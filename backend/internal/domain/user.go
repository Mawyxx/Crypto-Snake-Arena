package domain

import "time"

// User — модель пользователя (Postgres).
type User struct {
	ID          uint      `gorm:"primaryKey"`
	TgID        int64     `gorm:"uniqueIndex;not null"`
	Username    string    `gorm:"size:255"`
	DisplayName string    `gorm:"size:255"`
	Balance     float64   `gorm:"type:decimal(18,8);default:0"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}

// TableName для GORM.
func (User) TableName() string {
	return "users"
}
