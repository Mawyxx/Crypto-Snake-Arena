// resetdb — удаляет и создаёт БД crypto_snake заново (для разработки).
// Не требует psql. Запуск: go run ./cmd/resetdb
package main

import (
	"log"
	"os"
	"strings"

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

	// Подключаемся к postgres (не crypto_snake) для DROP/CREATE DATABASE
	baseDSN := strings.Replace(dsn, "dbname=crypto_snake", "dbname=postgres", 1)
	if baseDSN == dsn {
		baseDSN = strings.TrimSpace(dsn) + " dbname=postgres"
	}

	db, err := gorm.Open(postgres.Open(baseDSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("connect to postgres: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("db.DB: %v", err)
	}
	defer sqlDB.Close()

	log.Println("Terminating connections to crypto_snake...")
	db.Exec("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'crypto_snake' AND pid <> pg_backend_pid()")

	log.Println("Dropping database crypto_snake...")
	if err := db.Exec("DROP DATABASE IF EXISTS crypto_snake").Error; err != nil {
		log.Fatalf("drop: %v", err)
	}

	log.Println("Creating database crypto_snake...")
	if err := db.Exec("CREATE DATABASE crypto_snake").Error; err != nil {
		log.Fatalf("create: %v", err)
	}

	log.Println("Database reset complete. Run: go run ./cmd/initdb")
}
