package domain

import (
	"math"
	"math/rand"
	"time"
)

// Snake — модель змейки. headPath + findNextPointIndex (slither-clone style).
// DOD: SoA (headPathX/Y) — Structure of Arrays для лучшей cache locality; bodyCache — cached until UpdatePosition.
type Snake struct {
	ID         uint64
	UserID     int64
	JoinedTick uint64
	JoinedAt   time.Time
	HeadX      float64
	HeadY      float64
	TargetAngle  float64
	CurrentAngle float64
	Score      float64
	EntryFee   float64
	Boost      bool
	Dead       bool
	SkinID     int32

	speed            float64
	segmentLen       float64
	turnSpeed        float64
	headPathX        []float64 // SoA: ring buffer X coordinates, preallocated (no alloc in hot path)
	headPathY        []float64 // SoA: ring buffer Y coordinates, preallocated (no alloc in hot path)
	headPathLen      int        // number of valid points
	headPathIdx      int        // index of newest (logical 0)
	snakeLength      int        // head + tail segments
	queuedSections   int
	distanceTraveled float64 // accumulated distance since last cycleComplete

	bodyCache      []Point // cached until next UpdatePosition
	bodyCacheValid bool
}

const (
	BaseSpeed           = 71.0
	BoostSpeed          = 180.0
	TurnSpeed           = 2.0
	SegmentLen          = 42.0
	PreferredDist       = 42.0  // preferredDistance between segments (SegmentLen)
	Spangdv             = 4.8
	InitialLength       = 15    // head + 14 tail segments (slither.io-like start)
	MaxHeadPathLen      = 1200
	HeadPathSampleDist  = 2.5   // add headPath point every ~2.5px for smooth curve
	minDist             = 1e-6
)

// MaxMoveDistanceFor returns max allowed move per tick (anti-cheat).
func MaxMoveDistanceFor(dt float64) float64 {
	return BoostSpeed * dt * 1.2
}

// NewSnake creates a snake at arena center.
func NewSnake(id uint64) *Snake {
	return NewSnakeAt(id, 1000, 1000)
}

// NewSnakeAt creates a snake with headPath initialized (head + tail points going back).
// Points are spaced by HeadPathSampleDist for consistent direct index access.
func NewSnakeAt(id uint64, headX, headY float64) *Snake {
	s := &Snake{
		ID:               id,
		HeadX:            headX,
		HeadY:            headY,
		TargetAngle:      0,
		CurrentAngle:     0,
		Score:            0,
		EntryFee:         0,
		SkinID:           rand.Int31n(9),
		speed:            BaseSpeed,
		segmentLen:       SegmentLen,
		turnSpeed:        TurnSpeed,
		snakeLength:      InitialLength,
		distanceTraveled: 0,
		headPathX:        make([]float64, MaxHeadPathLen),
		headPathY:        make([]float64, MaxHeadPathLen),
		headPathLen:      0,
		headPathIdx:      0,
	}
	// headPath: [0]=head, [1..n]=points behind with HeadPathSampleDist spacing
	// Need enough points for InitialLength segments: (InitialLength-1) * step points
	step := int(math.Round(PreferredDist / HeadPathSampleDist))
	if step < 1 {
		step = 1
	}
	totalPoints := (InitialLength - 1) * step + 1
	if totalPoints > MaxHeadPathLen {
		totalPoints = MaxHeadPathLen
	}
	s.headPathX[0] = headX
	s.headPathY[0] = headY
	s.headPathLen = 1
	for i := 1; i < totalPoints; i++ {
		dist := float64(i) * HeadPathSampleDist
		s.headPathX[i] = headX - dist
		s.headPathY[i] = headY
		s.headPathLen++
	}
	return s
}

// SetTargetAngle sets target angle from client.
func (s *Snake) SetTargetAngle(angle float64) {
	s.TargetAngle = angle
}

// SetBoost sets boost mode.
func (s *Snake) SetBoost(boost bool) {
	s.Boost = boost
}

// UpdatePosition updates head and headPath per tick. Sub-samples headPath for smooth curves.
func (s *Snake) UpdatePosition(dt float64) {
	s.bodyCacheValid = false
	speed := s.speed
	if s.Boost {
		speed = BoostSpeed
	}
	spang := speed / Spangdv
	if spang > 1 {
		spang = 1
	}

	delta := normalizeAngle(s.TargetAngle - s.CurrentAngle)
	maxTurn := s.turnSpeed * dt * spang
	if delta > maxTurn {
		delta = maxTurn
	}
	if delta < -maxTurn {
		delta = -maxTurn
	}
	s.CurrentAngle += delta

	totalDist := speed * dt
	s.distanceTraveled += totalDist
	step := HeadPathSampleDist
	remain := totalDist
	for remain >= step {
		s.HeadX += math.Cos(s.CurrentAngle) * step
		s.HeadY += math.Sin(s.CurrentAngle) * step
		remain -= step
		s.addHeadPathPoint()
	}
	if remain > minDist {
		s.HeadX += math.Cos(s.CurrentAngle) * remain
		s.HeadY += math.Sin(s.CurrentAngle) * remain
		s.addHeadPathPoint()
	}
	s.checkCycleComplete()
}

