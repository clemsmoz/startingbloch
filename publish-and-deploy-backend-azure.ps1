#requires -version 7.0
Param(
  [string]$RG = "rg-startingbloch",
  [string]$Location = "westeurope",
  [string]$Plan = "plan-startingbloch",
  [string]$App = "sb-backend",
  [string]$BackendDir = "startingbloch/backend-dotnet",
  [string]$Runtime = "DOTNET|8.0",
  [string]$ZipName = "app.zip",

  [Parameter(Mandatory=$true)][string]$ConnectionStrings__DefaultConnection,
  [Parameter(Mandatory=$true)][string]$CORS_ALLOWED_ORIGINS,
  [Parameter(Mandatory=$true)][string]$JWT_SECRET,
  [string]$JWT_ISSUER = "startingbloch",
  [string]$JWT_AUDIENCE = "startingbloch"
)

function Require-Cli($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "CLI '$name' introuvable."
    exit 1
  }
}

Require-Cli az
Require-Cli dotnet
Require-Cli curl

Write-Host "==> Build .NET en Release" -ForegroundColor Cyan
Push-Location $BackendDir
if (Test-Path publish) { Remove-Item publish -Recurse -Force }
dotnet publish -c Release -o publish

Write-Host "==> ZIP du contenu publish/" -ForegroundColor Cyan
Push-Location publish
if (Test-Path $ZipName) { Remove-Item $ZipName -Force }
Compress-Archive -Path * -DestinationPath $ZipName -Force

Write-Host "==> Ressources Azure (idempotent)" -ForegroundColor Cyan
if (-not (az group show -n $RG 2>$null)) { az group create -n $RG -l $Location | Out-Null }
if (-not (az appservice plan show -g $RG -n $Plan 2>$null)) { az appservice plan create -g $RG -n $Plan --sku B1 --is-linux | Out-Null }
if (-not (az webapp show -g $RG -n $App 2>$null)) { az webapp create -g $RG -p $Plan -n $App --runtime $Runtime | Out-Null }

Write-Host "==> App settings (DB, CORS, JWT)" -ForegroundColor Cyan
az webapp config appsettings set -g $RG -n $App --settings `
  ConnectionStrings__DefaultConnection="$ConnectionStrings__DefaultConnection" `
  CORS_ALLOWED_ORIGINS="$CORS_ALLOWED_ORIGINS" `
  JWT_SECRET="$JWT_SECRET" `
  JWT_ISSUER="$JWT_ISSUER" `
  JWT_AUDIENCE="$JWT_AUDIENCE" | Out-Null

Write-Host "==> Déploiement ZIP" -ForegroundColor Cyan
az webapp deploy -g $RG -n $App --src-path $ZipName | Out-Null

$appUrl = "https://$App.azurewebsites.net"
Write-Host "==> Déployé : $appUrl" -ForegroundColor Green

Write-Host "==> Test /api/health" -ForegroundColor Cyan
try { curl -sS "$appUrl/api/health" } catch {}
Pop-Location; Pop-Location