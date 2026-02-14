package domain

import (
	"math"
	"math/rand"
	"time"
)

// Snake — модель змейки. Чистая логика без зависимостей.
// Векторное движение с плавным поворотом (Slither.io-style).
type Snake struct {
	ID         uint64
	UserID     int64
	JoinedTick uint64    // tick when snake joined (logical)
	JoinedAt   time.Time // wall-clock time when snake joined, for duration calculation
	HeadX      float64
	HeadY      float64
	TargetAngle  float64 // куда игрок хочет повернуть (от мыши)
	CurrentAngle float64 // текущий угол с инерцией
	Score      float64   // Собранные монеты
	EntryFee   float64   // Начальная ставка
	Tail       []float64 // [x1,y1, x2,y2, ...]
	Boost      bool
	Dead       bool // true после killSnake — претендент на награду снимается немедленно
	SkinID     int32  // индекс цвета (0-8 для палитры Slither)

	speed      float64 // units/sec
	segmentLen float64
	turnSpeed  float64 // рад/сек
}

const (
	// Slither.io 1:1: nsp1=4.25, nsp2=0.5 → ssp≈4.75; nsp3=12; csp=sp*vfr/4 → 71/180 units/sec
	BaseSpeed         = 71.0  // units/sec (≈3.55 units/tick при dt=0.05)
	BoostSpeed        = 180.0 // units/sec (9 units/tick при dt=0.05)
	TurnSpeed         = 2.0   // рад/сек (mamu*60 ≈ 1.98)
	SegmentLen        = 42.0  // default_msl в Slither.io
	Spangdv           = 4.8   // spang = speed/Spangdv, ограничение поворота от скорости
	Cst               = 0.43  // сглаживание тела (smus), Slither.io recalcSepMults
	Smuc              = 100  // размер smus
	InitialLength     = 3
	constraintPasses  = 6   // итераций Verlet для плавного изгиба хвоста
	minDist           = 1e-6 // защита от div-by-zero
	maxStretchRatio   = 1.5 // при сжатии сегментов не "стрелять" их в стороны
)

// MaxMoveDistanceFor возвращает максимально допустимую дистанцию за тик при заданном dt (анти-чит).
// Формула: BoostSpeed * dt * 1.2 (20% запас).
func MaxMoveDistanceFor(dt float64) float64 {
	return BoostSpeed * dt * 1.2
}

// NewSnake создаёт змейку с начальной длиной в центре арены (1000, 1000).
func NewSnake(id uint64) *Snake {
	return NewSnakeAt(id, 1000, 1000)
}

// NewSnakeAt создаёт змейку с начальной длиной в заданной позиции.
func NewSnakeAt(id uint64, headX, headY float64) *Snake {
	s := &Snake{
		ID:            id,
		HeadX:         headX,
		HeadY:         headY,
		TargetAngle:   0,
		CurrentAngle:  0,
		Score:         0,
		EntryFee:      0,
		SkinID:        rand.Int31n(9), // 0-8 для палитры Slither
		speed:         BaseSpeed,
		segmentLen:    SegmentLen,
		turnSpeed:     TurnSpeed,
	}
	// Начальный хвост (3 сегмента назад по X)
	for i := 0; i < InitialLength; i++ {
		s.Tail = append(s.Tail, s.HeadX-float64(i+1)*SegmentLen, s.HeadY)
	}
	return s
}

// SetTargetAngle задаёт целевой угол поворота (от клиента).
func (s *Snake) SetTargetAngle(angle float64) {
	s.TargetAngle = angle
}

// SetBoost устанавливает режим ускорения.
func (s *Snake) SetBoost(boost bool) {
	s.Boost = boost
}

