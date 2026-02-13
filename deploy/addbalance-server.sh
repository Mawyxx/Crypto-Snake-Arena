#!/bin/bash
# Начисление 500 USDT пользователю 7175104609 на ПРОДАКШЕН-сервере
# Запуск: ssh deploy@ТВОЙ_СЕРВЕР "cd /opt/crypto-snake-arena && bash deploy/addbalance-server.sh"
# Или если скрипт в incoming: bash /opt/crypto-snake-arena/incoming/deploy/addbalance-server.sh

set -e
APP_DIR="${APP_DIR:-/opt/crypto-snake-arena}"
BACKEND="$APP_DIR/backend"

cd "$BACKEND"
if [ ! -f .env ]; then
  echo "Ошибка: $BACKEND/.env не найден"
  exit 1
fi
set -a
source .env
set +a
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: DATABASE_URL не задан в .env"
  exit 1
fi
if [ ! -x ./addbalance ]; then
  echo "Ошибка: addbalance не найден. Сначала сделай deploy."
  exit 1
fi
./addbalance
echo "Готово."
