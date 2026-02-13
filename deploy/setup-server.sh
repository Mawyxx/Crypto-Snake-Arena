#!/bin/bash
# Однократная настройка Ubuntu-сервера. Запускать от root или через sudo.
# Использование: scp -r deploy/ user@server:/tmp/ && ssh user@server 'sudo bash /tmp/deploy/setup-server.sh'

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/opt/crypto-snake-arena"
DEPLOY_USER="${DEPLOY_USER:-root}"

echo "=== Setup Crypto Snake Arena ==="

# 1. Пользователь и директории
# root уже есть; для отдельного deploy: useradd -m -s /bin/bash deploy
mkdir -p "$APP_DIR"/{backend,frontend/dist,incoming}
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# 2. Go (если нужен для миграций — опционально)
# apt install -y golang-go

# 3. PostgreSQL и Redis
apt update && apt install -y postgresql redis-server nginx

# 4. БД (владелец — postgres или отдельный пользователь)
sudo -u postgres psql -c "CREATE USER cryptosnake WITH PASSWORD 'CHANGE_ME';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE crypto_snake OWNER cryptosnake;" 2>/dev/null || true

# 5. Systemd сервис
cp "$SCRIPT_DIR/crypto-snake-arena.service" /etc/systemd/system/
sed -i "s/User=deploy/User=$DEPLOY_USER/" /etc/systemd/system/crypto-snake-arena.service
sed -i "s/Group=deploy/Group=$DEPLOY_USER/" /etc/systemd/system/crypto-snake-arena.service
systemctl daemon-reload
systemctl enable crypto-snake-arena

# 6. Nginx конфиг
cp "$SCRIPT_DIR/nginx-crypto-snake.conf" /etc/nginx/sites-available/crypto-snake

# 7. .env для бэкенда
if [ ! -f "$APP_DIR/backend/.env" ]; then
  cat > "$APP_DIR/backend/.env" << 'EOF'
DATABASE_URL=host=localhost user=cryptosnake password=CHANGE_ME dbname=crypto_snake port=5432 sslmode=disable
REDIS_URL=localhost:6379
TELEGRAM_BOT_TOKEN=
PORT=8080
ALLOWED_ORIGINS=*
EOF
  chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/backend/.env"
  echo "Created $APP_DIR/backend/.env — ОБЯЗАТЕЛЬНО отредактируй TELEGRAM_BOT_TOKEN и пароль БД!"
fi

# 8. Включить сайт в Nginx
ln -sf /etc/nginx/sites-available/crypto-snake /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
# Домен arrenasnake.net уже в конфиге; nginx -t && systemctl reload nginx

# 9. root не нужен sudo; для отдельного deploy-user раскомментируй:
# echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart crypto-snake-arena" > /etc/sudoers.d/crypto-snake-deploy

echo "=== Done ==="
echo "1. Отредактируй $APP_DIR/backend/.env (TELEGRAM_BOT_TOKEN, DATABASE_URL)"
echo "2. Домен arrenasnake.net в Nginx уже настроен"
echo "3. nginx -t && systemctl reload nginx"
echo "4. Первый деплой через GitHub Actions или скопируй server + frontend/dist вручную"
