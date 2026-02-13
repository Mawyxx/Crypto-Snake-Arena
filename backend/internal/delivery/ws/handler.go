package ws

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/game"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	gamepb "github.com/crypto-snake-arena/server/proto"
	"github.com/gorilla/websocket"
	"google.golang.org/protobuf/proto"
)

const (
	websocketBinaryMessage = 2
	minStake               = 0.3
	readDeadline           = 60 * time.Second
	pingInterval           = 30 * time.Second
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
		log.Printf("[WS] auth failed: %v", err)
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
		log.Printf("[WS] GetOrCreateUser error: tgID=%d err=%v", userInfo.ID, err)
		http.Error(w, "failed to get user", http.StatusInternalServerError)
		return
	}
	userID := user.ID

	stake, err := parseStake(r.URL.Query().Get("stake"))
	if err != nil || stake < minStake {
		http.Error(w, "invalid stake (min 0.3)", http.StatusBadRequest)
		return
	}

	// Upgrade до PlaceBet — ставка списывается только при входе в комнату
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] upgrade failed: %v", err)
		return
	}
	log.Printf("New WebSocket connection from: %s", r.RemoteAddr)
	defer conn.Close()

	wsConn := &wsConnAdapter{conn: conn}
	stopHeartbeat := setupHeartbeat(wsConn)
	defer stopHeartbeat()

	room, queued := roomManager.GetOrCreateRoom(stake)
	if room != nil {
		if !room.CanJoin() {
			_ = conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"room is full"}`))
			return
		}
		if err := h.wallet.PlaceBet(r.Context(), userID, stake); err != nil {
			if err == payment.ErrInsufficientFunds {
				log.Printf("[WS] insufficient funds: user=%d stake=%.2f", userID, stake)
				_ = conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"insufficient funds"}`))
				return
			}
			log.Printf("[WS] PlaceBet error: %v", err)
			return
		}
		h.HandleConnection(wsConn, userID, userInfo.ID, stake, room)
		return
	}

	if !queued {
		return
	}

	// Очередь: AddToQueue, ждём Ready или Done
	p := &game.QueuedPlayer{
		UserID: userID,
		TgID:   userInfo.ID,
		Stake:  stake,
		Ready:  make(chan *game.Room, 1),
		Done:   make(chan struct{}),
	}
	roomManager.AddToQueue(p)

	stopTicker := make(chan struct{})
	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-stopTicker:
				return
			case <-p.Done:
				return
			case <-ticker.C:
				msg, _ := json.Marshal(map[string]interface{}{"type": "queue", "position": 1})
				if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					roomManager.RemoveFromQueue(p.ID)
					return
				}
			}
		}
	}()

	select {
	case room := <-p.Ready:
		close(stopTicker)
		if room == nil || !room.CanJoin() {
			return
		}
		if err := h.wallet.PlaceBet(r.Context(), userID, stake); err != nil {
			if err == payment.ErrInsufficientFunds {
				_ = conn.WriteMessage(websocket.TextMessage, []byte(`{"error":"insufficient funds"}`))
				return
			}
			log.Printf("[WS] PlaceBet error (from queue): %v", err)
			return
		}
		h.HandleConnection(wsConn, userID, userInfo.ID, stake, room)
	case <-p.Done:
		close(stopTicker)
		return
	}
}

// HandleConnection обрабатывает уже открытое WebSocket соединение.
// userID — внутренний DB ID (для кошелька), tgID — Telegram ID (snake ID в Protobuf).
func (h *Handler) HandleConnection(conn Conn, userID uint, tgID int64, stake float64, room *game.Room) {
	player := &game.Player{TgID: uint64(tgID), UserID: userID, EntryFee: stake}

	select {
	case room.Register <- player:
		// OK
	default:
		_ = h.wallet.AddGameReward(context.Background(), userID, stake, "") // refund: комната полна
		_ = conn.Close()
		return
	}

	broadcastCh, closeCh := room.Subscribe()
	closeFn := sync.OnceFunc(closeCh)

	// Cleanup: closeFn (Unsubscribe+close), Unregister, Close. stopHeartbeat — в defer UpgradeAndHandle.
	defer func() {
		closeFn()
		select {
		case room.Unregister <- player:
		default:
			// Room уже остановлена
		}
		_ = conn.Close()
	}()

	// Reader: PlayerID = TgID (snake ID в игре)
	go h.runReader(conn, player.TgID, room, closeFn)

	// Writer: читает из room.Broadcast (через broadcastCh) и отправляет в сокет
	h.runWriter(conn, broadcastCh)
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

// runReader читает сообщения: текст CASH_OUT — закрытие с наградой (если живой); бинар — PlayerInput.
// SetReadDeadline(60s) — закрывает «мёртвые» сокеты. При ошибке — closeFn(), чтобы runWriter вышел.
func (h *Handler) runReader(conn Conn, playerID uint64, room *game.Room, closeFn func()) {
	for {
		messageType, data, err := conn.ReadMessage()
		if err != nil {
			closeFn() // закрывает broadcastCh, runWriter выходит
			_ = conn.Close()
			return
		}
		_ = conn.SetReadDeadline(time.Now().Add(readDeadline))
		if isCashOutMessage(messageType, data) {
			// Явный Cash Out: закрываем соединение → Unregister → награда только если змейка жива
			closeFn()
			_ = conn.Close()
			return
		}
		if messageType != websocketBinaryMessage {
			continue
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
func (h *Handler) runWriter(conn Conn, broadcastCh <-chan []byte) {
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

// checkOrigin — ALLOWED_ORIGINS (через запятую), * в dev, ngrok. Пусто = localhost + web.telegram.org.
func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	allowed := os.Getenv("ALLOWED_ORIGINS")
	if allowed == "*" || allowed == "all" {
		return true // dev: разрешить все соединения
	}
	if strings.Contains(origin, ".ngrok-free.app") || strings.Contains(origin, ".ngrok-free.dev") {
		return true // ngrok туннель
	}
	if allowed != "" {
		for _, o := range strings.Split(allowed, ",") {
			o = strings.TrimSpace(o)
			if o != "" && (origin == o || strings.HasPrefix(origin, o)) {
				return true
			}
		}
		return false
	}
	// default: localhost + web.telegram.org
	return strings.HasPrefix(origin, "http://localhost") ||
		strings.HasPrefix(origin, "https://localhost") ||
		strings.HasPrefix(origin, "http://127.0.0.1") ||
		strings.HasPrefix(origin, "https://127.0.0.1") ||
		strings.HasPrefix(origin, "https://web.telegram.org")
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
