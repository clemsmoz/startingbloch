@echo off
echo ================================================
echo  TESTS COMPLETS - UNITAIRES + INTÉGRATION
echo ================================================
echo.

:: Navigation vers le dossier des tests
cd ..\backend-dotnet-tests

:: Nettoyage complet
echo [1/5] Nettoyage des builds précédents...
dotnet clean

:: Restauration des packages
echo [2/5] Restauration des packages...
dotnet restore

:: Compilation complète
echo [3/5] Compilation complète...
dotnet build --configuration Release

:: Tests avec couverture de code
echo [4/5] Exécution tests avec couverture...
dotnet test --configuration Release --collect:"XPlat Code Coverage" --logger "console;verbosity=detailed"

:: Génération rapport de couverture (si coverlet installé)
echo [5/5] Génération rapport couverture...
echo (Rapport de couverture généré dans TestResults/)

echo.
echo ================================================
echo   TOUS LES TESTS TERMINÉS
echo ================================================
pause
