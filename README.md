# 🐍 Crypto Snake Arena

> Мультиплеерная PvP-игра в стиле Slither.io внутри Telegram Mini App. Игроки делают ставку в USDT, заходят на арену, собирают монеты и сражаются с другими змейками.

[![Go](https://img.shields.io/badge/Go-1.23+-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![PixiJS](https://img.shields.io/badge/PixiJS-7-EA5A6F)](https://pixijs.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Mini%20App-26A5E4?logo=telegram)](https://core.telegram.org/bots/webapps)

---

## 📖 Описание

**Crypto Snake Arena** — high-performance игра с реальными ставками в криптовалюте. Игроки:

- Выбирают ставку (от 0.3 USDT)
- Заходят на арену и собирают монеты
- При смерти **80%** текущей суммы (ставка + монеты) выпадает в виде съедобных монет
- **20%** — комиссия платформы

Вывод средств через Crypto Bot API.

---

## 🛠 Технологический стек

| Слой | Технологии |
|------|------------|
| **Backend** | Go 1.23, GORM, PostgreSQL, Redis |
| **Frontend** | React 18, Vite, PixiJS 7, Zustand, Tailwind CSS |
| **Связь** | WebSocket + Protobuf (20 tick/s) |
| **Платежи** | Crypto Bot API |
| **Платформа** | Telegram Mini Apps (TMA SDK) |

---

## ⚡ Архитектура (Server-Authoritative)

| Принцип | Реализация |
|---------|------------|
| **Источник истины** | Сервер. Клиент — только визуализация. |
| **Физика** | Сервер пересчитывает X,Y каждые 50 ms (20 tick/s) |
| **Коллизии** | Сервер: голова + тело = смерть; голова + монета = начисление |
| **Интерполяция** | Клиент LERP между тиками сервера для плавности |

---

## 📁 Структура проекта

```
Crypto Snake Arena/
├── backend/                 # Go-сервер
│   ├── cmd/server/          # Точка входа
│   ├── internal/
│   │   ├── domain/          # Entities, логика (snake, coin, room)
│   │   ├── usecase/         # GameManager, WalletManager
│   │   ├── game/            # Room, RoomManager
│   │   ├── infrastructure/  # Repository, Payment, Auth, Redis
│   │   └── delivery/        # HTTP REST + WebSocket
│   ├── migrations/          # SQL-миграции
│   └── proto/               # game.proto
├── frontend/                # React + PixiJS
│   └── src/
│       ├── shared/api/      # WebSocket, Protobuf
│       ├── components/game/ # Arena, SnakeView, CoinView
│       ├── pages/           # Home, Game, Profile, Leaderboard, Frens
│       ├── store/           # Zustand
│       └── hooks/           # useBalance, useGameEngine...
├── deploy/                  # Nginx, setup-скрипты
├── scripts/                 # start-single.ps1, run.ps1
└── docker-compose.yml       # Локальный запуск (PostgreSQL, Redis, backend)
```

---

## 🚀 Быстрый старт (локальная разработка)

### Требования

- Go 1.23+
- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- [ngrok](https://ngrok.com/) (для Telegram Mini App)

### 1. База данных

```bash
# PostgreSQL: создай БД
createdb crypto_snake

# Redis — запусти локально
redis-server
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Заполни TELEGRAM_BOT_TOKEN
go run ./cmd/server
```

### 3. Frontend и ngrok (Windows PowerShell)

```powershell
# Один скрипт: бэк + статика + ngrok
.\scripts\start-single.ps1
```

Скрипт соберёт фронтенд, запустит бэкенд на порту 8081 и ngrok. Дальше:

1. Скопируй HTTPS URL из окна ngrok
2. `frontend/.env.local`: `VITE_WS_URL=wss://YOUR_NGROK_URL/ws`
3. BotFather → Edit App → Web App URL = `https://YOUR_NGROK_URL`
4. Пересобери: `cd frontend && npm run build`

### 4. Миграции

```bash
cd backend
make reset-db   # или: powershell -ExecutionPolicy Bypass -File scripts/reset_db.ps1
```

Подробнее по миграциям — [backend/README.md](backend/README.md).

---

## 🐳 Docker (локальный запуск)

```bash
# Создай .env с TELEGRAM_BOT_TOKEN
export TELEGRAM_BOT_TOKEN=your_token
docker compose up -d
```

Сервисы:
- **Backend** → `http://localhost:8080`
- **PostgreSQL** → `5432`
- **Redis** → `6379`

---

## 🌐 Деплой на продакшен

1. Настрой сервер: `sudo bash deploy/setup-server.sh`
2. Добавь GitHub Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`
3. Push в `main` — GitHub Actions задеплоит автоматически

Детали: [deploy/DEPLOY.md](deploy/DEPLOY.md)

---

## ⚙️ Переменные окружения

### Backend (`backend/.env`)

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL (по умолчанию `localhost:6379`) |
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather |
| `WEBHOOK_SECRET_TOKEN` | Опционально — для webhook рефералов |
| `PORT` | Порт HTTP (по умолчанию 8080) |
| `ALLOWED_ORIGINS` | CORS (`*` для dev) |

### Frontend (`frontend/.env.local`)

| Переменная | Описание |
|------------|----------|
| `VITE_WS_URL` | WebSocket URL (например `wss://arrenasnake.net/ws`) |
| `VITE_TELEGRAM_BOT_USERNAME` | Username бота для реферальных ссылок |

---

## 🔒 Безопасность

- **initData**: Telegram подписывает `initData`. Backend валидирует HMAC-SHA256 и извлекает `user_id`.
- **Никогда** не использовать `user_id` из тела запроса — только из заголовка `Authorization: tma <initData>`.
- Replay: `expires_in: 1 hour` для денежных операций.

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Итоги по проекту, аудит |
| [context.md](context.md) | Детальная архитектура, Proto, Redis, экономика |
| [backend/README.md](backend/README.md) | Запуск бэка, миграции |
| [deploy/DEPLOY.md](deploy/DEPLOY.md) | Инструкции по деплою |

---

## 📜 Лицензия

Проприетарный проект.
