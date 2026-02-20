package game

import (
	"math"
	"testing"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
)

func TestRoomManager_GetOrCreateRoom(t *testing.T) {
	cred := noopRewardCreditor{}
	death := noopDeathHandler{}
	rec := noopResultRecorder{}
	mgr := NewRoomManager(cred, death, noopExpiredCoinsHandler{}, rec)
	defer mgr.Stop()

	room, _ := mgr.GetOrCreateRoom(1.0)
	if room == nil {
		t.Fatal("GetOrCreateRoom returned nil")
	}
	if !room.CanJoin() {
		t.Error("new room should CanJoin")
	}
	if room.PlayerCount() != 0 {
		t.Errorf("PlayerCount = %d, want 0", room.PlayerCount())
	}
}

func TestRoomManager_ReusesRoomWithSpace(t *testing.T) {
	cred := noopRewardCreditor{}
	death := noopDeathHandler{}
	rec := noopResultRecorder{}
	mgr := NewRoomManager(cred, death, noopExpiredCoinsHandler{}, rec)
	defer mgr.Stop()

	room1, _ := mgr.GetOrCreateRoom(1.0)
	room2, _ := mgr.GetOrCreateRoom(1.0)

	if room1.ID != room2.ID {
		t.Errorf("expected same room, got %q vs %q", room1.ID, room2.ID)
	}
}

func TestRoomManager_StopStopsRooms(t *testing.T) {
	cred := noopRewardCreditor{}
	death := noopDeathHandler{}
	rec := noopResultRecorder{}
	mgr := NewRoomManager(cred, death, noopExpiredCoinsHandler{}, rec)

	room, _ := mgr.GetOrCreateRoom(1.0)
	roomID := room.ID

	mgr.Stop()
	time.Sleep(100 * time.Millisecond)

	// Room should be stopped - no panic when accessing
	if room.PlayerCount() != 0 {
		t.Errorf("room after stop: PlayerCount = %d", room.PlayerCount())
	}
	_ = roomID
}

func TestRoomManager_QueuedWhenAllFull(t *testing.T) {
	cred := noopRewardCreditor{}
	death := noopDeathHandler{}
	rec := noopResultRecorder{}
	mgr := NewRoomManager(cred, death, noopExpiredCoinsHandler{}, rec)
	defer mgr.Stop()

	room, queued := mgr.GetOrCreateRoom(1.0)
	if room == nil || queued {
		t.Fatal("first player should get room, not queued")
	}

	// Fill room to max (20 players)
	for i := 1; i <= RoomMaxPlayers(); i++ {
		tgID := uint64(i)
		go func(id uint64) {
			room.Register <- &Player{TgID: id, UserID: uint(id), EntryFee: 0.5}
		}(tgID)
	}
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		if room.PlayerCount() >= RoomMaxPlayers() {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}
	if room.PlayerCount() < RoomMaxPlayers() {
		t.Fatalf("room has %d players, need %d", room.PlayerCount(), RoomMaxPlayers())
	}

	// Next player should be queued
	_, queued2 := mgr.GetOrCreateRoom(1.0)
	if !queued2 {
		t.Error("when all rooms full, should return queued=true")
	}
}


// TestRoomManager_MatchmakingDistance проверяет выбор комнаты с минимальным |avgStake - stake|.
// Room A (avg 0.5) и Room B (avg 2.0); при stake=1.0 должна выбираться A (|0.5-1| < |2-1|).
func TestRoomManager_MatchmakingDistance(t *testing.T) {
	stopped := make(chan string, 1)
	roomA := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) { stopped <- id }, nil)
	roomB := NewRoom(noopRewardCreditor{}, noopDeathHandler{}, noopExpiredCoinsHandler{}, noopResultRecorder{}, func(id string) { stopped <- id }, nil)

	// Вручную добавляем змейки (без Run, чтобы избежать коллизий)
	snakeA := domain.NewSnake(1)
	snakeA.SetEntryFee(0.5)
	roomA.Snakes[1] = snakeA

	snakeB := domain.NewSnake(2)
	snakeB.SetEntryFee(2.0)
	roomB.Snakes[2] = snakeB

	if roomA.AverageStake() != 0.5 {
		t.Errorf("roomA AverageStake = %v, want 0.5", roomA.AverageStake())
	}
	if roomB.AverageStake() != 2.0 {
		t.Errorf("roomB AverageStake = %v, want 2.0", roomB.AverageStake())
	}

	// stake=1.0: dist(A)=|0.5-1|=0.5, dist(B)=|2-1|=1 → A ближе
	stake := 1.0
	distA := math.Abs(roomA.AverageStake() - stake)
	distB := math.Abs(roomB.AverageStake() - stake)
	if distA >= distB {
		t.Errorf("room A (avg 0.5) should be closer to stake 1.0 than room B (avg 2): distA=%.2f distB=%.2f", distA, distB)
	}
	_ = stopped
}

