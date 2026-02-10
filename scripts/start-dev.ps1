# Запуск бэкенда и фронтенда для разработки
# Использование: .\scripts\start-dev.ps1

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "=== Crypto Snake Arena — Dev ===" -ForegroundColor Cyan
Write-Host ""

# Проверка .env
$backendEnv = Join-Path $root "backend\.env"
if (-not (Test-Path $backendEnv)) {
    Write-Host "Создай backend\.env из backend\.env.example" -ForegroundColor Yellow
    Write-Host "Обязательно укажи TELEGRAM_BOT_TOKEN" -ForegroundColor Yellow
    exit 1
}

# Запуск бэкенда
Write-Host "Запуск бэкенда (порт 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; go run ./cmd/server"

Start-Sleep -Seconds 2

# Запуск фронтенда
Write-Host "Запуск фронтенда (порт 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Оба сервера запущены в отдельных окнах." -ForegroundColor Cyan
Write-Host ""
Write-Host "Дальше:" -ForegroundColor Yellow
Write-Host "  1. ngrok http 8080  (в отдельном терминале) -> ссылка для бэка"
Write-Host "  2. ngrok http 5173  (ещё один терминал)      -> ссылка для фронта"
Write-Host "  3. BotFather -> Edit App -> Web App URL = ссылка фронта (5173)"
Write-Host "  4. frontend\.env.local: VITE_WS_URL=wss://ССЫЛКА_БЭКА_8080/ws"
Write-Host "  5. Перезапусти npm run dev после смены .env.local"
Write-Host ""
