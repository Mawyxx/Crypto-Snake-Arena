# Твой сервер arrenasnake.net

**IP:** 72.56.105.226  
**SSH:** `ssh root@72.56.105.226`

---

## Шаг 1 — Настройка сервера (один раз)

С локального ПК:

```bash
cd "D:\Project\WORK\Crypto Snake Arena"
scp -r deploy/ root@72.56.105.226:/tmp/
ssh root@72.56.105.226 "bash /tmp/deploy/setup-server.sh"
```

---

## Шаг 2 — Секреты в GitHub

**Репозиторий → Settings → Secrets and variables → Actions:**

| Секрет       | Значение        |
|--------------|-----------------|
| `DEPLOY_HOST`| `72.56.105.226` |
| `DEPLOY_USER`| `root`          |
| `DEPLOY_SSH_KEY` | приватный SSH-ключ (см. ниже) |

**Создать ключ:**

```powershell
ssh-keygen -t ed25519 -C "deploy" -f $env:USERPROFILE\.ssh\deploy_arenasnake -N ""
```

**Добавить на сервер:**

```powershell
type $env:USERPROFILE\.ssh\deploy_arenasnake.pub | ssh root@72.56.105.226 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Скопировать приватный ключ в DEPLOY_SSH_KEY:**

```powershell
type $env:USERPROFILE\.ssh\deploy_arenasnake
```

Весь вывод (включая `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`) вставь в секрет `DEPLOY_SSH_KEY`.

---

## Шаг 3 — После setup на сервере

```bash
ssh root@72.56.105.226

# 1. Пароль БД и токен бота
nano /opt/crypto-snake-arena/backend/.env
# Заполни: TELEGRAM_BOT_TOKEN, password в DATABASE_URL

# 2. Проверка и перезапуск Nginx
nginx -t && systemctl reload nginx
```

---

## Шаг 4 — Cloudflare

В панели Cloudflare для arrenasnake.net:

1. **DNS** → A-запись: `@` (или `arrenasnake.net`) → `72.56.105.226`
2. Proxy: **Proxied** (оранжевое облако)
3. **SSL/TLS** → режим **Flexible**

---

## Шаг 5 — Первый деплой

После `git push` в `main` запустится GitHub Actions и задеплоит проект.

Или сделай ручной деплой (см. DEPLOY.md).

---

## Полезные команды

```bash
# Логи
journalctl -u crypto-snake-arena -f

# Статус
systemctl status crypto-snake-arena

# Перезапуск
systemctl restart crypto-snake-arena
```
