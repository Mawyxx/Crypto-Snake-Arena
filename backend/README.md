# Crypto Snake Arena — Backend

## Требования

- **PostgreSQL** — база данных
- **Redis** — presence (online-счётчик), общий для нескольких инстансов

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | `host=localhost user=postgres password=postgres dbname=crypto_snake port=5432 sslmode=disable` |
| `REDIS_URL` | Redis address или URL (`redis://host:port`) | `localhost:6379` |
| `TELEGRAM_BOT_TOKEN` | Токен бота от BotFather | — |
| `WEBHOOK_SECRET_TOKEN` | Секрет для проверки webhook (X-Telegram-Bot-Api-Secret-Token) | — (опционально) |
| `PORT` | Порт HTTP-сервера | `8080` |

## Запуск

```bash
cp .env.example .env
# Заполни TELEGRAM_BOT_TOKEN и при необходимости REDIS_URL
go run ./cmd/server
```

## Сброс БД (для разработки)

Полная пересоздание базы (drop + create + миграции), без psql:

```bash
make reset-db
# или: powershell -ExecutionPolicy Bypass -File scripts/reset_db.ps1
```

## Миграции

После первого запуска примени миграции (по порядку):

```bash
# 001 — UNIQUE индекс external_id для идемпотентности депозитов
psql "$DATABASE_URL" -f migrations/001_unique_external_id.sql

# 003 — индекс для GetUserStats
psql "$DATABASE_URL" -f migrations/003_transactions_user_type.sql

# 004 — индекс для GetActivePlayersCount7d
psql "$DATABASE_URL" -f migrations/004_game_results_created_at.sql

# 005 — колонка photo_url для аватарок
psql "$DATABASE_URL" -f migrations/005_users_photo_url.sql

# 006 — users: rank (кэш рейтинга), referred_by (FK)
psql "$DATABASE_URL" -f migrations/006_users_rank_referred_by.sql

# 007 — game_results: status, duration
psql "$DATABASE_URL" -f migrations/007_game_results_status_duration.sql

# 008 — transactions: balance_after (аудит)
psql "$DATABASE_URL" -f migrations/008_transactions_balance_after.sql

# 009 — referrals, referral_earnings (если не созданы через GORM)
psql "$DATABASE_URL" -f migrations/009_referrals_tables.sql
```

См. также [../context.md](../context.md) для полного Quick Start.
