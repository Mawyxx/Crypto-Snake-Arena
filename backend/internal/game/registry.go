package game

import (
	"context"
	"strconv"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"go.uber.org/zap"
)

// RegisterPlayer добавляет игрока в комнату: PickSpawnPosition, NewSnakeAt, r.Snakes[player.TgID] = snake.
// Вызывать под r.Mu.Lock.
func RegisterPlayer(r *Room, player *Player) {
	x, y := PickSpawnPosition(r.Grid, r.Snakes)
	snake := domain.NewSnakeAt(player.TgID, x, y)
	snake.SetEntryFee(player.EntryFee)
	snake.UserID = int64(player.UserID)
	snake.JoinedTick = r.CurrentTick
	snake.JoinedAt = time.Now()
	r.Snakes[player.TgID] = snake
}

// UnregisterPlayer обрабатывает выход: RewardCreditor (если живой), ResultRecorder, delete(r.Snakes), onSlotFreed.
// Вызывать под r.Mu.Lock для мутации Snakes; onSlotFreed — после Unlock.
func UnregisterPlayer(r *Room, player *Player) {
	snake, ok := r.Snakes[player.TgID]
	if ok {
		if snake.Score > 0 && !snake.Dead && r.RewardCreditor != nil {
			refID := r.ID + ":unreg:" + strconv.FormatUint(uint64(player.UserID), 10)
			if err := r.RewardCreditor.AddGameReward(context.Background(), player.UserID, snake.Score, refID); err != nil {
				zap.L().Error("room AddGameReward failed on Unregister", zap.Uint("userID", player.UserID), zap.Float64("score", snake.Score), zap.Error(err))
			}
		}
		if r.ResultRecorder != nil {
			loot := snake.Score
			if snake.Dead {
				loot = 0
			}
			status := "loss"
			if loot > 0 && !snake.Dead {
				status = "win"
			}
			durationSec := int(time.Since(snake.JoinedAt).Seconds())
			if durationSec < 0 {
				durationSec = 0
			}
			if err := r.ResultRecorder.RecordGameResult(context.Background(), player.UserID, player.EntryFee, loot, r.ID, status, durationSec); err != nil {
				zap.L().Error("room RecordGameResult failed on Unregister", zap.Uint("userID", player.UserID), zap.Float64("stake", player.EntryFee), zap.Float64("loot", loot), zap.Error(err))
			}
		}
	}
	delete(r.Snakes, player.TgID)
}

// ProcessDeath обрабатывает смерть змейки: victim.Dead=true, SpawnCoins в r.Coins/Grid, DeathHandler, ResultRecorder.
// Вызывать под r.Mu.Lock. Room сам удаляет змейку по toDeleteSnakes.
func ProcessDeath(r *Room, victim *domain.Snake) {
	victim.Dead = true
	victimScore := victim.CurrentScore()
	dropAmount := victimScore * 0.8
	newCoins := domain.SpawnCoins(victim.Body(), dropAmount)
	for _, c := range newCoins {
		r.Coins[c.ID] = c
		r.Grid.AddCoin(c)
	}
	if r.DeathHandler != nil && victim.UserID > 0 && victimScore > 0 {
		refID := r.ID + ":death:" + strconv.FormatUint(victim.ID, 10)
		roomID := r.ID
		entryFee := victim.EntryFee
		go func() {
			if err := r.DeathHandler.OnPlayerDeath(context.Background(), uint(victim.UserID), victimScore, entryFee, refID, roomID); err != nil {
				zap.L().Error("room OnPlayerDeath failed", zap.Int64("victimUserID", victim.UserID), zap.Float64("score", victimScore), zap.Error(err))
			}
		}()
	}
	if r.ResultRecorder != nil && victim.UserID > 0 {
		durationSec := int(time.Since(victim.JoinedAt).Seconds())
		if durationSec < 0 {
			durationSec = 0
		}
		go func() {
			if err := r.ResultRecorder.RecordGameResult(context.Background(), uint(victim.UserID), victim.EntryFee, 0, r.ID, "loss", durationSec); err != nil {
				zap.L().Error("room RecordGameResult failed on killSnake", zap.Int64("victimUserID", victim.UserID), zap.Float64("stake", victim.EntryFee), zap.Error(err))
			}
		}()
	}
}

// DrainUnregister обрабатывает Unregister до deadline или пока remaining==0. Вызывает UnregisterPlayer для каждого.
func DrainUnregister(r *Room, deadline time.Time) {
	for time.Now().Before(deadline) {
		r.Mu.Lock()
		remaining := len(r.Snakes)
		r.Mu.Unlock()
		if remaining == 0 {
			break
		}
		select {
		case player := <-r.Unregister:
			r.Mu.Lock()
			UnregisterPlayer(r, player)
			r.Mu.Unlock()
			if r.onSlotFreed != nil {
				r.onSlotFreed(r)
			}
		case <-time.After(100 * time.Millisecond):
			// check again
		}
	}
}

// SyncBalanceOnShutdown для оставшихся змеек при Stop: AddGameReward (refID shutdown).
// Вызывать под r.Mu.Lock.
func SyncBalanceOnShutdown(r *Room) {
	for _, snake := range r.Snakes {
		if snake.Score > 0 && !snake.Dead && r.RewardCreditor != nil && snake.UserID > 0 {
			refID := r.ID + ":shutdown:" + strconv.FormatUint(snake.ID, 10)
			if err := r.RewardCreditor.AddGameReward(context.Background(), uint(snake.UserID), snake.Score, refID); err != nil {
				zap.L().Error("room AddGameReward failed on shutdown", zap.Int64("userID", snake.UserID), zap.Error(err))
			}
		}
	}
}
