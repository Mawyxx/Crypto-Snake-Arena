package repository

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// RedisRoomRepo реализует domain.RoomRepository.
type RedisRoomRepo struct {
	// rdb *redis.Client
}

// NewRedisRoomRepo создаёт репозиторий.
func NewRedisRoomRepo() *RedisRoomRepo {
	return &RedisRoomRepo{}
}

func (r *RedisRoomRepo) SaveSnake(_ context.Context, roomID string, userID int64, snake *domain.Snake) error {
	// TODO: HSET snake:{roomID}:{userID} ...
	_ = roomID
	_ = userID
	_ = snake
	return nil
}

func (r *RedisRoomRepo) GetSnake(_ context.Context, roomID string, userID int64) (*domain.Snake, error) {
	// TODO: HGETALL snake:{roomID}:{userID}
	_ = roomID
	_ = userID
	return nil, nil
}

func (r *RedisRoomRepo) SetCoin(_ context.Context, roomID, coinID string, value float64, ttlSec int) error {
	// TODO: SET coin:{roomID}:{coinID} value EX ttlSec
	_ = roomID
	_ = coinID
	_ = value
	_ = ttlSec
	return nil
}

func (r *RedisRoomRepo) ClaimCoin(_ context.Context, roomID, coinID string) (float64, bool, error) {
	// TODO: GETDEL coin:{roomID}:{coinID}
	_ = roomID
	_ = coinID
	return 0, false, nil
}

// Проверка, что реализует интерфейс.
var _ domain.RoomRepository = (*RedisRoomRepo)(nil)
