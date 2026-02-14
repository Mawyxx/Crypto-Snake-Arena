package game

import (
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// ConsumeCoins проверяет для каждой живой змеи монеты в ячейке, при Intersects — Grow, AddScore.
// consumedInTick защищает от дюпа: монета, съеденная одной змеёй, недоступна другим в этом тике.
// Возвращает ID монет на удаление.
func ConsumeCoins(
	snakes map[uint64]*domain.Snake,
	grid *domain.SpatialGrid,
	toDeleteSnakes []uint64,
	consumedInTick map[string]bool,
) []string {
	toDeleteCoins := make([]string, 0, 16)
	for id, snake := range snakes {
		if contains(toDeleteSnakes, id) {
			continue
		}
		coinsInCell := grid.GetCoinsNear(snake.Head())
		for _, coin := range coinsInCell {
			if consumedInTick[coin.ID] {
				continue
			}
			if snake.Head().Intersects(coin) {
				snake.Grow()
				snake.AddScore(coin.Value)
				toDeleteCoins = append(toDeleteCoins, coin.ID)
				consumedInTick[coin.ID] = true
			}
		}
	}
	return toDeleteCoins
}

// ExpireCoins собирает просроченные монеты по TTL. Возвращает ID на удаление и сумму value.
func ExpireCoins(coins map[string]*domain.Coin, now time.Time) (toDelete []string, totalValue float64) {
	toDelete = make([]string, 0, 16)
	for id, coin := range coins {
		if now.After(coin.ExpiresAt) {
			toDelete = append(toDelete, id)
			totalValue += coin.Value
		}
	}
	return toDelete, totalValue
}
