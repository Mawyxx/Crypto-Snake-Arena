package repository

import (
	"context"

	"gorm.io/gorm"
)

// FailingLedgerWriter возвращает ошибку при AppendLedgerEntry (для тестов rollback).
type FailingLedgerWriter struct {
	Err error
}

func (f *FailingLedgerWriter) AppendLedgerEntry(_ context.Context, _ *gorm.DB, _ *string, _ *int64, _ float64, _ float64, _ string) error {
	return f.Err
}
