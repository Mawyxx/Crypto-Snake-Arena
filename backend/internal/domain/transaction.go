package domain

import (
	"time"

	"github.com/google/uuid"
)

// Transaction — запись о транзакции (Postgres).
type Transaction struct {
	ID         string    `gorm:"primaryKey;type:uuid"`
	UserID     uint      `gorm:"not null"`
	Amount     float64   `gorm:"type:decimal(18,8);not null"`
	Type       string    `gorm:"size:20;not null"` // deposit, withdraw, game_entry, game_reward
	Status     string    `gorm:"size:20;not null"`
	ExternalID string    `gorm:"size:255;index"` // Crypto Bot ID. UNIQUE — migrations/001 (partial, для deposit)
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}

// TableName для GORM.
func (Transaction) TableName() string {
	return "transactions"
}

// NewTransaction создаёт транзакцию с UUID.
func NewTransaction(userID uint, amount float64, txType, status, externalID string) *Transaction {
	return &Transaction{
		ID:         uuid.New().String(),
		UserID:     userID,
		Amount:     amount,
		Type:       txType,
		Status:     status,
		ExternalID: externalID,
		CreatedAt:  time.Now(),
	}
}
