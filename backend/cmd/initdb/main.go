// initdb — создаёт БД с нуля: GORM AutoMigrate + SQL миграции.
// Запуск: go run ./cmd/initdb
package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/crypto-snake-arena/server/internal/domain"
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
		log.Fatalf("connect: %v", err)
	}

	log.Println("Running GORM AutoMigrate...")
	if err := db.AutoMigrate(&domain.User{}, &domain.Transaction{}, &domain.Referral{}, &domain.ReferralEarning{}, &domain.GameResult{}, &domain.RevenueLog{}); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	log.Println("GORM AutoMigrate OK")

	// Применяем SQL миграции по порядку (backend/migrations)
	migrationsDir := filepath.Join("migrations")
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// из cmd/initdb
		migrationsDir = filepath.Join("..", "..", "migrations")
	}
	files := []string{
		"001_unique_external_id.sql",
		"002_game_results.sql",
		"003_transactions_user_type.sql",
		"004_game_results_created_at.sql",
		"005_users_photo_url.sql",
		"006_users_rank_referred_by.sql",
		"007_game_results_status_duration.sql",
		"008_transactions_balance_after.sql",
		"009_referrals_tables.sql",
		"010_revenue_logs.sql",
		"011_revenue_logs_reference_id.sql",
		"012_admin_revenue_ledger.sql",
	}

	for _, f := range files {
		path := filepath.Join(migrationsDir, f)
		raw, err := os.ReadFile(path)
		if err != nil {
			log.Printf("skip %s: %v", f, err)
			continue
		}
		if err := db.Exec(string(raw)).Error; err != nil {
			log.Printf("migration %s: %v", f, err)
		} else {
			log.Printf("OK: %s", f)
		}
	}

	log.Println("Database initialized.")
}
