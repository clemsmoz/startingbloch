/*
 * ================================================================================================
 * INTERFACE SERVICE RÔLES - CONTRAT GESTION PERMISSIONS ET AUTORISATIONS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service rôles StartingBloch définissant gestion permissions.
 * Spécification méthodes contrôle accès et autorisations selon rôles utilisateurs.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération rôles avec pagination
 * 🔍 DÉTAIL → Accès rôle spécifique avec permissions
 * 👥 ATTRIBUTION → Assignation rôles utilisateurs avec contexte
 * ❌ RETRAIT → Suppression rôles utilisateurs avec validation
 * 🔒 VÉRIFICATION → Contrôle permissions selon rôles
 * 📊 ACCÈS DONNÉES → Filtrage données selon autorisations
 * 
 * HIÉRARCHIE RÔLES SYSTÈME :
 * ==========================
 * 🔴 ADMIN → Accès total système et gestion utilisateurs
 * 🟠 EMPLOYEE → Accès lecture/écriture données internes
 * 🟡 USER → Accès lecture données selon assignations
 * 🔵 CLIENT → Accès restreint données propres uniquement
 * 🟢 GUEST → Accès consultation publique limitée
 * 
 * PERMISSIONS GRANULAIRES :
 * ========================
 * ✅ LECTURE → Consultation données selon rôle et contexte
 * ✅ ÉCRITURE → Modification données selon autorisations
 * ✅ SUPPRESSION → Suppression données selon niveau accès
 * ✅ ADMINISTRATION → Gestion utilisateurs et configuration
 * ✅ CLIENT-SPECIFIC → Accès données client spécifique
 * 
 * CONTRÔLES SÉCURITÉ :
 * ===================
 * 🔐 AUTHENTICATION → Vérification identité utilisateur
 * 🛡️ AUTHORIZATION → Contrôle permissions selon rôle
 * 🔒 ISOLATION → Séparation données selon contexte
 * 📊 AUDIT → Traçabilité accès et modifications
 * 
 * GESTION CONTEXTE CLIENT :
 * ========================
 * ✅ Multi-tenant support avec isolation données
 * ✅ Permissions client-spécifiques granulaires
 * ✅ Héritage permissions selon hiérarchie
 * ✅ Validation accès selon assignations
 * 
 * CONFORMITÉ SÉCURITÉ :
 * ====================
 * ✅ RBAC → Role-Based Access Control standard
 * ✅ PRINCIPLE OF LEAST PRIVILEGE → Accès minimal requis
 * ✅ SEGREGATION OF DUTIES → Séparation responsabilités
 * ✅ DEFENSE IN DEPTH → Sécurité multi-niveaux
 * 
 * CONFORMITÉ ARCHITECTURALE :
 * ==========================
 * ✅ Pattern Repository avec abstraction complète
 * ✅ Injection dépendances via interface
 * ✅ Séparation responsabilités métier/données
 * ✅ Testabilité maximale via contrats
 * ✅ Évolutivité garantie par découplage
 * 
 * ================================================================================================
 */

using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service métier gestion rôles et permissions système complet.
/// Contrat sécurisé contrôle accès avec hiérarchie rôles et isolation client.
/// </summary>
public interface IRoleService
{
    /// <summary>
    /// Récupère liste paginée rôles système avec informations complètes.
    /// Navigation optimisée rôles avec permissions et descriptions.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <returns>Réponse paginée rôles avec métadonnées permissions</returns>
    Task<PagedResponse<List<RoleDto>>> GetRolesAsync(int page = 1, int pageSize = 10);
    
    /// <summary>
    /// Récupère rôle spécifique avec permissions détaillées complètes.
    /// Chargement optimisé rôle avec hiérarchie et autorisations.
    /// </summary>
    /// <param name="id">Identifiant unique rôle recherché</param>
    /// <returns>Rôle détaillé avec permissions complètes ou erreur</returns>
    Task<ApiResponse<RoleDto>> GetRoleByIdAsync(int id);
    
