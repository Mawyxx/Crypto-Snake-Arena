package game

import (
	"context"
	"math"
	"sync"
	"testing"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
)

type noopRewardCreditor struct{}
type noopDeathHandler struct{}
type noopResultRecorder struct{}

func (noopRewardCreditor) AddGameReward(ctx context.Context, userID uint, amount float64, referenceID string) error {
	return nil
}
func (noopDeathHandler) OnPlayerDeath(ctx context.Context, victimUserID uint, victimScore, entryFee float64, referenceID, roomID string) error {
	return nil
}
func (noopResultRecorder) RecordGameResult(ctx context.Context, userID uint, stake, loot float64, roomID string, status string, durationSec int) error {
	return nil
}

type noopExpiredCoinsHandler struct{}

func (noopExpiredCoinsHandler) OnExpiredCoins(ctx context.Context, roomID string, totalValue float64) error {
	return nil
}

func TestRoom_RegisterUnregister(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	player := &Player{TgID: 1, UserID: 100, EntryFee: 0.5}
	go func() { room.Register <- player }()
	waitForPlayers(t, room, 1, 500*time.Millisecond)

	room.Unregister <- player
	waitForPlayers(t, room, 0, 500*time.Millisecond)
}

func waitForPlayers(t *testing.T, room *Room, want int, timeout time.Duration) {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if room.PlayerCount() == want {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Errorf("PlayerCount = %d, want %d (timeout)", room.PlayerCount(), want)
}

func TestRoom_InputProcessed(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	go func() { room.Register <- &Player{TgID: 1, UserID: 100, EntryFee: 0.5} }()
	waitForPlayers(t, room, 1, 200*time.Millisecond)
	room.Inputs <- &PlayerInput{PlayerID: 1, Angle: 0.1, Boost: false}
	// Input channel is buffered; sends should not block
}

func TestRoom_AverageStake(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	if avg := room.AverageStake(); avg != 0 {
		t.Errorf("empty room AverageStake = %v, want 0", avg)
	}

	player := &Player{TgID: 1, UserID: 100, EntryFee: 0.5}
	go func() { room.Register <- player }()
	waitForPlayers(t, room, 1, 500*time.Millisecond)

	if avg := room.AverageStake(); avg != 0.5 {
		t.Errorf("room with 1 player (stake 0.5) AverageStake = %v, want 0.5", avg)
	}
}

func TestRoom_PlayerCountAndCanJoin(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	if !room.CanJoin() {
		t.Error("empty room should CanJoin")
	}

	go func() { room.Register <- &Player{TgID: 1, UserID: 100, EntryFee: 0.5} }()
	waitForPlayers(t, room, 1, 500*time.Millisecond)
	if !room.CanJoin() {
		t.Error("room with 1 player should still CanJoin")
	}
}

func TestRoom_SubscribeReceivesSnapshot(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	go func() { room.Register <- &Player{TgID: 1, UserID: 100, EntryFee: 0.5} }()
	waitForPlayers(t, room, 1, 500*time.Millisecond)

	ch, closeFn := room.Subscribe(1)
	defer closeFn()

	time.Sleep(3 * TickRate)
	select {
	case data := <-ch:
		if len(data) == 0 {
			t.Error("snapshot data is empty")
		}
	case <-time.After(200 * time.Millisecond):
		t.Error("no snapshot received")
	}
}

func TestRoom_UnregisterDecreasesCount(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	for i := 1; i <= 5; i++ {
		pid := uint64(i)
		go func(id uint64) {
			room.Register <- &Player{TgID: id, UserID: uint(id), EntryFee: 0.5}
		}(pid)
	}
	waitForPlayers(t, room, 5, 500*time.Millisecond)

	room.Unregister <- &Player{TgID: 1, UserID: 1, EntryFee: 0.5}
	waitForPlayers(t, room, 4, 500*time.Millisecond)
}

func TestRoom_StopRemovesFromManager(t *testing.T) {
	var wg sync.WaitGroup
	var removedID string
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		removedID = id
		wg.Done()
	}, nil)
	wg.Add(1)
	go room.Run()

	time.Sleep(TickRate)
	room.Stop()
	wg.Wait()

	if removedID != room.ID {
		t.Errorf("onStopped called with %q, want %q", removedID, room.ID)
	}
}

