# Auto-setup deploy: SSH key, server, .env
# Run: .\deploy\auto-setup.ps1

$ErrorActionPreference = "Stop"
$SERVER = "72.56.105.226"
$KEY_PATH = "$env:USERPROFILE\.ssh\deploy_arenasnake"
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "=== Crypto Snake Arena - auto-setup ===" -ForegroundColor Cyan

# 1. SSH key
if (-not (Test-Path $KEY_PATH)) {
    Write-Host "Creating SSH key..." -ForegroundColor Yellow
    ssh-keygen -t ed25519 -f $KEY_PATH -N '""'
    Write-Host "Key created: $KEY_PATH" -ForegroundColor Green
} else {
    Write-Host "SSH key exists: $KEY_PATH" -ForegroundColor Green
}

# 2. Add key to server (will ask for root password)
Write-Host ""
Write-Host "Adding key to server (enter root password when prompted)..." -ForegroundColor Yellow
Get-Content "$KEY_PATH.pub" -Raw | ssh -o StrictHostKeyChecking=no root@$SERVER "mkdir -p .ssh; cat >> .ssh/authorized_keys"
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Key added." -ForegroundColor Green

# 3. Copy deploy and run setup
Write-Host ""
Write-Host "Copying deploy to server..." -ForegroundColor Yellow
$deployDir = Join-Path $PROJECT_ROOT "deploy"
scp -r "$deployDir" "root@${SERVER}:/tmp/"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Running setup on server..." -ForegroundColor Yellow
ssh root@$SERVER "bash /tmp/deploy/setup-server.sh"
if ($LASTEXITCODE -ne 0) { exit 1 }

# 4. DB password and .env
$DB_PASSWORD = "arenavoid"
Write-Host ""
Write-Host "Setting DB password..." -ForegroundColor Yellow
ssh root@$SERVER 'sudo -u postgres psql -c "ALTER USER cryptosnake PASSWORD ''arenavoid'';"'

# Token from local .env
$localEnvPath = Join-Path (Join-Path $PROJECT_ROOT "backend") ".env"
$BOT_TOKEN = ""
if (Test-Path $localEnvPath) {
    $content = Get-Content $localEnvPath -Raw -Encoding UTF8
    if ($content -match 'TELEGRAM_BOT_TOKEN=(.+)') {
        $BOT_TOKEN = $matches[1].Trim()
    }
}

Write-Host "Updating .env on server..." -ForegroundColor Yellow
$envContent = "DATABASE_URL=host=localhost user=cryptosnake password=$DB_PASSWORD dbname=crypto_snake port=5432 sslmode=disable`nREDIS_URL=localhost:6379`nTELEGRAM_BOT_TOKEN=$BOT_TOKEN`nPORT=8080`nALLOWED_ORIGINS=*"
$envContent | ssh root@$SERVER 'cat > /opt/crypto-snake-arena/backend/.env'

# 5. Nginx
Write-Host "Reloading Nginx..." -ForegroundColor Yellow
ssh root@$SERVER 'nginx -t; systemctl reload nginx'

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Add to GitHub Secrets:" -ForegroundColor Cyan
Write-Host "  DEPLOY_HOST = $SERVER"
Write-Host "  DEPLOY_USER = root"
Write-Host "  DEPLOY_SSH_KEY = (output below)"
Write-Host ""
Write-Host "Private key for DEPLOY_SSH_KEY:" -ForegroundColor Yellow
Get-Content $KEY_PATH
