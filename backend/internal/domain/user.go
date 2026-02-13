package domain

import "time"

// User — модель пользователя (Postgres).
type User struct {
	ID          uint      `gorm:"primaryKey"`
	TgID        int64     `gorm:"uniqueIndex;not null"`
	Username    string    `gorm:"size:255"`
	DisplayName string    `gorm:"size:255"`
	PhotoURL    string    `gorm:"column:photo_url;size:512"`
	Balance     float64   `gorm:"type:decimal(18,8);default:0"`
	Rank        int       `gorm:"default:0"`
	ReferredBy  *uint     `gorm:"column:referred_by"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}

// TableName для GORM.
func (User) TableName() string {
	return "users"
}
