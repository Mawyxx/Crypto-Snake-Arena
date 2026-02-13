package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
)

// UserProvider — получение и создание пользователя.
type UserProvider interface {
	GetUserByTgID(ctx context.Context, tgID int64) (*domain.User, error)
	GetOrCreateUser(ctx context.Context, tgID int64, username, displayName, startParam string) (*domain.User, error)
	GetUserIDByTgID(ctx context.Context, tgID int64) (uint, error)
	GetReferralStats(ctx context.Context, userID uint) (invited int, earned float64, err error)
	GetUserStats(ctx context.Context, userID uint) (gamesPlayed int, totalDeposited, totalWithdrawn, totalProfit float64, err error)
	GetUserRank(ctx context.Context, userID uint, cachedRank int) (int, error)
	GetLeaderboard(ctx context.Context, limit int) ([]repository.LeaderboardEntry, error)
	GetActivePlayersCount7d(ctx context.Context) (int, error)
	GetRecentGames(ctx context.Context, userID uint, limit int) ([]repository.RecentGameEntry, error)
	GetReferrals(ctx context.Context, referrerID uint, limit int) ([]repository.ReferralEntry, error)
	UpdateUserPhotoURL(ctx context.Context, userID uint, photoURL string) error
}

// PresenceStore — регистрация presence (heartbeat) и подсчёт онлайн.
type PresenceStore interface {
	Register(ctx context.Context, userID uint)
	Count() int
}

// Handler — REST API: баланс, профиль, история, конфиг.
type Handler struct {
	validator           *auth.Validator
	userProvider        UserProvider
	presenceStore       PresenceStore
	botToken            string
	webhookSecretToken  string // X-Telegram-Bot-Api-Secret-Token (опционально)
}

// NewHandler создаёт HTTP handler.
func NewHandler(validator *auth.Validator, userProvider UserProvider, presenceStore PresenceStore, botToken, webhookSecretToken string) *Handler {
	return &Handler{
		validator:          validator,
		userProvider:       userProvider,
		presenceStore:      presenceStore,
		botToken:           botToken,
		webhookSecretToken: webhookSecretToken,
	}
}

// ProfileResponse — ответ GET /api/user/profile.
type ProfileResponse struct {
	UserID          uint    `json:"user_id"`
	TgID            int64   `json:"tg_id"`
	Username        string  `json:"username"`
	DisplayName     string  `json:"display_name"`
	FirstName       string  `json:"first_name,omitempty"`
	LastName        string  `json:"last_name,omitempty"`
	Balance         float64 `json:"balance"`
	ReferralInvited int     `json:"referral_invited"`
	ReferralEarned  float64 `json:"referral_earned"`
	GamesPlayed     int     `json:"games_played"`
	TotalDeposited  float64 `json:"total_deposited"`
	TotalWithdrawn  float64 `json:"total_withdrawn"`
	TotalProfit     float64 `json:"total_profit"`
	Rank            int     `json:"rank"`
}

// displayNameFromUserInfo: first_name + last_name, иначе username без @, иначе "Игрок".
func displayNameFromUserInfo(u *auth.UserInfo) string {
	if u == nil {
		return "Игрок"
	}
	full := strings.TrimSpace(u.FirstName + " " + u.LastName)
	if full != "" {
		return full
	}
	if u.Username != "" {
		return strings.TrimPrefix(u.Username, "@")
	}
	return "Игрок"
}

var (
	botUsernameCache string
	botUsernameMu    sync.RWMutex
)

// Config возвращает публичную конфигурацию (bot_username для реферальной ссылки). Без auth.
func (h *Handler) Config(w http.ResponseWriter, r *http.Request) {
	username := getBotUsername(h.botToken)
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]string{"bot_username": username}); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

