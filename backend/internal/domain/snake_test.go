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
	if s.HeadX != 500 || s.HeadY != 500 {
		t.Errorf("Head = (%.0f, %.0f), want (500, 500)", s.HeadX, s.HeadY)
	}
	if s.Angle != 0 || s.Score != 0 || s.EntryFee != 0 {
		t.Errorf("Angle=%v Score=%v EntryFee=%v", s.Angle, s.Score, s.EntryFee)
	}
	if len(s.Tail) != 6 {
		t.Errorf("Tail len = %d, want 6 (3 segments × 2 coords)", len(s.Tail))
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
	// Tail should extend backward from head
	if len(s.Tail) != 6 {
		t.Errorf("Tail len = %d, want 6", len(s.Tail))
	}
	// First tail segment roughly at (headX - SegmentLen, headY)
	firstTailX := s.Tail[0]
	if firstTailX < 100-SegmentLen-1 || firstTailX > 100-SegmentLen+1 {
		t.Errorf("First tail X = %.2f, want ~%.2f", firstTailX, 100-SegmentLen)
	}
}

func TestSnake_SetDirection(t *testing.T) {
	s := NewSnake(1)
	s.SetDirection(math.Pi / 2)
	if s.Angle != math.Pi/2 {
		t.Errorf("Angle = %v, want π/2", s.Angle)
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

func TestSnake_Move(t *testing.T) {
	s := NewSnake(1)
	s.Angle = 0
	startX, startY := s.HeadX, s.HeadY
	s.Move()
	if s.HeadX != startX+BaseSpeed {
		t.Errorf("HeadX = %.2f, want %.2f", s.HeadX, startX+BaseSpeed)
	}
	if s.HeadY != startY {
		t.Errorf("HeadY changed from %.2f to %.2f", startY, s.HeadY)
	}
}

func TestSnake_MoveWithBoost(t *testing.T) {
	s := NewSnake(1)
	s.Angle = 0
	s.Boost = true
	startX := s.HeadX
	s.Move()
	if s.HeadX != startX+BoostSpeed {
		t.Errorf("HeadX = %.2f, want %.2f (BoostSpeed)", s.HeadX, startX+BoostSpeed)
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
	initialTailLen := len(s.Tail)
	s.Grow()
	if len(s.Tail) != initialTailLen+2 {
		t.Errorf("Tail len = %d, want %d", len(s.Tail), initialTailLen+2)
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

func TestSnake_Move_Angles(t *testing.T) {
	tests := []struct {
		name   string
		angle  float64
		dxWant float64
		dyWant float64
	}{
		{"east", 0, BaseSpeed, 0},
		{"north", math.Pi / 2, 0, BaseSpeed},
		{"west", math.Pi, -BaseSpeed, 0},
		{"south", -math.Pi / 2, 0, -BaseSpeed},
		{"diagonal", math.Pi / 4, BaseSpeed / math.Sqrt2, BaseSpeed / math.Sqrt2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewSnakeAt(1, 100, 100)
			s.Angle = tt.angle
			s.Move()
			dx := s.HeadX - 100
			dy := s.HeadY - 100
			if math.Abs(dx-tt.dxWant) > 0.01 || math.Abs(dy-tt.dyWant) > 0.01 {
				t.Errorf("Move(angle=%.2f): got (%.2f, %.2f), want (%.2f, %.2f)", tt.angle, dx, dy, tt.dxWant, tt.dyWant)
			}
		})
	}
}

func TestSnake_Move_TailFollows(t *testing.T) {
	s := NewSnakeAt(1, 100, 100)
	headBefore := s.Head()
	s.Move()
	body := s.Body()
	if len(body) < 2 {
		t.Fatal("body too short")
	}
	if body[1].X != headBefore.X || body[1].Y != headBefore.Y {
		t.Errorf("first tail segment should be at previous head (%v), got %v", headBefore, body[1])
	}
}

func TestSnake_Grow_Multiple(t *testing.T) {
	s := NewSnake(1)
	initialLen := len(s.Tail)
	for i := 0; i < 5; i++ {
		s.Grow()
	}
	if len(s.Tail) != initialLen+10 {
		t.Errorf("5x Grow: tail len = %d, want %d", len(s.Tail), initialLen+10)
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
	// Хвост идёт назад по X (angle=0)
	expectedFirstTail := Point{X: 77 - SegmentLen, Y: 88}
	firstTail := Point{X: body[1].X, Y: body[1].Y}
	if math.Abs(firstTail.X-expectedFirstTail.X) > 1 || math.Abs(firstTail.Y-expectedFirstTail.Y) > 1 {
		t.Errorf("first tail segment = %v, want ~%v", firstTail, expectedFirstTail)
	}
}
