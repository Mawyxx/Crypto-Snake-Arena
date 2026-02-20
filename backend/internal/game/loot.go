package game

import (
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
)

const consumeLerpFactor = 0.2  // coin moves 20% toward head per tick
const consumeCompleteDist = 2.0 // when coin reaches head, complete

// ConsumeCoins: Phase 1 — head touches coin → enter Consuming. Phase 2 — consuming coins move toward head, then Grow.
func ConsumeCoins(
	snakes map[uint64]*domain.Snake,
	coins map[string]*domain.Coin,
	grid *domain.SpatialGrid,
	toDeleteSnakes []uint64,
	consumedInTick map[string]bool,
) []string {
	toDeleteCoins := make([]string, 0, 16)

	// Phase 1: Touch — enter consuming state
	for id, snake := range snakes {
		if contains(toDeleteSnakes, id) {
			continue
		}
		coinsInCell := grid.GetCoinsNear(snake.Head())
		for _, coin := range coinsInCell {
			if consumedInTick[coin.ID] || coin.ConsumingSnakeID != 0 {
				continue
			}
			if snake.Head().Intersects(coin) {
				coin.ConsumingSnakeID = id
			}
		}
	}

	// Phase 2: Consuming coins move toward head
	for _, coin := range coins {
		if coin.ConsumingSnakeID == 0 || consumedInTick[coin.ID] {
			continue
		}
		snake, ok := snakes[coin.ConsumingSnakeID]
		if !ok || contains(toDeleteSnakes, coin.ConsumingSnakeID) {
			coin.ConsumingSnakeID = 0
			continue
		}
		head := snake.Head()
		dx := head.X - coin.X
		dy := head.Y - coin.Y
		coin.X += dx * consumeLerpFactor
		coin.Y += dy * consumeLerpFactor
		coinPos := domain.Point{X: coin.X, Y: coin.Y}
		if coinPos.Distance(head) < consumeCompleteDist {
			snake.Grow()
			snake.AddScore(coin.Value)
			toDeleteCoins = append(toDeleteCoins, coin.ID)
			consumedInTick[coin.ID] = true
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