    /// <summary>
    /// Assigne rôle à utilisateur avec contexte client optionnel.
    /// Attribution sécurisée avec validation permissions administrateur.
    /// </summary>
    /// <param name="assignRoleDto">Données assignation rôle avec contexte</param>
    /// <returns>Attribution rôle créée avec métadonnées complètes</returns>
    Task<ApiResponse<UserRoleDto>> AssignRoleToUserAsync(AssignRoleDto assignRoleDto);
    
    /// <summary>
    /// Retire rôle utilisateur avec validation contexte client.
    /// Suppression sécurisée attribution avec contrôle permissions.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour retrait rôle</param>
    /// <param name="roleId">Identifiant rôle à retirer utilisateur</param>
    /// <param name="clientId">Identifiant client optionnel pour contexte</param>
    /// <returns>Confirmation succès retrait rôle avec audit</returns>
    Task<ApiResponse<bool>> RemoveRoleFromUserAsync(int userId, int roleId, int? clientId = null);
    
    /// <summary>
    /// Récupère liste complète rôles assignés utilisateur spécifique.
    /// Chargement optimisé attributions avec contextes clients multiples.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour recherche rôles</param>
    /// <returns>Liste rôles utilisateur avec contextes clients</returns>
    Task<ApiResponse<List<UserRoleDto>>> GetUserRolesAsync(int userId);
    
    /// <summary>
    /// Vérifie statut administrateur utilisateur système complet.
    /// Contrôle permissions administratives globales toutes fonctionnalités.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification admin</param>
    /// <returns>Statut booléen permissions administrateur système</returns>
    Task<bool> IsAdminAsync(int userId);
    
    /// <summary>
    /// Vérifie statut employé utilisateur (admin ou user interne).
    /// Contrôle accès fonctionnalités internes selon hiérarchie.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification employé</param>
    /// <returns>Statut booléen permissions employé interne</returns>
    Task<bool> IsEmployeeAsync(int userId);
    
    /// <summary>
    /// Vérifie statut utilisateur client avec accès restreint.
    /// Contrôle accès données propres client uniquement.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification client</param>
    /// <returns>Statut booléen permissions utilisateur client</returns>
    Task<bool> IsClientUserAsync(int userId);
    
    /// <summary>
    /// Vérifie accès utilisateur à données client spécifique.
    /// Contrôle permissions selon assignations et contexte client.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification accès</param>
    /// <param name="clientId">Identifiant client pour contrôle accès</param>
    /// <returns>Autorisation booléenne accès données client</returns>
    Task<bool> UserHasAccessToClientAsync(int userId, int clientId);
    
    /// <summary>
    /// Vérifie permissions écriture utilisateur selon rôles.
    /// Contrôle autorisations modification données système.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification écriture</param>
    /// <returns>Autorisation booléenne permissions écriture</returns>
    Task<bool> UserCanWriteAsync(int userId);
    
    /// <summary>
    /// Vérifie permissions lecture utilisateur selon rôles.
    /// Contrôle autorisations consultation données système.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification lecture</param>
    /// <returns>Autorisation booléenne permissions lecture</returns>
    Task<bool> UserCanReadAsync(int userId);
    
    /// <summary>
    /// Récupère brevets accessibles utilisateur selon permissions.
    /// Filtrage automatique données selon rôles et assignations.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour filtrage brevets</param>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <returns>Brevets autorisés avec pagination selon permissions</returns>
    Task<ApiResponse<List<BrevetDto>>> GetUserAccessibleBrevetsAsync(int userId, int page = 1, int pageSize = 10);
    
    /// <summary>
    /// Récupère clients accessibles utilisateur selon permissions.
    /// Filtrage automatique clients selon rôles et assignations.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour filtrage clients</param>
    /// <returns>Clients autorisés selon permissions utilisateur</returns>
    Task<ApiResponse<List<ClientDto>>> GetUserAccessibleClientsAsync(int userId);
}
