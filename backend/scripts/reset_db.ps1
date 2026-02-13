# Сброс БД crypto_snake (для разработки)
# Требует: PostgreSQL, Go. Без psql — всё через GORM.
# Запуск: cd backend; .\scripts\reset_db.ps1

$ErrorActionPreference = "Stop"
$backendDir = if ($PSScriptRoot) { Join-Path $PSScriptRoot ".." } else { ".." }
Push-Location $backendDir

# Загружаем .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

Write-Host "Resetting database (drop + create)..." -ForegroundColor Yellow
go run ./cmd/resetdb
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }

Write-Host "Applying migrations (GORM + SQL)..." -ForegroundColor Yellow
go run ./cmd/initdb
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }

Write-Host "Database reset complete." -ForegroundColor Green
Pop-Location
