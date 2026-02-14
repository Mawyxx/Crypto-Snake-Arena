#!/bin/bash
# Добавляет публичный ключ на сервер для GitHub Actions deploy.
# ВАЖНО: никогда не публикуй приватный ключ! Если ты его показывал — сгенерируй новый.
#
# Запуск: ./deploy/add-deploy-key.sh
# Или:    DEPLOY_HOST=72.56.105.226 ROOT_PASSWORD='xxx' bash deploy/add-deploy-key.sh

set -e

DEPLOY_HOST="${DEPLOY_HOST:-72.56.105.226}"
DEPLOY_USER="${DEPLOY_USER:-root}"
ROOT_PASSWORD="${ROOT_PASSWORD:-}"

if [ -z "$ROOT_PASSWORD" ]; then
  echo "Укажи пароль: ROOT_PASSWORD='твой_пароль' $0"
  exit 1
fi

KEY_FILE="${1:-}"
if [ -z "$KEY_FILE" ]; then
  echo "Укажи путь к приватному ключу: $0 /path/to/deploy_arena"
  echo "Или сгенерируй новый: ssh-keygen -t ed25519 -f deploy_arena -N \"\""
  exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
  echo "Файл не найден: $KEY_FILE"
  exit 1
fi

# Получаем публичный ключ из приватного
PUBKEY=$(ssh-keygen -y -f "$KEY_FILE" 2>/dev/null)

if [ -z "$PUBKEY" ]; then
  echo "Не удалось извлечь публичный ключ. Проверь формат ключа."
  exit 1
fi

echo "Добавляю ключ на $DEPLOY_USER@$DEPLOY_HOST ..."

# Используем sshpass если есть, иначе — интерактивный ввод
if command -v sshpass &>/dev/null; then
  sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" \
    "mkdir -p ~/.ssh; chmod 700 ~/.ssh; echo '$PUBKEY' >> ~/.ssh/authorized_keys; sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys; echo OK"
else
  echo "Установи sshpass: apt install sshpass  (Ubuntu) или brew install sshpass  (Mac)"
  echo "Или выполни вручную на сервере:"
  echo "  ssh $DEPLOY_USER@$DEPLOY_HOST"
  echo "  echo '$PUBKEY' >> ~/.ssh/authorized_keys"
  exit 1
fi

echo "Готово. Проверь: ssh -i $KEY_FILE $DEPLOY_USER@$DEPLOY_HOST"