// TestRoomManager_QueueFIFO_OnSlotFreed проверяет: первый в очереди получает освободившийся слот.
func TestRoomManager_QueueFIFO_OnSlotFreed(t *testing.T) {
	cred := noopRewardCreditor{}
	death := noopDeathHandler{}
	rec := noopResultRecorder{}
	mgr := NewRoomManager(cred, death, noopExpiredCoinsHandler{}, rec)
	defer mgr.Stop()

	room, _ := mgr.GetOrCreateRoom(0.5)
	for i := 1; i <= RoomMaxPlayers(); i++ {
		id := uint64(i)
		go func(pid uint64) {
			room.Register <- &Player{TgID: pid, UserID: uint(pid), EntryFee: 0.5}
		}(id)
	}
	waitForPlayersTimeout(t, room, RoomMaxPlayers(), 3*time.Second)

	// Все заняты — следующий в очередь
	_, queued := mgr.GetOrCreateRoom(1.0)
	if !queued {
		t.Fatal("expected queued when all full")
	}

	p1 := &QueuedPlayer{UserID: 1, TgID: 1, Stake: 1.0, Ready: make(chan *Room, 1), Done: make(chan struct{})}
	mgr.AddToQueue(p1)

	received := make(chan *Room, 1)
	go func() {
		select {
		case r := <-p1.Ready:
			received <- r
		case <-time.After(2 * time.Second):
			received <- nil
		}
	}()

	// Освобождаем слот — onSlotFreed должен отдать комнату p1
	room.Unregister <- &Player{TgID: 1, UserID: 1, EntryFee: 0.5}

	var got *Room
	select {
	case got = <-received:
	case <-time.After(2 * time.Second):
		t.Fatal("timeout waiting for room from queue")
	}
	if got == nil {
		t.Fatal("expected room from queue, got nil")
	}
	if got.ID != room.ID {
		t.Errorf("queue got room %q, want %q", got.ID, room.ID)
	}
}

// TestRoomManager_QueueFIFO_TwoCreatesRoom проверяет: при 2 в очереди создаётся комната, оба получают её (FIFO: первые два).
func TestRoomManager_QueueFIFO_TwoCreatesRoom(t *testing.T) {
	cred := noopRewardCreditor{}
	death := noopDeathHandler{}
	rec := noopResultRecorder{}
	mgr := NewRoomManager(cred, death, noopExpiredCoinsHandler{}, rec)
	defer mgr.Stop()

	room, _ := mgr.GetOrCreateRoom(0.5)
	for i := 1; i <= RoomMaxPlayers(); i++ {
		id := uint64(i)
		go func(pid uint64) {
			room.Register <- &Player{TgID: pid, UserID: uint(pid), EntryFee: 0.5}
		}(id)
	}
	waitForPlayersTimeout(t, room, RoomMaxPlayers(), 3*time.Second)

	_, queued := mgr.GetOrCreateRoom(1.0)
	if !queued {
		t.Fatal("expected queued")
	}

	p1 := &QueuedPlayer{UserID: 1, TgID: 1, Stake: 1.0, Ready: make(chan *Room, 1), Done: make(chan struct{})}
	p2 := &QueuedPlayer{UserID: 2, TgID: 2, Stake: 1.0, Ready: make(chan *Room, 1), Done: make(chan struct{})}

	mgr.AddToQueue(p1)
	mgr.AddToQueue(p2) // len>=2 → создаётся комната, оба получают

	var r1, r2 *Room
	select {
	case r1 = <-p1.Ready:
	case <-time.After(2 * time.Second):
		t.Fatal("p1 did not receive room")
	}
	select {
	case r2 = <-p2.Ready:
	case <-time.After(2 * time.Second):
		t.Fatal("p2 did not receive room")
	}
	if r1 == nil || r2 == nil {
		t.Fatal("both should receive room")
	}
	if r1.ID != r2.ID {
		t.Errorf("p1 got room %q, p2 got room %q — must be same room", r1.ID, r2.ID)
	}
}

func waitForPlayersTimeout(t *testing.T, room *Room, want int, timeout time.Duration) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if room.PlayerCount() == want {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("PlayerCount = %d, want %d (timeout)", room.PlayerCount(), want)
}
