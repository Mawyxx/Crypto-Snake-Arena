// Однократное начисление баланса. Запуск: go run ./cmd/addbalance
package main

import (
	"context"
	"log"
	"os"

	"github.com/crypto-snake-arena/server/internal/infrastructure/payment"
	"github.com/crypto-snake-arena/server/internal/infrastructure/repository"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=crypto_snake port=5432 sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("db: %v", err)
	}

	txManager := payment.NewTxManager(db, nil)
	userResolver := repository.NewUserResolverDB(db)

	tgID := int64(7175104609)
	amount := 500.0

	ctx := context.Background()

	// Создаём пользователя, если не существует
	_, err = userResolver.GetOrCreateUser(ctx, tgID, "", "", "")
	if err != nil {
		log.Fatalf("get/create user: %v", err)
	}

	externalID := "admin_credit_7175104609_500"
	if err := txManager.ProcessDeposit(ctx, tgID, amount, externalID); err != nil {
		log.Fatalf("deposit: %v", err)
	}

	log.Printf("OK: +%.2f USDT начислено пользователю %d", amount, tgID)
}
