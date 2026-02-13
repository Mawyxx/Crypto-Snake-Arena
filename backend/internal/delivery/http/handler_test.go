package http

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/auth"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
)

type mockUserProvider struct {
	leaderboard []repository.LeaderboardEntry
	err         error
}

func (m *mockUserProvider) GetUserByTgID(_ context.Context, _ int64) (*domain.User, error) {
	return nil, m.err
}
func (m *mockUserProvider) GetOrCreateUser(_ context.Context, _ int64, _, _, _ string) (*domain.User, error) {
	return nil, m.err
}
func (m *mockUserProvider) GetUserIDByTgID(_ context.Context, _ int64) (uint, error) {
	return 0, m.err
}
func (m *mockUserProvider) GetReferralStats(_ context.Context, _ uint) (int, float64, error) {
	return 0, 0, m.err
}
func (m *mockUserProvider) GetUserStats(_ context.Context, _ uint) (int, float64, float64, float64, error) {
	return 0, 0, 0, 0, m.err
}
func (m *mockUserProvider) GetUserRank(_ context.Context, _ uint, _ int) (int, error) {
	return 0, m.err
}
func (m *mockUserProvider) GetLeaderboard(_ context.Context, limit int) ([]repository.LeaderboardEntry, error) {
	return m.leaderboard, m.err
}
func (m *mockUserProvider) GetActivePlayersCount7d(_ context.Context) (int, error) {
	return 0, m.err
}
func (m *mockUserProvider) GetRecentGames(_ context.Context, _ uint, _ int) ([]repository.RecentGameEntry, error) {
	return nil, m.err
}
func (m *mockUserProvider) GetReferrals(_ context.Context, _ uint, _ int) ([]repository.ReferralEntry, error) {
	return nil, m.err
}
func (m *mockUserProvider) UpdateUserPhotoURL(_ context.Context, _ uint, _ string) error {
	return m.err
}

type mockPresenceStore struct{}

func (mockPresenceStore) Register(_ context.Context, _ uint) {}
func (mockPresenceStore) Count() int                         { return 0 }

func TestConfig_ReturnsJSON(t *testing.T) {
	h := NewHandler(auth.NewValidator(""), &mockUserProvider{}, mockPresenceStore{}, "", "")
	req := httptest.NewRequest("GET", "/api/config", nil)
	rec := httptest.NewRecorder()
	h.Config(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", rec.Code)
	}
	var out map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&out); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if _, ok := out["bot_username"]; !ok {
		t.Error("response must have bot_username key")
	}
}

func TestLeaderboard_ReturnsEntries(t *testing.T) {
	entries := []repository.LeaderboardEntry{
		{Rank: 1, UserID: 1, DisplayName: "Alice", TotalProfit: 100},
		{Rank: 2, UserID: 2, DisplayName: "Bob", TotalProfit: 50},
	}
	provider := &mockUserProvider{leaderboard: entries}
	h := NewHandler(auth.NewValidator(""), provider, mockPresenceStore{}, "", "")
	req := httptest.NewRequest("GET", "/api/leaderboard?limit=10", nil)
	rec := httptest.NewRecorder()
	h.Leaderboard(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", rec.Code)
	}
	var out []repository.LeaderboardEntry
	if err := json.NewDecoder(rec.Body).Decode(&out); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(out) != 2 {
		t.Errorf("len(entries) = %d, want 2", len(out))
	}
	if out[0].DisplayName != "Alice" || out[0].TotalProfit != 100 {
		t.Errorf("first entry = %+v", out[0])
	}
}

func TestBotWebhook_RejectsWithoutSecretToken(t *testing.T) {
	h := NewHandler(auth.NewValidator(""), &mockUserProvider{}, mockPresenceStore{}, "fake-token", "my-secret")
	body := []byte(`{"message":{"message_id":1,"from":{"id":123},"chat":{"id":123},"text":"/start r_456"}}`)
	req := httptest.NewRequest("POST", "/api/bot/webhook", nil)
	req.Body = io.NopCloser(bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.BotWebhook(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Errorf("status = %d, want 403 (missing X-Telegram-Bot-Api-Secret-Token)", rec.Code)
	}
}

func TestBotWebhook_AcceptsWithCorrectSecretToken(t *testing.T) {
	h := NewHandler(auth.NewValidator(""), &mockUserProvider{}, mockPresenceStore{}, "fake-token", "my-secret")
	body := []byte(`{"message":{"message_id":1,"from":{"id":123},"chat":{"id":123},"text":"/start r_456"}}`)
	req := httptest.NewRequest("POST", "/api/bot/webhook", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "my-secret")
	rec := httptest.NewRecorder()
	h.BotWebhook(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want 200", rec.Code)
	}
}
