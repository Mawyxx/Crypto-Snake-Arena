# Crypto Snake Arena - Start backend + ngrok
$ErrorActionPreference = "Stop"
$root = "D:\Project\WORK\Crypto Snake Arena"

# Kill existing
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

# Start backend (must run from backend dir for relative paths)
$backendCmd = "`$env:STATIC_DIR='$root\frontend\dist'; Set-Location '$root\backend'; go run ./cmd/server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 6

# Start ngrok
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8080"

Write-Host ""
Write-Host "Backend: http://localhost:8080" -ForegroundColor Green
Write-Host "ngrok: check the new window for URL" -ForegroundColor Green
Write-Host "BotFather: use ngrok HTTPS URL as Web App URL" -ForegroundColor Yellow
Write-Host ""
