package payment

import (
	"context"
	"math"
	"strings"
	"testing"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/shopspring/decimal"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// ---- Unit tests: расчёт rake и referral (20% и 30% от rake) ----

func TestComputeDeathSplit_RakeAlways20Percent(t *testing.T) {
	tests := []struct {
		score       float64
		wantRake    float64 // ровно 20%
		description string
	}{
		{10.0, 2.0, "целое число"},
		{0.30, 0.06, "минимальная ставка"},
		{1.23456789, 0.24691358, "длинная дробь"},
		{999.99, 199.998, "крупная сумма"},
		{0.00000003, 0, "ниже min — 0 rake (score*0.2 < 1e-8)"},
		{0.00000004, 0, "на границе min"},
		{0.0000001, 0.00000002, "чуть выше min"},
		{123.456789123456, 24.69135782, "много знаков"},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			rake, _ := computeDeathSplit(tt.score)
			// Проверка: rake должен быть ровно 20% от score (с точностью до Round(8))
			if tt.wantRake == 0 {
				if rake != 0 {
					t.Errorf("computeDeathSplit(%v) rake = %v, want 0", tt.score, rake)
				}
				return
			}
			expectedRake := tt.score * 0.2
			// Допуск из-за округления float64
			if math.Abs(rake-expectedRake) > 0.00000001 && math.Abs(rake-tt.wantRake) > 0.00000001 {
				t.Errorf("computeDeathSplit(%v) rake = %v, want ~%v (20%% = %v)", tt.score, rake, tt.wantRake, expectedRake)
			}
			// Жёсткая проверка: 20% уходит платформе (допуск на округление до 8 знаков)
			ratio := rake / tt.score
			if rake > 0 && (ratio < 0.199 || ratio > 0.201) {
				t.Errorf("rake/score = %v, должен быть ~0.2 (20%%)", ratio)
			}
		})
	}
}

func TestComputeDeathSplit_Referral30PercentOfRake(t *testing.T) {
	tests := []struct {
		score          float64
		wantReferral   float64 // 30% от rake = 6% от score
		description    string
	}{
		{10.0, 0.6, "10 USDT: rake=2, referral=0.6"},
		{1.0, 0.06, "1 USDT: rake=0.2, referral=0.06"},
		{100.0, 6.0, "100 USDT"},
		{0.5, 0.03, "половина"},
	}
	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			rake, referral := computeDeathSplit(tt.score)
			if referral < 0.00000001 {
				if tt.wantReferral > 0 {
					t.Errorf("referral = 0, want %v", tt.wantReferral)
				}
				return
			}
			// referral = rake * 0.3 = 6% от score
			expectedReferral := tt.score * 0.06
			if math.Abs(referral-expectedReferral) > 0.0000001 {
				t.Errorf("computeDeathSplit(%v) referral = %v, want ~%v (6%% of score)", tt.score, referral, expectedReferral)
			}
			if rake > 0 {
				ratio := referral / rake
				if ratio < 0.2999999 || ratio > 0.3000001 {
					t.Errorf("referral/rake = %v, должен быть 0.3 (30%%)", ratio)
				}
			}
		})
	}
}

func TestComputeDeathSplit_DecimalPrecision(t *testing.T) {
	// Проверка: decimal даёт точные результаты, не float64-артефакты
	score := 33.33 // 1/3 — классический float problem
	rake, referral := computeDeathSplit(score)
	// 20% от 33.33 = 6.666, 30% от 6.666 = 1.9998
	expectedRake := 6.666
	expectedReferral := 1.9998
	if math.Abs(rake-expectedRake) > 0.001 {
		t.Errorf("rake = %v, want ~%v", rake, expectedRake)
	}
	if math.Abs(referral-expectedReferral) > 0.001 {
		t.Errorf("referral = %v, want ~%v", referral, expectedReferral)
	}
}

func TestComputeDeathSplit_EdgeCases(t *testing.T) {
	rake, ref := computeDeathSplit(0)
	if rake != 0 || ref != 0 {
		t.Errorf("score=0: rake=%v ref=%v, want 0,0", rake, ref)
	}
	rake, ref = computeDeathSplit(-5)
	if rake != 0 || ref != 0 {
		t.Errorf("score=-5: rake=%v ref=%v, want 0,0", rake, ref)
	}
}

func TestComputeDeathSplit_PlatformGetsExactly20(t *testing.T) {
	// Таблица: для любых score админ получает ровно 20%
	scores := []float64{0.5, 1, 2.5, 10, 25.99, 100, 500.123, 999.999}
	for _, s := range scores {
		rake, _ := computeDeathSplit(s)
		if s <= 0.00000006 {
			continue
		}
		// decimal даёт: score * 0.2, округлённое до 8 знаков
		exact := decimal.NewFromFloat(s).Mul(decimal.RequireFromString("0.2"))
		rakeDec, _ := exact.Round(8).Float64()
		if math.Abs(rake-rakeDec) > 0.00000001 {
			t.Errorf("score=%v: rake=%v, decimal exact=%v", s, rake, rakeDec)
		}
	}
}

