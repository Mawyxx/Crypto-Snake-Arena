package payment

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// CryptoBotService реализует domain.PaymentService (Crypto Pay / @CryptoBot).
// Документация: https://help.crypt.bot/crypto-pay-api
// При реализации: createInvoice, webhook для подтверждения, идемпотентность через external_id (см. tx_manager.ProcessDeposit).
type CryptoBotService struct {
	// apiKey string
}

// NewCryptoBotService создаёт сервис.
func NewCryptoBotService() *CryptoBotService {
	return &CryptoBotService{}
}

func (s *CryptoBotService) CreateInvoice(_ context.Context, userID int64, amount float64) (string, error) {
	// TODO: Crypto Bot API createInvoice
	_ = userID
	_ = amount
	return "", nil
}

func (s *CryptoBotService) ProcessWithdrawal(_ context.Context, userID int64, amount float64) error {
	// TODO: Crypto Bot API withdraw
	_ = userID
	_ = amount
	return nil
}

// Проверка, что реализует интерфейс.
var _ domain.PaymentService = (*CryptoBotService)(nil)
