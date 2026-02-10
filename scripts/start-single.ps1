# Crypto Snake Arena - single ngrok tunnel (backend + static frontend)
# Backend serves frontend/dist, WebSocket at /ws

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "=== Crypto Snake Arena (single tunnel) ===" -ForegroundColor Cyan

$ngrokConfig = "$env:LOCALAPPDATA\ngrok\ngrok.yml"
if (-not (Test-Path $ngrokConfig) -or (Get-Content $ngrokConfig -Raw -ErrorAction SilentlyContinue) -notmatch "authtoken:") {
    Write-Host "ngrok auth required: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Yellow
    exit 1
}

Write-Host "Building frontend..." -ForegroundColor Green
Push-Location "$root\frontend"
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed"; exit 1 }
Pop-Location

Write-Host "Starting backend (8081)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; `$env:PORT='8081'; go run ./cmd/server"

Start-Sleep -Seconds 4

Write-Host "Starting ngrok..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http http://127.0.0.1:8081 --pooling-enabled"

Write-Host ""
Write-Host "Done. Copy HTTPS URL from ngrok window." -ForegroundColor Cyan
Write-Host "  frontend\.env.local: VITE_WS_URL=wss://YOUR_NGROK_URL/ws" -ForegroundColor Yellow
Write-Host "  BotFather -> Edit App -> Web App URL = https://YOUR_NGROK_URL" -ForegroundColor Yellow
Write-Host "  Rebuild: cd frontend; npm run build" -ForegroundColor Yellow
Write-Host ""
