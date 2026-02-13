package presence

import (
	"context"
	"sync"
	"time"
)

const (
	defaultTTL   = 60 * time.Second
	cleanupEvery = 15 * time.Second
)

// Store — in-memory хранилище presence (user online). TTL 60 сек.
type Store struct {
	mu    sync.RWMutex
	users map[uint]time.Time
	ttl   time.Duration
	done  chan struct{}
}

// NewStore создаёт Store и запускает goroutine очистки устаревших записей.
func NewStore() *Store {
	s := &Store{
		users: make(map[uint]time.Time),
		ttl:   defaultTTL,
		done:  make(chan struct{}),
	}
	go s.cleanupLoop()
	return s
}

// Register обновляет timestamp для userID (heartbeat).
func (s *Store) Register(ctx context.Context, userID uint) {
	_ = ctx
	s.mu.Lock()
	s.users[userID] = time.Now()
	s.mu.Unlock()
}

// Count возвращает количество уникальных пользователей, активных за последние TTL.
func (s *Store) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	cutoff := time.Now().Add(-s.ttl)
	count := 0
	for _, lastSeen := range s.users {
		if lastSeen.After(cutoff) {
			count++
		}
	}
	return count
}

// Stop останавливает goroutine очистки (для graceful shutdown).
func (s *Store) Stop() {
	close(s.done)
}

func (s *Store) cleanupLoop() {
	ticker := time.NewTicker(cleanupEvery)
	defer ticker.Stop()
	for {
		select {
		case <-s.done:
			return
		case <-ticker.C:
			s.cleanup()
		}
	}
}

func (s *Store) cleanup() {
	s.mu.Lock()
	defer s.mu.Unlock()
	cutoff := time.Now().Add(-s.ttl)
	for uid, lastSeen := range s.users {
		if lastSeen.Before(cutoff) {
			delete(s.users, uid)
		}
	}
}
