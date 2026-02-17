package domain

import (
	"math"
	"testing"
)

func TestNewSnake(t *testing.T) {
	s := NewSnake(42)
	if s == nil {
		t.Fatal("NewSnake returned nil")
	}
	if s.ID != 42 {
		t.Errorf("ID = %d, want 42", s.ID)
	}
	if s.HeadX != 1000 || s.HeadY != 1000 {
		t.Errorf("Head = (%.0f, %.0f), want (1000, 1000)", s.HeadX, s.HeadY)
	}
	if s.TargetAngle != 0 || s.CurrentAngle != 0 || s.Score != 0 || s.EntryFee != 0 {
		t.Errorf("TargetAngle=%v CurrentAngle=%v Score=%v EntryFee=%v", s.TargetAngle, s.CurrentAngle, s.Score, s.EntryFee)
	}
	body := s.Body()
	if len(body) != 4 {
		t.Errorf("Body len = %d, want 4 (head + 3 tail)", len(body))
	}
}

func TestNewSnakeAt(t *testing.T) {
	s := NewSnakeAt(1, 100, 200)
	if s == nil {
		t.Fatal("NewSnakeAt returned nil")
	}
	if s.HeadX != 100 || s.HeadY != 200 {
		t.Errorf("Head = (%.0f, %.0f), want (100, 200)", s.HeadX, s.HeadY)
	}
	body := s.Body()
	if len(body) < 2 {
		t.Errorf("Body len = %d, want at least 2", len(body))
	}
	firstTailX := body[1].X
	if firstTailX < 100-SegmentLen-1 || firstTailX > 100-SegmentLen+1 {
		t.Errorf("First tail X = %.2f, want ~%.2f", firstTailX, 100-SegmentLen)
	}
}

func TestSnake_SetTargetAngle(t *testing.T) {
	s := NewSnake(1)
	s.SetTargetAngle(math.Pi / 2)
	if s.TargetAngle != math.Pi/2 {
		t.Errorf("TargetAngle = %v, want π/2", s.TargetAngle)
	}
}

func TestSnake_SetBoost(t *testing.T) {
	s := NewSnake(1)
	s.SetBoost(true)
	if !s.Boost {
		t.Error("Boost should be true")
	}
	s.SetBoost(false)
	if s.Boost {
		t.Error("Boost should be false")
	}
}

func TestSnake_UpdatePosition(t *testing.T) {
	s := NewSnake(1)
	s.TargetAngle = 0
	s.CurrentAngle = 0
	startX, startY := s.HeadX, s.HeadY
	dt := 0.05
	s.UpdatePosition(dt)
	wantX := startX + BaseSpeed*dt
	if math.Abs(s.HeadX-wantX) > 0.01 {
		t.Errorf("HeadX = %.2f, want %.2f", s.HeadX, wantX)
	}
	if math.Abs(s.HeadY-startY) > 0.01 {
		t.Errorf("HeadY changed from %.2f to %.2f", startY, s.HeadY)
	}
}

func TestSnake_UpdatePositionWithBoost(t *testing.T) {
	s := NewSnake(1)
	s.TargetAngle = 0
	s.CurrentAngle = 0
	s.Boost = true
	startX := s.HeadX
	dt := 0.05
	s.UpdatePosition(dt)
	wantX := startX + BoostSpeed*dt
	if math.Abs(s.HeadX-wantX) > 0.01 {
		t.Errorf("HeadX = %.2f, want %.2f (BoostSpeed)", s.HeadX, wantX)
	}
}

func TestSnake_Head(t *testing.T) {
	s := NewSnake(1)
	s.HeadX, s.HeadY = 100, 200
	p := s.Head()
	if p.X != 100 || p.Y != 200 {
		t.Errorf("Head() = (%.0f, %.0f), want (100, 200)", p.X, p.Y)
	}
}

func TestSnake_Body(t *testing.T) {
	s := NewSnake(1)
	body := s.Body()
	if len(body) < 2 {
		t.Fatalf("Body len = %d, want at least 2 (head + tail)", len(body))
	}
	if body[0].X != s.HeadX || body[0].Y != s.HeadY {
		t.Error("First body segment should be head")
	}
}

func TestSnake_Grow(t *testing.T) {
	s := NewSnake(1)
	initialBodyLen := len(s.Body())
	s.Grow()
	// Grow queues a section; it appears after onCycleComplete. Run a few ticks to trigger cycle.
	for i := 0; i < 50; i++ {
		s.UpdatePosition(0.05)
	}
	body := s.Body()
	if len(body) < initialBodyLen+1 {
		t.Errorf("Body len = %d, want >= %d after Grow+ticks", len(body), initialBodyLen+1)
	}
}

func TestSnake_AddScore(t *testing.T) {
	s := NewSnake(1)
	s.AddScore(5.5)
	if s.Score != 5.5 {
		t.Errorf("Score = %.2f, want 5.5", s.Score)
	}
	s.AddScore(2.5)
	if s.Score != 8 {
		t.Errorf("Score = %.2f, want 8", s.Score)
	}
}

func TestSnake_CurrentScore(t *testing.T) {
	s := NewSnake(1)
	s.SetEntryFee(10)
	s.AddScore(5)
	if got := s.CurrentScore(); got != 15 {
		t.Errorf("CurrentScore = %.2f, want 15", got)
	}
}

func TestSnake_SetEntryFee(t *testing.T) {
	s := NewSnake(1)
	s.SetEntryFee(0.5)
	if s.EntryFee != 0.5 {
		t.Errorf("EntryFee = %.2f, want 0.5", s.EntryFee)
	}
}

