package ws

import (
	"testing"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/game"
)

func TestReconnectRegistryResume(t *testing.T) {
	reg := newReconnectRegistry()
	room := game.NewRoom(nil, nil, nil, nil, nil, nil)
	room.Snakes[10] = domain.NewSnake(10)

	reg.Schedule("token-1", reconnectSession{
		userID: 1,
		tgID:   10,
		stake:  0.3,
		room:   room,
	}, 100*time.Millisecond, func(reconnectSession) {})

	if _, ok := reg.Resume("token-1", 1, 10); !ok {
		t.Fatalf("resume should succeed while session alive")
	}
}

func TestReconnectRegistryExpire(t *testing.T) {
	reg := newReconnectRegistry()
	room := game.NewRoom(nil, nil, nil, nil, nil, nil)
	room.Snakes[20] = domain.NewSnake(20)

	expired := make(chan struct{}, 1)
	reg.Schedule("token-2", reconnectSession{
		userID: 2,
		tgID:   20,
		stake:  0.7,
		room:   room,
	}, 10*time.Millisecond, func(reconnectSession) {
		expired <- struct{}{}
	})

	time.Sleep(25 * time.Millisecond)
	select {
	case <-expired:
	default:
		t.Fatalf("expected expiration callback")
	}
}