func getBotUsername(token string) string {
	if token == "" {
		return ""
	}
	botUsernameMu.RLock()
	if botUsernameCache != "" {
		botUsernameMu.RUnlock()
		return botUsernameCache
	}
	botUsernameMu.RUnlock()

	botUsernameMu.Lock()
	defer botUsernameMu.Unlock()
	if botUsernameCache != "" {
		return botUsernameCache
	}
	resp, err := http.Get("https://api.telegram.org/bot" + token + "/getMe")
	if err != nil {
		log.Printf("[HTTP] getMe failed: %v", err)
		return ""
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var result struct {
		OK     bool `json:"ok"`
		Result struct {
			Username string `json:"username"`
		} `json:"result"`
	}
	if json.Unmarshal(body, &result) != nil || !result.OK {
		return ""
	}
	botUsernameCache = result.Result.Username
	return botUsernameCache
}

// Profile — GET: баланс и данные пользователя. PATCH: обновление photo_url.
func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	user := UserFromContext(r.Context())
	userInfo := UserInfoFromContext(r.Context())
	if user == nil || userInfo == nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	if r.Method == http.MethodPatch {
		h.profileUpdate(w, r, user.ID)
		return
	}

	invited, earned, _ := h.userProvider.GetReferralStats(r.Context(), user.ID)
	games, deposited, withdrawn, totalProfit, _ := h.userProvider.GetUserStats(r.Context(), user.ID)
	rank, _ := h.userProvider.GetUserRank(r.Context(), user.ID, user.Rank)

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(ProfileResponse{
		UserID:          user.ID,
		TgID:            user.TgID,
		Username:        user.Username,
		DisplayName:     user.DisplayName,
		FirstName:       userInfo.FirstName,
		LastName:        userInfo.LastName,
		Balance:         user.Balance,
		ReferralInvited: invited,
		ReferralEarned:  earned,
		GamesPlayed:     games,
		TotalDeposited:  deposited,
		TotalWithdrawn:  withdrawn,
		TotalProfit:     totalProfit,
		Rank:            rank,
	}); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

func (h *Handler) profileUpdate(w http.ResponseWriter, r *http.Request, userID uint) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	var payload struct {
		PhotoURL string `json:"photo_url"`
	}
	if json.Unmarshal(body, &payload) != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if len(payload.PhotoURL) > 512 {
		payload.PhotoURL = payload.PhotoURL[:512]
	}
	if err := h.userProvider.UpdateUserPhotoURL(r.Context(), userID, payload.PhotoURL); err != nil {
		log.Printf("[HTTP] UpdateUserPhotoURL error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{})
}

// Stats возвращает online и active_players_7d. Требует RequireAuth (userID в контексте). GET /api/stats
func (h *Handler) Stats(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	h.presenceStore.Register(r.Context(), userID)
	active7d, err := h.userProvider.GetActivePlayersCount7d(r.Context())
	if err != nil {
		log.Printf("[HTTP] GetActivePlayersCount7d error: %v", err)
		active7d = 0
	}
	online := h.presenceStore.Count()
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]int{
		"online":            online,
		"active_players_7d": active7d,
	}); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

// RecentGames возвращает последние игры пользователя. Требует RequireAuth. GET /api/user/recent-games?limit=20
func (h *Handler) RecentGames(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	limit := 20
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := parseInt(s); err == nil && n > 0 {
			limit = n
			if limit > 50 {
				limit = 50
			}
		}
	}
	entries, err := h.userProvider.GetRecentGames(r.Context(), userID, limit)
	if err != nil {
		log.Printf("[HTTP] GetRecentGames error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(entries); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

// Referrals возвращает список приглашённых друзей. Требует RequireAuth. GET /api/user/referrals?limit=20
func (h *Handler) Referrals(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	limit := 20
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := parseInt(s); err == nil && n > 0 {
			limit = n
			if limit > 50 {
				limit = 50
			}
		}
	}
	entries, err := h.userProvider.GetReferrals(r.Context(), userID, limit)
	if err != nil {
		log.Printf("[HTTP] GetReferrals error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(entries); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

// Leaderboard возвращает топ игроков по total_profit. Без auth. GET /api/leaderboard?limit=50
func (h *Handler) Leaderboard(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := parseInt(s); err == nil && n > 0 {
			limit = n
			if limit > 100 {
				limit = 100
			}
		}
	}
	entries, err := h.userProvider.GetLeaderboard(r.Context(), limit)
	if err != nil {
		log.Printf("[HTTP] GetLeaderboard error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(entries); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

func parseInt(s string) (int, error) {
	n, err := strconv.Atoi(s)
	return n, err
}

// BotWebhook — обработчик Telegram Bot API webhook. Без auth. POST /api/bot/webhook
func (h *Handler) BotWebhook(w http.ResponseWriter, r *http.Request) {
	if h.webhookSecretToken != "" {
		if r.Header.Get("X-Telegram-Bot-Api-Secret-Token") != h.webhookSecretToken {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	var update struct {
		Message struct {
			ID   int64 `json:"message_id"`
			From struct {
				ID int64 `json:"id"`
			} `json:"from"`
			Chat struct {
				ID int64 `json:"id"`
			} `json:"chat"`
			Text string `json:"text"`
		} `json:"message"`
	}
	if json.Unmarshal(body, &update) != nil || update.Message.Text == "" {
		w.WriteHeader(http.StatusOK)
		return
	}
	text := strings.TrimSpace(update.Message.Text)
	if !strings.HasPrefix(text, "/start") {
		w.WriteHeader(http.StatusOK)
		return
	}
	parts := strings.Fields(text)
	startParam := ""
	if len(parts) >= 2 {
		startParam = parts[1]
	}
	botUser := getBotUsername(h.botToken)
	if botUser == "" {
		w.WriteHeader(http.StatusOK)
		return
	}
	appURL := fmt.Sprintf("https://t.me/%s", botUser)
	if startParam != "" {
		appURL = fmt.Sprintf("https://t.me/%s?startapp=%s", botUser, startParam)
	}
	msg := "Привет! Играй в Crypto Snake Arena — получай 30%% нашей прибыли за приглашённых друзей."
	if strings.HasPrefix(startParam, "r_") {
		msg = "Привет! Тебя пригласили в Crypto Snake Arena. Нажми кнопку ниже, чтобы начать играть!"
	}
	payload := map[string]interface{}{
		"chat_id":    update.Message.Chat.ID,
		"text":       msg,
		"parse_mode": "HTML",
		"reply_markup": map[string]interface{}{
			"inline_keyboard": [][]map[string]interface{}{
				{
					{"text": "▶️ Открыть игру", "url": appURL},
				},
			},
		},
	}
	jsonBody, _ := json.Marshal(payload)
	resp, err := http.Post("https://api.telegram.org/bot"+h.botToken+"/sendMessage", "application/json", bytes.NewReader(jsonBody))
	if err != nil {
		log.Printf("[BotWebhook] sendMessage failed: %v", err)
	}
	if resp != nil {
		resp.Body.Close()
	}
	w.WriteHeader(http.StatusOK)
}