func TestSnake_UpdatePosition_Angles(t *testing.T) {
	dt := 0.05
	dist := BaseSpeed * dt // 3.0 units per tick
	tests := []struct {
		name   string
		angle  float64
		dxWant float64
		dyWant float64
	}{
		{"east", 0, dist, 0},
		{"north", math.Pi / 2, 0, dist},
		{"west", math.Pi, -dist, 0},
		{"south", -math.Pi / 2, 0, -dist},
		{"diagonal", math.Pi / 4, dist / math.Sqrt2, dist / math.Sqrt2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewSnakeAt(1, 100, 100)
			s.TargetAngle = tt.angle
			s.CurrentAngle = tt.angle
			s.UpdatePosition(dt)
			dx := s.HeadX - 100
			dy := s.HeadY - 100
			if math.Abs(dx-tt.dxWant) > 0.01 || math.Abs(dy-tt.dyWant) > 0.01 {
				t.Errorf("UpdatePosition(angle=%.2f): got (%.2f, %.2f), want (%.2f, %.2f)", tt.angle, dx, dy, tt.dxWant, tt.dyWant)
			}
		})
	}
}

func TestSnake_UpdatePosition_TailFollows(t *testing.T) {
	s := NewSnakeAt(1, 100, 100)
	s.UpdatePosition(0.05)
	body := s.Body()
	if len(body) < 2 {
		t.Fatal("body too short")
	}
	// headPath: first tail segment at ~PreferredDist from head
	head := s.Head()
	dist := body[1].Distance(head)
	if math.Abs(dist-PreferredDist) > 5 {
		t.Errorf("first tail segment should be at distance ~%.1f from head, got dist=%.2f", PreferredDist, dist)
	}
}

func TestSnake_Grow_Multiple(t *testing.T) {
	s := NewSnake(1)
	for i := 0; i < 5; i++ {
		s.Grow()
	}
	// Run many ticks to process all queued sections
	for i := 0; i < 200; i++ {
		s.UpdatePosition(0.05)
	}
	body := s.Body()
	if len(body) < 9 {
		t.Errorf("5x Grow: body len = %d, want >= 9", len(body))
	}
}

func TestSnake_Body_OrderHeadToTail(t *testing.T) {
	s := NewSnakeAt(1, 200, 200)
	body := s.Body()
	if body[0].X != s.HeadX || body[0].Y != s.HeadY {
		t.Error("first body segment must be head")
	}
	for i := 1; i < len(body)-1; i++ {
		distToHead := body[i].Distance(Point{s.HeadX, s.HeadY})
		distNext := body[i+1].Distance(Point{s.HeadX, s.HeadY})
		if distToHead > distNext {
			t.Errorf("body[%d] (dist=%.1f) should be closer to head than body[%d] (dist=%.1f)", i, distToHead, i+1, distNext)
		}
	}
}

func TestSnake_NewSnakeAt_TailContinuity(t *testing.T) {
	s := NewSnakeAt(1, 77, 88)
	body := s.Body()
	// Tail extends back along X (angle=0)
	expectedFirstTail := Point{X: 77 - PreferredDist, Y: 88}
	firstTail := Point{X: body[1].X, Y: body[1].Y}
	if math.Abs(firstTail.X-expectedFirstTail.X) > 1 || math.Abs(firstTail.Y-expectedFirstTail.Y) > 1 {
		t.Errorf("first tail segment = %v, want ~%v", firstTail, expectedFirstTail)
	}
}

func TestSnake_UpdatePosition_TailBendsOnTurn(t *testing.T) {
	s := NewSnakeAt(1, 200, 200)
	s.TargetAngle = 0
	s.CurrentAngle = 0
	dt := 0.05
	// Движение вправо, затем поворот вверх
	for i := 0; i < 5; i++ {
		s.UpdatePosition(dt)
	}
	s.SetTargetAngle(math.Pi / 2) // поворот на 90°
	for i := 0; i < 8; i++ {
		s.UpdatePosition(dt)
	}
	body := s.Body()
	if len(body) < 4 {
		t.Fatal("body too short for bend test")
	}
	head := body[0]
	last := body[len(body)-1]
	// При повороте хвост изгибается — последний сегмент не на одной прямой с головой
	// Проверка: вектор head->last не коллинеарен направлению движения (0, 1)
	dx := last.X - head.X
	// Если хвост изогнут, dx != 0 (последний сегмент смещён по X относительно головы)
	if math.Abs(dx) < 1 {
		t.Errorf("tail should bend on turn: last segment at (%v,%v), head at (%v,%v) — dx=%.2f too small (tail too straight)", last.X, last.Y, head.X, head.Y, dx)
	}
}

func TestSnake_UpdatePosition_SmoothTurn(t *testing.T) {
	s := NewSnakeAt(1, 100, 100)
	s.TargetAngle = 0
	s.CurrentAngle = 0
	// SetTargetAngle(π/2) — CurrentAngle должен плавно стремиться к π/2
	s.SetTargetAngle(math.Pi / 2)
	dt := 0.05
	// За один тик: maxTurn = TurnSpeed * dt * spang; при BaseSpeed spang=min(1, 71/4.8)=1 → 0.1 рад
	// CurrentAngle станет 0.1, не π/2
	s.UpdatePosition(dt)
	if s.CurrentAngle < 0.05 || s.CurrentAngle > 0.15 {
		t.Errorf("CurrentAngle = %.3f, want ~0.1 (smooth turn, not instant)", s.CurrentAngle)
	}
	// Ещё несколько тиков — CurrentAngle приближается к π/2 (TurnSpeed=2 → ~16 тиков)
	for i := 0; i < 20; i++ {
		s.UpdatePosition(dt)
	}
	if s.CurrentAngle < math.Pi/2*0.9 {
		t.Errorf("CurrentAngle = %.3f, should approach π/2 after many ticks", s.CurrentAngle)
	}
}