// ---- Integration tests: OnPlayerDeath с SQLite in-memory ----

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	// Уникальная in-memory DB на тест
	name := strings.ReplaceAll(t.Name(), "/", "_")
	db, err := gorm.Open(sqlite.Open("file:"+name+"?mode=memory&cache=shared"), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&domain.User{}, &domain.Transaction{}, &domain.Referral{}, &domain.ReferralEarning{}, &domain.RevenueLog{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return db
}

func TestOnPlayerDeath_RevenueLogAlwaysCreated(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	ctx := context.Background()
	roomID := "room-1"
	refID := "room-1:death:123"
	victimUserID := uint(1)

	// Нет referral — только revenue_log
	err := tx.OnPlayerDeath(ctx, victimUserID, 10.0, 0, refID, roomID)
	if err != nil {
		t.Fatalf("OnPlayerDeath: %v", err)
	}

	var logs []domain.RevenueLog
	if err := db.Where("room_id = ? AND transaction_type = ?", roomID, "death_rake").Find(&logs).Error; err != nil {
		t.Fatalf("find revenue_logs: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("want 1 revenue_log, got %d", len(logs))
	}
	// 20% от 10 = 2.0
	if math.Abs(logs[0].Amount-2.0) > 0.0001 {
		t.Errorf("revenue amount = %v, want 2.0 (20%% of 10)", logs[0].Amount)
	}
}

func TestOnPlayerDeath_ReferrerGets30PercentOfRake(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	// Создаём referrer (id=1) и referred (id=2)
	db.Create(&domain.User{ID: 1, TgID: 100, Balance: 0})
	db.Create(&domain.User{ID: 2, TgID: 200, Balance: 0})
	db.Create(&domain.Referral{ReferrerID: 1, ReferredID: 2})

	ctx := context.Background()
	roomID := "room-2"
	refID := "room-2:death:456"
	victimUserID := uint(2)
	victimScore := 10.0 // rake=2, referral=0.6

	err := tx.OnPlayerDeath(ctx, victimUserID, victimScore, 0.5, refID, roomID)
	if err != nil {
		t.Fatalf("OnPlayerDeath: %v", err)
	}

	var user domain.User
	if err := db.First(&user, 1).Error; err != nil {
		t.Fatalf("find referrer: %v", err)
	}
	// Реферер должен получить 0.6 USDT
	if math.Abs(user.Balance-0.6) > 0.0001 {
		t.Errorf("referrer balance = %v, want 0.6 (30%% of rake 2)", user.Balance)
	}

	var logs []domain.RevenueLog
	db.Where("room_id = ?", roomID).Find(&logs)
	if len(logs) != 1 || math.Abs(logs[0].Amount-2.0) > 0.0001 {
		t.Errorf("revenue_log: want amount 2.0, got %v", logs)
	}
}

func TestOnPlayerDeath_Idempotent(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	db.Create(&domain.User{ID: 1, TgID: 100, Balance: 0})
	db.Create(&domain.User{ID: 2, TgID: 200, Balance: 0})
	db.Create(&domain.Referral{ReferrerID: 1, ReferredID: 2})

	ctx := context.Background()
	refID := "room-3:death:789"
	roomID := "room-3"
	victimUserID := uint(2)
	score := 5.0

	// Дважды один и тот же referenceID
	_ = tx.OnPlayerDeath(ctx, victimUserID, score, 0.5, refID, roomID)
	_ = tx.OnPlayerDeath(ctx, victimUserID, score, 0.5, refID, roomID)

	// Реферер должен получить только один раз (0.3 USDT = 30% от rake 1.0)
	var user domain.User
	db.First(&user, 1)
	if math.Abs(user.Balance-0.3) > 0.0001 {
		t.Errorf("idempotency: referrer balance = %v, want 0.3 (single credit)", user.Balance)
	}

	// revenue_log — только одна запись
	var count int64
	db.Model(&domain.RevenueLog{}).Where("room_id = ?", roomID).Count(&count)
	if count != 1 {
		t.Errorf("idempotency: want 1 revenue_log, got %d", count)
	}
}

func TestOnPlayerDeath_SmallAmountsRounding(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	ctx := context.Background()

	// Score, при котором rake < minAmount (0.00000001)
	// rake = score * 0.2. min = 0.00000001 => score min = 0.00000005
	t.Run("below_min_skips", func(t *testing.T) {
		roomID := "room-tiny"
		refID := "room-tiny:death:111"
		score := 0.00000004 // rake = 0.000000008 < min

		err := tx.OnPlayerDeath(ctx, 999, score, 0, refID, roomID)
		if err != nil {
			t.Fatalf("OnPlayerDeath: %v", err)
		}
		var count int64
		db.Model(&domain.RevenueLog{}).Where("room_id = ?", roomID).Count(&count)
		if count != 0 {
			t.Errorf("rake below min: want 0 revenue_logs, got %d", count)
		}
	})

	// Маленькая сумма, но выше min — revenue_log создаётся
	t.Run("small_above_min", func(t *testing.T) {
		roomID := "room-small-ok"
		refID := "room-small-ok:death:222"
		score := 0.0001 // rake = 0.00002 > min

		err := tx.OnPlayerDeath(ctx, 999, score, 0, refID, roomID)
		if err != nil {
			t.Fatalf("OnPlayerDeath: %v", err)
		}
		var logs []domain.RevenueLog
		db.Where("room_id = ?", roomID).Find(&logs)
		if len(logs) != 1 {
			t.Fatalf("want 1 revenue_log, got %d", len(logs))
		}
		// 20% от 0.0001 = 0.00002
		if math.Abs(logs[0].Amount-0.00002) > 0.00000001 {
			t.Errorf("revenue = %v, want 0.00002", logs[0].Amount)
		}
	})
}

func TestOnPlayerDeath_EmptyReferenceID_Skips(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	// refID пустой — ничего не должно создаться
	err := tx.OnPlayerDeath(context.Background(), 1, 10.0, 0, "", "room-empty")
	if err != nil {
		t.Fatalf("OnPlayerDeath: %v", err)
	}

	var count int64
	db.Model(&domain.RevenueLog{}).Where("room_id = ?", "room-empty").Count(&count)
	// Пустой refID — early return, room_empty не создаётся. Но другие тесты могли создать в другой room.
	// Проверяем что для этой комнаты записей нет (мы не передали room с таким id в других тестах, так что 0)
	if count != 0 {
		t.Errorf("empty refID: room-empty should have 0 revenue_logs, got %d", count)
	}
}

// ---- OnExpiredCoins ----

func TestOnExpiredCoins_CreatesRevenueLog(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	err := tx.OnExpiredCoins(context.Background(), "room-exp", 2.5)
	if err != nil {
		t.Fatalf("OnExpiredCoins: %v", err)
	}

	var logs []domain.RevenueLog
	db.Where("room_id = ? AND transaction_type = ?", "room-exp", "expired_coin").Find(&logs)
	if len(logs) != 1 {
		t.Fatalf("want 1 revenue_log, got %d", len(logs))
	}
	if math.Abs(logs[0].Amount-2.5) > 0.0001 {
		t.Errorf("amount = %v, want 2.5", logs[0].Amount)
	}
}

func TestOnExpiredCoins_ZeroSkips(t *testing.T) {
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	err := tx.OnExpiredCoins(context.Background(), "room-zero", 0)
	if err != nil {
		t.Fatalf("OnExpiredCoins: %v", err)
	}
	err = tx.OnExpiredCoins(context.Background(), "room-zero", -1)
	if err != nil {
		t.Fatalf("OnExpiredCoins: %v", err)
	}

	var count int64
	db.Model(&domain.RevenueLog{}).Where("room_id = ?", "room-zero").Count(&count)
	if count != 0 {
		t.Errorf("zero/negative should skip: got %d revenue_logs", count)
	}
}

// ---- ProcessWithdrawal ----

func TestProcessWithdrawal_3PercentFee(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	db.Create(&domain.User{ID: 1, TgID: 100, Balance: 10.0})

	err := tx.ProcessWithdrawal(context.Background(), 1, 5.0)
	if err != nil {
		t.Fatalf("ProcessWithdrawal: %v", err)
	}

	var user domain.User
	db.First(&user, 1)
	if math.Abs(user.Balance-5.0) > 0.0001 {
		t.Errorf("balance after withdraw 5 = %v, want 5 (10-5)", user.Balance)
	}

	var logs []domain.RevenueLog
	db.Where("transaction_type = ?", "withdraw_fee").Find(&logs)
	if len(logs) != 1 {
		t.Fatalf("want 1 withdraw_fee log, got %d", len(logs))
	}
	// 5 * 0.03 = 0.15
	if math.Abs(logs[0].Amount-0.15) > 0.0001 {
		t.Errorf("withdraw fee = %v, want 0.15 (3%% of 5)", logs[0].Amount)
	}
}

func TestProcessWithdrawal_InsufficientFunds(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}
	db := setupTestDB(t)
	tx := NewTxManager(db, nil)

	db.Create(&domain.User{ID: 1, TgID: 100, Balance: 1.0})

	err := tx.ProcessWithdrawal(context.Background(), 1, 5.0)
	if err != ErrInsufficientFunds {
		t.Errorf("want ErrInsufficientFunds, got %v", err)
	}

	var user domain.User
	db.First(&user, 1)
	if user.Balance != 1.0 {
		t.Errorf("balance should remain 1, got %v", user.Balance)
	}
}
