package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
)

// UserProvider — получение и создание пользователя.
type UserProvider interface {
	GetUserByTgID(ctx context.Context, tgID int64) (*domain.User, error)
	GetOrCreateUser(ctx context.Context, tgID int64, username, displayName, startParam string) (*domain.User, error)
	GetReferralStats(ctx context.Context, userID uint) (invited int, earned float64, err error)
	GetUserStats(ctx context.Context, userID uint) (gamesPlayed int, totalDeposited, totalWithdrawn float64, err error)
}

// Handler — REST API: баланс, профиль, история, конфиг.
type Handler struct {
	validator    *auth.Validator
	userProvider UserProvider
	botToken     string
}

// NewHandler создаёт HTTP handler.
func NewHandler(validator *auth.Validator, userProvider UserProvider, botToken string) *Handler {
	return &Handler{
		validator:    validator,
		userProvider: userProvider,
		botToken:     botToken,
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
}

// displayNameFromUserInfo: first_name + last_name, иначе username без @, иначе "Игрок".
func displayNameFromUserInfo(u *auth.UserInfo) string {
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

// Config возвращает публичную конфигурацию (bot_username для реферальной ссылки).
func (h *Handler) Config(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	username := getBotUsername(h.botToken)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"bot_username": username})
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

// extractInitData извлекает initData из Authorization: "tma <initData>" или query ?initData=.
func extractInitData(r *http.Request) string {
	if s := strings.TrimPrefix(r.Header.Get("Authorization"), "tma "); s != r.Header.Get("Authorization") {
		return strings.TrimSpace(s)
	}
	return r.URL.Query().Get("initData")
}

// Profile возвращает баланс и данные пользователя по initData.
func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	initData := extractInitData(r)
	if initData == "" {
		http.Error(w, "missing initData", http.StatusUnauthorized)
		return
	}

	userInfo, err := h.validator.Validate(initData)
	if err != nil {
		log.Printf("[HTTP] auth failed: %v", err)
		http.Error(w, "invalid or expired init data", http.StatusUnauthorized)
		return
	}

	disp := displayNameFromUserInfo(userInfo)
	user, err := h.userProvider.GetOrCreateUser(r.Context(), userInfo.ID,
		strings.TrimPrefix(userInfo.Username, "@"), disp, userInfo.StartParam)
	if err != nil {
		log.Printf("[HTTP] GetOrCreateUser error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	displayName := user.DisplayName
	if displayName == "" {
		displayName = disp
	}

	invited, earned, _ := h.userProvider.GetReferralStats(r.Context(), user.ID)
	games, deposited, withdrawn, _ := h.userProvider.GetUserStats(r.Context(), user.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ProfileResponse{
		UserID:          user.ID,
		TgID:            user.TgID,
		Username:        user.Username,
		DisplayName:     displayName,
		FirstName:       userInfo.FirstName,
		LastName:        userInfo.LastName,
		Balance:         user.Balance,
		ReferralInvited: invited,
		ReferralEarned:  earned,
		GamesPlayed:     games,
		TotalDeposited:  deposited,
		TotalWithdrawn:  withdrawn,
	})
}

// BotWebhook — обработчик Telegram Bot API webhook. На /start r_XXX отвечает сообщением с кнопкой открытия приложения.
func (h *Handler) BotWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
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
	appURL := fmt.Sprintf("https://t.me/%s/app", botUser)
	if startParam != "" {
		appURL = fmt.Sprintf("https://t.me/%s/app?startapp=%s", botUser, startParam)
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
