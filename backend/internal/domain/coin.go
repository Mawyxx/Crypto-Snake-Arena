package domain

import (
	"time"

	"github.com/google/uuid"
)

// Coin — логика монеты. Выпадение, TTL 5 сек.
type Coin struct {
	ID        string
	X         float64
	Y         float64
	Value     float64
	ExpiresAt time.Time
}

// Position возвращает точку монеты для SpatialGrid.
func (c *Coin) Position() Point {
	return Point{X: c.X, Y: c.Y}
}

// SpawnCoins генерирует монеты равномерно по площади тела убитого.
// body — сегменты змейки, dropAmount — 80% от CurrentScore.
func SpawnCoins(body []Point, dropAmount float64) []*Coin {
	if len(body) == 0 || dropAmount <= 0 {
		return nil
	}

	n := len(body)
	if n > 20 {
		n = 20 // Максимум монет
	}
	valuePerCoin := dropAmount / float64(n)
	coins := make([]*Coin, 0, n)

	for i := 0; i < n; i++ {
		idx := (i * len(body)) / n
		if idx >= len(body) {
			idx = len(body) - 1
		}
		p := body[idx]
		coins = append(coins, &Coin{
			ID:        uuid.New().String(),
			X:         p.X,
			Y:         p.Y,
			Value:     valuePerCoin,
			ExpiresAt: time.Now().Add(5 * time.Second),
		})
	}
	return coins
}
