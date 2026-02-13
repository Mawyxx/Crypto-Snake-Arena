package http

import "net/http"

// SetupRouter настраивает маршруты.
func (h *Handler) SetupRouter(mux *http.ServeMux) {
	mux.Handle("/api/config", methodGetOnly(http.HandlerFunc(h.Config)))
	mux.Handle("/api/leaderboard", methodGetOnly(http.HandlerFunc(h.Leaderboard)))
	mux.Handle("/api/bot/webhook", methodPostOnly(http.HandlerFunc(h.BotWebhook)))

	requireAuth := RequireAuth(h.validator, h.userProvider)

	mux.Handle("/api/user/profile", RequireAuthWithUserAllowPatch(h.validator, h.userProvider)(http.HandlerFunc(h.Profile)))
	mux.Handle("/api/user/recent-games", requireAuth(http.HandlerFunc(h.RecentGames)))
	mux.Handle("/api/user/referrals", requireAuth(http.HandlerFunc(h.Referrals)))
	mux.Handle("/api/stats", requireAuth(http.HandlerFunc(h.Stats)))
}

// methodGetOnly возвращает 405 для не-GET запросов.
func methodGetOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// methodPostOnly возвращает 405 для не-POST запросов.
func methodPostOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		next.ServeHTTP(w, r)
	})
}
