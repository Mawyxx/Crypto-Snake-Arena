# Добавляет публичный ключ на сервер для GitHub Actions deploy.
# Запуск: .\deploy\add-deploy-key.ps1 -KeyPath "C:\Users\...\deploy_arena" -RootPassword "пароль"
#
# ВАЖНО: никогда не публикуй приватный ключ! Если показывал — сгенерируй новый.

param(
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$true)]
    [string]$RootPassword,
    
    [string]$TargetHost = "72.56.105.226",
    [string]$User = "root"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $KeyPath)) {
    Write-Error "Ключ не найден: $KeyPath"
}

# Получаем публичный ключ (ssh-keygen в Git Bash или OpenSSH)
$pubKey = & ssh-keygen -y -f $KeyPath 2>$null
if (-not $pubKey) {
    Write-Error "Не удалось извлечь публичный ключ. Убедись что установлен OpenSSH."
}

Write-Host "Adding key to ${User}@${TargetHost} ..."

$plink = Get-Command plink -ErrorAction SilentlyContinue
if ($plink) {
    $cmd = "mkdir -p ~/.ssh; echo '" + $pubKey + "' >> ~/.ssh/authorized_keys; chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys"
    plink -batch -pw $RootPassword "${User}@${TargetHost}" $cmd
    Write-Host "Done."
    exit 0
}

Write-Host "plink not found. Add key manually or install PuTTY."
exit 1
