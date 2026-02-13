#!/bin/bash
# Запускается на сервере через GitHub Actions SSH
set -e

APP_DIR="${APP_DIR:-/opt/crypto-snake-arena}"
INCOMING="$APP_DIR/incoming"

cd "$APP_DIR"

# Копируем бинарник бэкенда
cp -f "$INCOMING/backend/server" "$APP_DIR/backend/server"
chmod +x "$APP_DIR/backend/server"

# Копируем статику фронтенда
rm -rf "$APP_DIR/frontend/dist"
cp -r "$INCOMING/frontend/dist" "$APP_DIR/frontend/"

# Обновляем nginx config (если есть в incoming)
if [ -f "$INCOMING/deploy/nginx-crypto-snake.conf" ]; then
  cp "$INCOMING/deploy/nginx-crypto-snake.conf" /etc/nginx/sites-available/crypto-snake
  nginx -t && systemctl reload nginx
fi

# Рестарт systemd
sudo systemctl restart crypto-snake-arena

echo "Deploy done. Service restarted."
sudo systemctl status crypto-snake-arena --no-pager -l || true
