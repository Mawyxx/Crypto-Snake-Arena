package domain

import (
	"math"
	"testing"
)

func TestInBounds_CircularArena(t *testing.T) {
	g := NewSpatialGrid(1000) // центр (500, 500), радиус 500

	tests := []struct {
		name string
		p    Point
		want bool
	}{
		{"center", Point{500, 500}, true},
		{"inside_near_center", Point{400, 400}, true},
		{"inside_far", Point{100, 400}, true},
		{"on_boundary_east", Point{1000, 500}, true},
		{"on_boundary_north", Point{500, 0}, true},
		{"on_boundary_south", Point{500, 1000}, true},
		{"on_boundary_west", Point{0, 500}, true},
		{"just_outside_east", Point{1001, 500}, false},
		{"outside_corner", Point{0, 0}, false},
		{"outside_far", Point{1000, 1000}, false}, // dist ≈ 707 > 500
		{"negative_coords", Point{-100, 500}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := g.InBounds(tt.p)
			if got != tt.want {
				t.Errorf("InBounds(%v) = %v, want %v", tt.p, got, tt.want)
			}
		})
	}
}

func TestInBounds_NonSquareArena(t *testing.T) {
	// Прямоугольник 800x600 → центр (400, 300), радиус min/2 = 300
	g := NewSpatialGrid(1000)
	g.Width = 800
	g.Height = 600

	cx, cy := 400.0, 300.0
	r := 300.0

	tests := []struct {
		name string
		p    Point
		want bool
	}{
		{"center", Point{cx, cy}, true},
		{"inside", Point{400, 400}, true},   // dist=100
		{"on_radius", Point{cx + r, cy}, true},
		{"outside_horizontal", Point{cx + r + 1, cy}, false},
		{"corner_outside", Point{0, 0}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := g.InBounds(tt.p)
			if got != tt.want {
				dist := math.Sqrt((tt.p.X-cx)*(tt.p.X-cx) + (tt.p.Y-cy)*(tt.p.Y-cy))
				t.Errorf("InBounds(%v) = %v, want %v (dist=%.1f, r=%.1f)", tt.p, got, tt.want, dist, r)
			}
		})
	}
}

func TestSpatialGrid_Clear(t *testing.T) {
	g := NewSpatialGrid(1000)
	snake := NewSnakeAt(1, 25, 25)
	g.AddSnake(snake)
	g.AddCoin(&Coin{X: 25, Y: 25, Value: 1})

	g.Clear()

	if len(g.SnakeCells) != 0 {
		t.Errorf("after Clear, SnakeCells has %d entries, want 0", len(g.SnakeCells))
	}
	if len(g.CoinCells) != 0 {
		t.Errorf("after Clear, CoinCells has %d entries, want 0", len(g.CoinCells))
	}
}

func TestSpatialGrid_AddSnake_GetSnakesInCell(t *testing.T) {
	g := NewSpatialGrid(1000)
	snake := NewSnakeAt(1, 125, 75) // cell col=2, row=1
	g.AddSnake(snake)

	// Змея добавляет голову и сегменты тела — в ячейке могут быть дубликаты ID
	ids := g.GetSnakesInCell(snake.Head(), 999)
	if len(ids) == 0 {
		t.Error("GetSnakesInCell(head, exclude=999): expected at least one ID")
	}
	hasOne := false
	for _, id := range ids {
		if id == 1 {
			hasOne = true
			break
		}
	}
	if !hasOne {
		t.Errorf("GetSnakesInCell(head, exclude=999) = %v, expected to contain 1", ids)
	}

	ids = g.GetSnakesInCell(snake.Head(), 1)
	for _, id := range ids {
		if id == 1 {
			t.Errorf("GetSnakesInCell(head, exclude=1) should not contain 1, got %v", ids)
		}
	}
}

func TestSpatialGrid_AddCoin_GetCoinsNear(t *testing.T) {
	g := NewSpatialGrid(1000)
	coin := &Coin{ID: "c1", X: 125, Y: 75, Value: 5}
	g.AddCoin(coin)

	near := g.GetCoinsNear(Point{125, 75})
	if len(near) != 1 || near[0] != coin {
		t.Errorf("GetCoinsNear = %v, want [coin]", near)
	}

	empty := g.GetCoinsNear(Point{500, 500})
	if len(empty) != 0 {
		t.Errorf("GetCoinsNear(500,500) = %v, want []", empty)
	}
}

func TestSpatialGrid_CheckCollision(t *testing.T) {
	g := NewSpatialGrid(1000)
	s1 := NewSnakeAt(1, 25, 25)
	s2 := NewSnakeAt(2, 30, 30) // та же ячейка (0,0)
	g.AddSnake(s1)
	g.AddSnake(s2)

	if !g.CheckCollision(Point{25, 25}, 999) {
		t.Error("CheckCollision: в ячейке есть чужая змея, ожидалось true")
	}
	if !g.CheckCollision(Point{25, 25}, 1) {
		t.Error("CheckCollision: змея 1 в ячейке с змеёй 2, ожидалось true")
	}
	if g.CheckCollision(Point{500, 500}, 1) {
		t.Error("CheckCollision: пустая ячейка, ожидалось false")
	}
}

func TestSpatialGrid_TwoSnakesSameCell_ExcludeSelf(t *testing.T) {
	g := NewSpatialGrid(1000)
	s1 := NewSnakeAt(1, 40, 40)
	s2 := NewSnakeAt(2, 45, 45)
	g.AddSnake(s1)
	g.AddSnake(s2)

	// Исключаем 1 — в результате только ID змейки 2 (могут быть дубли от сегментов)
	others := g.GetSnakesInCell(Point{40, 40}, 1)
	hasTwo, hasOne := false, false
	for _, id := range others {
		if id == 1 {
			hasOne = true
		}
		if id == 2 {
			hasTwo = true
		}
	}
	if hasOne {
		t.Errorf("GetSnakesInCell(exclude 1) should not contain 1, got %v", others)
	}
	if !hasTwo {
		t.Errorf("GetSnakesInCell(exclude 1) should contain 2, got %v", others)
	}

	others = g.GetSnakesInCell(Point{40, 40}, 2)
	hasTwo, hasOne = false, false
	for _, id := range others {
		if id == 1 {
			hasOne = true
		}
		if id == 2 {
			hasTwo = true
		}
	}
	if hasTwo {
		t.Errorf("GetSnakesInCell(exclude 2) should not contain 2, got %v", others)
	}
	if !hasOne {
		t.Errorf("GetSnakesInCell(exclude 2) should contain 1, got %v", others)
	}
}
