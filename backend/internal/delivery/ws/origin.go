package ws

import (
	"net/http"
	"os"
	"strings"
)

// parseAllowedOrigins parses ALLOWED_ORIGINS env (comma-separated) into a slice.
func parseAllowedOrigins(env string) []string {
	var out []string
	for _, v := range strings.Split(env, ",") {
		if t := strings.TrimSpace(v); t != "" {
			out = append(out, t)
		}
	}
	return out
}

// isOriginAllowed checks if origin is allowed by the given rules (ngrok, localhost, explicit list).
func isOriginAllowed(origin string, allowed []string) bool {
	if origin == "" {
		return true
	}
	if len(allowed) > 0 {
		for _, o := range allowed {
			if origin == o || strings.HasPrefix(origin, o) {
				return true
			}
		}
		return false
	}
	// default: localhost + web.telegram.org + ngrok + prod domain
	return strings.HasPrefix(origin, "http://localhost") ||
		strings.HasPrefix(origin, "https://localhost") ||
		strings.HasPrefix(origin, "http://127.0.0.1") ||
		strings.HasPrefix(origin, "https://127.0.0.1") ||
		strings.HasPrefix(origin, "https://web.telegram.org") ||
		strings.Contains(origin, ".ngrok-free.app") ||
		strings.Contains(origin, ".ngrok-free.dev") ||
		strings.Contains(origin, "arrenasnake.net")
}

// checkOrigin is used by websocket.Upgrader CheckOrigin. ALLOWED_ORIGINS (comma-separated), * in dev, ngrok.
func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	allowed := os.Getenv("ALLOWED_ORIGINS")
	if allowed == "*" || allowed == "all" {
		return true
	}
	parsed := parseAllowedOrigins(allowed)
	return isOriginAllowed(origin, parsed)
}
