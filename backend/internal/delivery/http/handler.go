package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

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

// PlatformStatsProvider — оборот и прибыль платформы.
type PlatformStatsProvider interface {
	GetPlatformStats(ctx context.Context) (*repository.PlatformStats, error)
}

// AdminProvider — админ-панель: дашборд, лог, экспорт.
type AdminProvider interface {
	GetDashboardSummary(ctx context.Context) (*repository.DashboardSummary, error)
	GetLedger(ctx context.Context, from, to time.Time, limit, offset int) ([]repository.LedgerEntry, int, error)
	GetStatsByPeriod(ctx context.Context, period string) (*repository.PeriodStats, error)
	ExportLedgerCSV(ctx context.Context, from, to time.Time) ([]byte, error)
}

// DepositCreditor — начисление депозита (для internal add-balance).
type DepositCreditor interface {
	ProcessDeposit(ctx context.Context, tgID int64, amount float64, externalID string) error
}

// Handler — REST API: баланс, профиль, история, конфиг, админка.
type Handler struct {
	validator          *auth.Validator
	userProvider       UserProvider
	presenceStore      PresenceStore
	platformStats      PlatformStatsProvider
	adminProvider      AdminProvider
	depositCreditor    DepositCreditor
	adminTgID          int64  // ADMIN_TG_ID — только этот пользователь видит is_admin и /api/admin/*
	botToken           string
	webhookSecretToken string // X-Telegram-Bot-Api-Secret-Token (опционально)
	addBalanceSecret   string // ADD_BALANCE_SECRET — для POST /api/internal/add-balance
}

