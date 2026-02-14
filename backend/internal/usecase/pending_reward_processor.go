package usecase

import (
	"context"
	"time"

	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"go.uber.org/zap"
)

const (
	defaultProcessInterval = 15 * time.Second
	defaultBatchSize       = 10
)

// PendingRewardProcessor — фоновая обработка pending_rewards.
type PendingRewardProcessor struct {
	txManager   *payment.TxManager
	pendingRepo repository.PendingRewardRepository
	interval    time.Duration
	batchSize   int
	log         *zap.Logger
	done        chan struct{}
}

// NewPendingRewardProcessor создаёт процессор.
func NewPendingRewardProcessor(txManager *payment.TxManager, pendingRepo repository.PendingRewardRepository, log *zap.Logger) *PendingRewardProcessor {
	if log == nil {
		log = zap.L()
	}
	return &PendingRewardProcessor{
		txManager:   txManager,
		pendingRepo: pendingRepo,
		interval:    defaultProcessInterval,
		batchSize:   defaultBatchSize,
		log:         log,
		done:        make(chan struct{}),
	}
}

// Start запускает фоновую обработку. Блокируется до вызова Stop.
func (p *PendingRewardProcessor) Start(ctx context.Context) {
	ticker := time.NewTicker(p.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			p.log.Info("pending reward processor stopping")
			return
		case <-p.done:
			return
		case <-ticker.C:
			p.processBatch(ctx)
		}
	}
}

// Stop останавливает процессор.
func (p *PendingRewardProcessor) Stop() {
	close(p.done)
}

func (p *PendingRewardProcessor) processBatch(ctx context.Context) {
	rows, err := p.pendingRepo.GetPending(ctx, p.batchSize)
	if err != nil {
		p.log.Error("GetPending failed", zap.Error(err))
		return
	}
	if len(rows) == 0 {
		return
	}

	for _, pr := range rows {
		if err := p.txManager.AddGameReward(ctx, pr.UserID, pr.Amount, pr.ReferenceID); err != nil {
			if markErr := p.pendingRepo.MarkFailed(ctx, pr.ID, err.Error()); markErr != nil {
				p.log.Error("MarkFailed failed", zap.String("id", pr.ID), zap.Error(markErr))
			}
			p.log.Warn("retry AddGameReward failed", zap.String("id", pr.ID), zap.Uint("userID", pr.UserID), zap.Error(err))
			continue
		}
		if err := p.pendingRepo.MarkCompleted(ctx, pr.ID); err != nil {
			p.log.Error("MarkCompleted failed", zap.String("id", pr.ID), zap.Error(err))
		}
	}
}
