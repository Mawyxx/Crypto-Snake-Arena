package http

import "net/http"

// SetupRouter настраивает маршруты.
func (h *Handler) SetupRouter(mux *http.ServeMux) {
	mux.HandleFunc("/api/config", h.Config)
	mux.HandleFunc("/api/user/profile", h.Profile)
	mux.HandleFunc("/api/bot/webhook", h.BotWebhook)
}
