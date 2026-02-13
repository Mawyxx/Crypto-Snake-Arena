package http

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
)

var errInvalid = errors.New("invalid")

type mockValidator struct {
	validInitData string
	userInfo      *auth.UserInfo
}

func (m *mockValidator) Validate(raw string) (*auth.UserInfo, error) {
	if raw == m.validInitData {
		return m.userInfo, nil
	}
	return nil, errInvalid
}

type mockAuthUserProvider struct {
	userID   uint
	user     *domain.User
	getErr   error
	createErr error
}

func (m *mockAuthUserProvider) GetUserIDByTgID(ctx context.Context, tgID int64) (uint, error) {
	if m.getErr != nil {
		return 0, m.getErr
	}
	return m.userID, nil
}

func (m *mockAuthUserProvider) GetOrCreateUser(ctx context.Context, tgID int64, username, displayName, startParam string) (*domain.User, error) {
	if m.createErr != nil {
		return nil, m.createErr
	}
	return m.user, nil
}

func TestRequireAuth_MissingInitData(t *testing.T) {
	validator := &mockValidator{validInitData: "valid", userInfo: &auth.UserInfo{ID: 1}}
	provider := &mockAuthUserProvider{userID: 100}
	mw := RequireAuth(validator, provider)
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	h := mw(next)

	req := httptest.NewRequest("GET", "/api/test", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want 401", rec.Code)
	}
}

func TestRequireAuth_InvalidInitData(t *testing.T) {
	validator := &mockValidator{validInitData: "valid", userInfo: &auth.UserInfo{ID: 1}}
	provider := &mockAuthUserProvider{userID: 100}
	mw := RequireAuth(validator, provider)
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	h := mw(next)

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "tma invalid_data")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("status = %d, want 401", rec.Code)
	}
}

func TestRequireAuth_ValidInitData(t *testing.T) {
	validator := &mockValidator{validInitData: "valid", userInfo: &auth.UserInfo{ID: 12345}}
	provider := &mockAuthUserProvider{userID: 100, user: &domain.User{ID: 100}}
	mw := RequireAuth(validator, provider)
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := UserIDFromContext(r.Context())
		if !ok || userID != 100 {
			t.Errorf("UserIDFromContext: ok=%v userID=%d", ok, userID)
		}
		w.WriteHeader(http.StatusOK)
	})
	h := mw(next)

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "tma valid")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", rec.Code)
	}
}
