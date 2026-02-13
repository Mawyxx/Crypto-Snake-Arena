package domain

import "time"

// GameResult — результат одной игры для рейтинга. P = L − S.
type GameResult struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null"`
	Stake     float64   `gorm:"type:decimal(18,8);not null"`
	Loot      float64   `gorm:"type:decimal(18,8);not null"`
	Profit    float64   `gorm:"type:decimal(18,8);not null"` // Loot - Stake
	Status    string    `gorm:"size:10;default:loss"`         // win, loss, draw
	Duration  int       `gorm:"default:0"`                    // seconds
	RoomID    string    `gorm:"size:64"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

// TableName для GORM.
func (GameResult) TableName() string {
	return "game_results"
}
