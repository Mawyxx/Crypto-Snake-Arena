package game

import (
	"log"
	"math"
	"sync"

	"github.com/google/uuid"
)

// QueuedPlayer — игрок в очереди ожидания.
type QueuedPlayer struct {
	ID     string
	UserID uint
	TgID   int64
	Stake  float64
	Ready  chan *Room // буферизован 1, чтобы не блокировать при отправке
	Done   chan struct{}
}

// RoomManager хранит активные комнаты и выдаёт свободную или создаёт новую.
// Поддерживает матчмейкинг по ставке и очередь ожидания (FIFO).
type RoomManager struct {
	mu               sync.RWMutex
	rooms            map[string]*Room
	queue            []*QueuedPlayer
	queueByID        map[string]*QueuedPlayer // для RemoveFromQueue
	rewardCreditor   RewardCreditor
	deathHandler     DeathHandler
	resultRecorder   GameResultRecorder
}

// NewRoomManager создаёт менеджер комнат.
func NewRoomManager(rewardCreditor RewardCreditor, deathHandler DeathHandler, resultRecorder GameResultRecorder) *RoomManager {
	return &RoomManager{
		rooms:          make(map[string]*Room),
		queue:          nil,
		queueByID:      make(map[string]*QueuedPlayer),
		rewardCreditor: rewardCreditor,
		deathHandler:   deathHandler,
		resultRecorder: resultRecorder,
	}
}

// GetOrCreateRoom возвращает комнату с минимальным |avgStake - stake| или (nil, true) если все заняты.
// При отсутствии комнат создаёт новую.
func (m *RoomManager) GetOrCreateRoom(stake float64) (room *Room, queued bool) {
	m.mu.RLock()
	var best *Room
	bestDist := -1.0
	for _, r := range m.rooms {
		if !r.CanJoin() {
			continue
		}
		avg := r.AverageStake()
		dist := math.Abs(avg - stake)
		if best == nil || dist < bestDist {
			best = r
			bestDist = dist
		}
	}
	m.mu.RUnlock()

	if best != nil {
		return best, false
	}

	// Нет комнат с местом: создать новую только если комнат вообще нет (первый игрок)
	m.mu.Lock()
	defer m.mu.Unlock()

	// Double-check
	for _, r := range m.rooms {
		if r.CanJoin() {
			return r, false
		}
	}

	// Нет комнат или все заняты
	if len(m.rooms) == 0 {
		room = m.createRoom(nil)
		go room.Run()
		log.Printf("[RoomManager] new room %s created (first), total: %d", room.ID, len(m.rooms))
		return room, false
	}

	// Все заняты — в очередь
	return nil, true
}

// createRoom создаёт комнату с onSlotFreed. Вызывать под m.mu.
func (m *RoomManager) createRoom(onSlotFreed func(*Room)) *Room {
	if onSlotFreed == nil {
		onSlotFreed = m.onSlotFreed
	}
	room := NewRoom(m.rewardCreditor, m.deathHandler, m.resultRecorder, func(roomID string) {
		m.mu.Lock()
		delete(m.rooms, roomID)
		m.mu.Unlock()
		log.Printf("[RoomManager] room %s removed from map", roomID)
	}, onSlotFreed)
	m.rooms[room.ID] = room
	return room
}

func (m *RoomManager) onSlotFreed(room *Room) {
	m.mu.Lock()
	if len(m.queue) == 0 {
		m.mu.Unlock()
		return
	}
	p := m.queue[0]
	m.queue = m.queue[1:]
	delete(m.queueByID, p.ID)
	m.mu.Unlock()

	select {
	case p.Ready <- room:
	default:
		// Канал полон или получатель вышел — игнорируем
	}
}

// AddToQueue добавляет игрока в очередь. Если len>=2 — создаёт комнату для первых двух.
func (m *RoomManager) AddToQueue(p *QueuedPlayer) {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	if p.Ready == nil {
		p.Ready = make(chan *Room, 1)
	}
	if p.Done == nil {
		p.Done = make(chan struct{})
	}

	m.mu.Lock()
	m.queue = append(m.queue, p)
	m.queueByID[p.ID] = p

	if len(m.queue) >= 2 {
		p1 := m.queue[0]
		p2 := m.queue[1]
		m.queue = m.queue[2:]
		delete(m.queueByID, p1.ID)
		delete(m.queueByID, p2.ID)
		room := m.createRoom(nil)
		m.mu.Unlock()

		go room.Run()
		log.Printf("[RoomManager] new room %s created from queue, total: %d", room.ID, len(m.rooms))

		select {
		case p1.Ready <- room:
		default:
		}
		select {
		case p2.Ready <- room:
		default:
		}
		return
	}
	m.mu.Unlock()
}

// RemoveFromQueue удаляет игрока из очереди (при disconnect).
func (m *RoomManager) RemoveFromQueue(id string) {
	m.mu.Lock()
	p, ok := m.queueByID[id]
	if !ok {
		m.mu.Unlock()
		return
	}
	delete(m.queueByID, id)
	for i := range m.queue {
		if m.queue[i].ID == id {
			m.queue = append(m.queue[:i], m.queue[i+1:]...)
			break
		}
	}
	m.mu.Unlock()

	// Сигнализируем ожидающей горутине выйти
	select {
	case <-p.Done:
	default:
		close(p.Done)
	}
}

// Stop останавливает все активные комнаты (для graceful shutdown).
func (m *RoomManager) Stop() {
	m.mu.Lock()
	snapshot := make([]*Room, 0, len(m.rooms))
	for id, room := range m.rooms {
		snapshot = append(snapshot, room)
		log.Printf("[RoomManager] stop requested for room %s", id)
	}
	m.mu.Unlock()
	for _, room := range snapshot {
		room.Stop()
	}
}
