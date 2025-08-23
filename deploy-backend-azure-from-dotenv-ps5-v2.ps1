
#requires -version 5.1
<#
  Déploiement backend .NET sur Azure App Service (Linux, .NET 8)
  Version robuste PS5 — chemins absolus (évite les soucis de répertoire courant)
#>

Param(
  [Parameter(Mandatory=$true)][string]$EnvPath,
  [Parameter(Mandatory=$true)][string]$BackendDir,
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

# Resolve absolute paths
$EnvFull = (Resolve-Path $EnvPath).Path
$BackendFull = (Resolve-Path $BackendDir).Path
$PublishDir = Join-Path $BackendFull "publish"
$ZipPath = Join-Path $PublishDir "app.zip"

Write-Host "==== Lecture .env ===="
$envMap = Read-EnvFile -Path $EnvFull

$DB_URL = $envMap['ConnectionStrings__DefaultConnection']
$JWT_SECRET = $envMap['JWT_SECRET']

if ([string]::IsNullOrWhiteSpace($DB_URL)) { Write-Error "ConnectionStrings__DefaultConnection manquant"; exit 1 }
if ([string]::IsNullOrWhiteSpace($JWT_SECRET)) { Write-Error "JWT_SECRET manquant"; exit 1 }

$CORS = $envMap['CORS_ALLOWED_ORIGINS']
if ([string]::IsNullOrWhiteSpace($CORS)) { $CORS = "http://localhost:3000" }

if (-not $envMap.ContainsKey('JWT_ISSUER')) { $envMap['JWT_ISSUER'] = 'startingbloch' }
if (-not $envMap.ContainsKey('JWT_AUDIENCE')) { $envMap['JWT_AUDIENCE'] = 'startingbloch' }
if (-not $envMap.ContainsKey('ENABLE_RATE_LIMITING')) { $envMap['ENABLE_RATE_LIMITING'] = 'true' }
if (-not $envMap.ContainsKey('ENABLE_HTTPS_REDIRECT')) { $envMap['ENABLE_HTTPS_REDIRECT'] = 'true' }
if (-not $envMap.ContainsKey('LOG_LEVEL')) { $envMap['LOG_LEVEL'] = 'Information' }

Write-Host "==== Étape 2 — Build en Release ===="
if (Test-Path $PublishDir) { Remove-Item $PublishDir -Recurse -Force }
& dotnet publish "$BackendFull" -c Release -o "$PublishDir"

Write-Host "==== Étape 3 — ZIP du contenu publish/ ===="
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path (Join-Path $PublishDir '*') -DestinationPath $ZipPath -Force

Write-Host "==== Étape 4 — Ressources Azure (RG/Plan/WebApp) ===="
if (-not (az group show -n $RG 2>$null)) { az group create -n $RG -l $Location | Out-Null }
if (-not (az appservice plan show -g $RG -n $Plan 2>$null)) { az appservice plan create -g $RG -n $Plan --sku B1 --is-linux | Out-Null }
if (-not (az webapp show -g $RG -n $App 2>$null)) { az webapp create -g $RG -p $Plan -n $App --runtime "DOTNET|8.0" | Out-Null }

Write-Host "==== Étape 5 — App Settings ===="
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

Write-Host "==== Étape 6 — Déploiement du ZIP ===="
az webapp deploy -g $RG -n $App --src-path $ZipPath | Out-Null

$appUrl = "https://$App.azurewebsites.net"
Write-Host "==== Étape 7 — Test ===="
Write-Host "URL: $appUrl"
try {
  $h = Invoke-WebRequest -UseBasicParsing "$appUrl/api/health" -TimeoutSec 20
  Write-Host "- /api/health :" 
  $h.Content | Out-String | Write-Output
} catch {
  Write-Host "- /api/health indisponible, tentative racine /"
  try { (Invoke-WebRequest -UseBasicParsing "$appUrl").Content.Substring(0,500) | Out-String | Write-Output } catch {}
}

Write-Host "✅ Terminé."
