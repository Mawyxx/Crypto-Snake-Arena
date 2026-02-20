package repository

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/redis/go-redis/v9"
)

// RedisRoomRepo реализует domain.RoomRepository.
type RedisRoomRepo struct {
	rdb *redis.Client
}

// NewRedisRoomRepo создаёт репозиторий.
func NewRedisRoomRepo(rdb *redis.Client) *RedisRoomRepo {
	return &RedisRoomRepo{rdb: rdb}
}

func snakeKey(roomID string, userID int64) string {
	return fmt.Sprintf("snake:%s:%d", roomID, userID)
}

func coinKey(roomID, coinID string) string {
	return fmt.Sprintf("coin:%s:%s", roomID, coinID)
}

func (r *RedisRoomRepo) SaveSnake(ctx context.Context, roomID string, userID int64, snake *domain.Snake) error {
	if r.rdb == nil || snake == nil {
		return nil
	}
	key := snakeKey(roomID, userID)
	data := map[string]interface{}{
		"id":      strconv.FormatUint(snake.ID, 10),
		"head_x":  strconv.FormatFloat(snake.HeadX, 'f', -1, 64),
		"head_y":  strconv.FormatFloat(snake.HeadY, 'f', -1, 64),
		"angle":   strconv.FormatFloat(snake.CurrentAngle, 'f', -1, 64),
		"score":   strconv.FormatFloat(snake.Score, 'f', -1, 64),
		"skin_id": strconv.FormatInt(int64(snake.SkinID), 10),
		"boost":   strconv.FormatBool(snake.Boost),
	}
	pipe := r.rdb.Pipeline()
	pipe.HSet(ctx, key, data)
	pipe.Expire(ctx, key, 10*time.Minute)
	_, err := pipe.Exec(ctx)
	return err
}

func (r *RedisRoomRepo) GetSnake(ctx context.Context, roomID string, userID int64) (*domain.Snake, error) {
	if r.rdb == nil {
		return nil, nil
	}
	key := snakeKey(roomID, userID)
	data, err := r.rdb.HGetAll(ctx, key).Result()
	if err != nil || len(data) == 0 {
		return nil, err
	}
	id, _ := strconv.ParseUint(data["id"], 10, 64)
	headX, _ := strconv.ParseFloat(data["head_x"], 64)
	headY, _ := strconv.ParseFloat(data["head_y"], 64)
	angle, _ := strconv.ParseFloat(data["angle"], 64)
	score, _ := strconv.ParseFloat(data["score"], 64)
	skinID64, _ := strconv.ParseInt(data["skin_id"], 10, 32)
	boost, _ := strconv.ParseBool(data["boost"])

	snake := domain.NewSnakeAt(id, headX, headY)
	snake.CurrentAngle = angle
	snake.TargetAngle = angle
	snake.Score = score
	snake.SkinID = int32(skinID64)
	snake.Boost = boost
	return snake, nil
}

func (r *RedisRoomRepo) SetCoin(ctx context.Context, roomID, coinID string, value float64, ttlSec int) error {
	if r.rdb == nil {
		return nil
	}
	key := coinKey(roomID, coinID)
	return r.rdb.Set(ctx, key, strconv.FormatFloat(value, 'f', -1, 64), time.Duration(ttlSec)*time.Second).Err()
}

func (r *RedisRoomRepo) ClaimCoin(ctx context.Context, roomID, coinID string) (float64, bool, error) {
	if r.rdb == nil {
		return 0, false, nil
	}
	key := coinKey(roomID, coinID)
	raw, err := r.rdb.GetDel(ctx, key).Result()
	if err == redis.Nil {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, err
	}
	v, parseErr := strconv.ParseFloat(raw, 64)
	if parseErr != nil {
		return 0, false, parseErr
	}
	return v, true, nil
}

// Проверка, что реализует интерфейс.
var _ domain.RoomRepository = (*RedisRoomRepo)(nil)
