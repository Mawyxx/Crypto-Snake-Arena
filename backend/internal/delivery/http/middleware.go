package http

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
)

type contextKey int

const (
	userInfoKey contextKey = iota
	userIDKey
	userKey
)

// AuthValidator — валидация initData (для тестов — mock).
type AuthValidator interface {
	Validate(rawInitData string) (*auth.UserInfo, error)
}

// AuthUserProvider — минимальный интерфейс для middleware (валидация + userID).
type AuthUserProvider interface {
	GetUserIDByTgID(ctx context.Context, tgID int64) (uint, error)
	GetOrCreateUser(ctx context.Context, tgID int64, username, displayName, startParam string) (*domain.User, error)
}

// UserInfoFromContext возвращает *auth.UserInfo из контекста (после RequireAuth).
func UserInfoFromContext(ctx context.Context) *auth.UserInfo {
	u, _ := ctx.Value(userInfoKey).(*auth.UserInfo)
	return u
}

// UserIDFromContext возвращает userID из контекста (после RequireAuth).
func UserIDFromContext(ctx context.Context) (uint, bool) {
	id, ok := ctx.Value(userIDKey).(uint)
	return id, ok
}

// UserFromContext возвращает *domain.User из контекста (после RequireAuthWithUser).
func UserFromContext(ctx context.Context) *domain.User {
	u, _ := ctx.Value(userKey).(*domain.User)
	return u
}

// RequireAuth — middleware: извлекает initData, валидирует, GetOrCreateUser (создаёт нового при реферале), кладёт userInfo и userID в контекст.
// При ошибке возвращает 401 и не вызывает next.
func RequireAuth(validator AuthValidator, userProvider AuthUserProvider) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet {
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			initData := auth.ExtractInitData(r)
			if initData == "" {
				http.Error(w, "missing initData", http.StatusUnauthorized)
				return
			}
			userInfo, err := validator.Validate(initData)
			if err != nil {
				log.Printf("[HTTP] auth failed: %v", err)
				http.Error(w, "invalid or expired init data", http.StatusUnauthorized)
				return
			}
			disp := displayNameFromUserInfo(userInfo)
			user, err := userProvider.GetOrCreateUser(r.Context(), userInfo.ID,
				strings.TrimPrefix(userInfo.Username, "@"), disp, userInfo.StartParam)
			if err != nil {
				log.Printf("[HTTP] GetOrCreateUser error: %v", err)
				http.Error(w, "internal server error", http.StatusInternalServerError)
				return
			}
			ctx := context.WithValue(r.Context(), userInfoKey, userInfo)
			ctx = context.WithValue(ctx, userIDKey, user.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuthWithUser — middleware: как RequireAuth + GetOrCreateUser, кладёт user в контекст.
// Нужен для Profile, где нужны полные данные пользователя.
func RequireAuthWithUser(validator AuthValidator, userProvider AuthUserProvider) func(http.Handler) http.Handler {
	return requireAuthWithUserImpl(validator, userProvider, false)
}

// RequireAuthWithUserAllowPatch — то же, но разрешает GET и PATCH (для /api/user/profile).
func RequireAuthWithUserAllowPatch(validator AuthValidator, userProvider AuthUserProvider) func(http.Handler) http.Handler {
	return requireAuthWithUserImpl(validator, userProvider, true)
}

func requireAuthWithUserImpl(validator AuthValidator, userProvider AuthUserProvider, allowPatch bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			allowed := r.Method == http.MethodGet || (allowPatch && r.Method == http.MethodPatch)
			if !allowed {
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			initData := auth.ExtractInitData(r)
			if initData == "" {
				http.Error(w, "missing initData", http.StatusUnauthorized)
				return
			}
			userInfo, err := validator.Validate(initData)
			if err != nil {
				log.Printf("[HTTP] auth failed: %v", err)
				http.Error(w, "invalid or expired init data", http.StatusUnauthorized)
				return
			}
			disp := displayNameFromUserInfo(userInfo)
			user, err := userProvider.GetOrCreateUser(r.Context(), userInfo.ID,
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
			user.DisplayName = displayName
			ctx := context.WithValue(r.Context(), userInfoKey, userInfo)
			ctx = context.WithValue(ctx, userIDKey, user.ID)
			ctx = context.WithValue(ctx, userKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
