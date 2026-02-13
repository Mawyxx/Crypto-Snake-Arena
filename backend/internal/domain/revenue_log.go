package domain

import "time"

// RevenueLog — запись о комиссии платформы для аналитики.
type RevenueLog struct {
	ID              int64     `gorm:"primaryKey;autoIncrement"`
	RoomID          string    `gorm:"size:64;not null"`
	TransactionType string    `gorm:"size:32;not null"` // death_rake, withdraw_fee
	ReferenceID     string    `gorm:"size:128;index:idx_revenue_logs_reference_id,unique"` // идемпотентность
	Amount          float64   `gorm:"type:decimal(18,8);not null"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
}

func (RevenueLog) TableName() string {
	return "revenue_logs"
}
