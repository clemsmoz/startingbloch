/*
 * ================================================================================================
 * INTERFACE SERVICE ADMINISTRATION UTILISATEURS - CONTRAT GESTION SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service administration utilisateurs StartingBloch réservé admins.
 * Spécification méthodes gestion complète utilisateurs avec permissions et audit.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES ADMIN :
 * =====================================
 * 👥 GESTION UTILISATEURS → CRUD complet avec validation sécurisée
 * 🔐 PERMISSIONS → Attribution et modification droits accès
 * 📊 RAPPORTS → Statistiques et analyses utilisateurs
 * 📋 AUDIT → Traçabilité activités et modifications
 * 🏢 CLIENT-USERS → Gestion comptes clients spécialisés
 * 
 * HIÉRARCHIE UTILISATEURS SYSTÈME :
 * =================================
 * 🔴 ADMIN → Administration complète système
 * 🟠 EMPLOYEE → Personnel interne lecture/écriture
 * 🟡 USER → Personnel interne lecture seule
 * 🔵 CLIENT → Utilisateurs externes accès restreint
 * 🟢 GUEST → Accès consultation limitée
 * 
 * TYPES CRÉATION UTILISATEURS :
 * =============================
 * 👨‍💼 EMPLOYEE → Personnel interne (admin/user)
 * 👤 CLIENT_USER → Utilisateur client existant
 * 🆕 NEW_CLIENT_USER → Nouveau client avec compte
 * 🔄 EXISTING_CLIENT → Compte pour client existant
 * 
 * GESTION PERMISSIONS GRANULAIRES :
 * =================================
 * ✅ CAN_READ → Autorisation lecture données
 * ✅ CAN_WRITE → Autorisation modification données
 * ✅ IS_ACTIVE → Statut activation compte
 * ✅ CLIENT_SPECIFIC → Accès données client spécifique
 * ✅ MULTI_CLIENT → Accès plusieurs clients
 * 
 * RAPPORTS ADMINISTRATIFS :
 * ========================
 * 📊 UTILISATEURS → Liste complète avec statuts
 * 👨‍💼 EMPLOYÉS → Personnel interne uniquement
 * 👥 CLIENTS → Utilisateurs externes uniquement
 * 🏢 PAR_CLIENT → Utilisateurs par client
 * 📋 SANS_COMPTE → Clients sans utilisateur
 * 
 * AUDIT TRAIL COMPLET :
 * =====================
 * 📅 ACTIVITÉ → Historique actions utilisateur
 * 🔍 FILTRAGE → Par dates et types actions
 * 📊 STATISTIQUES → Métriques utilisation système
 * 🔐 SÉCURITÉ → Tentatives accès et modifications
 * 
 * CONTRÔLES SÉCURITÉ ADMIN :
 * ==========================
 * 🔐 AUTHENTICATION → Vérification droits admin
 * 🛡️ AUTHORIZATION → Contrôle permissions actions
 * 🔒 ISOLATION → Protection données sensibles
 * 📊 MONITORING → Surveillance activités admin
 * 
 * VALIDATION DONNÉES MÉTIER :
 * ===========================
 * ✅ Unicité emails utilisateurs système
 * ✅ Cohérence rôles et permissions
 * ✅ Validation associations client-utilisateur
 * ✅ Contrôle contraintes référentielles
 * ✅ Vérification cycles vie utilisateurs
 * 
 * CONFORMITÉ SÉCURITÉ :
 * ====================
 * ✅ RGPD → Protection données personnelles
 * ✅ OWASP → Standards sécurité applications
 * ✅ ISO 27001 → Gestion sécurité information
 * ✅ ANSSI → Recommandations sécurité France
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
/// Interface service administration utilisateurs réservé admins système complet.
/// Contrat gestion complète utilisateurs avec permissions et audit trail sécurisé.
/// </summary>
public interface IUserAdminService
{
    /// <summary>
    /// Récupère liste paginée complète utilisateurs système avec statuts.
    /// Navigation administrative optimisée avec métadonnées complètes.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <returns>Réponse paginée utilisateurs avec informations complètes</returns>
    Task<PagedResponse<List<UserDto>>> GetAllUsersAsync(int page = 1, int pageSize = 10);
    
    /// <summary>
    /// Récupère utilisateur spécifique avec informations détaillées complètes.
    /// Chargement administratif optimisé avec permissions et associations.
    /// </summary>
    /// <param name="userId">Identifiant unique utilisateur recherché</param>
    /// <returns>Utilisateur détaillé avec métadonnées ou null</returns>
    Task<UserDto?> GetUserByIdAsync(int userId);
    
    /// <summary>
    /// Récupère utilisateur par email avec informations détaillées complètes.
    /// Recherche optimisée pour authentification et gestion connexions.
    /// </summary>
    /// <param name="email">Email utilisateur pour recherche</param>
    /// <returns>Utilisateur détaillé avec métadonnées ou null</returns>
    Task<UserDto?> GetUserByEmailAsync(string email);
    
    /// <summary>
    /// Met à jour dernière connexion utilisateur pour audit trail.
    /// Enregistrement sécurisé timestamp dernière activité système.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour mise à jour connexion</param>
    /// <returns>Confirmation mise à jour avec timestamp</returns>
    Task<bool> UpdateLastLoginAsync(int userId);
    
    /// <summary>
    /// Met à jour mot de passe utilisateur avec validation sécurité.
    /// Modification sécurisée avec hachage et contrôle complexité.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour changement mot de passe</param>
    /// <param name="newPassword">Nouveau mot de passe avec validation</param>
    /// <returns>Confirmation modification avec audit trail</returns>
    Task<bool> UpdatePasswordAsync(int userId, string newPassword);
    
    /// <summary>
    /// Crée nouvel utilisateur système avec validation administrative complète.
    /// Création sécurisée avec contrôle unicité et attribution permissions.
    /// </summary>
    /// <param name="createUserDto">Données création utilisateur avec paramètres</param>
    /// <returns>Utilisateur créé avec identifiant et métadonnées</returns>
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
    
    /// <summary>
    /// Met à jour informations utilisateur avec validation administrative.
    /// Modification sécurisée avec contrôle permissions et audit trail.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur à modifier</param>
    /// <param name="updateUserDto">Données modification utilisateur partielles</param>
    /// <returns>Utilisateur modifié avec nouvelles informations ou null</returns>
    Task<UserDto?> UpdateUserAsync(int userId, UpdateUserDto updateUserDto);
    
    /// <summary>
    /// Crée employé interne avec rôle spécifique et permissions.
    /// Création personnel interne avec attribution automatique droits.
    /// </summary>
    /// <param name="createUserDto">Données création employé avec paramètres</param>
    /// <param name="role">Rôle employé (admin ou user interne)</param>
    /// <returns>Employé créé avec rôle assigné et permissions</returns>
    Task<ApiResponse<UserDto>> CreateEmployeeAsync(CreateUserDto createUserDto, string role);
    
    /// <summary>
    /// Crée utilisateur client avec association client spécifique.
    /// Création compte client avec accès restreint données propres.
    /// </summary>
    /// <param name="createUserDto">Données création utilisateur client</param>
    /// <param name="clientId">Identifiant client pour association compte</param>
    /// <returns>Utilisateur client créé avec association validée</returns>
    Task<ApiResponse<UserDto>> CreateClientUserAsync(CreateUserDto createUserDto, int clientId);
    
    /// <summary>
    /// Crée compte utilisateur pour client existant système.
    /// Attribution compte à client sans utilisateur avec validation.
    /// </summary>
    /// <param name="clientId">Identifiant client existant pour compte</param>
    /// <param name="createUserDto">Données création compte utilisateur</param>
    /// <returns>Compte utilisateur créé avec association client</returns>
    Task<ApiResponse<UserDto>> CreateUserAccountForExistingClientAsync(int clientId, CreateUserDto createUserDto);
    
    /// <summary>
    /// Crée nouveau client complet avec compte utilisateur associé.
    /// Création simultanée client et utilisateur avec validation complète.
    /// </summary>
    /// <param name="createClientWithUserDto">Données création client et utilisateur</param>
    /// <returns>Client et utilisateur créés avec association validée</returns>
    Task<ApiResponse<UserDto>> CreateNewClientWithUserAsync(CreateClientWithUserDto createClientWithUserDto);
    
    /// <summary>
    /// Supprime utilisateur système avec validation contraintes référentielles.
    /// Suppression sécurisée avec vérification données associées existantes.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur à supprimer du système</param>
    /// <returns>Confirmation suppression avec audit trail complet</returns>
    Task<ApiResponse<bool>> DeleteUserAsync(int userId);
    
    /// <summary>
    /// Active compte utilisateur avec restauration permissions complètes.
    /// Activation sécurisée avec validation statut et audit trail.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour activation compte</param>
    /// <returns>Confirmation activation avec métadonnées utilisateur</returns>
    Task<ApiResponse<bool>> ActivateUserAsync(int userId);
    
    /// <summary>
    /// Désactive compte utilisateur avec suspension accès système.
    /// Désactivation sécurisée avec préservation données et audit.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour désactivation</param>
    /// <returns>Confirmation désactivation avec audit trail</returns>
    Task<ApiResponse<bool>> DeactivateUserAsync(int userId);
    
    /// <summary>
    /// Met à jour permissions utilisateur avec contrôle granulaire.
    /// Modification sécurisée droits accès avec validation cohérence.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour modification permissions</param>
    /// <param name="canRead">Autorisation lecture données système</param>
    /// <param name="canWrite">Autorisation écriture données système</param>
    /// <returns>Confirmation modification permissions avec audit</returns>
    Task<ApiResponse<bool>> UpdateUserPermissionsAsync(int userId, bool canRead, bool canWrite);
    
    /// <summary>
    /// Assigne utilisateur à client spécifique avec accès restreint.
    /// Association sécurisée avec validation contraintes et permissions.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour assignation client</param>
    /// <param name="clientId">Identifiant client pour association utilisateur</param>
    /// <returns>Confirmation assignation avec métadonnées association</returns>
    Task<ApiResponse<bool>> AssignUserToClientAsync(int userId, int clientId);
    
    /// <summary>
    /// Retire utilisateur de client avec restauration accès général.
    /// Suppression association avec validation contraintes référentielles.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour retrait client</param>
    /// <returns>Confirmation retrait avec audit trail complet</returns>
    Task<ApiResponse<bool>> RemoveUserFromClientAsync(int userId);
    
    /// <summary>
    /// Récupère liste complète employés internes système (admin + user).
    /// Chargement optimisé personnel avec rôles et permissions.
    /// </summary>
    /// <returns>Liste employés internes avec métadonnées complètes</returns>
    Task<ApiResponse<List<UserDto>>> GetEmployeesAsync();
    
    /// <summary>
    /// Récupère liste complète utilisateurs clients externes uniquement.
    /// Chargement optimisé clients avec associations et permissions.
    /// </summary>
    /// <returns>Liste utilisateurs clients avec métadonnées associations</returns>
    Task<ApiResponse<List<UserDto>>> GetClientUsersAsync();
    
    /// <summary>
    /// Récupère utilisateurs associés à client spécifique système.
    /// Chargement optimisé utilisateurs avec permissions client-spécifiques.
    /// </summary>
    /// <param name="clientId">Identifiant client pour recherche utilisateurs</param>
    /// <returns>Liste utilisateurs client avec métadonnées permissions</returns>
    Task<ApiResponse<List<UserDto>>> GetUsersByClientAsync(int clientId);
    
    /// <summary>
    /// Récupère clients système sans compte utilisateur associé.
    /// Identification clients nécessitant création compte pour accès.
    /// </summary>
    /// <returns>Liste clients sans utilisateur avec métadonnées complètes</returns>
    Task<ApiResponse<List<ClientDto>>> GetClientsWithoutUserAccountAsync();
    
    /// <summary>
    /// Récupère historique activité utilisateur avec filtrage temporel.
    /// Audit trail complet avec actions et modifications système.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour historique activité</param>
    /// <param name="fromDate">Date début optionnelle pour filtrage période</param>
    /// <param name="toDate">Date fin optionnelle pour filtrage période</param>
    /// <returns>Historique activité avec métadonnées temporelles</returns>
    Task<ApiResponse<List<LogDto>>> GetUserActivityAsync(int userId, DateTime? fromDate = null, DateTime? toDate = null);
    
    /// <summary>
    /// Récupère nombre utilisateurs associés à client spécifique.
    /// Comptage optimisé pour statistiques et validation contraintes.
    /// </summary>
    /// <param name="clientId">Identifiant client pour comptage utilisateurs</param>
    /// <returns>Nombre utilisateurs associés avec métadonnées</returns>
    Task<ApiResponse<int>> GetUserCountByClientAsync(int clientId);
}

/// <summary>
/// DTO mise à jour permissions utilisateur avec contrôle granulaire accès.
/// Structure données modification droits avec validation sécurisée système.
/// </summary>
public class UpdateUserPermissionsDto
{
    /// <summary>
    /// Autorisation lecture données système selon rôle utilisateur.
    /// </summary>
    public bool CanRead { get; set; } = true;
    
    /// <summary>
    /// Autorisation écriture données système selon permissions.
    /// </summary>
    public bool CanWrite { get; set; } = false;
    
    /// <summary>
    /// Statut activation compte utilisateur système actuel.
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Identifiant client optionnel pour assignation spécifique accès.
    /// </summary>
    public int? ClientId { get; set; }
}
