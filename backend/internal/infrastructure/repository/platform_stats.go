package repository

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
	"gorm.io/gorm"
)

// PlatformStats — оборот и прибыль платформы.
type PlatformStats struct {
	TotalDeposits float64 `json:"total_deposits"`
	TotalProfit   float64 `json:"total_profit"`
	DeathRake     float64 `json:"death_rake"`
	ExpiredCoins  float64 `json:"expired_coins"`
	WithdrawFee   float64 `json:"withdraw_fee"`
}

// PlatformStatsDB — агрегация оборота и прибыли из transactions и revenue_logs.
type PlatformStatsDB struct {
	db *gorm.DB
}

// NewPlatformStatsDB создаёт провайдер статистики платформы.
func NewPlatformStatsDB(db *gorm.DB) *PlatformStatsDB {
	return &PlatformStatsDB{db: db}
}

// GetPlatformStats возвращает оборот (депозиты) и прибыль (revenue_logs).
func (r *PlatformStatsDB) GetPlatformStats(ctx context.Context) (*PlatformStats, error) {
	var dep struct {
		Total float64 `gorm:"column:total"`
	}
	if err := r.db.WithContext(ctx).Model(&domain.Transaction{}).
		Select("COALESCE(SUM(amount), 0) as total").
		Where("type = ?", "deposit").
		Scan(&dep).Error; err != nil {
		return nil, err
	}
	deposited := dep.Total

	var totalProfit, deathRake, expiredCoins, withdrawFee float64
	type row struct {
		TransactionType string  `gorm:"column:transaction_type"`
		Sum              float64 `gorm:"column:sum"`
	}
	var rows []row
	if err := r.db.WithContext(ctx).Model(&domain.RevenueLog{}).
		Select("transaction_type, COALESCE(SUM(amount), 0) as sum").
		Group("transaction_type").
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	for _, rr := range rows {
		totalProfit += rr.Sum
		switch rr.TransactionType {
		case "death_rake":
			deathRake = rr.Sum
		case "expired_coin":
			expiredCoins = rr.Sum
		case "withdraw_fee":
			withdrawFee = rr.Sum
		}
	}

	return &PlatformStats{
		TotalDeposits: deposited,
		TotalProfit:   totalProfit,
		DeathRake:     deathRake,
		ExpiredCoins:  expiredCoins,
		WithdrawFee:   withdrawFee,
	}, nil
}
