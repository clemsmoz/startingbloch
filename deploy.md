# Déploiement (zip) - backend-dotnet

Ce fichier rassemble toutes les commandes PowerShell nécessaires pour :
- publier le backend .NET (depuis la racine du dépôt),
- créer l'archive zip de publication,
- déployer le zip sur Azure App Service,
- vérifier et dépanner le démarrage.

Exécuter les commandes une par une et attendre la fin de chaque commande avant de lancer la suivante.

---

Pré-requis
- .NET 8 SDK installé (dotnet --version)
- Azure CLI installée et configurée (az --version)
- Vous êtes connecté(e) à Azure : `az login`
- Connaître le `resourceGroup` et le `app name` App Service (ex: `rg-startingbloch`, `sb-backend`).

Toutes les commandes ci‑dessous sont écrites pour PowerShell et en supposant que vous travaillez depuis la racine du repo `c:\Users\clems\startingbloch`.

1) Publier le projet (Release)

```powershell
dotnet publish "backend-dotnet/StartingBloch.Backend.csproj" -c Release -o "backend-dotnet/publish"
```

2) Vérifier le contenu publié

```powershell
Test-Path ".\backend-dotnet\publish"
Get-ChildItem -Path ".\backend-dotnet\publish" -Recurse | Measure-Object
```

3) Créer l'archive zip de publication

```powershell
# depuis la racine du repo
Compress-Archive -Path .\backend-dotnet\publish\* -DestinationPath .\backend-dotnet\publish.zip -Force
```

4) Vérifier que le zip existe et sa taille

```powershell
Test-Path .\backend-dotnet\publish.zip
Get-Item .\backend-dotnet\publish.zip | Select-Object Name, Length
```


5) (Connexion Azure) - si nécessaire

```powershell
az login
# si vous avez plusieurs subscriptions :
az account set --subscription "<Ma Subscription>"
```

Variables utilisées dans ce dépôt

```powershell
$RESOURCE_GROUP = "rg-startingbloch"
$APP_NAME = "sb-backend"
```

Si vous ne connaissez pas encore les valeurs ou voulez les retrouver automatiquement :

```powershell
# Lister toutes les WebApps (pour repérer rapidement les noms)
az webapp list --query "[].{name:name,resourceGroup:resourceGroup,location:location}" -o table

# Détecter automatiquement le resourceGroup pour l'app connue et l'assigner en variable
$APP_NAME = "sb-backend"
$RESOURCE_GROUP = (az webapp list --query "[?name=='$($APP_NAME)'].resourceGroup | [0]" -o tsv)
Write-Output "Using resource group: $RESOURCE_GROUP and app name: $APP_NAME"
```

6) Déployer le zip sur App Service (commande recommandée)

```powershell
az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --src-path "${PWD}\backend-dotnet\publish.zip"
```

Remarque : la commande `az webapp deployment source config-zip` est dépréciée, `az webapp deploy` la remplace.

7) Démarrer l'app (si elle est arrêtée)

```powershell
az webapp start --resource-group "$RESOURCE_GROUP" --name "$APP_NAME"
```

8) Vérifier l'endpoint santé (public)

```powershell
Invoke-RestMethod -Uri "https://$APP_NAME.azurewebsites.net/api/health" -UseBasicParsing | ConvertTo-Json -Depth 4
```

9) Suivre les logs en temps réel (tail)

```powershell
az webapp log tail --resource-group "$RESOURCE_GROUP" --name "$APP_NAME"
```

10) Lister les WebApps (utile pour retrouver noms exacts)

```powershell
az webapp list --query "[].{name:name,resourceGroup:resourceGroup,location:location}" -o table
```

11) Lister / Inspecter les déploiements (historique Kudu)

```powershell
az webapp deployment list --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --query "[].{id:id,status:status,received:receivedTime,message:message}" -o table
```

12) Voir les app settings (connection strings, JWT, CORS, ...)

```powershell
az webapp config appsettings list --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" -o table
```

13) Activer la collecte de logs côté App Service (si non activée)

```powershell
az webapp log config --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --application-logging true --web-server-logging filesystem
```

14) Redémarrer l'application

```powershell
az webapp restart --resource-group "$RESOURCE_GROUP" --name "$APP_NAME"
```

