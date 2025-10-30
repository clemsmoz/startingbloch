@echo off
echo ================================================
echo   LANCEMENT TESTS UNITAIRES STARTINGBLOCH
echo ================================================
echo.

:: Navigation vers le dossier des tests
cd ..\backend-dotnet-tests

:: Restauration des packages si nécessaire
echo [1/3] Restauration des packages...
dotnet restore

:: Compilation du projet de tests
echo [2/3] Compilation des tests...
dotnet build --no-restore

:: Lancement des tests avec rapport détaillé
echo [3/3] Exécution des tests...
echo.
dotnet test --no-build --verbosity normal --logger "console;verbosity=detailed"

:: Pause pour voir les résultats
echo.
echo ================================================
echo   TESTS TERMINÉS - Appuyez sur une touche...
echo ================================================
pause