// addHeadPathPoint adds current head to path front (newest first). Zero allocations (SoA ring buffer).
func (s *Snake) addHeadPathPoint() {
	cap := len(s.headPathX)
	if cap == 0 {
		return
	}
	// Prepend: decrement head index (wrap), write newest at head
	s.headPathIdx = (s.headPathIdx - 1 + cap) % cap
	s.headPathX[s.headPathIdx] = s.HeadX
	s.headPathY[s.headPathIdx] = s.HeadY
	if s.headPathLen < cap {
		s.headPathLen++
	}
}

// headPathAt returns logical index i (0=newest, 1=second newest, ...).
func (s *Snake) headPathAt(i int) Point {
	cap := len(s.headPathX)
	if cap == 0 {
		return s.Head()
	}
	idx := (s.headPathIdx + i) % cap
	return Point{X: s.headPathX[idx], Y: s.headPathY[idx]}
}

// PointOnPath returns the point at distFromHead along the path from head toward tail.
// Uses linear interpolation between path vertices. Second return is false if path too short.
func (s *Snake) PointOnPath(distFromHead float64) (Point, bool) {
	if s.headPathLen < 2 {
		return s.Head(), distFromHead < minDist
	}
	accumulated := 0.0
	for i := 0; i < s.headPathLen-1; i++ {
		p0 := s.headPathAt(i)
		p1 := s.headPathAt(i + 1)
		segLen := p0.Distance(p1)
		if accumulated+segLen >= distFromHead {
			t := (distFromHead - accumulated) / segLen
			if t < 0 {
				t = 0
			}
			if t > 1 {
				t = 1
			}
			return Point{
				X: p0.X + (p1.X-p0.X)*t,
				Y: p0.Y + (p1.Y-p0.Y)*t,
			}, true
		}
		accumulated += segLen
	}
	return s.headPathAt(s.headPathLen - 1), true
}

// BodyFromHeadPath computes body segments from headPath (head + tail) via direct index access.
// HeadPathSampleDist = 2.5px фиксирован, поэтому step константный даже при boost.
// Result is cached until next UpdatePosition.
func (s *Snake) BodyFromHeadPath() []Point {
	if s.bodyCacheValid && len(s.bodyCache) > 0 {
		return s.bodyCache
	}
	// Прямой доступ: step = PreferredDist / HeadPathSampleDist ≈ 16-17 индексов
	step := int(math.Round(PreferredDist / HeadPathSampleDist))
	if step < 1 {
		step = 1
	}

	count := s.snakeLength
	if cap(s.bodyCache) < count {
		s.bodyCache = make([]Point, 0, count+8)
	} else {
		s.bodyCache = s.bodyCache[:0]
	}

	cap := len(s.headPathX)
	for i := 0; i < count; i++ {
		idx := (s.headPathIdx + i*step) % cap
		s.bodyCache = append(s.bodyCache, Point{
			X: s.headPathX[idx],
			Y: s.headPathY[idx],
		})
	}
	if len(s.bodyCache) == 0 {
		s.bodyCache = append(s.bodyCache, Point{X: s.HeadX, Y: s.HeadY})
	}
	s.bodyCacheValid = true
	return s.bodyCache
}

// checkCycleComplete: when distanceTraveled >= PreferredDist, call onCycleComplete.
// O(1) вместо O(n) итерации по path.
func (s *Snake) checkCycleComplete() {
	if s.distanceTraveled >= PreferredDist {
		s.distanceTraveled = 0
		s.onCycleComplete()
	}
}

func (s *Snake) onCycleComplete() {
	if s.queuedSections <= 0 {
		return
	}
	body := s.BodyFromHeadPath()
	if len(body) < 2 {
		return
	}
	last := body[len(body)-1]
	s.bodyCacheValid = false
	cap := len(s.headPathX)
	if cap == 0 {
		return
	}
	if s.headPathLen < cap {
		phys := (s.headPathIdx + s.headPathLen) % cap
		s.headPathX[phys] = last.X
		s.headPathY[phys] = last.Y
		s.headPathLen++
	} else {
		phys := (s.headPathIdx + cap - 1) % cap
		s.headPathX[phys] = last.X
		s.headPathY[phys] = last.Y
	}
	s.snakeLength++
	s.queuedSections--
}

func normalizeAngle(delta float64) float64 {
	for delta > math.Pi {
		delta -= 2 * math.Pi
	}
	for delta <= -math.Pi {
		delta += 2 * math.Pi
	}
	return delta
}

// Head returns head point.
func (s *Snake) Head() Point {
	return Point{X: s.HeadX, Y: s.HeadY}
}

// Body returns head + tail for collisions and coin spawn.
func (s *Snake) Body() []Point {
	return s.BodyFromHeadPath()
}

// Grow queues a new segment (added on next cycle complete).
func (s *Snake) Grow() {
	s.queuedSections++
}

// AddScore adds coin value.
func (s *Snake) AddScore(value float64) {
	s.Score += value
}

// CurrentScore returns entry fee + collected score.
func (s *Snake) CurrentScore() float64 {
	return s.EntryFee + s.Score
}

// SetEntryFee sets entry fee.
func (s *Snake) SetEntryFee(fee float64) {
	s.EntryFee = fee
}
