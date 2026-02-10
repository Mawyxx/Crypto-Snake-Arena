
---

# CONTEXT.MD: Crypto Snake Arena (Telegram Mini App)

## Запуск (Quick Start)

1. **PostgreSQL** — установлен, база `crypto_snake` создана
2. **backend/.env** — `TELEGRAM_BOT_TOKEN` указан
3. **ngrok** — зарегистрируйся на https://dashboard.ngrok.com/signup, затем:
   ```
   ngrok config add-authtoken ТВОЙ_ТОКЕН
   ```
4. **Один туннель (рекомендуется):** `.\scripts\start-single.ps1` — бэк + статика, 1 ngrok
   - Порт 8081 (8080 занят PostgreSQL). Вручную: `$env:PORT=8081; go run ./cmd/server`, затем `ngrok http http://127.0.0.1:8081`
5. **frontend/.env.local** → `VITE_WS_URL=wss://ТВОЙ_NGROK_URL/ws`
6. **BotFather** → Edit App → Web App URL = URL из ngrok (HTTPS)
7. Пересобери фронт: `cd frontend; npm run build`

**Важно:** Proto генерируется в ES6 (`-w es6`), иначе `require is not defined` в браузере/WebView.

**Telegram Mini App (официальная документация):**
- `telegram-web-app.js` — обязательно первым скриптом в `<head>` (core.telegram.org/bots/webapps)
- `<meta name="color-scheme" content="light dark">` — для iOS WkWebView
- `Telegram.WebApp.ready()` — вызывать как можно раньше

## 1. Project Overview

**Crypto Snake Arena** — высокопроизводительная мультиплеерная PvP игра внутри Telegram.
**Суть:** Игроки сами выбирают ставку (минимум 0.3 USDT), заходят на арену. При смерти игрока 80% его **актуальной суммы** (ставка + собранные монеты) выпадает в виде монет, которые исчезают через 3 секунды. 20% — комиссия платформы. *Пример: зашёл на $10, убил кого-то, получил ещё $20 → итого $30. При смерти выпадает 80% от $30.*

## 2. Technical Stack (Mandatory)

* **Backend:** Golang (высокая производительность, горутины для сокетов).
* **Communication:** WebSockets + **Protobuf** (бинарный протокол). JSON при 20 тиках/сек — слишком тяжёлый; Protobuf даёт экономию трафика в 3–4 раза.
* **Frontend:** React + PixiJS (WebGL рендеринг для 60 FPS).
* **Database:** PostgreSQL (балансы, транзакции), Redis (in-memory игровой мир — не кеш, а источник истины для состояния арены).
* **Payments:** Crypto Bot API (Mainnet/Testnet).
* **Platform:** Telegram Mini Apps (TMA SDK).

## 3. Server-Authoritative Architecture (Anti-Cheat)

**Strict Rule:** Клиент — это только визуализация. Сервер — единственный источник истины.

* Клиент отправляет только `PlayerInput` (angle, boost) — желаемый угол и ускорение.
* Сервер рассчитывает `X, Y` координаты каждой змейки каждые 50мс (20 ticks/sec).
* Сервер проверяет коллизии:
* Голова змейки + Тело другой змейки = Смерть.
* Голова змейки + Координаты монеты = Проверка на сервере -> Начисление баланса.


* Сервер транслирует состояние мира (World Snapshot) всем подключенным игрокам.

## 4. Game Economics Logic

* **Entry Fee:** Игрок выбирает ставку сам. Минимальная ставка 0.3 USDT. Списывается из БД перед входом.
* **Death Drop:** Игрок умирает → 20% rake, 80% (`CurrentScore * 0.8`) превращается в монеты. Монеты распределяются **равномерно по площади места смерти** (зона тела убитого). Сумма делится на N монет — в каждой одинаковая ценность. Визуально монеты могут слегка отличаться цветом и размером, но `value` у всех одинаковый. Цель: равномерно заполнить зону смерти.
* **Coin TTL:** Каждая монета имеет `LifeTime = 3000ms`. Если не съедена — удаляется.
* **Rake:** 20% с каждой смерти уходит на системный кошелек.
* **Withdrawal:** Комиссия 3% на вывод через Crypto Bot.