// UpdatePosition обновляет позицию головы и хвоста за dt секунд.
// dt — длительность тика в секундах (напр. 0.05 при 20 Hz).
func (s *Snake) UpdatePosition(dt float64) {
	// Текущая скорость для spang (ограничение поворота от скорости)
	speed := s.speed
	if s.Boost {
		speed = BoostSpeed
	}
	spang := speed / Spangdv
	if spang > 1 {
		spang = 1
	}

	// 1. Плавный поворот: CurrentAngle стремится к TargetAngle
	// normalizeAngle приводит разницу к (-π, π], чтобы змея не крутилась на 360°
	delta := normalizeAngle(s.TargetAngle - s.CurrentAngle)
	maxTurn := s.turnSpeed * dt * spang
	if delta > maxTurn {
		delta = maxTurn
	}
	if delta < -maxTurn {
		delta = -maxTurn
	}
	s.CurrentAngle += delta

	// 2. Векторное движение головы: v = (cos(θ), sin(θ)) * speed * dt
	dist := speed * dt
	s.HeadX += math.Cos(s.CurrentAngle) * dist
	s.HeadY += math.Sin(s.CurrentAngle) * dist

	// 3. Verlet-хвост: каждый сегмент на расстоянии segmentLen от предыдущего
	s.updateTail()
}

// updateTail применяет Distance Constraint (Verlet): сегмент следует за предыдущим,
// сохраняя строгое расстояние segmentLen. При dist < minDist сегмент не двигаем,
// чтобы избежать div-by-zero и "выстрелов". maxStretchRatio ограничивает ratio
// при сжатии — иначе сегмент мог бы улететь далеко.
// После Verlet — smus-проход (Slither.io): сглаживание от 3-го сегмента с конца к хвосту.
func (s *Snake) updateTail() {
	for pass := 0; pass < constraintPasses; pass++ {
		prevX, prevY := s.HeadX, s.HeadY
		for i := 0; i < len(s.Tail); i += 2 {
			cx, cy := s.Tail[i], s.Tail[i+1]
			dx, dy := prevX-cx, prevY-cy
			dist := math.Sqrt(dx*dx + dy*dy)
			if dist < minDist {
				prevX, prevY = s.Tail[i], s.Tail[i+1]
				continue
			}
			// ratio = segmentLen/dist: при dist > segmentLen тянем сегмент к prev
			ratio := s.segmentLen / dist
			if ratio > maxStretchRatio {
				ratio = maxStretchRatio
			}
			s.Tail[i] = prevX - dx*ratio
			s.Tail[i+1] = prevY - dy*ratio
			prevX, prevY = s.Tail[i], s.Tail[i+1]
		}
	}
	s.applySmusSmoothing()
}

// applySmusSmoothing — Slither.io recalcSepMults: каждый сегмент от 3-го с конца
// к хвосту смещается к следующему (в сторону головы) с коэффициентом mv = cst*min(n,4)/4.
func (s *Snake) applySmusSmoothing() {
	segCount := len(s.Tail) / 2
	k := segCount - 3
	if k < 1 {
		return
	}
	lmpoX := s.Tail[2*k]
	lmpoY := s.Tail[2*k+1]
	for i := k - 1; i >= 0; i-- {
		n := k - i
		if n > 4 {
			n = 4
		}
		mv := Cst * float64(n) / 4
		cx := s.Tail[2*i]
		cy := s.Tail[2*i+1]
		s.Tail[2*i] += (lmpoX - cx) * mv
		s.Tail[2*i+1] += (lmpoY - cy) * mv
		lmpoX = s.Tail[2*i]
		lmpoY = s.Tail[2*i+1]
	}
}

// normalizeAngle приводит разницу углов к интервалу (-π, π].
// Используется для плавного поворота без "прыжка" через 0.
func normalizeAngle(delta float64) float64 {
	for delta > math.Pi {
		delta -= 2 * math.Pi
	}
	for delta <= -math.Pi {
		delta += 2 * math.Pi
	}
	return delta
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
// Новый сегмент — позади хвоста по направлению last → prev на расстоянии segmentLen.
func (s *Snake) Grow() {
	if len(s.Tail) < 2 {
		return
	}
	lastX, lastY := s.Tail[len(s.Tail)-2], s.Tail[len(s.Tail)-1]
	prevX, prevY := s.Tail[len(s.Tail)-4], s.Tail[len(s.Tail)-3]
	dx, dy := lastX-prevX, lastY-prevY
	dist := math.Sqrt(dx*dx + dy*dy)
	if dist > minDist {
		ratio := s.segmentLen / dist
		newX := lastX + dx*ratio
		newY := lastY + dy*ratio
		s.Tail = append(s.Tail, newX, newY)
	} else {
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
