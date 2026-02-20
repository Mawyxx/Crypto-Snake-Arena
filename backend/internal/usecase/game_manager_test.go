package usecase

import (
	"context"
	"testing"

	"github.com/crypto-snake-arena/server/internal/game"
)

type walletMock struct {
	placed   float64
	refunded float64
}

func (w *walletMock) PlaceBet(_ context.Context, _ uint, amount float64) error {
	w.placed += amount
	return nil
}

func (w *walletMock) AddGameReward(_ context.Context, _ uint, amount float64, _ string) error {
	w.refunded += amount
	return nil
}

func TestGameManagerJoinRoom(t *testing.T) {
	wallet := &walletMock{}
	gm := NewGameManager(wallet)
	room := game.NewRoom(nil, nil, nil, nil, nil, nil)

	if err := gm.JoinRoom(context.Background(), 1, 0.3, room); err != nil {
		t.Fatalf("JoinRoom failed: %v", err)
	}
	if wallet.placed != 0.3 {
		t.Fatalf("expected stake to be placed, got %.2f", wallet.placed)
	}
}

func TestGameManagerRefundFailedJoin(t *testing.T) {
	wallet := &walletMock{}
	gm := NewGameManager(wallet)
	if err := gm.RefundFailedJoin(context.Background(), 1, 0.5, "room_full"); err != nil {
		t.Fatalf("RefundFailedJoin failed: %v", err)
	}
	if wallet.refunded != 0.5 {
		t.Fatalf("expected refund=0.5, got %.2f", wallet.refunded)
	}
}
