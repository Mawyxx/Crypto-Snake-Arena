package ws

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/game"
	"github.com/google/uuid"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	gamepb "github.com/crypto-snake-arena/server/proto"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
)

const (
	websocketBinaryMessage = 2
	minStake               = 0.3
	readDeadline           = 60 * time.Second
	pingInterval           = 30 * time.Second
	// Rate limit: max сообщений в окне. При превышении — CloseConnection.
	wsRateLimitCount  = 50  // игровых пакетов (PlayerInput)
	wsRateLimitWindow = 1   // секунда
)

// GameWallet — списание ставки и возврат при ошибке входа.
type GameWallet interface {
	PlaceBet(ctx context.Context, userID uint, amount float64) error
	AddGameReward(ctx context.Context, userID uint, amount float64, referenceID string) error
}

// UserResolver — получение/создание пользователя по Telegram ID (для новых игроков и рефералов).
type UserResolver interface {
	GetUserIDByTgID(ctx context.Context, tgID int64) (uint, error)
	GetOrCreateUser(ctx context.Context, tgID int64, username, displayName, startParam string) (*domain.User, error)
}

// Conn — WebSocket соединение (ReadMessage, WriteMessage, Close, Heartbeat).
type Conn interface {
	ReadMessage() (messageType int, p []byte, err error)
	WriteMessage(messageType int, data []byte) error
	Close() error
	SetReadDeadline(t time.Time) error
	SetPongHandler(h func(appData string) error)
	WriteControl(messageType int, data []byte, deadline time.Time) error
}

// Handler — WebSocket: байты -> Protobuf -> Room.
type Handler struct {
	wallet       GameWallet
	validator    *auth.Validator
	userResolver UserResolver
	upgrader     websocket.Upgrader
}

// NewHandler создаёт WebSocket handler.
func NewHandler(wallet GameWallet, validator *auth.Validator, userResolver UserResolver) *Handler {
	return &Handler{
		wallet:       wallet,
		validator:    validator,
		userResolver: userResolver,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     checkOrigin,
		},
	}
}

// RoomProvider возвращает комнату для подключения (с учётом ставки и очереди).
type RoomProvider interface {
	GetOrCreateRoom(stake float64) (room *game.Room, queued bool)
	AddToQueue(p *game.QueuedPlayer)
	RemoveFromQueue(id string)
}

// UpgradeAndHandle: Auth → Upgrade → GetOrCreateRoom. Если очередь — PlaceBet только при получении комнаты.
func (h *Handler) UpgradeAndHandle(w http.ResponseWriter, r *http.Request, roomManager RoomProvider) {
	initData := auth.ExtractInitData(r)
	if initData == "" {
		http.Error(w, "missing initData", http.StatusUnauthorized)
		return
	}
	userInfo, err := h.validator.Validate(initData)
	if err != nil {
		zap.L().Warn("ws auth failed", zap.Error(err))
		http.Error(w, "invalid or expired init data", http.StatusUnauthorized)
		return
	}

	disp := strings.TrimSpace(userInfo.FirstName + " " + userInfo.LastName)
	if disp == "" {
		disp = strings.TrimPrefix(userInfo.Username, "@")
	}
	user, err := h.userResolver.GetOrCreateUser(r.Context(), userInfo.ID,
		strings.TrimPrefix(userInfo.Username, "@"), disp, userInfo.StartParam)
	if err != nil {
		zap.L().Error("ws GetOrCreateUser failed", zap.Int64("tgID", userInfo.ID), zap.Error(err))
		http.Error(w, "failed to get user", http.StatusInternalServerError)
		return
	}
	userID := user.ID

	stake, err := parseStake(r.URL.Query().Get("stake"))
	if err != nil || stake < minStake {
		http.Error(w, "invalid stake (min 0.3)", http.StatusBadRequest)
		return
	}

	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		zap.L().Warn("ws upgrade failed", zap.Error(err))
		return
	}
	zap.L().Info("ws connected", zap.String("remote", r.RemoteAddr), zap.Uint("userID", userID), zap.Int64("tgID", userInfo.ID))
	defer conn.Close()

	wsConn := &wsConnAdapter{conn: conn}
	stopHeartbeat := setupHeartbeat(wsConn)
	defer stopHeartbeat()

	room, queued := roomManager.GetOrCreateRoom(stake)
	if room != nil {
		handleImmediateRoom(h, wsConn, r.Context(), userID, userInfo.ID, stake, room, conn)
		return
	}
	if queued {
		handleQueued(h, wsConn, conn, userID, userInfo.ID, stake, roomManager)
	}
}

