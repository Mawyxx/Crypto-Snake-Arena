package domain

import (
	"math"
	"testing"
)

func TestPoint_Distance(t *testing.T) {
	tests := []struct {
		name   string
		p1, p2 Point
		want   float64
	}{
		{"3-4-5 triangle", Point{0, 0}, Point{3, 4}, 5.0},
		{"same point", Point{10, 20}, Point{10, 20}, 0},
		{"horizontal", Point{0, 0}, Point{10, 0}, 10.0},
		{"vertical", Point{0, 0}, Point{0, 7}, 7.0},
		{"negative coords", Point{-3, -4}, Point{0, 0}, 5.0},
		{"diagonal", Point{0, 0}, Point{1, 1}, math.Sqrt2},
		{"symmetric", Point{5, 5}, Point{8, 9}, 5.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.p1.Distance(tt.p2)
			if math.Abs(got-tt.want) > 1e-9 {
				t.Errorf("Distance(%v, %v) = %.6f, want %.6f", tt.p1, tt.p2, got, tt.want)
			}
			gotRev := tt.p2.Distance(tt.p1)
			if math.Abs(gotRev-got) > 1e-9 {
				t.Errorf("Distance should be symmetric: %v vs %v", got, gotRev)
			}
		})
	}
}

func TestPoint_Intersects(t *testing.T) {
	tests := []struct {
		name  string
		head  Point
		coin  *Coin
		want  bool
	}{
		{"inside_radius", Point{100, 100}, &Coin{X: 105, Y: 100}, true},
		{"outside_radius", Point{0, 0}, &Coin{X: 20, Y: 0}, false},
		{"exactly_at_center", Point{50, 50}, &Coin{X: 50, Y: 50}, true},
		{"at_boundary", Point{0, 0}, &Coin{X: CoinRadius - 0.1, Y: 0}, true},
		{"just_outside", Point{0, 0}, &Coin{X: CoinRadius + 0.1, Y: 0}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.head.Intersects(tt.coin)
			if got != tt.want {
				dist := tt.head.Distance(tt.coin.Position())
				t.Errorf("Intersects: head=%v coin=(%.1f,%.1f) dist=%.2f got=%v want=%v (CoinRadius=%.1f)",
					tt.head, tt.coin.X, tt.coin.Y, dist, got, tt.want, CoinRadius)
			}
		})
	}
}

func TestPoint_Intersects_NilCoinPanics(t *testing.T) {
	assertPanic(t, func() {
		Point{0, 0}.Intersects(nil)
	}, "Intersects(nil) should panic")
}

func assertPanic(t *testing.T, fn func(), msg string) {
	t.Helper()
	defer func() {
		if r := recover(); r == nil {
			t.Error(msg)
		}
	}()
	fn()
}