## 5. Telegram InitData Authentication (Trust No One)

**Критично:** На кону реальные деньги. Без проверки `initData` любой может подменить `user_id` в DevTools и вывести чужие средства.

**Правило:** Backend **никогда** не верит `user_id` из тела запроса. Backend верит только строке `initData` из заголовка `Authorization`, подписанной Bot Token.

### Алгоритм проверки

1. Получить `initData` (query_id=...&user=...&hash=...)
2. Извлечь `hash`, остальные параметры отсортировать по алфавиту
3. Сформировать `data_check_string` (параметры через `\n`)
4. HMAC-SHA256: ключ = HMAC("WebAppData", BotToken), сообщение = data_check_string
5. Сравнить результат с `hash` → подлинность

**Replay Attack:** Ограничить срок жизни. Для денег — `expires_in: 1 hour`. Старая ссылка → перезагрузка Mini App.

### Реализация (`internal/infrastructure/auth`)

```go
// github.com/telegram-mini-apps/init-data-golang
func (v *Validator) Validate(rawInitData string) (*initdata.InitData, error) {
    expIn := 1 * time.Hour // Для денег — строго
    err := initdata.Validate(rawInitData, v.token, expIn)
    if err != nil {
        return nil, errors.New("invalid or expired init data")
    }
    return initdata.Parse(rawInitData)
}
```

### Frontend → Backend

**Никогда** в JSON-теле. Только в заголовке:

```javascript
headers: { 'Authorization': `tma ${window.Telegram.WebApp.initData}` }
```

**Backend:** Middleware извлекает `Authorization`, прогоняет через Validator, кладёт `user_id` в контекст. WebSocket: валидация при подключении — без валидного initData нельзя зайти на арену.

### Риски при пропуске

Читеры смогут: подделывать баланс, отправлять запросы от лица других игроков, выводить чужую крипту.

## 6. Project Structure (Clean Architecture + SOLID)

**Принцип:** Игровая логика ничего не знает о БД или WebSockets. Зависимости идут только внутрь.

### Backend (Go)

```text
/cmd/server/main.go        # Точка входа: инициализация и запуск
/internal/
  /domain/                 # СЛОЙ 1: Ядро (Entities). Чистая логика без зависимостей.
    snake.go               # Модель змейки и её поведение
    room.go                # Логика игровой комнаты
    coin.go                # Логика монеты (выпадение, TTL)
    interfaces.go          # Контракты (Repo, PaymentService)

  /usecase/                # СЛОЙ 2: Бизнес-логика (Application rules).
    game_manager.go        # Управление сессиями (создание комнат, старт/стоп)
    wallet_manager.go      # Логика ставок (списание, зачисление выигрыша)

  /infrastructure/         # СЛОЙ 3: Внешние детали (Implementation).
    /repository/           # Postgres (GORM), Redis
    /payment/              # Crypto Bot API
    /auth/                 # Валидация Telegram InitData

  /delivery/               # СЛОЙ 4: Транспорт (Interfaces с внешним миром).
    /ws/                   # WebSocket: байты -> decode -> usecase
    /http/                 # REST API (баланс, история, пре-гейм)

/proto/                    # Protobuf (общие для сервера и фронта)
```

### Frontend (React + PixiJS)

```text
/web/src/
  /api/                    # WebSocket, Protobuf декодеры
  /engine/                 # Ядро PixiJS
    /objects/              # Snake, Coin, Arena (только отрисовка)
    /systems/              # Interpolator (LERP), InputHandler
    viewport.ts            # Камера, масштабирование
  /store/                  # Zustand/Redux (баланс, профиль)
  /ui/                     # React-компоненты (меню, кнопки, панели)
  /hooks/                  # Telegram WebApp SDK
```

