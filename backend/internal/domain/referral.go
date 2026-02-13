package domain

import "time"

// Referral — связь реферера и приглашённого.
type Referral struct {
	ID         uint      `gorm:"primaryKey"`
	ReferrerID uint      `gorm:"index;not null"` // user_id того, кто пригласил
	ReferredID uint      `gorm:"uniqueIndex;not null"` // user_id приглашённого
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}

func (Referral) TableName() string {
	return "referrals"
}

// ReferralEarning — начисление рефереру (30% с прибыли).
type ReferralEarning struct {
	ID         uint      `gorm:"primaryKey"`
	ReferrerID uint      `gorm:"index;not null"`
	ReferredID uint      `gorm:"index"` // user_id приглашённого, для агрегации «заработано с друга»
	Amount     float64   `gorm:"type:decimal(18,8);not null"`
	SourceTxID string    `gorm:"size:255;index"` // ID транзакции (rake), от которой %
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}

func (ReferralEarning) TableName() string {
	return "referral_earnings"
}
