package domain

import (
	"testing"
)

func TestSpawnCoins_EmptyBody(t *testing.T) {
	coins := SpawnCoins(nil, 100)
	if coins != nil {
		t.Errorf("SpawnCoins(nil, 100) = %v, want nil", coins)
	}
	coins = SpawnCoins([]Point{}, 100)
	if coins != nil {
		t.Errorf("SpawnCoins([], 100) = %v, want nil", coins)
	}
}

func TestSpawnCoins_ZeroDrop(t *testing.T) {
	body := []Point{{X: 100, Y: 100}}
	coins := SpawnCoins(body, 0)
	if coins != nil {
		t.Errorf("SpawnCoins(body, 0) = %v, want nil", coins)
	}
}

func TestSpawnCoins_CountAndValue(t *testing.T) {
	body := []Point{
		{X: 100, Y: 100},
		{X: 90, Y: 100},
		{X: 80, Y: 100},
	}
	dropAmount := 30.0
	coins := SpawnCoins(body, dropAmount)
	if len(coins) != 3 {
		t.Errorf("len(coins) = %d, want 3", len(coins))
	}
	valuePerCoin := dropAmount / 3
	for i, c := range coins {
		if c.Value != valuePerCoin {
			t.Errorf("coin[%d].Value = %.2f, want %.2f", i, c.Value, valuePerCoin)
		}
		if c.ID == "" {
			t.Errorf("coin[%d].ID is empty", i)
		}
	}
}

func TestSpawnCoins_PositionsFromBody(t *testing.T) {
	body := []Point{
		{X: 100, Y: 100},
		{X: 50, Y: 50},
	}
	coins := SpawnCoins(body, 10)
	if len(coins) != 2 {
		t.Fatalf("len(coins) = %d, want 2", len(coins))
	}
	if coins[0].X != 100 || coins[0].Y != 100 {
		t.Errorf("coin[0] pos = (%.0f, %.0f), want (100, 100)", coins[0].X, coins[0].Y)
	}
	if coins[1].X != 50 || coins[1].Y != 50 {
		t.Errorf("coin[1] pos = (%.0f, %.0f), want (50, 50)", coins[1].X, coins[1].Y)
	}
}

func TestSpawnCoins_Max20(t *testing.T) {
	body := make([]Point, 30)
	for i := range body {
		body[i] = Point{X: float64(i), Y: float64(i)}
	}
	coins := SpawnCoins(body, 100)
	if len(coins) != 20 {
		t.Errorf("len(coins) = %d, want 20 (max cap)", len(coins))
	}
	valuePerCoin := 100.0 / 20
	for _, c := range coins {
		if c.Value != valuePerCoin {
			t.Errorf("Value = %.2f, want %.2f", c.Value, valuePerCoin)
			break
		}
	}
}

func TestSpawnCoins_SingleSegment(t *testing.T) {
	body := []Point{{X: 50, Y: 50}}
	coins := SpawnCoins(body, 10)
	if len(coins) != 1 {
		t.Fatalf("len(coins) = %d, want 1", len(coins))
	}
	if coins[0].X != 50 || coins[0].Y != 50 {
		t.Errorf("coin pos = (%.0f, %.0f), want (50, 50)", coins[0].X, coins[0].Y)
	}
	if coins[0].Value != 10 {
		t.Errorf("coin value = %.2f, want 10", coins[0].Value)
	}
	if coins[0].ID == "" {
		t.Error("coin ID must be non-empty")
	}
	if coins[0].ExpiresAt.IsZero() {
		t.Error("coin ExpiresAt must be set")
	}
}

func TestSpawnCoins_ValueDistribution(t *testing.T) {
	body := []Point{{X: 0, Y: 0}, {X: 10, Y: 0}, {X: 20, Y: 0}}
	drop := 9.0
	coins := SpawnCoins(body, drop)
	if len(coins) != 3 {
		t.Fatalf("len = %d, want 3", len(coins))
	}
	gotSum := 0.0
	for _, c := range coins {
		gotSum += c.Value
	}
	if gotSum != drop {
		t.Errorf("total value = %.2f, want %.2f", gotSum, drop)
	}
	expectedPer := drop / 3
	for i, c := range coins {
		if c.Value != expectedPer {
			t.Errorf("coin[%d].Value = %.2f, want %.2f", i, c.Value, expectedPer)
		}
	}
}

func TestCoin_Position(t *testing.T) {
	c := &Coin{X: 123.5, Y: 456.7}
	p := c.Position()
	if p.X != 123.5 || p.Y != 456.7 {
		t.Errorf("Position() = (%.1f, %.1f), want (123.5, 456.7)", p.X, p.Y)
	}
}
