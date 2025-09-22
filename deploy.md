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

6) Déployer le zip sur App Service (commande recommandée)

Remplacez `<RESOURCE_GROUP>` et `<APP_NAME>` par vos valeurs.

```powershell
az webapp deploy --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>" --src-path "${PWD}\backend-dotnet\publish.zip"
```

Remarque : la commande `az webapp deployment source config-zip` est dépréciée, `az webapp deploy` la remplace.

7) Démarrer l'app (si elle est arrêtée)

```powershell
az webapp start --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>"
```

8) Vérifier l'endpoint santé (public)

```powershell
Invoke-RestMethod -Uri "https://<APP_NAME>.azurewebsites.net/api/health" -UseBasicParsing | ConvertTo-Json -Depth 4
```

9) Suivre les logs en temps réel (tail)

```powershell
az webapp log tail --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>"
```

10) Lister les WebApps (utile pour retrouver noms exacts)

```powershell
az webapp list --query "[].{name:name,resourceGroup:resourceGroup,location:location}" -o table
```

11) Lister / Inspecter les déploiements (historique Kudu)

```powershell
az webapp deployment list --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>" --query "[].{id:id,status:status,received:receivedTime,message:message}" -o table
```

12) Voir les app settings (connection strings, JWT, CORS, ...)

```powershell
az webapp config appsettings list --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>" -o table
```

13) Activer la collecte de logs côté App Service (si non activée)

```powershell
az webapp log config --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>" --application-logging true --web-server-logging filesystem
```

14) Redémarrer l'application

```powershell
az webapp restart --resource-group "<RESOURCE_GROUP>" --name "<APP_NAME>"
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
