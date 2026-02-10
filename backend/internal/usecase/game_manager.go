package usecase

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// GameManager — управление сессиями: создание комнат, старт/стоп.
type GameManager struct {
	userRepo domain.UserRepository
	roomRepo domain.RoomRepository
}

// NewGameManager создаёт GameManager с инжектированными зависимостями.
func NewGameManager(userRepo domain.UserRepository, roomRepo domain.RoomRepository) *GameManager {
	return &GameManager{userRepo: userRepo, roomRepo: roomRepo}
}

// JoinRoom — игрок входит в комнату (списание ставки, создание змейки).
func (gm *GameManager) JoinRoom(ctx context.Context, userID int64, roomID string, stake float64) error {
	// TODO: проверить баланс, списать, создать змейку
	_ = userID
	_ = roomID
	_ = stake
	return nil
}
