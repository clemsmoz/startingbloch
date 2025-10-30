# Script PowerShell pour tests API StartingBloch
# ================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   TESTS API STARTINGBLOCH BACKEND" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigation vers le dossier des tests
Set-Location "..\backend-dotnet-tests"

try {
    # Restauration et compilation
    Write-Host "[1/3] Restauration des packages..." -ForegroundColor Green
    dotnet restore --quiet
    
    Write-Host "[2/3] Compilation des tests..." -ForegroundColor Green
    dotnet build --no-restore --quiet
    
    # Lancement des tests avec filtrage possible
    Write-Host "[3/3] Exécution des tests..." -ForegroundColor Green
    Write-Host ""
    
    # Tests avec filtre si argument fourni
    if ($args.Count -gt 0) {
        $filter = $args[0]
        Write-Host "Filtre appliqué: $filter" -ForegroundColor Yellow
        dotnet test --no-build --filter $filter --verbosity normal
    } else {
        dotnet test --no-build --verbosity normal
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   TESTS TERMINÉS AVEC SUCCÈS" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
}
catch {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "   ERREUR LORS DES TESTS" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    exit 1
}

# Retour au répertoire original
Set-Location "..\backend-dotnet"
