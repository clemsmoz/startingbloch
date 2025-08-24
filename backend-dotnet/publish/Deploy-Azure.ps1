# Deploy-Azure.ps1
$ErrorActionPreference = "Stop"

# Paramètres
$SUBSCRIPTION   = "Azure subscription 1"
$RESOURCE_GROUP = "rg-startingbloch"
$PLAN_NAME      = "plan-startingbloch"
$WEBAPP_NAME    = "sb-backend"
$LOCATION       = "westeurope"

$DB_CONN = "Host=ep-purple-voice-a2j51ltt-pooler.eu-central-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=npg_kCf9qNlYTEd3;SSL Mode=Require;Trust Server Certificate=true;Search Path=public"

# Vérifs préalables
if (-not (Test-Path .\app.zip)) { Write-Error "app.zip introuvable (build avec: dotnet publish -c Release -o publish ; zip du dossier publish)." }

az login
az account set --subscription $SUBSCRIPTION

# Créer groupe si absent
if (-not (az group show -n $RESOURCE_GROUP 2>$null)) {
  Write-Host "Création resource group..."
  az group create -n $RESOURCE_GROUP -l $LOCATION | Out-Null
}

# Créer plan si absent
if (-not (az appservice plan show -g $RESOURCE_GROUP -n $PLAN_NAME 2>$null)) {
  Write-Host "Création plan App Service..."
  az appservice plan create -g $RESOURCE_GROUP -n $PLAN_NAME --sku B1 --is-linux | Out-Null
}

# Créer webapp si absente
if (-not (az webapp show -g $RESOURCE_GROUP -n $WEBAPP_NAME 2>$null)) {
  Write-Host "Création WebApp..."
  az webapp create -g $RESOURCE_GROUP -p $PLAN_NAME -n $WEBAPP_NAME --runtime "DOTNET:8" | Out-Null
}

# App settings
Write-Host "Mise à jour des AppSettings..."
az webapp config appsettings set -g $RESOURCE_GROUP -n $WEBAPP_NAME --settings `
  ASPNETCORE_ENVIRONMENT=Production `
  ConnectionStrings__DefaultConnection="$DB_CONN" `
  EF_TABLES_LOWERCASE=true `
  EF_AUTO_MIGRATE=true | Out-Null

# Déploiement ZIP
Write-Host "Déploiement du package..."
az webapp deployment source config-zip -g $RESOURCE_GROUP -n $WEBAPP_NAME --src app.zip | Out-Null

Write-Host "Terminé. Teste: https://$WEBAPP_NAME.azurewebsites.net/api/health"