func TestPickSpawnPosition_EmptyRoom(t *testing.T) {
	grid := domain.NewSpatialGrid(1000)
	snakes := make(map[uint64]*domain.Snake)

	x, y := PickSpawnPosition(grid, snakes)

	cx, cy := 500.0, 500.0
	dx, dy := x-cx, y-cy
	dist := math.Sqrt(dx*dx + dy*dy)
	arenaRadius := 500.0
	if dist > arenaRadius {
		t.Errorf("spawn (%.2f, %.2f) is outside arena (dist=%.2f > radius=%.0f)", x, y, dist, arenaRadius)
	}
	if dist < float64(spawnMargin) {
		t.Errorf("spawn (%.2f, %.2f) too close to center (dist=%.2f < margin=%d)", x, y, dist, spawnMargin)
	}
}

func TestPickSpawnPosition_AwayFromOthers(t *testing.T) {
	grid := domain.NewSpatialGrid(1000)
	s1 := domain.NewSnakeAt(1, 500, 500)
	snakes := map[uint64]*domain.Snake{1: s1}

	x, y := PickSpawnPosition(grid, snakes)

	// Should not spawn on top of existing snake
	dx, dy := x-500, y-500
	dist := math.Sqrt(dx*dx + dy*dy)
	if dist < 20 {
		t.Errorf("spawn (%.2f, %.2f) too close to existing snake at (500,500), dist=%.2f", x, y, dist)
	}
	// Should be inside arena
	cx, cy := 500.0, 500.0
	dx2, dy2 := x-cx, y-cy
	distFromCenter := math.Sqrt(dx2*dx2 + dy2*dy2)
	if distFromCenter > 500 {
		t.Errorf("spawn (%.2f, %.2f) outside arena (dist=%.2f > 500)", x, y, distFromCenter)
	}
}

func TestPickSpawnPosition_MultipleSnakes_PrefersSpread(t *testing.T) {
	grid := domain.NewSpatialGrid(1000)
	snakes := map[uint64]*domain.Snake{
		1: domain.NewSnakeAt(1, 200, 500),
		2: domain.NewSnakeAt(2, 800, 500),
		3: domain.NewSnakeAt(3, 500, 200),
	}

	// Запускаем несколько раз — точка должна быть внутри и не на других змейках
	for run := 0; run < 5; run++ {
		x, y := PickSpawnPosition(grid, snakes)
		cx, cy := 500.0, 500.0
		dist := math.Sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy))
		if dist > 500 {
			t.Errorf("run %d: spawn (%.2f, %.2f) outside arena", run, x, y)
		}
		for id, s := range snakes {
			d := math.Sqrt((x-s.HeadX)*(x-s.HeadX) + (y-s.HeadY)*(y-s.HeadY))
			if d < 15 {
				t.Errorf("run %d: spawn (%.2f, %.2f) too close to snake %d at (%.0f, %.0f)", run, x, y, id, s.HeadX, s.HeadY)
			}
		}
	}
}

func TestPickSpawnPosition_SmallArena_ReturnsCenter(t *testing.T) {
	grid := domain.NewSpatialGrid(100) // 100x100, radius 50
	snakes := make(map[uint64]*domain.Snake)

	x, y := PickSpawnPosition(grid, snakes)

	// Радиус 50, margin 50 → maxR <= 0 → return center
	if x != 50 || y != 50 {
		t.Errorf("small arena (100x100): got (%.2f, %.2f), want (50, 50)", x, y)
	}
}

func TestRoom_SnakeSpawnsAtRandomPosition(t *testing.T) {
	stopped := make(chan string, 1)
	room := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) {
		stopped <- id
	}, nil)
	go room.Run()
	defer func() {
		room.Stop()
		<-stopped
	}()

	player := &Player{TgID: 99, UserID: 99, EntryFee: 0.5}
	go func() { room.Register <- player }()
	waitForPlayers(t, room, 1, 500*time.Millisecond)

	room.Mu.Lock()
	snake, ok := room.Snakes[99]
	room.Mu.Unlock()
	if !ok {
		t.Fatal("snake not found after register")
	}
	cx, cy := 500.0, 500.0
	dx, dy := snake.HeadX-cx, snake.HeadY-cy
	dist := math.Sqrt(dx*dx + dy*dy)
	if dist > 500 {
		t.Errorf("spawned snake at (%.2f, %.2f) outside circular arena", snake.HeadX, snake.HeadY)
	}
	// Не в центре (500,500) — случайный спавн
	if snake.HeadX == 500 && snake.HeadY == 500 {
		t.Log("snake spawned at center — possible but rare with random spawn")
	}
}
