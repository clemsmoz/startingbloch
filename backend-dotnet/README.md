# StartingBloch Backend .NET 8

## 🎯 Description

Backend moderne en .NET 8 pour l'application StartingBloch de gestion des brevets. Cette API remplace entièrement le backend Node.js tout en gardant la compatibilité avec le frontend React existant.

## 🏗️ Architecture

- **Framework**: .NET 8 (LTS)
- **Base de données**: SQLite (compatible avec l'existant)
- **ORM**: Entity Framework Core 8
- **Architecture**: Clean Architecture avec DTOs, Services, Controllers
- **Sécurité**: Authentification par rôles (Admin, User, Client)
- **Documentation**: Swagger/OpenAPI

## 📁 Structure du projet

```
backend-dotnet/
├── Controllers/          # Contrôleurs API
│   ├── ClientController.cs
│   ├── BrevetController.cs
│   └── UserAdminController.cs
├── Models/              # Entités de base de données
│   ├── Client.cs
│   ├── Brevet.cs
│   ├── User.cs
│   └── ...
├── DTOs/               # Objets de transfert de données
│   ├── ClientDTOs.cs
│   ├── BrevetDTOs.cs
│   └── UserDTOs.cs
├── Services/           # Logique métier
│   ├── ClientService.cs
│   ├── BrevetService.cs
│   └── UserAdminService.cs
├── Data/              # Configuration EF Core
│   └── StartingBlochDbContext.cs
├── Middleware/        # Middlewares personnalisés
└── Extensions/        # Extensions et configuration
```

## 🚀 Démarrage rapide

### Prérequis
- .NET 8 SDK
- VS Code ou Visual Studio

### Installation

1. **Cloner et naviguer**
```bash
cd backend-dotnet
```

2. **Restaurer les packages**
```bash
dotnet restore
```

3. **Créer la base de données**
```bash
dotnet ef database update
```

4. **Démarrer l'application**
```bash
dotnet run
```

L'API sera disponible sur :
- HTTPS: https://localhost:7000
- HTTP: http://localhost:5000
- Swagger: https://localhost:7000/swagger

## 🔧 Configuration

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=database.sqlite"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

## 📋 Fonctionnalités principales

### 🏢 Gestion des clients
- ✅ CRUD complet des clients
- ✅ Recherche et filtrage
- ✅ Gestion des permissions (lecture/écriture)
- ✅ Association avec cabinets d'avocats

### 📄 Gestion des brevets
- ✅ CRUD complet des brevets
- ✅ Gestion des statuts et échéances
- ✅ Association clients/inventeurs/titulaires
- ✅ Filtres par pays, statut, etc.

### 👥 Gestion des utilisateurs (Admin)
- ✅ Création d'utilisateurs pour clients existants
- ✅ Création simultanée client + utilisateur
- ✅ Gestion des rôles (Admin/User/Client)
- ✅ Activation/désactivation des comptes

## 🔐 Système de rôles

### Admin
- Accès complet à tous les clients et brevets
- Création/modification d'utilisateurs
- Gestion des permissions

### User (Employé)
- Accès aux clients et brevets internes
- Droit d'écriture contrôlé via un flag `canWrite`
- Pas de gestion d'utilisateurs

### Client
- Accès uniquement à ses propres données (portefeuille associé)
- Lecture par défaut; droit d'écriture contrôlé via `canWrite`

Notes importantes:
- Les rôles affichés côté frontend proviennent de la table `Roles` (endpoint `/api/roles`).
- La lecture/écriture est gérée par les flags `canRead`/`canWrite`.

## 🛠️ API Endpoints

### Clients
```
GET    /api/clients              # Liste des clients
POST   /api/clients              # Créer un client
GET    /api/clients/{id}         # Détails d'un client
PUT    /api/clients/{id}         # Modifier un client
DELETE /api/clients/{id}         # Supprimer un client
```

### Brevets
```
GET    /api/brevets              # Liste des brevets
POST   /api/brevets              # Créer un brevet
GET    /api/brevets/{id}         # Détails d'un brevet
PUT    /api/brevets/{id}         # Modifier un brevet
DELETE /api/brevets/{id}         # Supprimer un brevet
```

### Administration (Admin uniquement)
```
GET    /api/admin/users                              # Liste des utilisateurs
POST   /api/admin/create-employee                    # Créer employé (admin/user) avec canWrite
POST   /api/admin/create-client-account              # Créer utilisateur pour client existant
POST   /api/admin/create-new-client-with-user        # Créer client + utilisateur
PUT    /api/admin/user/{userId}/permissions          # Modifier droits (canRead/canWrite)
PUT    /api/admin/user/{userId}/activate             # Activer un utilisateur
PUT    /api/admin/user/{userId}/deactivate           # Désactiver un utilisateur
POST   /api/admin/user/{userId}/assign-client/{clientId}  # Assigner un client à un utilisateur
POST   /api/admin/user/{userId}/remove-client             # Retirer l'association client
GET    /api/admin/clients-without-account            # Clients sans compte utilisateur

### Référentiel de rôles
GET    /api/roles                                    # Rôles issus de la DB (AdminOnly)
```

## 🧪 Tests

### Test manuel avec PowerShell
```bash
.\test-api.ps1
```

### Test de santé
```bash
curl https://localhost:7000/api/health
```

## 🔄 Migration depuis Node.js

L'API .NET est entièrement compatible avec le frontend React existant :

1. **Mêmes endpoints** : URLs identiques
2. **Même format JSON** : Structures de données conservées
3. **Même base de données** : SQLite existante utilisée
4. **CORS configuré** : Frontend React supporté

### Étapes de migration
1. Arrêter le backend Node.js
2. Démarrer le backend .NET : `dotnet run`
3. Le frontend React continue de fonctionner sans modification

## 📚 Développement

### Ajouter un nouveau modèle
1. Créer l'entité dans `Models/`
2. Ajouter au `DbContext`
3. Créer les DTOs dans `DTOs/`
4. Implémenter le service dans `Services/`
5. Créer le contrôleur dans `Controllers/`

### Migrations Entity Framework
```bash
# Ajouter une migration
dotnet ef migrations add NomDeLaMigration

# Appliquer les migrations
dotnet ef database update
```

## 🏷️ Version

**Version actuelle**: 1.0.0
- ✅ Backend .NET 8 fonctionnel
- ✅ Compatibilité frontend React
- ✅ Système de rôles complet
- ✅ Gestion avancée des utilisateurs

## 🤝 Contribution

1. Respecter l'architecture Clean Architecture
2. Utiliser les DTOs pour les transferts de données
3. Implémenter les interfaces pour les services
4. Ajouter les attributs d'autorisation appropriés
5. Documenter les nouveaux endpoints dans Swagger
