package usecase

import (
	"context"
	"strings"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"go.uber.org/zap"
)

// RewardService реализует RewardCreditor и GameWallet: начисление наград с fallback в pending_rewards при ошибке.
type RewardService struct {
	txManager   *payment.TxManager
	pendingRepo repository.PendingRewardRepository
	log         *zap.Logger
}

// NewRewardService создаёт RewardService.
func NewRewardService(txManager *payment.TxManager, pendingRepo repository.PendingRewardRepository, log *zap.Logger) *RewardService {
	if log == nil {
		log = zap.L()
	}
	return &RewardService{
		txManager:   txManager,
		pendingRepo: pendingRepo,
		log:         log,
	}
}

// AddGameReward начисляет награду. При ошибке TxManager — сохраняет в pending_rewards для повторной обработки.
func (s *RewardService) AddGameReward(ctx context.Context, userID uint, amount float64, referenceID string) error {
	if amount <= 0 {
		return nil
	}
	err := s.txManager.AddGameReward(ctx, userID, amount, referenceID)
	if err == nil {
		return nil
	}
	s.log.Warn("AddGameReward failed, saving to pending_rewards",
		zap.Uint("userID", userID), zap.Float64("amount", amount), zap.String("referenceID", referenceID), zap.Error(err))

	pr := &domain.PendingReward{
		UserID:      userID,
		Amount:      amount,
		ReferenceID: referenceID,
		Source:      inferSource(referenceID),
		Status:      "pending",
	}
	if err := s.pendingRepo.Create(ctx, pr); err != nil {
		s.log.Error("failed to save pending_reward", zap.Uint("userID", userID), zap.Error(err))
		return err
	}
	return nil
}

// PlaceBet делегирует TxManager (без изменений).
func (s *RewardService) PlaceBet(ctx context.Context, userID uint, amount float64) error {
	return s.txManager.PlaceBet(ctx, userID, amount)
}

// StartProcessor запускает фоновую обработку pending_rewards. Вызывать при старте сервера.
func (s *RewardService) StartProcessor(ctx context.Context) {
	proc := NewPendingRewardProcessor(s.txManager, s.pendingRepo, s.log)
	go proc.Start(ctx)
}

// inferSource определяет source по префиксу referenceID.
func inferSource(referenceID string) string {
	switch {
	case strings.HasPrefix(referenceID, "refund:"):
		return "refund"
	case strings.Contains(referenceID, ":unreg:"):
		return "unreg"
	case strings.Contains(referenceID, ":shutdown:"):
		return "shutdown"
	case strings.Contains(referenceID, ":drain"):
		return "drain"
	default:
		return "unreg"
	}
}
