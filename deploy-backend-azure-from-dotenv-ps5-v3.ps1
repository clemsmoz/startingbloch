
#requires -version 5.1
<#
  Backend .NET -> Azure App Service (Linux, .NET 8)
  PS5 v3: robust paths, csproj auto-detect, safe '&' passing with --%%
#>

Param(
  [Parameter(Mandatory=$true)][string]$EnvPath,
  [Parameter(Mandatory=$true)][string]$BackendDir,
  [string]$RG = "rg-startingbloch",
  [string]$Location = "westeurope",
  [string]$Plan = "plan-startingbloch",
  [string]$App = "sb-backend"
)

$ErrorActionPreference = "Stop"

function Require-Cli($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "CLI missing: $name"
  }
}

function Read-EnvFile([string]$Path) {
  if (-not (Test-Path $Path)) { throw "ENV file not found: $Path" }
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

$EnvFull = (Resolve-Path $EnvPath).Path
$BackendFull = (Resolve-Path $BackendDir).Path
$PublishDir = Join-Path $BackendFull "publish"
$ZipPath = Join-Path $PublishDir "app.zip"

Write-Host "== Read .env =="
$envMap = Read-EnvFile -Path $EnvFull

$DB_URL = $envMap['ConnectionStrings__DefaultConnection']
$JWT_SECRET = $envMap['JWT_SECRET']
if ([string]::IsNullOrWhiteSpace($DB_URL)) { throw "Missing ConnectionStrings__DefaultConnection" }
if ([string]::IsNullOrWhiteSpace($JWT_SECRET)) { throw "Missing JWT_SECRET" }

$CORS = $envMap['CORS_ALLOWED_ORIGINS']
if ([string]::IsNullOrWhiteSpace($CORS)) { $CORS = "http://localhost:3000" }

if (-not $envMap.ContainsKey('JWT_ISSUER')) { $envMap['JWT_ISSUER'] = 'startingbloch' }
if (-not $envMap.ContainsKey('JWT_AUDIENCE')) { $envMap['JWT_AUDIENCE'] = 'startingbloch' }
if (-not $envMap.ContainsKey('ENABLE_RATE_LIMITING')) { $envMap['ENABLE_RATE_LIMITING'] = 'true' }
if (-not $envMap.ContainsKey('ENABLE_HTTPS_REDIRECT')) { $envMap['ENABLE_HTTPS_REDIRECT'] = 'true' }
if (-not $envMap.ContainsKey('LOG_LEVEL')) { $envMap['LOG_LEVEL'] = 'Information' }

# Find a csproj (exclude Tests)
$csproj = Get-ChildItem -LiteralPath $BackendFull -Filter *.csproj -Recurse |
  Where-Object { $_.FullName -notmatch '\.Tests\.csproj$' } |
  Select-Object -First 1
if (-not $csproj) { throw "No .csproj found under $BackendFull" }
Write-Host "== Using project: $($csproj.FullName) =="

Write-Host "== Step 2: dotnet publish =="
if (Test-Path $PublishDir) { Remove-Item $PublishDir -Recurse -Force }
& dotnet publish "$($csproj.FullName)" -c Release -o "$PublishDir"
if ($LASTEXITCODE -ne 0) { throw "dotnet publish failed with exit code $LASTEXITCODE" }
if (-not (Test-Path $PublishDir)) { throw "Publish directory missing: $PublishDir" }

Write-Host "== Step 3: zip publish folder =="
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path (Join-Path $PublishDir '*') -DestinationPath $ZipPath -Force
if (-not (Test-Path $ZipPath)) { throw "ZIP not created: $ZipPath" }

Write-Host "== Step 4: ensure Azure resources =="
az group show -n $RG 2>$null 1>$null
if ($LASTEXITCODE -ne 0) { az group create -n $RG -l $Location | Out-Null }
az appservice plan show -g $RG -n $Plan 2>$null 1>$null
if ($LASTEXITCODE -ne 0) { az appservice plan create -g $RG -n $Plan --sku B1 --is-linux | Out-Null }
az webapp show -g $RG -n $App 2>$null 1>$null
if ($LASTEXITCODE -ne 0) { az webapp create -g $RG -p $Plan -n $App --runtime "DOTNET|8.0" | Out-Null }

Write-Host "== Step 5: app settings =="
# 5a. Set DB URL safely using stop-parsing marker --%% (escaping '&')
az webapp config appsettings set --% -g $RG -n $App --settings ConnectionStrings__DefaultConnection=$DB_URL

# 5b. Other settings (no '&' expected)
$pairs = @("CORS_ALLOWED_ORIGINS=$CORS")
$keys = @('JWT_SECRET','JWT_ISSUER','JWT_AUDIENCE','JWT_EXPIRE_MINUTES','ENABLE_RATE_LIMITING','MAX_REQUESTS_PER_MINUTE','ENABLE_HTTPS_REDIRECT','LOG_LEVEL','EF_AUTO_MIGRATE','EF_RUNTIME_SEED','EF_TABLES_LOWERCASE','EF_DATETIME_AS_TEXT')
foreach ($k in $keys) {
  if ($envMap.ContainsKey($k) -and -not [string]::IsNullOrWhiteSpace($envMap[$k])) {
    $pairs += "$k=$($envMap[$k])"
  }
}
if ($pairs.Count -gt 0) {
  az webapp config appsettings set -g $RG -n $App --settings $pairs | Out-Null
}

Write-Host "== Step 6: deploy ZIP =="
az webapp deploy -g $RG -n $App --src-path $ZipPath | Out-Null

$appUrl = "https://$App.azurewebsites.net"
Write-Host "== Step 7: test =="
Write-Host "URL: $appUrl"
try {
  $h = Invoke-WebRequest -UseBasicParsing "$appUrl/api/health" -TimeoutSec 20
  Write-Host "/api/health:"
  $h.Content | Out-String | Write-Output
} catch {
  Write-Host "/api/health unavailable, trying root /"
  try { (Invoke-WebRequest -UseBasicParsing "$appUrl").Content.Substring(0,500) | Out-String | Write-Output } catch {}
}

Write-Host "OK."
