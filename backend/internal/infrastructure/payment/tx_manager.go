package payment

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const txTimeout = 10 * time.Second

var (
	ErrInsufficientFunds = errors.New("на балансе недостаточно средств")
	ErrTxAlreadyExists   = errors.New("транзакция уже была обработана")
)

// TxManager — логика «Банкира»: депозит (Crypto Bot) и игровые списания (БД).
type TxManager struct {
	db *gorm.DB
}

// NewTxManager создаёт менеджер транзакций.
func NewTxManager(db *gorm.DB) *TxManager {
	return &TxManager{db: db}
}

// ----------------------------------------------------------------
// 1. ИГРОВАЯ ЛОГИКА (Внутренние списания)
// ----------------------------------------------------------------

// PlaceBet вызывается, когда игрок нажимает "Войти в игру".
func (m *TxManager) PlaceBet(ctx context.Context, userID uint, amount float64) error {
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()
	return m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var user domain.User

		// Pessimistic Lock — блокируем строку, чтобы не зайти в 2 игры одновременно
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&user, userID).Error; err != nil {
			return err
		}

		if user.Balance < amount {
			return ErrInsufficientFunds
		}
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
			return err
		}

		return tx.Create(&domain.Transaction{
			ID:        uuid.New().String(),
			UserID:    userID,
			Amount:    -amount,
			Type:      "game_entry",
			Status:    "completed",
			CreatedAt: time.Now(),
		}).Error
	})
}

// AddGameReward начисление собранных в игре монет.
// referenceID — идемпотентность (ID сессии, метка смерти). Пустой — для refund, без проверки дубликата.
// SELECT ... FOR UPDATE + атомарный Update — защита от race и deadlock.
func (m *TxManager) AddGameReward(ctx context.Context, userID uint, amount float64, referenceID string) error {
	if amount <= 0 {
		return nil
	}
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()
	return m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if referenceID != "" {
			var count int64
			if err := tx.Model(&domain.Transaction{}).
				Where("user_id = ? AND type = ? AND external_id = ?", userID, "game_reward", referenceID).
				Count(&count).Error; err != nil {
				return err
			}
			if count > 0 {
				return nil // уже обработано
			}
		}

		var user domain.User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&user, userID).Error; err != nil {
			return err
		}
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
			return err
		}
		err := tx.Create(&domain.Transaction{
			ID:         uuid.New().String(),
			UserID:     userID,
			Amount:     amount,
			Type:       "game_reward",
			Status:     "completed",
			ExternalID: referenceID,
			CreatedAt:  time.Now(),
		}).Error
		if err != nil && isDuplicateKeyError(err) {
			return nil // повторный вызов — считаем успешным
		}
		return err
	})
}

// ----------------------------------------------------------------
// 2. ВНЕШНЯЯ ЛОГИКА (Crypto Bot Webhook)
// ----------------------------------------------------------------

// ProcessDeposit вызывается Webhook-обработчиком, когда Crypto Bot подтвердил оплату.
// Идемпотентность: проверка unique external_id до зачисления + UNIQUE индекс как защита от race.
func (m *TxManager) ProcessDeposit(ctx context.Context, tgID int64, amount float64, externalID string) error {
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()
	err := m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if externalID != "" {
			var count int64
			if err := tx.Model(&domain.Transaction{}).Where("external_id = ?", externalID).Count(&count).Error; err != nil {
				return err
			}
			if count > 0 {
				return ErrTxAlreadyExists
			}
		}

		var user domain.User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("tg_id = ?", tgID).First(&user).Error; err != nil {
			return err
		}
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
			return err
		}

		return tx.Create(&domain.Transaction{
			ID:         uuid.New().String(),
			UserID:     user.ID,
			Amount:     amount,
			Type:       "deposit",
			Status:     "completed",
			ExternalID: externalID,
			CreatedAt:  time.Now(),
		}).Error
	})
	if err != nil && (err == ErrTxAlreadyExists || isDuplicateKeyError(err)) {
		return ErrTxAlreadyExists
	}
	return err
}

// isDuplicateKeyError — PostgreSQL unique violation (23505) или дубликат в GORM.
func isDuplicateKeyError(err error) bool {
	if err == nil {
		return false
	}
	s := err.Error()
	return strings.Contains(s, "23505") ||
		strings.Contains(s, "unique constraint") ||
		strings.Contains(s, "Duplicate entry")
}

// ----------------------------------------------------------------
// 3. РЕФЕРАЛЬНАЯ ЛОГИКА (30% от 20% rake при смерти приглашённого)
// ----------------------------------------------------------------

const (
	rakePercent           = 0.2 // 20% — комиссия платформы с каждой смерти
	referralPercentOfRake = 0.3 // 30% от rake — рефереру
)

// OnPlayerDeath вызывается при смерти змейки. 20% victimScore = rake, 30% от rake — рефереру.
func (m *TxManager) OnPlayerDeath(ctx context.Context, victimUserID uint, victimScore float64, referenceID string) error {
	if victimScore <= 0 || referenceID == "" {
		return nil
	}
	rake := victimScore * rakePercent
	referralAmount := rake * referralPercentOfRake
	if referralAmount < 0.00000001 {
		return nil
	}

	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()

	return m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var ref domain.Referral
		if err := tx.Where("referred_id = ?", victimUserID).First(&ref).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil // нет реферера — ничего не делаем
			}
			return err
		}

		// Идемпотентность: уже начисляли за эту смерть
		var count int64
		if err := tx.Model(&domain.ReferralEarning{}).
			Where("referrer_id = ? AND source_tx_id = ?", ref.ReferrerID, referenceID).
			Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return nil
		}

		var user domain.User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&user, ref.ReferrerID).Error; err != nil {
			return err
		}
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance + ?", referralAmount)).Error; err != nil {
			return err
		}

		if err := tx.Create(&domain.ReferralEarning{
			ReferrerID: ref.ReferrerID,
			Amount:     referralAmount,
			SourceTxID: referenceID,
		}).Error; err != nil {
			return err
		}

		return tx.Create(&domain.Transaction{
			ID:         uuid.New().String(),
			UserID:     ref.ReferrerID,
			Amount:     referralAmount,
			Type:       "referral_bonus",
			Status:     "completed",
			ExternalID: referenceID,
			CreatedAt:  time.Now(),
		}).Error
	})
}
