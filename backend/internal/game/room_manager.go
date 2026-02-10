package game

import (
	"log"
	"sync"
)

// RoomManager хранит активные комнаты и выдаёт свободную или создаёт новую.
// Каждая комната запускается в своей горутине с собственным Ticker.
type RoomManager struct {
	mu              sync.RWMutex
	rooms           map[string]*Room
	rewardCreditor  RewardCreditor
	deathHandler    DeathHandler
}

// NewRoomManager создаёт менеджер комнат с заданными creditor и deathHandler для новых комнат.
func NewRoomManager(rewardCreditor RewardCreditor, deathHandler DeathHandler) *RoomManager {
	return &RoomManager{
		rooms:          make(map[string]*Room),
		rewardCreditor: rewardCreditor,
		deathHandler:   deathHandler,
	}
}

// GetOrCreateRoom возвращает комнату, в которую можно войти (PlayerCount < MaxPlayers).
// Если такой нет — создаёт новую, запускает её в отдельной горутине и возвращает.
func (m *RoomManager) GetOrCreateRoom() *Room {
	m.mu.RLock()
	for _, room := range m.rooms {
		if room.CanJoin() {
			m.mu.RUnlock()
			return room
		}
	}
	m.mu.RUnlock()

	m.mu.Lock()
	// Повторная проверка после взятия write lock
	for _, room := range m.rooms {
		if room.CanJoin() {
			m.mu.Unlock()
			return room
		}
	}
	room := NewRoom(m.rewardCreditor, m.deathHandler)
	m.rooms[room.ID] = room
	m.mu.Unlock()

	go room.Run()

	log.Printf("[RoomManager] new room %s created, total rooms: %d", room.ID, len(m.rooms))
	return room
}

// Stop останавливает все активные комнаты (для graceful shutdown).
func (m *RoomManager) Stop() {
	m.mu.Lock()
	defer m.mu.Unlock()
	for id, room := range m.rooms {
		room.Stop()
		log.Printf("[RoomManager] stop requested for room %s", id)
	}
}
