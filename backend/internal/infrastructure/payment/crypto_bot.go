package payment

import (
	"context"

	"github.com/crypto-snake-arena/server/internal/domain"
)

// CryptoBotService реализует domain.PaymentService (Crypto Bot API).
type CryptoBotService struct {
	// apiKey string
}

// NewCryptoBotService создаёт сервис.
func NewCryptoBotService() *CryptoBotService {
	return &CryptoBotService{}
}

func (s *CryptoBotService) CreateInvoice(ctx context.Context, userID int64, amount float64) (string, error) {
	// TODO: Crypto Bot API createInvoice
	_ = userID
	_ = amount
	return "", nil
}

func (s *CryptoBotService) ProcessWithdrawal(ctx context.Context, userID int64, amount float64) error {
	// TODO: Crypto Bot API withdraw
	_ = userID
	_ = amount
	return nil
}

// Проверка, что реализует интерфейс.
var _ domain.PaymentService = (*CryptoBotService)(nil)
