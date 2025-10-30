#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Déploiement backend .NET sur Azure App Service (Linux, .NET 8)
# - Lit les variables depuis un fichier .env (fourni par l'utilisateur)
# - Exécute les 7 étapes : build, zip, ressources, app settings, déploiement, test
#
# Usage:
#   ./deploy-backend-azure-from-dotenv.sh [--env ./chemin/.env]
#
# Variables par défaut (modifiables via env ou flags) :
#   RG="rg-startingbloch"
#   LOCATION="westeurope"
#   PLAN="plan-startingbloch"
#   APP="sb-backend"
#   BACKEND_DIR="startingbloch/backend-dotnet"
#
# Prérequis : Azure CLI (az), .NET SDK (dotnet), zip, curl
###############################################################################

RG="${RG:-rg-startingbloch}"
LOCATION="${LOCATION:-westeurope}"
PLAN="${PLAN:-plan-startingbloch}"
APP="${APP:-sb-backend}"
BACKEND_DIR="${BACKEND_DIR:-startingbloch/backend-dotnet}"
ENV_FILE=".env"

# Parse args
while [[ "${1:-}" != "" ]]; do
  case "$1" in
    --env)
      shift
      ENV_FILE="${1:-.env}"
      ;;
    *)
      echo "Argument inconnu: $1" >&2
      exit 1
      ;;
  esac
  shift || true
done

# Outils requis
for bin in az dotnet zip curl; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Outil requis manquant: $bin"; exit 1; }
done

# Lecture sécurisée du .env (sans 'source' à cause des caractères spéciaux comme &)
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Fichier .env introuvable: $ENV_FILE" >&2
  exit 1
fi

