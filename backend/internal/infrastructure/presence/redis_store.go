package presence

import (
	"context"
	"log"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

const presenceKey = "presence"
const presenceTTL = 60 * time.Second

type RedisStore struct {
	rdb *redis.Client
}

// NewRedisStore создаёт Redis-based presence store для multi-instance online-счётчика.
func NewRedisStore(rdb *redis.Client) *RedisStore {
	return &RedisStore{rdb: rdb}
}

// Register обновляет timestamp для userID (heartbeat). ZADD presence {ts} {user_id}.
func (s *RedisStore) Register(ctx context.Context, userID uint) {
	score := float64(time.Now().Unix())
	member := strconv.FormatUint(uint64(userID), 10)
	if err := s.rdb.ZAdd(ctx, presenceKey, redis.Z{Score: score, Member: member}).Err(); err != nil {
		log.Printf("[Presence] Redis ZAdd failed: userID=%d err=%v", userID, err)
	}
}

// Count возвращает количество уникальных пользователей, активных за последние 60 сек.
// Сначала ZREMRANGEBYSCORE удаляет протухшие, затем ZCARD.
func (s *RedisStore) Count() int {
	ctx := context.Background()
	cutoff := float64(time.Now().Add(-presenceTTL).Unix())
	if err := s.rdb.ZRemRangeByScore(ctx, presenceKey, "-inf", strconv.FormatFloat(cutoff, 'f', 0, 64)).Err(); err != nil {
		log.Printf("[Presence] Redis ZRemRangeByScore failed: err=%v", err)
		return 0
	}
	n, err := s.rdb.ZCard(ctx, presenceKey).Result()
	if err != nil {
		log.Printf("[Presence] Redis ZCard failed: err=%v", err)
		return 0
	}
	return int(n)
}

// Stop — no-op для Redis, клиент закрывается в main.
func (s *RedisStore) Stop() {}