15) Dépannage Kudu (accès direct - peut demander credentials SCM)

- Détecteurs/Kudu diagnostics : https://<APP_NAME>.scm.azurewebsites.net/detectors
- Dernier déploiement JSON (Kudu) : https://<APP_NAME>.scm.azurewebsites.net/api/deployments/latest

---

Notes et conseils
- Exécuter une commande à la fois et attendre la fin (surtout publish / deploy).
- Si le déploiement affiche "Warming up Kudu" pendant trop longtemps : vérifier que l'app est démarrée (`az webapp show`) et tailer les logs.
- Si vous voulez automatiser tout ça dans CI, adaptez les chemins et utilisez `actions/setup-dotnet` + `azure/webapps-deploy` ou équivalent.

---

Si vous voulez, je peux :
- ajouter un script PowerShell `deploy.ps1` qui demande les variables et exécute ces étapes séquentiellement (une à la fois),
- ou commiter directement ce `deploy.md` (fait) et créer `deploy.ps1` ensuite.

---

Frontend (Cloudflare Pages - Git-based)

Si votre site front est dans `frontend-v2` et que Cloudflare Pages est configuré pour récupérer automatiquement les pushes sur une branche (par ex. `main` ou `master`), voici les commandes PowerShell utiles pour construire localement, prévisualiser rapidement et pousser sur la branche surveillée.

Remarques :
- Ces commandes sont écrites pour PowerShell (Windows). Elles n'utilisent pas d'opérateur `&&` mais la séquence `; if ($?) { ... }` pour enchaîner proprement.
- Assurez-vous d'avoir Node.js + npm installés et la bonne version mentionnée dans `frontend-v2/package.json`.

1) Aller dans le dossier frontend

```powershell
Set-Location -Path .\frontend-v2
```

2) Installer les dépendances de manière reproductible

```powershell
npm ci
```

3) Build PowerShell-safe

```powershell
npm ci; if ($?) { npm run build } ; if (-not $?) { Write-Error 'Build failed' ; exit 1 }
```

4) Vérifier le contenu de `dist`

```powershell
if (Test-Path .\dist) { Get-ChildItem -Path .\dist -Recurse | Select-Object FullName,Length } else { Write-Host 'dist not found' }
```

5) Prévisualiser localement (vite preview) — utile pour un contrôle rapide

Option A: utiliser vite (installé par devDependencies)

```powershell
npm ci; if ($?) { npx vite preview --port 5173 --strictPort }
```

Option B: servir `dist` statiquement avec un utilitaire simple (si vous préférez)

```powershell
npx serve dist -s
```

6) Pousser sur la branche surveillée par Cloudflare Pages

Remarque: Cloudflare Pages déclenchera automatiquement un build & déploiement lorsqu'un push est reçu sur la branche configurée.

```powershell
# depuis le répertoire racine du repo
Set-Location -Path ..\
git add -A
git commit -m "chore(frontend): build/dist ready for deploy" || Write-Host 'Nothing to commit'
git push origin HEAD
```

7) Points d'attention / variables

- Branche surveillée : vérifiez dans l'interface Cloudflare Pages quelle branche est configurée (ex: `main`).
- Build command côté Pages : gardez `npm ci && npm run build` et le répertoire de sortie `dist`.
- Si vous avez des variables d'environnement (API_URL, etc.), configurez-les dans les Environment variables de Cloudflare Pages (UI) ou en variables de déploiement Git provider.

8) Option : automatiser localement (script PowerShell)

Vous pouvez créer un petit script `frontend-v2/deploy-frontend.ps1` pour exécuter séquentiellement les étapes ci‑dessous :

```powershell
Set-Location -Path $PSScriptRoot
npm ci; if ($?) { npm run build } else { Write-Error 'npm ci failed'; exit 1 }
Set-Location -Path ..\
git add -A
git commit -m "chore(frontend): build dist" || Write-Host 'No changes to commit'
git push origin HEAD
```

---

Si vous voulez, je peux créer ce script `frontend-v2/deploy-frontend.ps1` et committer les changements (ou juste ajouter la section ci-dessus si vous préférez garder le repo inchangé). Indiquez si je dois :
- créer et committer `deploy-frontend.ps1`,
- ou seulement ajouter ces instructions dans `deploy.md` (déjà fait ici).
