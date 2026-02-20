package ws

import (
	"sync"
	"time"

	"github.com/crypto-snake-arena/server/internal/game"
)

type reconnectSession struct {
	userID uint
	tgID   uint64
	stake  float64
	room   *game.Room
}

type reconnectEntry struct {
	session reconnectSession
	timer   *time.Timer
}

type reconnectRegistry struct {
	mu      sync.Mutex
	entries map[string]reconnectEntry
}

func newReconnectRegistry() *reconnectRegistry {
	return &reconnectRegistry{entries: make(map[string]reconnectEntry)}
}

func (r *reconnectRegistry) Schedule(
	token string,
	session reconnectSession,
	ttl time.Duration,
	onExpire func(reconnectSession),
) {
	if token == "" {
		return
	}
	r.mu.Lock()
	if prev, ok := r.entries[token]; ok && prev.timer != nil {
		prev.timer.Stop()
	}
	entry := reconnectEntry{
		session: session,
	}
	entry.timer = time.AfterFunc(ttl, func() {
		r.mu.Lock()
		delete(r.entries, token)
		r.mu.Unlock()
		onExpire(session)
	})
	r.entries[token] = entry
	r.mu.Unlock()
}

func (r *reconnectRegistry) Resume(token string, userID uint, tgID uint64) (reconnectSession, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	entry, ok := r.entries[token]
	if !ok {
		return reconnectSession{}, false
	}
	if entry.session.userID != userID || entry.session.tgID != tgID {
		return reconnectSession{}, false
	}
	if entry.timer != nil {
		entry.timer.Stop()
	}
	entry.session.room.Mu.RLock()
	_, stillInRoom := entry.session.room.Snakes[tgID]
	entry.session.room.Mu.RUnlock()
	if !stillInRoom {
		delete(r.entries, token)
		return reconnectSession{}, false
	}
	delete(r.entries, token)
	return entry.session, true
}
