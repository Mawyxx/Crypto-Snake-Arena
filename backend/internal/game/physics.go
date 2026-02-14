package game

import (
	"encoding/binary"
	"math"

	cryptoRand "crypto/rand"

	"github.com/crypto-snake-arena/server/internal/domain"
	"go.uber.org/zap"
)

const spawnTries  = 15 // число попыток выбора точки спавна
const spawnMargin = 50 // отступ от края арены (не спавнить у смертельной границы)

// cryptoFloat64 returns a random float64 in [0, 1) using crypto/rand (for coin spawn).
func cryptoFloat64() float64 {
	var b [8]byte
	if _, err := cryptoRand.Read(b[:]); err != nil {
		return 0
	}
	u := binary.LittleEndian.Uint64(b[:])
	return float64(u>>11) / (1 << 53)
}

// PickSpawnPosition выбирает позицию внутри круглой арены, предпочтительно подальше от других змеек.
func PickSpawnPosition(grid *domain.SpatialGrid, snakes map[uint64]*domain.Snake) (float64, float64) {
	cx, cy := grid.Width/2, grid.Height/2
	arenaRadius := math.Min(grid.Width, grid.Height) / 2
	maxR := arenaRadius - float64(spawnMargin)
	if maxR <= 0 {
		return cx, cy
	}
	minR := float64(spawnMargin)
	if minR >= maxR {
		minR = 0
	}

	heads := make([]domain.Point, 0, len(snakes))
	for _, s := range snakes {
		heads = append(heads, s.Head())
	}

	bestX, bestY := cx, cy
	bestMinDist := -1.0

	for i := 0; i < spawnTries; i++ {
		angle := cryptoFloat64() * 2 * math.Pi
		radius := minR + cryptoFloat64()*(maxR-minR)
		x := cx + math.Cos(angle)*radius
		y := cy + math.Sin(angle)*radius

		minDist := 1e9
		if len(heads) == 0 {
			minDist = maxR
		} else {
			for _, h := range heads {
				dx, dy := x-h.X, y-h.Y
				d := math.Sqrt(dx*dx + dy*dy)
				if d < minDist {
					minDist = d
				}
			}
		}
		if minDist > bestMinDist {
			bestMinDist = minDist
			bestX, bestY = x, y
		}
	}
	return bestX, bestY
}

// MoveSnakes обновляет позиции змеек, валидирует скорость и границы. Возвращает ID змеек для kill (speed/out-of-bounds).
func MoveSnakes(dt float64, snakes map[uint64]*domain.Snake, grid *domain.SpatialGrid) []uint64 {
	toDelete := make([]uint64, 0, 8)
	for _, snake := range snakes {
		prevHead := snake.Head()
		snake.UpdatePosition(dt)
		if prevHead.Distance(snake.Head()) > domain.MaxMoveDistanceFor(dt) {
			zap.L().Warn("room speed violation", zap.Uint64("snakeID", snake.ID))
			toDelete = append(toDelete, snake.ID)
			continue
		}
		if !grid.InBounds(snake.Head()) {
			toDelete = append(toDelete, snake.ID)
			continue
		}
		grid.AddSnake(snake)
	}
	return toDelete
}

// CheckCollisions проверяет snake-vs-snake и snake-vs-self. Возвращает доп. ID змеек для kill.
func CheckCollisions(snakes map[uint64]*domain.Snake, grid *domain.SpatialGrid, toDelete []uint64) []uint64 {
	moreToDelete := make([]uint64, 0, 8)
	for id, snake := range snakes {
		if contains(toDelete, id) {
			continue
		}
		dead := false

		otherIDs := grid.GetSnakesInCell(snake.Head(), id)
		for _, otherID := range otherIDs {
			other, ok := snakes[otherID]
			if !ok || contains(toDelete, otherID) {
				continue
			}
			myHead := snake.Head()
			for _, seg := range other.Body() {
				if myHead.Distance(seg) < domain.SnakeRadius {
					moreToDelete = append(moreToDelete, snake.ID)
					dead = true
					break
				}
			}
			if dead {
				break
			}
		}
		if dead {
			continue
		}

		body := snake.Body()
		for i := 1; i < len(body); i++ {
			if snake.Head().Distance(body[i]) < domain.SnakeRadius {
				moreToDelete = append(moreToDelete, snake.ID)
				dead = true
				break
			}
		}
	}
	return moreToDelete
}

func contains(ids []uint64, id uint64) bool {
	for _, v := range ids {
		if v == id {
			return true
		}
	}
	return false
}
