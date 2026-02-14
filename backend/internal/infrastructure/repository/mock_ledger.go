package repository

import (
	"context"

	"gorm.io/gorm"
)

// FailingLedgerWriter возвращает ошибку при AppendLedgerEntry (для тестов rollback).
type FailingLedgerWriter struct {
	Err error
}

func (f *FailingLedgerWriter) AppendLedgerEntry(ctx context.Context, db *gorm.DB, gameID *string, playerID *int64, entryFee, platformFee float64, entryType string) error {
	return f.Err
}