read_env() {
  # Lit la dernière occurrence KEY=VALUE (ignore commentaires), retourne la valeur brute (sans guillemets)
  local key="$1"
  local line
  line="$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "$ENV_FILE" | tail -n1 || true)"
  if [[ -z "$line" ]]; then
    echo ""
    return 0
  fi
  # coupe après le 1er '=' et garde tout le reste tel quel
  local val="${line#*=}"
  # trim espaces autour
  val="${val#"${val%%[![:space:]]*}"}"  # ltrim
  val="${val%"${val##*[![:space:]]}"}"  # rtrim
  # retire guillemets simples/doubles éventuels en bord
  if [[ "$val" =~ ^\".*\"$ ]]; then
    val="${val:1:${#val}-2}"
  elif [[ "$val" =~ ^\'.*\'$ ]]; then
    val="${val:1:${#val}-2}"
  fi
  printf '%s' "$val"
}

# Clés lues depuis .env
DB_URL="$(read_env 'ConnectionStrings__DefaultConnection')"
JWT_SECRET="$(read_env 'JWT_SECRET')"
JWT_ISSUER="$(read_env 'JWT_ISSUER')"
JWT_AUDIENCE="$(read_env 'JWT_AUDIENCE')"
JWT_EXPIRE_MINUTES="$(read_env 'JWT_EXPIRE_MINUTES')"
ENABLE_RATE_LIMITING="$(read_env 'ENABLE_RATE_LIMITING')"
MAX_REQUESTS_PER_MINUTE="$(read_env 'MAX_REQUESTS_PER_MINUTE')"
ENABLE_HTTPS_REDIRECT="$(read_env 'ENABLE_HTTPS_REDIRECT')"
LOG_LEVEL="$(read_env 'LOG_LEVEL')"
EF_AUTO_MIGRATE="$(read_env 'EF_AUTO_MIGRATE')"
EF_RUNTIME_SEED="$(read_env 'EF_RUNTIME_SEED')"
EF_TABLES_LOWERCASE="$(read_env 'EF_TABLES_LOWERCASE')"
EF_DATETIME_AS_TEXT="$(read_env 'EF_DATETIME_AS_TEXT')"
CORS_ALLOWED_ORIGINS="$(read_env 'CORS_ALLOWED_ORIGINS')"

# Valeurs par défaut utiles
: "${JWT_ISSUER:=startingbloch}"
: "${JWT_AUDIENCE:=startingbloch}"
: "${ENABLE_RATE_LIMITING:=true}"
: "${ENABLE_HTTPS_REDIRECT:=true}"
: "${LOG_LEVEL:=Information}"

# Contrôles minimum
if [[ -z "$DB_URL" ]]; then
  echo "⚠️  ConnectionStrings__DefaultConnection manquant dans $ENV_FILE" >&2
  exit 1
fi
if [[ -z "$JWT_SECRET" ]]; then
  echo "⚠️  JWT_SECRET manquant dans $ENV_FILE" >&2
  exit 1
fi
if [[ -z "$CORS_ALLOWED_ORIGINS" ]]; then
  echo "ℹ️  CORS_ALLOWED_ORIGINS absent dans $ENV_FILE — utilisation d'une valeur par défaut: http://localhost:3000"
  CORS_ALLOWED_ORIGINS="http://localhost:3000"
fi

echo "==== Étape 2 — Build en Release ===="
cd "$BACKEND_DIR"
rm -rf publish
dotnet publish -c Release -o publish

echo "==== Étape 3 — ZIP du contenu publish/ ===="
cd publish
rm -f app.zip
zip -r app.zip . >/dev/null

echo "==== Étape 4 — Ressources Azure (RG/Plan/WebApp) ===="
az group show -n "$RG" >/dev/null 2>&1 || az group create -n "$RG" -l "$LOCATION" >/dev/null
az appservice plan show -g "$RG" -n "$PLAN" >/dev/null 2>&1 || az appservice plan create -g "$RG" -n "$PLAN" --sku B1 --is-linux >/dev/null
if ! az webapp show -g "$RG" -n "$APP" >/dev/null 2>&1; then
  az webapp create -g "$RG" -p "$PLAN" -n "$APP" --runtime "DOTNET|8.0" >/dev/null
fi

echo "==== Étape 5 — Variables d'environnement de l'app ===="
SETTINGS=(
  "ConnectionStrings__DefaultConnection=$DB_URL"
  "CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS"
  "JWT_SECRET=$JWT_SECRET"
  "JWT_ISSUER=$JWT_ISSUER"
  "JWT_AUDIENCE=$JWT_AUDIENCE"
  "JWT_EXPIRE_MINUTES=$JWT_EXPIRE_MINUTES"
  "ENABLE_RATE_LIMITING=$ENABLE_RATE_LIMITING"
  "MAX_REQUESTS_PER_MINUTE=$MAX_REQUESTS_PER_MINUTE"
  "ENABLE_HTTPS_REDIRECT=$ENABLE_HTTPS_REDIRECT"
  "LOG_LEVEL=$LOG_LEVEL"
  "EF_AUTO_MIGRATE=$EF_AUTO_MIGRATE"
  "EF_RUNTIME_SEED=$EF_RUNTIME_SEED"
  "EF_TABLES_LOWERCASE=$EF_TABLES_LOWERCASE"
  "EF_DATETIME_AS_TEXT=$EF_DATETIME_AS_TEXT"
)

# Filtre les paires vides (KEY=)
CLEANED_SETTINGS=()
for kv in "${SETTINGS[@]}"; do
  k="${kv%%=*}"
  v="${kv#*=}"
  if [[ -n "$v" ]]; then
    CLEANED_SETTINGS+=("$k=$v")
  fi
done

# shellcheck disable=SC2086
az webapp config appsettings set -g "$RG" -n "$APP" --settings "${CLEANED_SETTINGS[@]}" >/dev/null

echo "==== Étape 6 — Déploiement du ZIP ===="
az webapp deploy -g "$RG" -n "$APP" --src-path app.zip >/dev/null

APP_URL="https://$APP.azurewebsites.net"
echo "==== Étape 7 — Test ===="
echo "URL: $APP_URL"
echo "- /api/health :"
set +e
curl -sS "$APP_URL/api/health" || true
echo
echo "- / :"
curl -sS "$APP_URL" | head -c 500 || true
echo
set -e

echo "✅ Terminé."    