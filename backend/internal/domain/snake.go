package domain

import (
	"math"
	"math/rand"
	"time"
)

// Snake — модель змейки. headPath + findNextPointIndex (slither-clone style).
// DOD: headPathBuf — ring buffer (no alloc in addHeadPathPoint); bodyCache — cached until UpdatePosition.
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
	headPathBuf      []Point // ring buffer, preallocated in NewSnakeAt (no alloc in hot path)
	headPathLen      int     // number of valid points
	headPathIdx      int     // index of newest (logical 0)
	snakeLength      int     // head + tail segments
	queuedSections   int
	lastHeadPosition Point

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
	InitialLength       = 4     // head + 3 tail segments
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
		lastHeadPosition: Point{X: headX, Y: headY},
		headPathBuf:      make([]Point, MaxHeadPathLen),
		headPathLen:      InitialLength,
		headPathIdx:      0,
	}
	// headPath: [0]=head, [1..n]=points behind (angle 0 = east, behind = west)
	s.headPathBuf[0] = Point{X: headX, Y: headY}
	for i := 1; i < InitialLength; i++ {
		s.headPathBuf[i] = Point{
			X: headX - float64(i)*PreferredDist,
			Y: headY,
		}
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

// addHeadPathPoint adds current head to path front (newest first). Zero allocations (ring buffer).
func (s *Snake) addHeadPathPoint() {
	cap := len(s.headPathBuf)
	if cap == 0 {
		return
	}
	// Prepend: decrement head index (wrap), write newest at head
	s.headPathIdx = (s.headPathIdx - 1 + cap) % cap
	s.headPathBuf[s.headPathIdx] = Point{X: s.HeadX, Y: s.HeadY}
	if s.headPathLen < cap {
		s.headPathLen++
	}
}

// headPathAt returns logical index i (0=newest, 1=second newest, ...).
func (s *Snake) headPathAt(i int) Point {
	cap := len(s.headPathBuf)
	if cap == 0 {
		return s.Head()
	}
	idx := (s.headPathIdx + i) % cap
	return s.headPathBuf[idx]
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

// BodyFromHeadPath computes body segments from headPath (head + tail) via PointOnPath.
// Result is cached until next UpdatePosition.
func (s *Snake) BodyFromHeadPath() []Point {
	if s.bodyCacheValid && len(s.bodyCache) > 0 {
		return s.bodyCache
	}
	// Reuse or grow cache slice (single allocation when snake grows)
	if cap(s.bodyCache) < s.snakeLength {
		s.bodyCache = make([]Point, 0, s.snakeLength+8)
	} else {
		s.bodyCache = s.bodyCache[:0]
	}
	for i := 0; i < s.snakeLength; i++ {
		dist := PreferredDist * float64(i)
		pt, ok := s.PointOnPath(dist)
		if !ok {
			break
		}
		s.bodyCache = append(s.bodyCache, pt)
	}
	if len(s.bodyCache) == 0 {
		s.bodyCache = append(s.bodyCache, Point{X: s.HeadX, Y: s.HeadY})
	}
	s.bodyCacheValid = true
	return s.bodyCache
}

// checkCycleComplete: when segment 1 reaches lastHeadPosition, call onCycleComplete.
func (s *Snake) checkCycleComplete() {
	body := s.BodyFromHeadPath()
	if len(body) < 2 {
		s.lastHeadPosition = Point{X: s.HeadX, Y: s.HeadY}
		return
	}
	// Cycle complete when segment 1 (at PreferredDist from head) reaches lastHeadPosition.
	// Iterate path from head, accumulate distance. When we find lastHeadPosition at dist >= PreferredDist, seg1 has reached it.
	distFromHead := 0.0
	for i := 0; i < s.headPathLen-1; i++ {
		p0 := s.headPathAt(i)
		p1 := s.headPathAt(i + 1)
		if math.Abs(p0.X-s.lastHeadPosition.X) < 0.01 && math.Abs(p0.Y-s.lastHeadPosition.Y) < 0.01 {
			if distFromHead >= PreferredDist-0.5 {
				s.lastHeadPosition = Point{X: s.HeadX, Y: s.HeadY}
				s.onCycleComplete()
			}
			return
		}
		distFromHead += p0.Distance(p1)
	}
	if s.headPathLen > 0 {
		pt := s.headPathAt(s.headPathLen - 1)
		if math.Abs(pt.X-s.lastHeadPosition.X) < 0.01 && math.Abs(pt.Y-s.lastHeadPosition.Y) < 0.01 {
			if distFromHead >= PreferredDist-0.5 {
				s.lastHeadPosition = Point{X: s.HeadX, Y: s.HeadY}
				s.onCycleComplete()
			}
		}
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
	cap := len(s.headPathBuf)
	if cap == 0 {
		return
	}
	if s.headPathLen < cap {
		phys := (s.headPathIdx + s.headPathLen) % cap
		s.headPathBuf[phys] = last
		s.headPathLen++
	} else {
		phys := (s.headPathIdx + cap - 1) % cap
		s.headPathBuf[phys] = last
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