func handleImmediateRoom(h *Handler, conn Conn, ctx context.Context, userID uint, tgID int64, stake float64, room *game.Room, rawConn *websocket.Conn) {
	if !room.CanJoin() {
		_ = rawConn.WriteMessage(websocket.TextMessage, []byte(`{"error":"room is full"}`))
		return
	}
	joinRoomAndPlay(h, conn, ctx, userID, tgID, stake, room, rawConn)
}

func handleQueued(h *Handler, conn Conn, rawConn *websocket.Conn, userID uint, tgID int64, stake float64, roomManager RoomProvider) {
	p := &game.QueuedPlayer{
		UserID: userID,
		TgID:   tgID,
		Stake:  stake,
		Ready:  make(chan *game.Room, 1),
		Done:   make(chan struct{}),
	}
	roomManager.AddToQueue(p)

	stopTicker := make(chan struct{})
	go runQueueTicker(rawConn, roomManager, p, stopTicker)

	select {
	case room := <-p.Ready:
		close(stopTicker)
		if room != nil && room.CanJoin() {
			joinRoomAndPlay(h, conn, context.Background(), userID, tgID, stake, room, rawConn)
		}
	case <-p.Done:
		close(stopTicker)
	}
}

func runQueueTicker(conn *websocket.Conn, roomManager RoomProvider, p *game.QueuedPlayer, stopCh <-chan struct{}) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-stopCh:
			return
		case <-p.Done:
			return
		case <-ticker.C:
			msg, err := json.Marshal(map[string]interface{}{"type": "queue", "position": 1})
			if err != nil {
				zap.L().Warn("ws queue status marshal failed", zap.Error(err))
				return
			}
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				roomManager.RemoveFromQueue(p.ID)
				return
			}
		}
	}
}

func joinRoomAndPlay(h *Handler, conn Conn, ctx context.Context, userID uint, tgID int64, stake float64, room *game.Room, rawConn *websocket.Conn) {
	if err := h.wallet.PlaceBet(ctx, userID, stake); err != nil {
		if err == payment.ErrInsufficientFunds {
			zap.L().Info("ws insufficient funds", zap.Uint("userID", userID), zap.Float64("stake", stake))
			_ = rawConn.WriteMessage(websocket.TextMessage, []byte(`{"error":"insufficient funds"}`))
			return
		}
		zap.L().Error("ws PlaceBet failed", zap.Error(err))
		return
	}
	h.HandleConnection(conn, userID, tgID, stake, room)
}

// HandleConnection обрабатывает уже открытое WebSocket соединение.
// userID — внутренний DB ID (для кошелька), tgID — Telegram ID (snake ID в Protobuf).
func (h *Handler) HandleConnection(conn Conn, userID uint, tgID int64, stake float64, room *game.Room) {
	player := &game.Player{TgID: uint64(tgID), UserID: userID, EntryFee: stake}

	select {
	case room.Register <- player:
		// OK
	default:
		refID := "refund:room_full:" + strconv.FormatUint(uint64(userID), 10) + ":" + uuid.New().String()
		_ = h.wallet.AddGameReward(context.Background(), userID, stake, refID) // refund: комната полна
		_ = conn.Close()
		zap.L().Warn("ws room full, refunded", zap.Uint("userID", userID), zap.String("roomID", room.ID))
		return
	}

	broadcastCh, closeCh := room.Subscribe(player.TgID)
	closeFn := sync.OnceFunc(closeCh)
	var disconnectReason string

	// Cleanup: closeFn (Unsubscribe+close), Unregister, Close. stopHeartbeat — в defer UpgradeAndHandle.
	defer func() {
		if disconnectReason == "" {
			disconnectReason = "closed"
		}
		zap.L().Info("ws disconnected",
			zap.Uint("userID", userID),
			zap.Int64("tgID", tgID),
			zap.String("roomID", room.ID),
			zap.String("reason", disconnectReason))
		closeFn()
		select {
		case room.Unregister <- player:
		default:
			// Room уже остановлена
		}
		_ = conn.Close()
	}()

	// Reader: PlayerID = TgID (snake ID в игре), с rate limit
	go runReader(conn, player.TgID, room, closeFn, &disconnectReason, newRateLimiter(wsRateLimitCount, wsRateLimitWindow))

	// Writer: читает из room.Broadcast (через broadcastCh) и отправляет в сокет
	runWriter(conn, broadcastCh)
}

// Текстовое сообщение CASH_OUT — клиент запрашивает вывод накопленных монет и выход.
// Поддерживаются строка "CASH_OUT" или JSON с полем Type: "CASH_OUT".
const wsTextMessage = 1

func isCashOutMessage(messageType int, data []byte) bool {
	if messageType != wsTextMessage {
		return false
	}
	s := strings.TrimSpace(string(data))
	return s == "CASH_OUT" || strings.Contains(s, `"CASH_OUT"`)
}

