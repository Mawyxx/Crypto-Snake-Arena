package domain

import "math"

// CellSize — размер ячейки сетки.
// Должен быть чуть больше максимального шага змейки за 1 тик,
// чтобы не пропустить столкновение на границе.
const CellSize = 50.0

// SpatialGrid — пространственная хеш-сетка.
type SpatialGrid struct {
	Width  float64
	Height float64
	// SnakeCells: ключ cellID -> список ID змеек в этой ячейке
	SnakeCells map[int][]uint64
	// CoinCells: ключ cellID -> список монет
	CoinCells map[int][]*Coin
}

// NewSpatialGrid создаёт сетку.
func NewSpatialGrid(mapSize float64) *SpatialGrid {
	return &SpatialGrid{
		Width:      mapSize,
		Height:     mapSize,
		SnakeCells: make(map[int][]uint64),
		CoinCells:  make(map[int][]*Coin),
	}
}

// Clear — очистка сетки перед новым тиком (вызывать в начале updateGameState).
func (g *SpatialGrid) Clear() {
	g.SnakeCells = make(map[int][]uint64)
	g.CoinCells = make(map[int][]*Coin)
}

// ClearSnakes — очистка только змеек (для sub-stepping в MoveSnakes, сохраняет монеты).
func (g *SpatialGrid) ClearSnakes() {
	g.SnakeCells = make(map[int][]uint64)
}

// getCellID превращает координаты X,Y в уникальный ID ячейки.
func (g *SpatialGrid) getCellID(p Point) int {
	col := int(p.X / CellSize)
	row := int(p.Y / CellSize)
	colsCount := int(g.Width / CellSize)
	return row*colsCount + col
}

// InBounds — проверка, не ушла ли голова за границы круглой арены.
// Арена: центр (Width/2, Height/2), радиус min(Width,Height)/2.
func (g *SpatialGrid) InBounds(p Point) bool {
	cx, cy := g.Width/2, g.Height/2
	r := math.Min(g.Width, g.Height) / 2
	dx, dy := p.X-cx, p.Y-cy
	return dx*dx+dy*dy <= r*r
}

// AddSnake добавляет сегменты змейки в сетку.
// Оптимизация: добавляем голову и тело. Хвост нужен для проверки "врезался ли я в кого-то".
func (g *SpatialGrid) AddSnake(snake *Snake) {
	for _, segment := range snake.Body() {
		cellID := g.getCellID(segment)
		g.SnakeCells[cellID] = append(g.SnakeCells[cellID], snake.ID)
	}
}

// AddCoin регистрирует монету.
func (g *SpatialGrid) AddCoin(coin *Coin) {
	cellID := g.getCellID(coin.Position())
	g.CoinCells[cellID] = append(g.CoinCells[cellID], coin)
}

// CheckCollision — Broad Phase: проверяет, есть ли в ячейке головы чужие змейки.
// Narrow Phase (точная проверка Distance < SnakeRadius) выполняется в Room.
func (g *SpatialGrid) CheckCollision(head Point, myID uint64) bool {
	cellID := g.getCellID(head)
	potentialColliders := g.SnakeCells[cellID]
	if len(potentialColliders) == 0 {
		return false
	}
	for _, otherSnakeID := range potentialColliders {
		if otherSnakeID == myID {
			continue // Свой хвост — самоубийство, обрабатывается отдельно
		}
		return true // В клетке есть чужая змея — потенциальная смерть
	}
	return false
}

// GetSnakesInCell возвращает ID змеек в ячейке (для Narrow Phase в Room).
func (g *SpatialGrid) GetSnakesInCell(head Point, excludeID uint64) []uint64 {
	cellID := g.getCellID(head)
	all := g.SnakeCells[cellID]
	result := make([]uint64, 0, len(all))
	for _, id := range all {
		if id != excludeID {
			result = append(result, id)
		}
	}
	return result
}

// GetSnakesInCellRadius возвращает ID змеек в ячейке center и 8 соседних (3x3).
// Для точной проверки коллизий — edge может быть на границе ячеек.
func (g *SpatialGrid) GetSnakesInCellRadius(center Point, excludeID uint64) []uint64 {
	col := int(center.X / CellSize)
	row := int(center.Y / CellSize)
	colsCount := int(g.Width / CellSize)
	rowsCount := int(g.Height / CellSize)
	seen := make(map[uint64]bool)
	for dc := -1; dc <= 1; dc++ {
		for dr := -1; dr <= 1; dr++ {
			c, r := col+dc, row+dr
			if c < 0 || r < 0 || c >= colsCount || r >= rowsCount {
				continue
			}
			cellID := r*colsCount + c
			for _, id := range g.SnakeCells[cellID] {
				if id != excludeID && !seen[id] {
					seen[id] = true
				}
			}
		}
	}
	result := make([]uint64, 0, len(seen))
	for id := range seen {
		result = append(result, id)
	}
	return result
}

// GetCoinsNear возвращает монеты в той же ячейке, что и голова.
func (g *SpatialGrid) GetCoinsNear(head Point) []*Coin {
	cellID := g.getCellID(head)
	return g.CoinCells[cellID]
}
