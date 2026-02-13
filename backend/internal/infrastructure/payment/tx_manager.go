package payment

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const txTimeout = 10 * time.Second

var (
	ErrInsufficientFunds = errors.New("на балансе недостаточно средств")
	ErrTxAlreadyExists   = errors.New("транзакция уже была обработана")
)

// LedgerWriter — запись в admin_revenue_ledger. db передаётся для участия в транзакции (nil = отдельное соединение).
type LedgerWriter interface {
	AppendLedgerEntry(ctx context.Context, db *gorm.DB, gameID *string, playerID *int64, entryFee, platformFee float64, entryType string) error
}

// TxManager — логика «Банкира»: депозит (Crypto Bot) и игровые списания (БД).
type TxManager struct {
	db           *gorm.DB
	ledgerWriter LedgerWriter
}

// NewTxManager создаёт менеджер транзакций. ledgerWriter опционален (для admin_revenue_ledger).
func NewTxManager(db *gorm.DB, ledgerWriter LedgerWriter) *TxManager {
	return &TxManager{db: db, ledgerWriter: ledgerWriter}
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
		newBalance := user.Balance - amount
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
			return err
		}

		return tx.Create(&domain.Transaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Amount:       -amount,
			Type:         "game_entry",
			Status:       "completed",
			BalanceAfter: &newBalance,
			CreatedAt:    time.Now(),
		}).Error
	})
}

// RecordGameResult записывает результат игры для рейтинга. P = L − S.
func (m *TxManager) RecordGameResult(ctx context.Context, userID uint, stake, loot float64, roomID string, status string, durationSec int) error {
	profit := loot - stake
	if status == "" {
		if profit > 0 {
			status = "win"
		} else {
			status = "loss"
		}
	}
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()
	return m.db.WithContext(ctx).Create(&domain.GameResult{
		UserID:   userID,
		Stake:    stake,
		Loot:     loot,
		Profit:   profit,
		Status:   status,
		Duration: durationSec,
		RoomID:   roomID,
	}).Error
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
		newBalance := user.Balance + amount
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
			return err
		}
		err := tx.Create(&domain.Transaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Amount:       amount,
			Type:         "game_reward",
			Status:       "completed",
			ExternalID:   referenceID,
			BalanceAfter: &newBalance,
			CreatedAt:    time.Now(),
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
// ВАЖНО: пользователь должен существовать в users. Перед вызовом — GetOrCreateUser(tgID, ...) при Crypto Pay webhook.
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
		newBalance := user.Balance + amount
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
			return err
		}

		return tx.Create(&domain.Transaction{
			ID:           uuid.New().String(),
			UserID:       user.ID,
			Amount:       amount,
			Type:         "deposit",
			Status:       "completed",
			ExternalID:   externalID,
			BalanceAfter: &newBalance,
			CreatedAt:    time.Now(),
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
	rakePercent           = "0.2" // 20% — комиссия платформы
	referralPercentOfRake = "0.3" // 30% от rake — рефереру
	minAmount             = "0.00000001"
)

// computeDeathSplit вычисляет rake (20%) и referral (30% от rake) через decimal.
// Возвращает (rake, referralAmount). Если rake < min — (0, 0).
func computeDeathSplit(victimScore float64) (rake, referralAmount float64) {
	if victimScore <= 0 {
		return 0, 0
	}
	score := decimal.NewFromFloat(victimScore)
	rakeDec := score.Mul(decimal.RequireFromString(rakePercent))
	if rakeDec.LessThan(decimal.RequireFromString(minAmount)) {
		return 0, 0
	}
	referralDec := rakeDec.Mul(decimal.RequireFromString(referralPercentOfRake))
	rakeF, _ := rakeDec.Round(8).Float64()
	referralF, _ := referralDec.Round(8).Float64()
	return rakeF, referralF
}

// OnPlayerDeath вызывается при смерти змейки. Атомарно: revenue_log (20% rake) + referrer (30% от rake) + ledger.
func (m *TxManager) OnPlayerDeath(ctx context.Context, victimUserID uint, victimScore, entryFee float64, referenceID, roomID string) error {
	if referenceID == "" {
		return nil
	}
	rakeF, referralF := computeDeathSplit(victimScore)

	if rakeF <= 0 {
		return nil
	}

	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()

	return m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 0. Идемпотентность: уже обработано?
		var exist int64
		if err := tx.Model(&domain.RevenueLog{}).Where("reference_id = ?", referenceID).Count(&exist).Error; err != nil {
			return err
		}
		if exist > 0 {
			return nil
		}

		// 1. Revenue log — комиссия платформы (админ)
		if err := tx.Create(&domain.RevenueLog{
			RoomID:          roomID,
			TransactionType: "death_rake",
			ReferenceID:     referenceID,
			Amount:          rakeF,
			CreatedAt:       time.Now(),
		}).Error; err != nil {
			return err
		}

		// 1b. Admin ledger
		if m.ledgerWriter != nil {
			pid := int64(victimUserID)
			if err := m.ledgerWriter.AppendLedgerEntry(ctx, tx, &roomID, &pid, entryFee, rakeF, "death"); err != nil {
				return err
			}
		}

		// 2. Referrer bonus (если есть)
		var ref domain.Referral
		if err := tx.Where("referred_id = ?", victimUserID).First(&ref).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil
			}
			return err
		}

		if referralF < 0.00000001 {
			return nil
		}

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
		newBalance := user.Balance + referralF
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance + ?", referralF)).Error; err != nil {
			return err
		}

		if err := tx.Create(&domain.ReferralEarning{
			ReferrerID: ref.ReferrerID,
			ReferredID: ref.ReferredID,
			Amount:     referralF,
			SourceTxID: referenceID,
		}).Error; err != nil {
			return err
		}

		return tx.Create(&domain.Transaction{
			ID:           uuid.New().String(),
			UserID:       ref.ReferrerID,
			Amount:       referralF,
			Type:         "referral_bonus",
			Status:       "completed",
			ExternalID:   referenceID,
			BalanceAfter: &newBalance,
			CreatedAt:    time.Now(),
		}).Error
	})
}

