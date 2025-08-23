
#requires -version 5.1
<#
  Déploiement backend .NET sur Azure App Service (Linux, .NET 8)
  Compatible Windows PowerShell 5.1

  Usage :
    powershell -ExecutionPolicy Bypass -File .\deploy-backend-azure-from-dotenv-ps5.ps1 `
      -EnvPath startingbloch\backend-dotnet\.env `
      -BackendDir startingbloch\backend-dotnet `
      -RG rg-startingbloch -Location westeurope -Plan plan-startingbloch -App sb-backend
#>

Param(
  [string]$EnvPath = ".env",
  [string]$BackendDir = "startingbloch/backend-dotnet",
  [string]$RG = "rg-startingbloch",
  [string]$Location = "westeurope",
  [string]$Plan = "plan-startingbloch",
  [string]$App = "sb-backend"
)

function Require-Cli($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "CLI '$name' introuvable. Installez-le puis relancez."
    exit 1
  }
}

function Read-EnvFile([string]$Path) {
  if (-not (Test-Path $Path)) {
    Write-Error "Fichier .env introuvable : $Path"
    exit 1
  }
  $map = @{}
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length-2) }
    if ($val.StartsWith("'") -and $val.EndsWith("'")) { $val = $val.Substring(1, $val.Length-2) }
    $map[$key] = $val
  }
  return $map
}

Require-Cli az
Require-Cli dotnet

Write-Host "==== Lecture .env ====" -ForegroundColor Cyan
$envMap = Read-EnvFile -Path $EnvPath

$DB_URL = $envMap['ConnectionStrings__DefaultConnection']
$JWT_SECRET = $envMap['JWT_SECRET']

if ([string]::IsNullOrWhiteSpace($DB_URL)) { Write-Error "ConnectionStrings__DefaultConnection manquant dans $EnvPath"; exit 1 }
if ([string]::IsNullOrWhiteSpace($JWT_SECRET)) { Write-Error "JWT_SECRET manquant dans $EnvPath"; exit 1 }

$CORS = $envMap['CORS_ALLOWED_ORIGINS']
if ([string]::IsNullOrWhiteSpace($CORS)) { $CORS = "http://localhost:3000" }

if (-not $envMap.ContainsKey('JWT_ISSUER')) { $envMap['JWT_ISSUER'] = 'startingbloch' }
if (-not $envMap.ContainsKey('JWT_AUDIENCE')) { $envMap['JWT_AUDIENCE'] = 'startingbloch' }
if (-not $envMap.ContainsKey('ENABLE_RATE_LIMITING')) { $envMap['ENABLE_RATE_LIMITING'] = 'true' }
if (-not $envMap.ContainsKey('ENABLE_HTTPS_REDIRECT')) { $envMap['ENABLE_HTTPS_REDIRECT'] = 'true' }
if (-not $envMap.ContainsKey('LOG_LEVEL')) { $envMap['LOG_LEVEL'] = 'Information' }

Write-Host "==== Étape 2 — Build en Release ====" -ForegroundColor Cyan
Push-Location $BackendDir
if (Test-Path publish) { Remove-Item publish -Recurse -Force }
dotnet publish -c Release -o publish

Write-Host "==== Étape 3 — ZIP du contenu publish/ ====" -ForegroundColor Cyan
Push-Location publish
$zipPath = Join-Path (Get-Location) "app.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path * -DestinationPath $zipPath -Force

Write-Host "==== Étape 4 — Ressources Azure (RG/Plan/WebApp) ====" -ForegroundColor Cyan
if (-not (az group show -n $RG 2>$null)) { az group create -n $RG -l $Location | Out-Null }
if (-not (az appservice plan show -g $RG -n $Plan 2>$null)) { az appservice plan create -g $RG -n $Plan --sku B1 --is-linux | Out-Null }
if (-not (az webapp show -g $RG -n $App 2>$null)) { az webapp create -g $RG -p $Plan -n $App --runtime "DOTNET|8.0" | Out-Null }

Write-Host "==== Étape 5 — App Settings ====" -ForegroundColor Cyan
$pairs = @(
  "ConnectionStrings__DefaultConnection=$DB_URL",
  "CORS_ALLOWED_ORIGINS=$CORS"
)
$keys = @(
  'JWT_SECRET','JWT_ISSUER','JWT_AUDIENCE','JWT_EXPIRE_MINUTES',
  'ENABLE_RATE_LIMITING','MAX_REQUESTS_PER_MINUTE','ENABLE_HTTPS_REDIRECT','LOG_LEVEL',
  'EF_AUTO_MIGRATE','EF_RUNTIME_SEED','EF_TABLES_LOWERCASE','EF_DATETIME_AS_TEXT'
)
foreach ($k in $keys) {
  if ($envMap.ContainsKey($k) -and -not [string]::IsNullOrWhiteSpace($envMap[$k])) {
    $pairs += "$k=$($envMap[$k])"
  }
}
az webapp config appsettings set -g $RG -n $App --settings $pairs | Out-Null

Write-Host "==== Étape 6 — Déploiement du ZIP ====" -ForegroundColor Cyan
az webapp deploy -g $RG -n $App --src-path $zipPath | Out-Null

$appUrl = "https://$App.azurewebsites.net"
Write-Host "==== Étape 7 — Test ====" -ForegroundColor Cyan
Write-Host "URL: $appUrl"
Write-Host "- /api/health :"
try { (Invoke-WebRequest -UseBasicParsing "$appUrl/api/health").Content | Out-String | Write-Output } catch {}
Write-Host ""
Write-Host "- / :"
try { (Invoke-WebRequest -UseBasicParsing "$appUrl").Content.Substring(0,500) | Out-String | Write-Output } catch {}

Pop-Location; Pop-Location
Write-Host "✅ Terminé." -ForegroundColor Green
