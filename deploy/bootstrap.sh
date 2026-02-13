#!/bin/bash
# Полная автоустановка на пустой Ubuntu-сервер.
# Запуск (подключись по SSH как root):
#   curl -sSL https://raw.githubusercontent.com/Mawyxx/Crypto-Snake-Arena/main/deploy/bootstrap.sh | bash
# С токеном и паролем БД:
#   TELEGRAM_BOT_TOKEN=твой_токен DB_PASSWORD=arenavoid bash -s < <(curl -sSL https://raw.githubusercontent.com/Mawyxx/Crypto-Snake-Arena/main/deploy/bootstrap.sh)

set -e
export DEBIAN_FRONTEND=noninteractive

DB_PASSWORD="${DB_PASSWORD:-arenavoid}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
REPO_URL="https://github.com/Mawyxx/Crypto-Snake-Arena.git"
APP_DIR="/opt/crypto-snake-arena"

echo "=== Crypto Snake Arena — полная установка ==="

# 1. Обновление и зависимости
apt update -qq && apt install -y -qq git curl postgresql redis-server nginx

# 2. Клонирование репо
rm -rf /tmp/crypto-snake-arena
git clone --depth 1 -q "$REPO_URL" /tmp/crypto-snake-arena
DEPLOY_DIR="/tmp/crypto-snake-arena/deploy"

# 3. БД
sudo -u postgres psql -c "CREATE USER cryptosnake WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE crypto_snake OWNER cryptosnake;" 2>/dev/null || true

# 4. Директории приложения
mkdir -p "$APP_DIR"/{backend,frontend/dist,incoming/backend,incoming/frontend,incoming/deploy}
chown -R root:root "$APP_DIR"

# 5. Systemd
cp "$DEPLOY_DIR/crypto-snake-arena.service" /etc/systemd/system/
sed -i 's/User=.*/User=root/' /etc/systemd/system/crypto-snake-arena.service
sed -i 's/Group=.*/Group=root/' /etc/systemd/system/crypto-snake-arena.service
systemctl daemon-reload
systemctl enable crypto-snake-arena

# 6. Nginx
cp "$DEPLOY_DIR/nginx-crypto-snake.conf" /etc/nginx/sites-available/crypto-snake
ln -sf /etc/nginx/sites-available/crypto-snake /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t 2>/dev/null && systemctl reload nginx

# 7. .env
cat > "$APP_DIR/backend/.env" << EOF
DATABASE_URL=host=localhost user=cryptosnake password=$DB_PASSWORD dbname=crypto_snake port=5432 sslmode=disable
REDIS_URL=localhost:6379
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
PORT=8080
ALLOWED_ORIGINS=*
EOF

# 8. Deploy-скрипт (заполнится при первом деплое от GitHub Actions; сейчас — заглушка)
mkdir -p "$APP_DIR/incoming/deploy"
cp "$DEPLOY_DIR/run-deploy.sh" "$APP_DIR/incoming/deploy/"
chmod +x "$APP_DIR/incoming/deploy/run-deploy.sh"

echo ""
echo "=== Установка завершена ==="
echo "Сервер готов к деплою."
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Добавь токен: nano $APP_DIR/backend/.env"
fi
echo ""
echo "Сделай push в main или запусти workflow вручную — GitHub Actions задеплоит приложение."