// OnExpiredCoins вызывается при удалении просроченных монет по TTL. Записывает totalValue в revenue_logs (expired_coin) + ledger.
func (m *TxManager) OnExpiredCoins(ctx context.Context, roomID string, totalValue float64) error {
	if totalValue <= 0 {
		return nil
	}
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()
	if err := m.db.WithContext(ctx).Create(&domain.RevenueLog{
		RoomID:          roomID,
		TransactionType: "expired_coin",
		Amount:          totalValue,
		CreatedAt:       time.Now(),
	}).Error; err != nil {
		return err
	}
	if m.ledgerWriter != nil {
		_ = m.ledgerWriter.AppendLedgerEntry(ctx, nil, &roomID, nil, 0, totalValue, "expired")
	}
	return nil
}

// ----------------------------------------------------------------
// 4. ВЫВОД (3% комиссия платформы)
// ----------------------------------------------------------------

const withdrawFeePercent = "0.03" // 3% — комиссия на вывод

// ProcessWithdrawal списывает amount с баланса, записывает 3% в revenue_logs (withdraw_fee), 97% — на вывод (заглушка Crypto Bot).
func (m *TxManager) ProcessWithdrawal(ctx context.Context, userID uint, amount float64) error {
	if amount <= 0 {
		return nil
	}
	ctx, cancel := context.WithTimeout(ctx, txTimeout)
	defer cancel()

	amt := decimal.NewFromFloat(amount)
	feeDec := amt.Mul(decimal.RequireFromString(withdrawFeePercent)).Round(8)
	netDec := amt.Sub(feeDec).Round(8)
	feeF, _ := feeDec.Float64()
	netF, _ := netDec.Float64()

	return m.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var user domain.User
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&user, userID).Error; err != nil {
			return err
		}
		if user.Balance < amount {
			return ErrInsufficientFunds
		}
		newBalance := user.Balance - amount
		if err := tx.Model(&user).Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
			return err
		}
		if err := tx.Create(&domain.Transaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Amount:       -amount,
			Type:         "withdraw",
			Status:       "completed",
			BalanceAfter: &newBalance,
			CreatedAt:    time.Now(),
		}).Error; err != nil {
			return err
		}
		if feeF > 0 {
			if err := tx.Create(&domain.RevenueLog{
				RoomID:          "withdraw",
				TransactionType: "withdraw_fee",
				Amount:          feeF,
				CreatedAt:       time.Now(),
			}).Error; err != nil {
				return err
			}
			if m.ledgerWriter != nil {
				pid := int64(userID)
				if err := m.ledgerWriter.AppendLedgerEntry(ctx, tx, nil, &pid, 0, feeF, "withdrawal"); err != nil {
					return err
				}
			}
		}
		// TODO: Crypto Bot API — отправить netF на TgID user.TgID
		_ = netF
		return nil
	})
}
