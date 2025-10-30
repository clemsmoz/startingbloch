Param(
  [Parameter(Mandatory=$true)][string]$ResourceGroup,
  [Parameter(Mandatory=$true)][string]$SiteName,
  [string]$LoginEmail = "admin@startingbloch.com",
  [string]$LoginPassword = "admin123",
  [string]$LoginPath = "/api/auth/login",
  [string]$HealthPath = "/api/health",
  [switch]$Restart,
  [switch]$VerboseLogs
)

$ErrorActionPreference = 'Stop'

function Write-Step($t){ Write-Host "[+] $t" -ForegroundColor Cyan }

if (-not (Get-Command az -ErrorAction SilentlyContinue)) { Write-Error "Azure CLI non installé" }

Write-Step "Configuration des logs (filesystem)"
$level = 'Information'
if ($VerboseLogs) { $level = 'Verbose' }
az webapp log config -g $ResourceGroup -n $SiteName --application-logging filesystem --level $level --web-server-logging filesystem --detailed-error-messages true --failed-request-tracing true | Out-Null

if ($Restart){ Write-Step "Redémarrage de l'app"; az webapp restart -g $ResourceGroup -n $SiteName | Out-Null }

Write-Step "Récupération hostname"
$siteHost = az webapp show -g $ResourceGroup -n $SiteName --query defaultHostName -o tsv
$baseUrl = "https://$siteHost"
Write-Host "URL: $baseUrl" -ForegroundColor Yellow

Write-Step "Test health $HealthPath"
$healthUrl = "$baseUrl$HealthPath"
try { $h = Invoke-RestMethod -Method GET -Uri $healthUrl -TimeoutSec 20; Write-Host "Health OK" -ForegroundColor Green } catch { Write-Warning "Health échec: $($_.Exception.Message)" }

Write-Step "Tentative login $LoginPath"
$loginUrl = "$baseUrl$LoginPath"
$bodyObj = @{ email=$LoginEmail; password=$LoginPassword }
$bodyJson = $bodyObj | ConvertTo-Json -Compress
try {
  $resp = Invoke-RestMethod -Method POST -Uri $loginUrl -ContentType 'application/json' -Body $bodyJson -TimeoutSec 30 -ErrorAction Stop
  Write-Host "Login STATUS: 200" -ForegroundColor Green
  ($resp | ConvertTo-Json -Depth 5)
} catch {
  if ($_.Exception.Response) {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "Login STATUS: $code" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $raw = $reader.ReadToEnd()
    Write-Host "Response Body:" -ForegroundColor DarkYellow
    Write-Host $raw
  } else { Write-Warning $_ }
}

Write-Step "Téléchargement des logs (zip)"
$zipPath = Join-Path $PWD "logs-$SiteName.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
az webapp log download -g $ResourceGroup -n $SiteName --log-file $zipPath 2>$null | Out-Null
if (Test-Path $zipPath) {
  Write-Host "Logs ZIP: $zipPath" -ForegroundColor Yellow
  $extractDir = Join-Path $PWD "logs-$SiteName"
  if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
  Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
  Write-Step "Analyse rapide des exceptions"
  $patterns = 'Exception','ERROR','fail','Unhandled','Npgsql'
  Get-ChildItem $extractDir -Recurse -File | ForEach-Object {
    $file = $_.FullName
    $hits = Select-String -Path $file -Pattern $patterns -SimpleMatch | Select-Object -First 20
    if ($hits) {
      Write-Host "--- $file" -ForegroundColor Magenta
      $hits | ForEach-Object { Write-Host $_.Line }
    }
  }
} else {
  Write-Warning "Aucun zip de logs récupéré (app peut être sur Linux sans logs générés encore). Essaye: az webapp log tail -g $ResourceGroup -n $SiteName"
}

Write-Step "Terminé"
