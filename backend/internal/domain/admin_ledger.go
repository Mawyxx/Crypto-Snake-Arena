package domain

import "time"

// AdminLedgerEntry — запись в admin_revenue_ledger.
type AdminLedgerEntry struct {
	ID          string    `gorm:"primaryKey;type:uuid"`
	GameID      *string   `gorm:"size:64"`
	PlayerID    *int64    `gorm:"type:bigint"`
	EntryFee    float64   `gorm:"type:decimal(18,8);default:0"`
	PlatformFee float64   `gorm:"type:decimal(18,8);not null"`
	Type        string    `gorm:"size:20;default:death"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}

// TableName для GORM.
func (AdminLedgerEntry) TableName() string {
	return "admin_revenue_ledger"
}
