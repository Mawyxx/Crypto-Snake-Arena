package usecase

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// WalletManager — логика ставок: списание перед игрой, зачисление выигрыша.
type WalletManager struct {
	userRepo domain.UserRepository
}

// NewWalletManager создаёт WalletManager.
func NewWalletManager(userRepo domain.UserRepository) *WalletManager {
	return &WalletManager{userRepo: userRepo}
}

// Spend — списать сумму (перед входом в арену).
func (wm *WalletManager) Spend(ctx context.Context, userID int64, amount float64) error {
	return wm.userRepo.SpendBalance(ctx, userID, amount)
}

// Credit — зачислить (съел монету, вышел с выигрышем).
func (wm *WalletManager) Credit(ctx context.Context, userID int64, amount float64) error {
	return wm.userRepo.AddBalance(ctx, userID, amount)
}
