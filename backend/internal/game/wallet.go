package game

import "context"

// GameResultRecorder — запись результата игры для рейтинга. P = L − S.
type GameResultRecorder interface {
	RecordGameResult(ctx context.Context, userID uint, stake, loot float64, roomID string, status string, durationSec int) error
}

// RewardCreditor — интерфейс для начисления выигрыша (AddGameReward при выходе/refund).
// referenceID — идемпотентность (roomID:snakeID или roomID:unreg:playerID).
type RewardCreditor interface {
	AddGameReward(ctx context.Context, userID uint, amount float64, referenceID string) error
}

// DeathHandler — обработчик смерти игрока. Вызывается при killSnake.
// Атомарно: revenue_log (20% rake) + referrer (30% от rake).
// referenceID — идемпотентность (roomID:death:snakeID).
// entryFee — ставка жертвы при входе в игру (для admin_revenue_ledger).
type DeathHandler interface {
	OnPlayerDeath(ctx context.Context, victimUserID uint, victimScore, entryFee float64, referenceID, roomID string) error
}

// ExpiredCoinsHandler — обработчик просроченных монет. Вызывается при удалении монет по TTL.
// totalValue — сумма Value всех просроченных монет; зачисляется как прибыль платформы (revenue_log expired_coin).
type ExpiredCoinsHandler interface {
	OnExpiredCoins(ctx context.Context, roomID string, totalValue float64) error
}
