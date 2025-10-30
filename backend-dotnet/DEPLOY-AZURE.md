# Déploiement Azure App Service (.NET 8, Linux)

Ce guide déploie `backend-dotnet` sur Azure App Service avec GitHub Actions.

## 1) Créer la Web App
- Azure Portal → App Services → Create
- Runtime stack: .NET 8 (LTS)
- Operating system: Linux
- Plan: F1 (Free) si disponible, sinon Basic (B1)
- Nom: startingbloch-api-<unique>

## 2) Activer le déploiement GitHub Actions
- Web App → Deployment Center → GitHub
- Choisir votre organisation et dépôt
- Branch: master (ou principale)
- App location: backend-dotnet
- Générer le workflow

Si non proposé, utilisez l’exemple en section 6.

## 3) Configurer les App Settings
App Service → Configuration → Application settings. Ajouter:

Obligatoires:
- ConnectionStrings__DefaultConnection = postgresql://user:pass@host:5432/db?sslmode=require
- Jwt__Secret = <clé secrète forte>

Recommandés:
- Jwt__Issuer = startingbloch
- Jwt__Audience = startingbloch-client
- CORS_ALLOWED_ORIGINS = https://<ton-site>.pages.dev,https://www.<ton-domaine>

Optionnels (selon votre import PostgreSQL):
- EF_BASELINE_MIGRATIONS = true
- EF_AUTO_MIGRATE = false
- EF_TABLES_LOWERCASE = true

Généraux:
- ASPNETCORE_ENVIRONMENT = Production

## 4) Déployer
- Commit/push sur la branche surveillée → Actions build & déploie.
- Surveiller l’onglet Actions et les Logs App Service.

## 5) Vérifications
- GET https://<app>.azurewebsites.net/api/health
- GET https://<app>.azurewebsites.net/api/health/db
- Frontend: définir VITE_API_URL sur l’URL backend et autoriser le domaine via CORS_ALLOWED_ORIGINS.

## 6) Workflow GitHub Actions (exemple)
Créez `.github/workflows/deploy-backend.yml` à la racine du repo:

```yaml
name: Deploy Backend to Azure Web App

on:
  push:
    branches: [ "master" ]
    paths:
      - 'backend-dotnet/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    env:
      DOTNET_VERSION: '8.0.x'
      WORKING_DIR: backend-dotnet

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore
        run: dotnet restore $WORKING_DIR/StartingBloch.Backend.csproj

      - name: Build
        run: dotnet build $WORKING_DIR/StartingBloch.Backend.csproj --configuration Release --no-restore

      - name: Publish
        run: dotnet publish $WORKING_DIR/StartingBloch.Backend.csproj -c Release -o ${{github.workspace}}/publish

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ${{ github.workspace }}/publish
```

Secrets requis:
- AZURE_WEBAPP_NAME: nom de l’app (ex: startingbloch-api-xyz)
- AZURE_WEBAPP_PUBLISH_PROFILE: contenu du Publish Profile (Overview → Get publish profile)

## 7) Dépannage
- 500 au démarrage sur base importée PostgreSQL: EF_BASELINE_MIGRATIONS=true, EF_AUTO_MIGRATE=false, EF_TABLES_LOWERCASE=true
- CORS: ajouter l’URL Cloudflare Pages à CORS_ALLOWED_ORIGINS
- JWT: vérifier Jwt__Secret et éventuellement Issuer/Audience
- Santé: /api/health et /api/health/db doivent renvoyer 200
