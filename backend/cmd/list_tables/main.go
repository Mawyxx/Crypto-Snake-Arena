// Список таблиц и колонок в БД. Запуск: go run ./cmd/list_tables
package main

import (
	"fmt"
	"log"
	"os"

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
		log.Fatal(err)
	}

	var tables []struct {
		TableName string `gorm:"column:tablename"`
	}
	db.Raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename").Scan(&tables)

	for _, t := range tables {
		fmt.Println("\n" + t.TableName + ":")
		var cols []struct {
			ColumnName string `gorm:"column:column_name"`
			DataType   string `gorm:"column:data_type"`
		}
		db.Raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? ORDER BY ordinal_position", t.TableName).Scan(&cols)
		for _, c := range cols {
			fmt.Printf("  - %s (%s)\n", c.ColumnName, c.DataType)
		}
	}
}
