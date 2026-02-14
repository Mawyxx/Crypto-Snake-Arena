package repository

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// PendingRewardRepository — репозиторий для pending_rewards.
type PendingRewardRepository interface {
	Create(ctx context.Context, pr *domain.PendingReward) error
	GetPending(ctx context.Context, limit int) ([]*domain.PendingReward, error)
	MarkProcessing(ctx context.Context, id string) error
	MarkCompleted(ctx context.Context, id string) error
	MarkFailed(ctx context.Context, id string, errMsg string) error
}

type pendingRewardRepository struct {
	db *gorm.DB
}

// NewPendingRewardRepository создаёт репозиторий.
func NewPendingRewardRepository(db *gorm.DB) PendingRewardRepository {
	return &pendingRewardRepository{db: db}
}

// Create вставляет новую запись.
func (r *pendingRewardRepository) Create(ctx context.Context, pr *domain.PendingReward) error {
	if pr.ID == "" {
		pr.ID = uuid.New().String()
	}
	return r.db.WithContext(ctx).Create(pr).Error
}

// GetPending возвращает записи со status = 'pending' для обработки.
// Атомарно помечает их как 'processing' в одной транзакции.
// Использует FOR UPDATE SKIP LOCKED для конкурентной обработки несколькими воркерами.
func (r *pendingRewardRepository) GetPending(ctx context.Context, limit int) ([]*domain.PendingReward, error) {
	if limit <= 0 {
		limit = 10
	}
	var rows []*domain.PendingReward
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).
			Where("status = ? AND retry_count < ?", "pending", 5).
			Order("created_at ASC").
			Limit(limit).
			Find(&rows).Error; err != nil {
			return err
		}
		for _, pr := range rows {
			if err := tx.Model(pr).Update("status", "processing").Error; err != nil {
				return err
			}
		}
		return nil
	})
	return rows, err
}

// MarkProcessing устанавливает status = 'processing'.
func (r *pendingRewardRepository) MarkProcessing(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Model(&domain.PendingReward{}).
		Where("id = ?", id).
		Update("status", "processing").Error
}

// MarkCompleted устанавливает status = 'completed'.
func (r *pendingRewardRepository) MarkCompleted(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Model(&domain.PendingReward{}).
		Where("id = ?", id).
		Update("status", "completed").Error
}

// MarkFailed обновляет last_error, retry_count++. Если retry_count >= 5 — status = 'failed', иначе status = 'pending' для повторной попытки.
func (r *pendingRewardRepository) MarkFailed(ctx context.Context, id string, errMsg string) error {
	var pr domain.PendingReward
	if err := r.db.WithContext(ctx).First(&pr, "id = ?", id).Error; err != nil {
		return err
	}
	newCount := pr.RetryCount + 1
	status := "pending"
	if newCount >= 5 {
		status = "failed"
	}
	return r.db.WithContext(ctx).Model(&domain.PendingReward{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":      status,
			"last_error":  errMsg,
			"retry_count": newCount,
		}).Error
}