### SOLID в проекте

| Принцип | Реализация |
|---------|------------|
| **Dependency Inversion** | `domain` определяет интерфейсы; `infrastructure` их реализует. Замена Postgres/MongoDB — один файл. |
| **Single Responsibility** | `Room` — только физика и коллизии. `WS` — только pack/unpack. `PaymentService` — только API. |
| **Open/Closed** | Middleware для игровых событий. Новый бонус (например, "магнит") — добавить обработчик, не трогать ядро. |

### Implementation Rules (для Cursor AI)

1. **Strict Decoupling:** `domain` и `usecase` НЕ импортируют `infrastructure` или `delivery`. Только интерфейсы из `domain`.
2. **Binary Flow:** Все WorldUpdate сериализуются через Protobuf перед отправкой в `delivery/ws`.
3. **Stateless Transport:** WebSocket handlers только decode → вызов UseCase. Без бизнес-логики в transport.
4. **Concurrency:** Go channels для входа от игроков в одну Room — избегать race conditions.
5. **Client LERP:** Клиент обязан интерполировать (Linear Interpolation) между тиками сервера.

## 7. Protobuf Protocol (Binary over WebSocket)

**Почему не JSON:** При 20 тиках/сек JSON раздувает трафик — ключи `"x"`, `"y"`, `"id"` повторяются в каждом пакете. Protobuf сжимает данные в 3–4 раза.

| Формат | Пример | Размер |
|--------|--------|--------|
| JSON | `{"id":15,"x":1024.5,"y":512.2,"a":1.57}` | ~45 байт |
| Protobuf | `08 0F 15 00 00 80 44 1D 00 10 00 44` | ~12 байт |

**Преимущества:** Меньше CPU, защита от простого перехвата трафика, обратная совместимость при изменении схемы.

**Оптимизация:** Для координат можно использовать `int32` вместо `float` (×10 на сервере, ÷10 на клиенте) — ещё сильнее сожмёт пакет.

### game.proto

```protobuf
syntax = "proto3";

package game;

message PlayerInput {
    float angle = 1;      // Угол направления змейки в радианах
    bool boost = 2;       // Нажато ли ускорение
}

message SnakeState {
    uint32 id = 1;
    float head_x = 2;
    float head_y = 3;
    repeated float tail_segments = 4;
    float score = 5;
}

message CoinState {
    string id = 1;
    float x = 2;
    float y = 3;
    float value = 4;
}

message WorldUpdate {
    uint64 tick = 1;
    repeated SnakeState snakes = 2;
    repeated CoinState coins = 3;
}
```

### Сервер (Go)

```go
update := &game.WorldUpdate{Tick: 1450, Snakes: activeSnakes}
data, _ := proto.Marshal(update)
conn.WriteMessage(websocket.BinaryMessage, data)
```

### Клиент (TypeScript/PixiJS)

```typescript
const message = WorldUpdate.decode(new Uint8Array(event.data));
// message.snakes, message.coins — для рендеринга
```

## 8. Database Schema (Postgres)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE,
    username VARCHAR(255),
    balance DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount DECIMAL(18, 8),
    type VARCHAR(20), -- 'deposit', 'withdraw', 'game_reward'
    status VARCHAR(20),
    external_id VARCHAR(255) UNIQUE -- Crypto Bot ID (idempotency)
);

