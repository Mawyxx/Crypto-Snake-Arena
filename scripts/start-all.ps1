# Crypto Snake Arena — полный запуск
# 1. Зарегистрируйся на https://dashboard.ngrok.com/signup
# 2. Скопируй authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Выполни: ngrok config add-authtoken ТВОЙ_ТОКЕН

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "=== Crypto Snake Arena ===" -ForegroundColor Cyan

# Проверка ngrok authtoken
$ngrokConfig = "$env:LOCALAPPDATA\ngrok\ngrok.yml"
if (-not (Test-Path $ngrokConfig) -or (Get-Content $ngrokConfig -Raw -ErrorAction SilentlyContinue) -notmatch "authtoken:") {
    Write-Host ""
    Write-Host "ngrok требует авторизацию:" -ForegroundColor Yellow
    Write-Host "  1. Зайди на https://dashboard.ngrok.com/signup" -ForegroundColor White
    Write-Host "  2. Скопируй authtoken с https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "  3. Выполни: ngrok config add-authtoken ТВОЙ_ТОКЕН" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Запуск бэкенда
Write-Host "Запуск бэкенда (8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; go run ./cmd/server"

Start-Sleep -Seconds 3

# Запуск фронтенда
Write-Host "Запуск фронтенда (5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 2

# Запуск ngrok для бэка
Write-Host "Запуск ngrok для бэкенда (8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8080"

Start-Sleep -Seconds 2

# Запуск ngrok для фронта
Write-Host "Запуск ngrok для фронтенда (5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173"

Write-Host ""
Write-Host "Все сервисы запущены в 4 окнах." -ForegroundColor Cyan
Write-Host ""
Write-Host "Дальше:" -ForegroundColor Yellow
Write-Host "  1. ngrok 8080 - copy HTTPS URL"
Write-Host "  2. frontend\.env.local: VITE_WS_URL=wss://YOUR_NGROK_URL/ws"
Write-Host "  3. ngrok 5173 - copy HTTPS URL"
Write-Host "  4. BotFather -> Edit App -> Web App URL = URL from step 3"
Write-Host "  5. Restart npm run dev after changing .env.local"
Write-Host ""