// NewHandler создаёт HTTP handler.
func NewHandler(validator *auth.Validator, userProvider UserProvider, presenceStore PresenceStore, platformStats PlatformStatsProvider, adminProvider AdminProvider, depositCreditor DepositCreditor, adminTgID int64, botToken, webhookSecretToken, addBalanceSecret string) *Handler {
	return &Handler{
		validator:          validator,
		userProvider:       userProvider,
		presenceStore:      presenceStore,
		platformStats:      platformStats,
		adminProvider:      adminProvider,
		depositCreditor:    depositCreditor,
		adminTgID:          adminTgID,
		botToken:           botToken,
		webhookSecretToken: webhookSecretToken,
		addBalanceSecret:   addBalanceSecret,
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
	IsAdmin         bool    `json:"is_admin"`
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
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("[HTTP] getMe read body: %v", err)
		return ""
	}
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

	invited, earned, errRef := h.userProvider.GetReferralStats(r.Context(), user.ID)
	if errRef != nil {
		log.Printf("[HTTP] GetReferralStats error: %v", errRef)
	}
	games, deposited, withdrawn, totalProfit, errStats := h.userProvider.GetUserStats(r.Context(), user.ID)
	if errStats != nil {
		log.Printf("[HTTP] GetUserStats error: %v", errStats)
	}
	rank, errRank := h.userProvider.GetUserRank(r.Context(), user.ID, user.Rank)
	if errRank != nil {
		log.Printf("[HTTP] GetUserRank error: %v", errRank)
	}

	isAdmin := h.adminTgID != 0 && user.TgID == h.adminTgID
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
		IsAdmin:         isAdmin,
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

// PlatformStats возвращает оборот (депозиты) и прибыль платформы. Требует RequireAuth. GET /api/platform-stats
func (h *Handler) PlatformStats(w http.ResponseWriter, r *http.Request) {
	if h.platformStats == nil {
		http.Error(w, "platform stats not configured", http.StatusNotImplemented)
		return
	}
	stats, err := h.platformStats.GetPlatformStats(r.Context())
	if err != nil {
		log.Printf("[HTTP] GetPlatformStats error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("[HTTP] json encode failed: %v", err)
	}
}

// AdminDashboard — дашборд из VIEW. Требует RequireAdmin. GET /api/admin/dashboard
func (h *Handler) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	if h.adminProvider == nil {
		http.Error(w, "admin not configured", http.StatusNotImplemented)
		return
	}
	s, err := h.adminProvider.GetDashboardSummary(r.Context())
	if err != nil {
		log.Printf("[HTTP] GetDashboardSummary error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(s)
}

// AdminLedger — лог с пагинацией. GET /api/admin/ledger?from=&to=&limit=&offset=
func (h *Handler) AdminLedger(w http.ResponseWriter, r *http.Request) {
	if h.adminProvider == nil {
		http.Error(w, "admin not configured", http.StatusNotImplemented)
		return
	}
	from, to := parseAdminDateRange(r)
	limit, offset := parseIntOrDefault(r.URL.Query().Get("limit"), 50), parseIntOrDefault(r.URL.Query().Get("offset"), 0)
	if limit > 100 {
		limit = 100
	}
	entries, total, err := h.adminProvider.GetLedger(r.Context(), from, to, limit, offset)
	if err != nil {
		log.Printf("[HTTP] GetLedger error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"entries": entries,
		"total":   total,
	})
}

// AdminStats — агрегаты за период. GET /api/admin/stats?period=day|week|month
func (h *Handler) AdminStats(w http.ResponseWriter, r *http.Request) {
	if h.adminProvider == nil {
		http.Error(w, "admin not configured", http.StatusNotImplemented)
		return
	}
	period := r.URL.Query().Get("period")
	if period == "" {
		period = "day"
	}
	s, err := h.adminProvider.GetStatsByPeriod(r.Context(), period)
	if err != nil {
		log.Printf("[HTTP] GetStatsByPeriod error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(s)
}

// AdminExport — CSV экспорт. GET /api/admin/export?from=&to=
func (h *Handler) AdminExport(w http.ResponseWriter, r *http.Request) {
	if h.adminProvider == nil {
		http.Error(w, "admin not configured", http.StatusNotImplemented)
		return
	}
	from, to := parseAdminDateRange(r)
	data, err := h.adminProvider.ExportLedgerCSV(r.Context(), from, to)
	if err != nil {
		log.Printf("[HTTP] ExportLedgerCSV error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=revenue_ledger.csv")
	if _, err := w.Write(data); err != nil {
		log.Printf("[HTTP] AdminExport write failed: %v", err)
	}
}

func parseAdminDateRange(r *http.Request) (from, to time.Time) {
	now := time.Now()
	from = now.AddDate(0, -1, 0)
	to = now
	if s := r.URL.Query().Get("from"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			from = t
		}
	}
	if s := r.URL.Query().Get("to"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			to = t
		}
	}
	return from, to
}

func parseIntOrDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil || n < 0 {
		return def
	}
	return n
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
	jsonBody, errMarshal := json.Marshal(payload)
	if errMarshal != nil {
		log.Printf("[BotWebhook] json.Marshal failed: %v", errMarshal)
		w.WriteHeader(http.StatusOK)
		return
	}
	resp, err := http.Post("https://api.telegram.org/bot"+h.botToken+"/sendMessage", "application/json", bytes.NewReader(jsonBody))
	if err != nil {
		log.Printf("[BotWebhook] sendMessage failed: %v", err)
	}
	if resp != nil {
		resp.Body.Close()
	}
	w.WriteHeader(http.StatusOK)
}

// DevCredit500 — для тестов: при клике на баланс/пополнить начисляет 500 USDT текущему пользователю.
// POST /api/dev/credit-500. Требует auth. Работает только при DEV_AUTO_CREDIT=true в .env.
// Для релиза: убрать DEV_AUTO_CREDIT из .env — эндпоинт вернёт 404.
func (h *Handler) DevCredit500(w http.ResponseWriter, r *http.Request) {
	// Проверяем флаг — для релиза просто не задаём DEV_AUTO_CREDIT
	if os.Getenv("DEV_AUTO_CREDIT") != "true" && os.Getenv("DEV_AUTO_CREDIT") != "1" {
		http.Error(w, "disabled", http.StatusNotFound)
		return
	}
	if h.depositCreditor == nil {
		http.Error(w, "disabled", http.StatusNotFound)
		return
	}
	userInfo := UserInfoFromContext(r.Context())
	if userInfo == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	tgID := userInfo.ID
	amount := 500.0
	_, err := h.userProvider.GetOrCreateUser(r.Context(), tgID, "", "", "")
	if err != nil {
		log.Printf("[DevCredit500] GetOrCreateUser error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	externalID := fmt.Sprintf("dev_credit_%d_%d_%d", tgID, int(amount), time.Now().UnixNano())
	if err := h.depositCreditor.ProcessDeposit(r.Context(), tgID, amount, externalID); err != nil {
		if strings.Contains(err.Error(), "уже") || strings.Contains(err.Error(), "23505") {
			// Уже начислено в эту секунду — считаем успехом
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "amount": amount})
			return
		}
		log.Printf("[DevCredit500] ProcessDeposit error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "amount": amount})
}

// AddBalance — внутренний эндпоинт: начисление баланса по секретному токену.
// POST /api/internal/add-balance
// Header: X-Add-Balance-Token: <ADD_BALANCE_SECRET>
// Body: {"tg_id": 7175104609, "amount": 500} или query: ?tg_id=7175104609&amount=500
func (h *Handler) AddBalance(w http.ResponseWriter, r *http.Request) {
	if h.addBalanceSecret == "" || h.depositCreditor == nil {
		http.Error(w, "add-balance disabled", http.StatusNotFound)
		return
	}
	if r.Header.Get("X-Add-Balance-Token") != h.addBalanceSecret {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	var tgID int64 = 7175104609
	var amount float64 = 500
	if r.Header.Get("Content-Type") == "application/json" {
		var body struct {
			TgID   int64   `json:"tg_id"`
			Amount float64 `json:"amount"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err == nil && body.TgID != 0 {
			tgID = body.TgID
			if body.Amount > 0 {
				amount = body.Amount
			}
		}
	} else {
		if s := r.URL.Query().Get("tg_id"); s != "" {
			if n, err := strconv.ParseInt(s, 10, 64); err == nil {
				tgID = n
			}
		}
		if s := r.URL.Query().Get("amount"); s != "" {
			if f, err := strconv.ParseFloat(s, 64); err == nil && f > 0 {
				amount = f
			}
		}
	}
	_, err := h.userProvider.GetOrCreateUser(r.Context(), tgID, "", "", "")
	if err != nil {
		log.Printf("[AddBalance] GetOrCreateUser error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	externalID := fmt.Sprintf("admin_credit_%d_%d_%d", tgID, int(amount), time.Now().UnixNano())
	if err := h.depositCreditor.ProcessDeposit(r.Context(), tgID, amount, externalID); err != nil {
		if strings.Contains(err.Error(), "уже") || strings.Contains(err.Error(), "23505") {
			http.Error(w, "already processed", http.StatusConflict)
			return
		}
		log.Printf("[AddBalance] ProcessDeposit error: %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "tg_id": tgID, "amount": amount})
}