```

## 9. Redis Schema (In-Memory Game State)

**Роль:** Redis — in-memory база для игрового мира. Чтение/запись < 1 мс. Схема спроектирована под **горизонтальное масштабирование** (сотни/тысячи параллельных арен).

**Hash Tags `{room_id}`:** В Redis Cluster все ключи с одинаковым `{room_id}` попадают на один сервер → атомарные операции внутри комнаты, без Cross-slot ошибок.

### Схема ключей

| Ключ | Тип | Поля/Значение | TTL | Назначение |
|------|-----|---------------|-----|------------|
| `snake:{room_id}:{user_id}` | Hash | `h` (x), `v` (y), `a` (angle), `b` (body, Protobuf) | 10м | Состояние змейки |
| `coin:{room_id}:{coin_id}` | String | Номинал (decimal) | **3с** | Монета. TTL = исчезновение. GETDEL = съесть атомарно |
| `rooms:active` | ZSET | member: `{room_id}`, score: players_count | — | Реестр арен. Matchmaking: `ZRANGEBYSCORE 0 19` (лимит 20) |
| `lock:player:{user_id}` | String | room_id | сессия | Блокировка: игрок не в двух комнатах |
| `balance:{user_id}` | String | decimal | 1ч | Кеш баланса из Postgres |
| `input:{room_id}:{user_id}` | List | binary (Protobuf) | 1с | Очередь команд до обработки тиком |

### Namespacing: изоляция арен

| Объект | Арена 101 (Low Stakes) | Арена 202 (Whales) |
|--------|------------------------|---------------------|
| Змейка | `snake:{101}:user_15` | `snake:{202}:user_99` |
| Монета | `coin:{101}:c_abc` | `coin:{202}:c_xyz` |

### Монеты: Pipeline при смерти

```go
// Генерация N монет на месте смерти
for i := 0; i < n; i++ {
    coinID := uuid.New().String()
    key := fmt.Sprintf("coin:%s:%s", roomID, coinID)
    rdb.Set(ctx, key, amountPerCoin, 3*time.Second)
    broadcastCoinSpawn(coinID, x, y)
}
```

### Монеты: атомарное съедание (GETDEL)

```go
val, err := rdb.GetDel(ctx, key).Result()
if err == redis.Nil {
    return // Монета уже сгорела по TTL — опоздал
}
// Монета съедена, начисляем баланс
```

**Почему GETDEL:** Исключает Double Spend — две змейки не съедят одну монету. **Binary Protobuf** для тела змейки — в 5 раз быстрее JSON.

### Redis Multi-Arena Strategy

1. **Key Pattern:** Используй `{room_id}` как Hash Tag во всех session-ключах → data locality в Redis Cluster.
2. **Room Registry:** ZSET `rooms:active`, score = players_count. Matchmaking: `ZRANGEBYSCORE rooms:active 0 19` (найти комнату с местом, лимит 20). Работает мгновенно при 10,000 арен.
3. **Isolation:** Логика `domain`/`usecase` строго в контексте `RoomID`. Никакого cross-room доступа.
4. **Cleanup (Janitor):** Сканировать `rooms:active`, удалять пустые комнаты из Redis/Postgres при неактивности > 5 минут.
5. **Horizontal Scaling:** Второй Go-сервер → в Registry добавить `server_address` на комнату. Клиент коннектится по WebSocket к серверу, где крутится его `room_id`.

## 10. Instructions for Cursor AI

1. **Domain First:** Начни с `internal/domain` — `Snake`, `Room`, `Coin`, `interfaces.go`. Чистая логика без импортов из db/transport.
2. **UseCases:** Реализуй `GameManager` и `WalletManager` в `usecase/`. Инжектируй зависимости через интерфейсы.
3. **Infrastructure:** Подключи `repository` (Postgres, Redis), `payment` (Crypto Bot), `auth` (Validator для Telegram InitData — обязателен для WebSocket и HTTP). Реализуй интерфейсы из domain.
4. **Delivery:** WebSocket в `delivery/ws` — **валидация initData при подключении**, decode Protobuf, вызов UseCase. HTTP API для баланса и истории.
5. **Client:** PixiJS engine с LERP-интерполяцией. Рендерер отделён от сетевого слоя (`/api`).

---
