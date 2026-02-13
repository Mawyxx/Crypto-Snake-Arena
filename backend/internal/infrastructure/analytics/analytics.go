package analytics

import (
	"context"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"gorm.io/gorm"
)

const txTimeout = 5 * time.Second

// AnalyticsService — логирует каждый цент комиссии в revenue_logs.
type AnalyticsService struct {
	db *gorm.DB
}

// NewAnalyticsService создаёт сервис аналитики.
func NewAnalyticsService(db *gorm.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

// LogRevenue записывает комиссию платформы.
func (s *AnalyticsService) LogRevenue(ctx context.Context, roomID, transactionType string, amount float64) error {
	if amount <= 0 {
		return nil
	}
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()
	return s.db.WithContext(ctx).Create(&domain.RevenueLog{
		RoomID:          roomID,
		TransactionType: transactionType,
		Amount:          amount,
		CreatedAt:       time.Now(),
	}).Error
}
