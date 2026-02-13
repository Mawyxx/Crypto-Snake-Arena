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
// 20% от victimScore — rake платформы. Реферер получает 30% от этого rake.
// referenceID — идемпотентность (roomID:death:snakeID).
type DeathHandler interface {
	OnPlayerDeath(ctx context.Context, victimUserID uint, victimScore float64, referenceID string) error
}
