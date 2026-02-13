# Crypto Snake Arena — Итог по проекту

## Общее описание

**Crypto Snake Arena** — мультиплеерная PvP-игра в стиле Slither.io, встроенная в Telegram Mini App. Игроки делают ставку в USDT, заходят на арену и собирают монеты. При смерти 80% их текущей суммы (ставка + собранные монеты) выпадает в монеты, 20% — комиссия платформы.

---

## Стек технологий

| Слой | Технологии |
|------|------------|
| **Backend** | Go 1.23, GORM, PostgreSQL, Redis |
| **Frontend** | React 18, Vite, PixiJS 7, Zustand |
| **Связь** | WebSocket + Protobuf (20 tick/s) |
| **Платежи** | Crypto Bot API |
| **Платформа** | Telegram Mini Apps (TMA SDK) |

---

## Структура проекта

```
Crypto Snake Arena/
├── backend/                 # Go-сервер
│   ├── cmd/server/          # Точка входа
│   ├── internal/
│   │   ├── domain/          # Entities, интерфейсы
│   │   ├── usecase/         # GameManager, WalletManager
│   │   ├── infrastructure/  # Repository, Payment, Auth, Redis
│   │   ├── delivery/        # HTTP REST + WebSocket
│   │   └── game/            # Room, RoomManager, Player
│   ├── migrations/         # SQL-миграции (001–003)
│   └── proto/              # game.proto, game.pb.go
├── frontend/               # React + PixiJS
│   └── src/
│       ├── api/            # WebSocket, Protobuf
│       ├── engine/         # PixiJS (Snake, Coin, Interpolator)
│       ├── views/          # Home, Profile, Game, Leaderboard, Frens
│       ├── store/          # Zustand
│       └── hooks/          # useBalance, useStats, useLeaderboard...
├── scripts/                # start-single.ps1, run.ps1
└── context.md              # Детальная документация
```

---

## Архитектура (Server-Authoritative)

| Принцип | Реализация |
|---------|-------------|
| **Источник истины** | Сервер. Клиент — только визуализация (PlayerInput → угол, boost). |
| **Физика** | Сервер пересчитывает X,Y каждые 50 ms (20 tick/s). |
| **Коллизии** | Сервер: голова + тело = смерть; голова + монета = начисление. |
| **LERP** | Клиент интерполирует между тиками сервера. |

---

## Безопасность

| Механизм | Детали |
|----------|--------|
| **initData** | Telegram подписывает `initData`. Backend валидирует HMAC-SHA256, извлекает `user_id`. Без валидного initData — нет доступа. |
| **Replay** | `expires_in: 1 hour` для денежных операций. |
| **Никогда user_id из тела** | Только из заголовка `Authorization: tma <initData>`. |

---

## Игровая экономика

- **Вход:** ставка от 0.3 USDT, списание перед ареной.
- **Death drop:** 80% текущей суммы → монеты на месте смерти.
- **TTL монет:** 3 секунды, затем удаление.
- **Rake:** 20% платформе.
- **Вывод:** Crypto Bot, комиссия 3%.

---

## База данных

**PostgreSQL:**
- `users` — tg_id, username, balance
- `transactions` — deposit, withdraw, game_reward (индекс `user_id, type`)
- `game_results` — игра, профит, rake (индекс `user_id, profit`)

**Redis:**
- `snake:{room}:{user}` — состояние змейки (Hash)
- `coin:{room}:{id}` — монета с TTL 3 с (GETDEL для атомарного съедания)
- `rooms:active` — ZSET для matchmaking

---

## Уже сделанные улучшения (Audit Phase 1)

- Миграция 003: индекс `transactions(user_id, type)` для GetUserStats
- GetUserStats: один SQL-запрос вместо четырёх
- Обработка ошибок `json.Encode` во всех handler
- RoomManager: `onStopped` — очистка комнат при завершении
- Zustand: гранулярные селекторы в HomeView, ProfileView, LeaderboardView
- `React.memo` для SnakeView, CoinView
- Общий `getApiBaseUrl`, исправление WebSocket/race/initData

---

## Быстрый старт

1. PostgreSQL, Redis — запущены.
2. `backend/.env` — `TELEGRAM_BOT_TOKEN`.
3. `scripts/start-single.ps1` — бэк + статика через ngrok.
4. `frontend/.env.local` → `VITE_WS_URL=wss://<ngrok>/ws`.
5. BotFather → Edit App → Web App URL = ngrok HTTPS URL.
6. `cd frontend && npm run build`.

---

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `context.md` | Полное описание архитектуры, Proto, Redis, безопасности |
| `backend/README.md` | Запуск, миграции, переменные |
| `backend/internal/game/room.go` | Игровая комната, тик, коллизии |
| `frontend/src/hooks/useGameEngine.ts` | WebSocket, Protobuf, PixiJS |
| `frontend/src/store/useGameStore.ts` | Глобальное состояние игры |
