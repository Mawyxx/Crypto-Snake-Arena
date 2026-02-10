package repository

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// PostgresUserRepo реализует domain.UserRepository.
type PostgresUserRepo struct {
	// db *gorm.DB
}

// NewPostgresUserRepo создаёт репозиторий.
func NewPostgresUserRepo() *PostgresUserRepo {
	return &PostgresUserRepo{}
}

func (r *PostgresUserRepo) GetBalance(ctx context.Context, userID int64) (float64, error) {
	// TODO: SELECT balance FROM users WHERE tg_id = ?
	return 0, nil
}

func (r *PostgresUserRepo) SpendBalance(ctx context.Context, userID int64, amount float64) error {
	// TODO: UPDATE users SET balance = balance - ? WHERE tg_id = ?
	_ = userID
	_ = amount
	return nil
}

func (r *PostgresUserRepo) AddBalance(ctx context.Context, userID int64, amount float64) error {
	// TODO: UPDATE users SET balance = balance + ? WHERE tg_id = ?
	_ = userID
	_ = amount
	return nil
}

// Проверка, что реализует интерфейс.
var _ domain.UserRepository = (*PostgresUserRepo)(nil)
