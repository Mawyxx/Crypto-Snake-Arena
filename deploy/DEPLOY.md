# Деплой Crypto Snake Arena на Ubuntu

## Быстрый старт

### 1. Однократная настройка сервера

На сервере Ubuntu (22.04+):

```bash
# С твоего ПК скопируй deploy-папку
scp -r deploy/ user@ТВОЙ_СЕРВЕР:/tmp/

# Подключись и запусти setup
ssh user@ТВОЙ_СЕРВЕР
sudo bash /tmp/deploy/setup-server.sh
```

Скрипт создаст:
- папку `/opt/crypto-snake-arena`
- пользователя `deploy`
- PostgreSQL БД `crypto_snake`
- systemd-сервис `crypto-snake-arena`
- конфиг Nginx

### 2. Доработки после setup

```bash
# Редактируй .env (токен бота, пароль БД)
sudo nano /opt/crypto-snake-arena/backend/.env

# Домен arrenasnake.net уже прописан в конфиге. При необходимости отредактируй:
# sudo nano /etc/nginx/sites-available/crypto-snake

# Проверь и перезапусти Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 3. GitHub Actions — автодеплой

В настройках репозитория: **Settings → Secrets and variables → Actions**

Добавь секреты:

| Секрет | Описание |
|--------|----------|
| `DEPLOY_HOST` | IP или домен сервера (например `arrenasnake.net`) |
| `DEPLOY_USER` | SSH-пользователь (тот же, что в setup, например `deploy`) |
| `DEPLOY_SSH_KEY` | Приватный SSH-ключ для доступа к серверу |

**Создание SSH-ключа (если ещё нет):**

```bash
# На твоём ПК
ssh-keygen -t ed25519 -C "deploy" -f ~/.ssh/deploy_crypto_snake -N ""

# Публичный ключ — на сервер в ~/.ssh/authorized_keys пользователя deploy
ssh-copy-id -i ~/.ssh/deploy_crypto_snake.pub deploy@ТВОЙ_СЕРВЕР

# Приватный ключ — скопируй целиком в DEPLOY_SSH_KEY
cat ~/.ssh/deploy_crypto_snake
```

После `git push` в ветку `main` workflow соберёт backend + frontend и задеплоит на сервер.

### 4. Первый деплой вручную (до первого push)

Если репозиторий ещё не настроен или нужно проверить setup:

```bash
# На ПК: сборка
cd backend && go build -o server ./cmd/server
cd ../frontend && npm ci && npm run build

# Копирование на сервер
scp backend/server deploy@ТВОЙ_СЕРВЕР:/opt/crypto-snake-arena/incoming/backend/
scp -r frontend/dist deploy@ТВОЙ_СЕРВЕР:/opt/crypto-snake-arena/incoming/frontend/

# На сервере
ssh deploy@ТВОЙ_СЕРВЕР
cd /opt/crypto-snake-arena
./incoming/run-deploy.sh  # или положи run-deploy.sh из deploy/ в incoming/
```

---

## Полезные команды

```bash
# Логи бэкенда (последние 50 строк)
journalctl -u crypto-snake-arena -n 50 -o short-iso

# Логи в реальном времени
journalctl -u crypto-snake-arena -f

# Перезапуск
sudo systemctl restart crypto-snake-arena

# Статус
sudo systemctl status crypto-snake-arena
```

---

## Cloudflare

1. Добавь A-запись: `game` (или @) → IP сервера
2. Включи Proxy (оранжевое облако) — Cloudflare будет принимать HTTPS и проксировать на твой сервер
3. SSL/TLS: в панели Cloudflare выбери режим **Flexible** (Cloudflare → сервер по HTTP) или **Full** если настроишь certbot

---

## Структура на сервере

```
/opt/crypto-snake-arena/
├── backend/
│   ├── server      # бинарник
│   └── .env        # переменные окружения
├── frontend/
│   └── dist/       # статика (index.html, assets/)
├── incoming/       # сюда GitHub Actions загружает артефакты
└── deploy/
    └── run-deploy.sh
```
