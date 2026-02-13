package domain

import "math"

// Snake — модель змейки. Чистая логика без зависимостей.
type Snake struct {
	ID         uint64
	UserID     int64
	JoinedTick uint64 // tick when snake joined, for duration calculation
	HeadX      float64
	HeadY    float64
	Angle    float64
	Score    float64   // Собранные монеты
	EntryFee float64   // Начальная ставка
	Tail     []float64 // [x1,y1, x2,y2, ...]
	Boost    bool
	Dead     bool // true после killSnake — претендент на награду снимается немедленно

	speed      float64
	segmentLen float64
}

const (
	BaseSpeed     = 3.0
	BoostSpeed    = 5.0
	SegmentLen    = 12.0
	InitialLength = 3
)

// NewSnake создаёт змейку с начальной длиной в центре арены (500, 500).
func NewSnake(id uint64) *Snake {
	return NewSnakeAt(id, 500, 500)
}

// NewSnakeAt создаёт змейку с начальной длиной в заданной позиции.
func NewSnakeAt(id uint64, headX, headY float64) *Snake {
	s := &Snake{
		ID:         id,
		HeadX:      headX,
		HeadY:      headY,
		Angle:      0,
		Score:      0,
		EntryFee:   0,
		speed:      BaseSpeed,
		segmentLen: SegmentLen,
	}
	// Начальный хвост (3 сегмента назад по X)
	for i := 0; i < InitialLength; i++ {
		s.Tail = append(s.Tail, s.HeadX-float64(i+1)*SegmentLen, s.HeadY)
	}
	return s
}

// SetDirection обновляет желаемый угол.
func (s *Snake) SetDirection(angle float64) {
	s.Angle = angle
}

// SetBoost устанавливает режим ускорения.
func (s *Snake) SetBoost(boost bool) {
	s.Boost = boost
}

// Move — сдвиг головы и хвоста за один тик.
func (s *Snake) Move() {
	speed := s.speed
	if s.Boost {
		speed = BoostSpeed
	}

	prevX, prevY := s.HeadX, s.HeadY
	s.HeadX += math.Cos(s.Angle) * speed
	s.HeadY += math.Sin(s.Angle) * speed

	// Сдвиг хвоста
	for i := 0; i < len(s.Tail); i += 2 {
		x, y := s.Tail[i], s.Tail[i+1]
		s.Tail[i], s.Tail[i+1] = prevX, prevY
		prevX, prevY = x, y
	}
}

// Head возвращает точку головы.
func (s *Snake) Head() Point {
	return Point{X: s.HeadX, Y: s.HeadY}
}

// Body возвращает все сегменты (голова + хвост) для спавна монет.
func (s *Snake) Body() []Point {
	body := []Point{{X: s.HeadX, Y: s.HeadY}}
	for i := 0; i < len(s.Tail); i += 2 {
		body = append(body, Point{X: s.Tail[i], Y: s.Tail[i+1]})
	}
	return body
}

// Grow добавляет сегмент (при съедании монеты).
func (s *Snake) Grow() {
	if len(s.Tail) >= 2 {
		lastX, lastY := s.Tail[len(s.Tail)-2], s.Tail[len(s.Tail)-1]
		s.Tail = append(s.Tail, lastX, lastY)
	}
}

// AddScore начисляет очки за монету.
func (s *Snake) AddScore(value float64) {
	s.Score += value
}

// CurrentScore — актуальная сумма (ставка + собранные).
func (s *Snake) CurrentScore() float64 {
	return s.EntryFee + s.Score
}

// SetEntryFee устанавливает начальную ставку при входе.
func (s *Snake) SetEntryFee(fee float64) {
	s.EntryFee = fee
}
