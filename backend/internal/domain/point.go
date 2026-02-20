package domain

import "math"

// Point — 2D координата для коллизий.
type Point struct {
	X, Y float64
}

// CoinRadius — радиус монеты для проверки съедания.
const CoinRadius = 8.0

// SnakeRadius — радиус змейки для проверки столкновений (Narrow Phase).
const SnakeRadius = 10.0

// EdgeOffset — смещение «edge» (точки столкновения) впереди головы (slither-clone style).
const EdgeOffset = 8.0

// Intersects проверяет пересечение точки с монетой.
func (p Point) Intersects(c *Coin) bool {
	return p.Distance(c.Position()) < CoinRadius
}

// Distance возвращает расстояние до другой точки.
func (p Point) Distance(other Point) float64 {
	dx := p.X - other.X
	dy := p.Y - other.Y
	return math.Sqrt(dx*dx + dy*dy)
}
