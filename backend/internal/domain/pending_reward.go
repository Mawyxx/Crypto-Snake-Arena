package domain

import "time"

// PendingReward — запись о неудачном начислении для повторной обработки.
type PendingReward struct {
	ID          string    `gorm:"primaryKey;type:uuid"`
	UserID      uint      `gorm:"not null"`
	Amount      float64   `gorm:"type:decimal(18,8);not null"`
	ReferenceID string    `gorm:"size:255;not null"`
	RoomID      string    `gorm:"size:64"`
	Source      string    `gorm:"size:32;not null"`
	RetryCount  int       `gorm:"default:0"`
	LastError   string    `gorm:"type:text"`
	Status      string    `gorm:"size:20;default:pending"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

// TableName для GORM.
func (PendingReward) TableName() string {
	return "pending_rewards"
}
