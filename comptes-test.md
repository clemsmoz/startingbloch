# 🔐 COMPTES DE TEST - STARTINGBLOCH

Ce document répertorie tous les comptes utilisateurs créés par le script de seed pour les tests de l'application.

## 📋 COMPTES GÉNÉRÉS PAR LE SCRIPT SEED

### 🏢 COMPTE CLIENT PRINCIPAL

**Entreprise :** GlobalTech Innovation  
**Type :** Client propriétaire de portefeuille PI  
**Référence :** GTI-2024-001  

#### 👤 Utilisateur Principal
- **Nom complet :** Sophie Laurent
- **Fonction :** Directrice Juridique
- **Username :** `globaltech.admin`
- **Email :** `admin@globaltech-innovation.com`
- **Mot de passe :** `GlobalTech2024!`
- **Rôle :** `Client`
- **Permissions :** 
  - ✅ Lecture (CanRead: true)
  - ✅ Écriture (CanWrite: true)
- **Statut :** ✅ Actif (IsActive: true)
- **Liaison Client :** ✅ Compte lié à l'entité client (ClientId assigné)

---

## 🏢 INFORMATIONS SOCIÉTÉ CLIENT

**GlobalTech Innovation**
- **Adresse :** 123 Innovation Boulevard, 75001 Paris, France
- **Téléphone :** +33 1 55 43 21 87
- **Email :** contact@globaltech-innovation.com
- **Pays :** France
- **Secteur :** Innovation technologique et propriété intellectuelle

---

## 📊 DONNÉES ASSOCIÉES

### 📋 Portefeuille Brevets
- **Nombre de brevets :** 10 brevets de test
- **Technologies couvertes :** IA, IoT, Cybersécurité, Blockchain, AR, Nanotechnologies, Biotechnologies, Énergies Renouvelables, Robotique, Quantique
- **Couverture géographique :** 7-15 pays par brevet

### 👥 Contacts Entreprise
1. **Sophie Laurent** - Directrice Juridique (compte utilisateur principal)
2. **Alexandre Moreau** - Responsable PI
3. **Émilie Dupont** - CTO

### 🏢 Cabinets Partenaires
- **Annuités :** Renouv'IP France, European Patent Renewals Ltd
- **Procédures :** LexIP Avocats, Müller & Associates Patentanwälte

---

## 🔑 UTILISATION DES COMPTES

### Connexion Client
```
URL: http://localhost:3000/login
Username: globaltech.admin
Password: GlobalTech2024!
```

### Fonctionnalités Accessibles
- ✅ Consultation du portefeuille brevets
- ✅ Gestion des contacts
- ✅ Suivi des dépôts internationaux
- ✅ Relations avec les cabinets
- ✅ Modification des informations client

---

## 🛡️ SÉCURITÉ

- **Hachage :** Mots de passe sécurisés avec BCrypt
- **Validation :** Contraintes foreign key respectées
- **Audit :** Timestamps de création/modification
- **Isolation :** Accès restreint aux données du client propriétaire

---

## 🚀 NOTES TECHNIQUES

- **Script source :** `backend-dotnet/Data/SeedMassiveData.cs`
- **Base de données :** Utilise les pays et statuts existants
- **Relations :** Toutes les entités sont correctement liées
- **Transaction :** Création atomique (tout ou rien)

---

*Document généré automatiquement le 5 août 2025*  
*Version : Script SeedMassiveData v2.0 Optimisé*
