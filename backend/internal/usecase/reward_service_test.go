package usecase

import (
	"context"
	"strings"
	"testing"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupRewardServiceTestDB(t *testing.T) (*gorm.DB, *payment.TxManager, repository.PendingRewardRepository) {
	t.Helper()
	name := "file:" + strings.ReplaceAll(t.Name(), "/", "_") + "?mode=memory&cache=shared"
	db, err := gorm.Open(sqlite.Open(name), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
		SkipDefaultTransaction:                   true,
	})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&domain.User{}, &domain.Transaction{}, &domain.PendingReward{}))

	// Создаём пользователя с балансом
	db.Create(&domain.User{ID: 1, TgID: 100, Balance: 10.0})

	txManager := payment.NewTxManager(db, nil)
	pendingRepo := repository.NewPendingRewardRepository(db)
	return db, txManager, pendingRepo
}

func TestRewardService_AddGameReward_Success(t *testing.T) {
	db, txManager, pendingRepo := setupRewardServiceTestDB(t)
	svc := NewRewardService(txManager, pendingRepo, zap.NewNop())

	err := svc.AddGameReward(context.Background(), 1, 2.5, "room-1:unreg:1")
	require.NoError(t, err)

	var user domain.User
	require.NoError(t, db.First(&user, 1).Error)
	assert.InDelta(t, 12.5, user.Balance, 0.0001)

	var count int64
	db.Model(&domain.PendingReward{}).Count(&count)
	assert.Equal(t, int64(0), count, "pending_rewards should be empty on success")
}

func TestRewardService_AddGameReward_FailureSavesToPending(t *testing.T) {
	db, txManager, pendingRepo := setupRewardServiceTestDB(t)
	svc := NewRewardService(txManager, pendingRepo, zap.NewNop())

	// Используем несуществующего userID — TxManager вернёт ошибку (record not found)
	err := svc.AddGameReward(context.Background(), 99999, 2.5, "room-1:unreg:99999")
	require.NoError(t, err) // RewardService не возвращает ошибку при сохранении в pending

	var prs []domain.PendingReward
	require.NoError(t, db.Where("user_id = ?", 99999).Find(&prs).Error)
	require.Len(t, prs, 1)
	assert.Equal(t, 2.5, prs[0].Amount)
	assert.Equal(t, "room-1:unreg:99999", prs[0].ReferenceID)
	assert.Equal(t, "unreg", prs[0].Source)
	assert.Equal(t, "pending", prs[0].Status)
}

func TestRewardService_PlaceBet_Delegates(t *testing.T) {
	_, txManager, pendingRepo := setupRewardServiceTestDB(t)
	svc := NewRewardService(txManager, pendingRepo, zap.NewNop())

	err := svc.PlaceBet(context.Background(), 1, 1.0)
	require.NoError(t, err)
}

func TestRewardService_InferSource(t *testing.T) {
	tests := []struct {
		refID string
		want  string
	}{
		{"refund:room_full:1:uuid", "refund"},
		{"room-1:unreg:1", "unreg"},
		{"room-1:shutdown:123", "shutdown"},
		{"other", "unreg"},
	}
	for _, tt := range tests {
		t.Run(tt.refID, func(t *testing.T) {
			got := inferSource(tt.refID)
			assert.Equal(t, tt.want, got)
		})
	}
}