// rateLimiter — sliding window: N сообщений за W секунд.
type rateLimiter struct {
	counts []time.Time
	max    int
	window time.Duration
	mu     sync.Mutex
}

func newRateLimiter(max int, windowSec int) *rateLimiter {
	return &rateLimiter{max: max, window: time.Duration(windowSec) * time.Second}
}

func (r *rateLimiter) allow() bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	now := time.Now()
	cutoff := now.Add(-r.window)
	var valid []time.Time
	for _, t := range r.counts {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	if len(valid) >= r.max {
		return false
	}
	valid = append(valid, now)
	r.counts = valid
	return true
}

// runReader читает сообщения: текст CASH_OUT — закрытие; бинар — PlayerInput. Rate limit на спам.
func runReader(conn Conn, playerID uint64, room *game.Room, closeFn func(), reason *string, limiter *rateLimiter) {
	for {
		messageType, data, err := conn.ReadMessage()
		if err != nil {
			if *reason == "" {
				*reason = "read_error"
			}
			zap.L().Debug("ws read error", zap.Uint64("playerID", playerID), zap.Error(err))
			closeFn()
			_ = conn.Close()
			return
		}
		_ = conn.SetReadDeadline(time.Now().Add(readDeadline))
		if isCashOutMessage(messageType, data) {
			// Получаем score змейки перед закрытием соединения
			room.Mu.RLock()
			snake, hasSnake := room.Snakes[playerID]
			reward := 0.0
			if hasSnake && !snake.Dead {
				reward = snake.Score
			}
			room.Mu.RUnlock()

			// Отправляем reward клиенту перед закрытием
			if reward > 0 {
				response := map[string]interface{}{
					"type":   "cash_out",
					"reward": reward,
					"score":  reward,
				}
				jsonData, err := json.Marshal(response)
				if err == nil {
					_ = conn.WriteMessage(websocket.TextMessage, jsonData)
				}
			}

			*reason = "cash_out"
			closeFn()
			_ = conn.Close()
			return
		}
		if messageType != websocketBinaryMessage {
			continue
		}
		if !limiter.allow() {
			*reason = "rate_limit"
			zap.L().Warn("ws rate limit exceeded", zap.Uint64("playerID", playerID))
			closeFn()
			_ = conn.Close()
			return
		}
		var input gamepb.PlayerInput
		if err := proto.Unmarshal(data, &input); err != nil {
			continue
		}
		select {
		case room.Inputs <- &game.PlayerInput{
			PlayerID: playerID,
			Angle:    float64(input.GetAngle()),
			Boost:    input.GetBoost(),
		}:
		default:
			// Канал полон — пропускаем ввод
		}
	}
}

// runWriter читает бинарные данные из broadcastCh и отправляет в сокет.
func runWriter(conn Conn, broadcastCh <-chan []byte) {
	for data := range broadcastCh {
		if err := conn.WriteMessage(websocketBinaryMessage, data); err != nil {
			return
		}
	}
}

// setupHeartbeat — Ping/Pong и ReadDeadline. Возвращает stop для немедленного выхода горутины пинга.
func setupHeartbeat(conn Conn) (stop func()) {
	done := make(chan struct{})
	_ = conn.SetReadDeadline(time.Now().Add(readDeadline))
	conn.SetPongHandler(func(string) error {
		_ = conn.SetReadDeadline(time.Now().Add(readDeadline))
		return nil
	})
	go func() {
		ticker := time.NewTicker(pingInterval)
		defer ticker.Stop()
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				if err := conn.WriteControl(websocket.PingMessage, nil, time.Now().Add(10*time.Second)); err != nil {
					_ = conn.Close()
					return
				}
			}
		}
	}()
	return func() { close(done) }
}

// wsConnAdapter адаптирует *websocket.Conn к интерфейсу Conn.
type wsConnAdapter struct {
	conn *websocket.Conn
}

func (a *wsConnAdapter) ReadMessage() (int, []byte, error) {
	return a.conn.ReadMessage()
}

func (a *wsConnAdapter) WriteMessage(messageType int, data []byte) error {
	return a.conn.WriteMessage(messageType, data)
}

func (a *wsConnAdapter) Close() error {
	return a.conn.Close()
}

func (a *wsConnAdapter) SetReadDeadline(t time.Time) error {
	return a.conn.SetReadDeadline(t)
}

func (a *wsConnAdapter) SetPongHandler(h func(appData string) error) {
	a.conn.SetPongHandler(h)
}

func (a *wsConnAdapter) WriteControl(messageType int, data []byte, deadline time.Time) error {
	return a.conn.WriteControl(messageType, data, deadline)
}

func parseStake(s string) (float64, error) {
	if s == "" {
		return 0, strconv.ErrSyntax
	}
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, err
	}
	return f, nil
}
