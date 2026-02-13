.PHONY: run
run:
	go run ./cmd/server

.PHONY: addbalance
addbalance:
	go run ./cmd/addbalance

# Сброс БД для разработки: drop + create + миграции (без psql)
.PHONY: reset-db
reset-db:
	powershell -ExecutionPolicy Bypass -File scripts/reset_db.ps1

# Миграция 003 (индекс idx_transactions_user_type): выполни вручную:
#   psql "$(DATABASE_URL)" -f migrations/003_transactions_user_type.sql

# Генерация Protobuf (требует: protoc, protoc-gen-go в PATH)
# Установка protoc: https://github.com/protocolbuffers/protobuf/releases
# Установка protoc-gen-go: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
.PHONY: proto
proto:
	protoc --go_out=. --go_opt=paths=source_relative proto/game.proto
