package domain

import "context"

// UserRepository — контракт для работы с пользователями (Postgres).
type UserRepository interface {
	GetBalance(ctx context.Context, userID int64) (float64, error)
	SpendBalance(ctx context.Context, userID int64, amount float64) error
	AddBalance(ctx context.Context, userID int64, amount float64) error
}

// RoomRepository — контракт для игрового состояния (Redis).
type RoomRepository interface {
	SaveSnake(ctx context.Context, roomID string, userID int64, snake *Snake) error
	GetSnake(ctx context.Context, roomID string, userID int64) (*Snake, error)
	SetCoin(ctx context.Context, roomID, coinID string, value float64, ttlSec int) error
	ClaimCoin(ctx context.Context, roomID, coinID string) (float64, bool, error)
}

// PaymentService — контракт для платежей (Crypto Bot API).
type PaymentService interface {
	CreateInvoice(ctx context.Context, userID int64, amount float64) (string, error)
	ProcessWithdrawal(ctx context.Context, userID int64, amount float64) error
}
