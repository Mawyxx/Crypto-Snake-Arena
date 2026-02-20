package usecase

import (
	"context"
	"errors"
	"strconv"

	"github.com/crypto-snake-arena/server/internal/game"
)

var ErrRoomFull = errors.New("room is full")

type gameWallet interface {
	PlaceBet(ctx context.Context, userID uint, amount float64) error
	AddGameReward(ctx context.Context, userID uint, amount float64, referenceID string) error
}

// GameManager — управление сессиями: создание комнат, старт/стоп.
// Вход в игру (ставка/рефанд) централизован в usecase, transport остаётся тонким.
type GameManager struct {
	wallet gameWallet
}

// NewGameManager создаёт GameManager.
func NewGameManager(wallet gameWallet) *GameManager {
	return &GameManager{wallet: wallet}
}

// JoinRoom проверяет room capacity и списывает ставку перед входом.
func (gm *GameManager) JoinRoom(ctx context.Context, userID uint, stake float64, room *game.Room) error {
	if room == nil || !room.CanJoin() {
		return ErrRoomFull
	}
	return gm.wallet.PlaceBet(ctx, userID, stake)
}

// RefundFailedJoin возвращает ставку, если подключение сорвалось после PlaceBet.
func (gm *GameManager) RefundFailedJoin(ctx context.Context, userID uint, stake float64, reason string) error {
	if stake <= 0 {
		return nil
	}
	refID := "refund:" + reason + ":" + strconv.FormatUint(uint64(userID), 10)
	return gm.wallet.AddGameReward(ctx, userID, stake, refID)
}
