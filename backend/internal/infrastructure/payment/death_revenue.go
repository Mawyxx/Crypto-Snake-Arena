package payment

import (
	"context"
	"errors"
	"time"

	"github.com/crypto-snake-arena/server/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// createRevenueLog записывает revenue_log (20% rake) и ledger entry.
func createRevenueLog(ctx context.Context, tx *gorm.DB, roomID, referenceID string, rakeF float64, entryFee float64, victimUserID uint, ledgerWriter LedgerWriter) error {
	if err := tx.Create(&domain.RevenueLog{
		RoomID:          roomID,
		TransactionType: "death_rake",
		ReferenceID:     referenceID,
		Amount:          rakeF,
		CreatedAt:       time.Now(),
	}).Error; err != nil {
		return err
	}
	if ledgerWriter != nil {
		pid := int64(victimUserID)
		if err := ledgerWriter.AppendLedgerEntry(ctx, tx, &roomID, &pid, entryFee, rakeF, "death"); err != nil {
			return err
		}
	}
	return nil
}

// createReferrerBonus начисляет 30% от rake рефереру (если есть).
func createReferrerBonus(tx *gorm.DB, victimUserID uint, referralF float64, referenceID string) error {
	if referralF < 0.00000001 {
		return nil
	}
	var ref domain.Referral
	if err := tx.Where("referred_id = ?", victimUserID).First(&ref).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
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
}
