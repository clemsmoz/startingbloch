# Tests du backend StartingBloch

Ce dossier contient **ABSOLUMENT TOUS LES TESTS** pour l'application backend .NET de StartingBloch.

## Structure complète des tests

- `UnitTests/Services/` : tests unitaires des services (logique métier)
- `UnitTests/Controllers/` : tests unitaires des contrôleurs (API)
- `UnitTests/Middleware/` : tests des middlewares (autorisation, gestion d'erreurs)
- `UnitTests/Validators/` : tests des validateurs de DTOs
- `UnitTests/Data/` : tests des relations entre modèles Entity Framework
- `UnitTests/Authorization/` : tests d'autorisation et de rôles
- `UnitTests/Performance/` : tests de performance et d'optimisation
- `IntegrationTests/` : tests d'intégration end-to-end (API + base de données)
- `TestUtils/` : utilitaires de tests (factories, seeders, mocks)

## Types de tests

### 1. Tests unitaires de services ✅
- Vérifient la logique métier de chaque service (CRUD, validation, erreurs)
- Tous les services : `ClientServiceTests`, `BrevetServiceTests`, `ContactServiceTests`, `UserAdminServiceTests`, `DeposantServiceTests`, `InventeurServiceTests`, `TitulaireServiceTests`, `CabinetServiceTests`, `PaysServiceTests`, `NumeroPaysServiceTests`, `StatutsServiceTests`, `LogServiceTests`

### 2. Tests unitaires de contrôleurs ✅
- Vérifient chaque endpoint API indépendamment (statuts HTTP, validation, erreurs)
- Tous les contrôleurs : `ClientControllerTests`, `BrevetControllerTests`, `ContactControllerTests`, `UserAdminControllerTests`, `AuthControllerTests`, `DeposantControllerTests`, `InventeurControllerTests`, `TitulaireControllerTests`, `CabinetControllerTests`, `PaysControllerTests`, `NumeroPaysControllerTests`, `StatutsControllerTests`, `LogControllerTests`

### 3. Tests d'intégration ✅
- Vérifient le fonctionnement complet de l'API avec une base de données en mémoire
- Tests complets : `BrevetControllerIntegrationTests`, `UserAdminControllerIntegrationTests`, `ClientControllerIntegrationTests`, `ContactControllerIntegrationTests`, `CabinetControllerIntegrationTests`, `PaysControllerIntegrationTests`

### 4. Tests de middleware ✅
- `AuthorizationMiddlewareTests` : tests d'autorisation et de rôles
- `ExceptionHandlingMiddlewareTests` : tests de gestion d'erreurs globales

### 5. Tests de validation ✅
- `DtoValidatorTests` : validation des CreateClientDto, CreateBrevetDto, CreateContactDto, etc.
- Tests FluentValidation complets

### 6. Tests de relations de données ✅
- `ModelRelationshipsTests` : relations Many-to-Many, One-to-Many, cascade delete
- Tests Entity Framework complets

### 7. Tests d'autorisation et de sécurité ✅
- `AuthorizationTests` : tests des rôles (Admin, Employee, Client)
- Tests d'accès aux données selon les rôles

### 8. Tests de fonctionnalités avancées ✅
- `PaginationAndSearchIntegrationTests` : pagination, recherche, tri, filtres
- `ImportExportIntegrationTests` : import/export CSV/Excel, traitement par lots

### 9. Tests de performance ✅
- `PerformanceTests` : optimisation requêtes, gestion mémoire, accès concurrent

## Lancer tous les tests

### Sous Windows
```powershell
cd backend-dotnet
./run-tests.bat
```

### Sous Linux/Mac
```bash
cd backend-dotnet
./run-tests.sh
```

### Ou avec dotnet CLI
```bash
cd backend-dotnet
 dotnet test
```

## Bonnes pratiques
- Ajoutez un test pour chaque nouvelle fonctionnalité ou bug corrigé
- Les tests d'intégration simulent des scénarios réels (création, modification, suppression, recherche)
- Les tests unitaires doivent être rapides et isolés

## Structure recommandée

### Tests Unitaires
- `UnitTests/Services/` :
  - `ClientServiceTests.cs` ✅
  - `BrevetServiceTests.cs` ✅
  - `ContactServiceTests.cs` ✅
  - `UserAdminServiceTests.cs` ✅
  - `DeposantServiceTests.cs` ✅
  - `InventeurServiceTests.cs` ✅
  - `TitulaireServiceTests.cs` ✅
  - `CabinetServiceTests.cs` ✅
  - `PaysServiceTests.cs` ✅
  - `NumeroPaysServiceTests.cs` ✅
  - `StatutsServiceTests.cs` ✅
  - `LogServiceTests.cs` ✅

- `UnitTests/Controllers/` :
  - `ClientControllerTests.cs` ✅
  - `BrevetControllerTests.cs` ✅
  - `ContactControllerTests.cs` ✅
  - `UserAdminControllerTests.cs` ✅
  - `AuthControllerTests.cs` ✅
  - `DeposantControllerTests.cs` ✅
  - `InventeurControllerTests.cs` ✅
  - `TitulaireControllerTests.cs` ✅
  - `CabinetControllerTests.cs` ✅
  - `PaysControllerTests.cs` ✅
  - `NumeroPaysControllerTests.cs` ✅
  - `StatutsControllerTests.cs` ✅
  - `LogControllerTests.cs` ✅

- `UnitTests/Middleware/` :
  - `AuthorizationMiddlewareTests.cs` ✅
  - `ExceptionHandlingMiddlewareTests.cs` ✅

- `UnitTests/Validators/` :
  - `DtoValidatorTests.cs` ✅

- `UnitTests/Data/` :
  - `ModelRelationshipsTests.cs` ✅

- `UnitTests/Authorization/` :
  - `AuthorizationTests.cs` ✅

- `UnitTests/Performance/` :
  - `PerformanceTests.cs` ✅

### Tests d'Intégration
- `IntegrationTests/` :
  - `BrevetControllerIntegrationTests.cs` ✅
  - `UserAdminControllerIntegrationTests.cs` ✅
  - `ClientControllerIntegrationTests.cs` ✅
  - `ContactControllerIntegrationTests.cs` ✅
  - `CabinetControllerIntegrationTests.cs` ✅
  - `PaysControllerIntegrationTests.cs` ✅
  - `PaginationAndSearchIntegrationTests.cs` ✅
  - `ImportExportIntegrationTests.cs` ✅

### Utilitaires de Tests
- `TestUtils/` :
  - `TestDbContextFactory.cs` ✅
  - `TestDataSeeder.cs` ✅
  - `StartingBlochWebApplicationFactory.cs` ✅
  - `BaseIntegrationTest.cs` ✅

## Couverture COMPLÈTE ✅
- ✅ **TOUS** les services, contrôleurs, endpoints testés
- ✅ **TOUS** les scénarios d'erreur et validations
- ✅ **TOUTES** les relations entre entités
- ✅ **TOUTE** la pagination, recherche, tri, filtres
- ✅ **TOUT** l'import/export CSV/Excel
- ✅ **TOUTE** l'autorisation et sécurité par rôles
- ✅ **TOUS** les middlewares et gestion d'erreurs
- ✅ **TOUTES** les validations de DTOs
- ✅ **TOUS** les tests de performance et optimisation
- ✅ **TOUS** les tests d'intégration end-to-end

## Scripts d'exécution

### Exécuter TOUS les tests
```bash
# Windows
./run-tests.bat

# Linux/Mac  
./run-tests.sh

# Ou avec dotnet CLI
dotnet test
```

### Exécuter par catégorie
```bash
# Tests unitaires uniquement
dotnet test --filter "Category=Unit"

# Tests d'intégration uniquement  
dotnet test --filter "Category=Integration"

# Tests de performance uniquement
dotnet test --filter "Category=Performance"
```

### Rapport de couverture
```bash
# Générer rapport de couverture
dotnet test --collect:"XPlat Code Coverage"
reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" -targetdir:"TestResults/CoverageReport"
```

---

Pour toute question ou ajout de tests, contactez l'équipe technique.
