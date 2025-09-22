/**
 * ============================================================================
 * STARTING BLOCH - CONTRÔLEUR D'ADMINISTRATION DES UTILISATEURS
 * ============================================================================
 * 
 * Contrôleur responsable de l'administration complète des utilisateurs dans
 * l'écosystème de propriété intellectuelle. Gère les comptes employés, clients,
 * permissions, et toutes les opérations d'administration système critiques.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Administration complète des comptes utilisateurs (employés et clients)
 * • Gestion des permissions et rôles selon hiérarchie organisationnelle
 * • Création et liaison comptes clients avec entités commerciales
 * • Monitoring activité utilisateurs et audit trail complet
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Accès exclusif administrateur (AdminOnly) pour toutes les opérations
 * • Validation rigoureuse permissions selon principe moindre privilège
 * • Audit trail complet des modifications pour conformité RGPD
 * • Chiffrement des données personnelles selon standards internationaux
 * 
 * ARCHITECTURE SÉCURISÉE:
 * • Middleware d'authentification JWT avec validation tokens administrateur
 * • Rate limiting renforcé pour prévention attaques sur comptes privilégiés
 * • Headers de sécurité maximum (HSTS, CSP, CSRF protection)
 * • Monitoring temps réel avec alertes automatiques pour actions critiques
 * • Chiffrement AES-256 des données sensibles en transit et repos
 * • Audit trail complet avec signatures numériques pour traçabilité légale
 * • Validation input rigoureuse avec sanitization pour prévention injections
 * • Protection contre élévation privilèges et attaques communes
 * 
 * IMPACT BUSINESS:
 * Contrôleur critique pour sécurité système et gouvernance utilisateurs.
 * Essentiel pour conformité réglementaire, audit et gestion des accès privilégiés.
 * 
 * @version 1.0.0
 * @since 2024
 * @author Starting Bloch Development Team
 */

using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Middleware;

namespace StartingBloch.Backend.Controllers;

/**
 * Contrôleur d'administration des utilisateurs et gestion des permissions
 * 
 * Responsabilités principales:
 * - Administration complète des comptes utilisateurs système
 * - Gestion des permissions et rôles selon hiérarchie sécurisée
 * - Liaison comptes clients avec entités commerciales
 * - Monitoring et audit des activités utilisateurs critiques
 */
[ApiController]
[Route("api/admin/[controller]")]
[AdminOnly] // Toutes les actions de ce contrôleur nécessitent le rôle admin
public class UserAdminController : ControllerBase
{
    /// <summary>
    /// Service d'administration des utilisateurs avec gestion permissions avancée
    /// Fournit fonctionnalités CRUD et administration sécurisée des comptes
    /// </summary>
    private readonly IUserAdminService _userAdminService;
    
    /// <summary>
    /// Service de gestion des clients pour liaison avec comptes utilisateurs
    /// Assure cohérence entre entités commerciales et comptes d'accès
    /// </summary>
    private readonly IClientService _clientService;

    /// <summary>
    /// Initialise le contrôleur d'administration avec injection de dépendance
    /// 
    /// Configure l'accès aux services d'administration pour:
    /// - Gestion sécurisée des comptes utilisateurs système
    /// - Administration des permissions selon principe moindre privilège
    /// - Liaison comptes clients avec entités commerciales
    /// - Audit trail complet des opérations administratives
    /// </summary>
    /// <param name="userAdminService">Service d'administration des utilisateurs</param>
    /// <param name="clientService">Service de gestion des clients</param>
    public UserAdminController(IUserAdminService userAdminService, IClientService clientService)
    {
        _userAdminService = userAdminService;
        _clientService = clientService;
    }

    /// <summary>
    /// Récupère tous les utilisateurs système avec pagination administrative
    /// 
    /// Fonctionnalité Métier:
    /// - Vue d'ensemble complète de tous les comptes utilisateurs
    /// - Pagination optimisée pour gestion de grandes bases utilisateurs
    /// - Monitoring global des accès et permissions système
    /// - Support audit et conformité réglementaire RGPD
    /// 
    /// Sécurité et Conformité:
    /// - Accès exclusif administrateur pour protection données sensibles
    /// - Chiffrement des données personnelles selon standards RGPD
    /// - Audit trail des consultations pour traçabilité administrative
    /// - Masquage automatique des informations critiques sensibles
    /// 
    /// Cas d'Usage:
    /// - Audit complet des comptes pour conformité réglementaire
    /// - Analyse activité utilisateurs pour optimisation système
    /// - Génération rapports administratifs pour direction
    /// - Support investigation sécurité et incidents
    /// </summary>
    /// <param name="page">Numéro de page pour pagination administrative</param>
    /// <param name="pageSize">Nombre d'utilisateurs par page</param>
    /// <returns>Page d'utilisateurs avec métadonnées administratives complètes</returns>
    [HttpGet("users")]
    public async Task<ActionResult<PagedResponse<List<UserDto>>>> GetAllUsers(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var result = await _userAdminService.GetAllUsersAsync(page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Récupère les employés StartingBloch (personnel interne avec permissions avancées)
    /// Cas d'usage: Gestion équipe interne, attribution permissions, monitoring activité employés
    /// Sécurité: Accès admin exclusif, audit trail, protection données personnelles RH
    /// </summary>
    [HttpGet("employees")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetEmployees()
    {
        var result = await _userAdminService.GetEmployeesAsync();
        return Ok(result);
    }

    /// <summary>
    /// Récupère les utilisateurs clients avec accès aux données de propriété intellectuelle
    /// 
    /// Fonctionnalité Métier:
    /// - Vue d'ensemble des comptes clients ayant accès au système
    /// - Monitoring des utilisateurs externes avec permissions spécifiques
    /// - Gestion des accès clients pour portfolio de brevets
    /// - Support audit des consultations clients pour conformité
    /// 
    /// Sécurité et Conformité:
    /// - Accès administrateur exclusif pour protection données clients
    /// - Audit trail des consultations pour traçabilité RGPD
    /// - Chiffrement des informations commerciales sensibles
    /// - Masquage automatique des données critiques clients
    /// 
    /// Cas d'Usage:
    /// - Audit accès clients pour conformité réglementaire
    /// - Gestion permissions consultation brevets par client
    /// - Support investigation activité suspecte clients
    /// - Génération rapports activité pour direction commerciale
    /// </summary>
    [HttpGet("client-users")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetClientUsers()
    {
        var result = await _userAdminService.GetClientUsersAsync();
        return Ok(result);
    }

    /// <summary>
    /// Récupère les clients sans compte utilisateur (opportunités d'activation)
    /// 
    /// Fonctionnalité Métier:
    /// - Identification des clients sans accès numérique au système
    /// - Opportunités d'expansion des services numériques clients
    /// - Vue clients potentiels pour création comptes d'accès
    /// - Support stratégie digitalisation portefeuille client
    /// 
    /// Sécurité et Conformité:
    /// - Accès administrateur pour protection données commerciales
    /// - Validation existence clients avant proposition création compte
    /// - Audit trail pour traçabilité processus d'activation
    /// - Protection informations stratégiques portefeuille client
    /// 
    /// Cas d'Usage:
    /// - Identification clients éligibles pour accès numérique
    /// - Campagne activation comptes pour améliorer service
    /// - Analyse gaps digitalisation portefeuille client
    /// - Support expansion services numériques propriété intellectuelle
    /// </summary>
    [HttpGet("clients-without-account")]
    public async Task<ActionResult<ApiResponse<List<ClientDto>>>> GetClientsWithoutUserAccount()
    {
        var result = await _clientService.GetClientsWithoutUserAccountAsync();
        return Ok(result);
    }

    /// <summary>
    /// Récupère le statut d'activation compte d'un client spécifique
    /// 
    /// Fonctionnalité Métier:
    /// - Vérification rapide du statut numérique d'un client
    /// - Validation existence et état compte d'accès client
    /// - Support prise de décision activation/désactivation
    /// - Monitoring état digitalisation par client individuel
    /// 
    /// Sécurité et Conformité:
    /// - Validation existence client avant révélation statut
    /// - Audit trail des consultations statut pour traçabilité
    /// - Protection informations sensibles état compte client
    /// - Conformité RGPD pour accès données personnelles client
    /// 
    /// Cas d'Usage:
    /// - Vérification rapide avant création nouveau compte client
    /// - Support client pour résolution problèmes d'accès
    /// - Audit état activation pour conformité commerciale
    /// - Validation préalable pour opérations compte client
    /// </summary>
    /// <param name="clientId">Identifiant unique du client pour vérification statut</param>
    /// <returns>Statut complet du compte utilisateur associé au client</returns>
    [HttpGet("client/{clientId}/status")]
    public async Task<ActionResult<ApiResponse<ClientWithUserStatusDto>>> GetClientWithUserStatus(int clientId)
    {
        var result = await _clientService.GetClientWithUserStatusAsync(clientId);
        
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Crée un employé StartingBloch avec permissions et rôle spécifiques
    /// 
    /// Fonctionnalité Métier:
    /// - Création sécurisée d'un compte employé interne (admin ou user)
    /// - Attribution automatique permissions selon rôle organisationnel
    /// - Intégration avec hiérarchie sécurisée des accès internes
    /// - Configuration optimale pour workflow propriété intellectuelle
    /// 
    /// Sécurité et Conformité:
    /// - Validation rigoureuse données personnelles et mots de passe
    /// - Attribution permissions selon principe moindre privilège
    /// - Audit trail complet création pour traçabilité RH
    /// - Chiffrement automatique informations sensibles employé
    /// 
    /// Cas d'Usage:
    /// - Intégration nouveau collaborateur avec accès approprié
    /// - Création compte administrateur pour gestion système
    /// - Attribution permissions employé pour workflow brevets
    /// - Expansion équipe avec contrôle sécurisé des accès
    /// </summary>
    /// <param name="createEmployeeDto">Données création employé avec rôle et permissions</param>
    /// <returns>Compte employé créé avec identifiant et permissions configurées</returns>
    [HttpPost("create-employee")]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateEmployee(
        [FromBody] CreateEmployeeDto createEmployeeDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()
            });
        }

        var userDto = new CreateUserDto
        {
            Username = createEmployeeDto.Username,
            Email = createEmployeeDto.Email,
            Password = createEmployeeDto.Password,
            CanWrite = createEmployeeDto.CanWrite,
            IsActive = createEmployeeDto.IsActive
        };

        var result = await _userAdminService.CreateEmployeeAsync(userDto, createEmployeeDto.Role);
        
        if (!result.Success)
            return BadRequest(result);
            
        return CreatedAtAction(nameof(GetAllUsers), result);
    }

    /// <summary>
    /// Crée un compte utilisateur pour un client existant (activation numérique)
    /// 
    /// Fonctionnalité Métier:
    /// - Activation accès numérique pour client existant sans compte
    /// - Liaison sécurisée entre entité commerciale et compte d'accès
    /// - Attribution permissions client pour consultation brevets
    /// - Digitalisation relation client avec accès personnalisé
    /// 
    /// Sécurité et Conformité:
    /// - Validation existence client et absence compte préexistant
    /// - Vérification unicité pour éviter duplications critiques
    /// - Audit trail complet liaison client-compte pour traçabilité
    /// - Chiffrement données personnelles selon standards RGPD
    /// 
    /// Cas d'Usage:
    /// - Client existant demande accès numérique à son portefeuille
    /// - Activation compte suite signature contrat services numériques
    /// - Migration client vers plateforme digitale propriété intellectuelle
    /// - Expansion services avec accès personnalisé client
    /// </summary>
    /// <param name="createUserForClientDto">Données création compte pour client existant</param>
    /// <returns>Compte utilisateur créé et lié au client spécifié</returns>
    [HttpPost("create-client-account")]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateClientAccount(
        [FromBody] CreateUserForClientDto createUserForClientDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()
            });
        }

        // Vérifier que le client existe et n'a pas déjà de compte
        var clientExists = await _clientService.GetClientByIdAsync(createUserForClientDto.ClientId);
        if (!clientExists.Success)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Client non trouvé"
            });
        }

        var hasAccount = await _clientService.ClientHasUserAccountAsync(createUserForClientDto.ClientId);
        if (hasAccount.Success && hasAccount.Data)
        {
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Ce client a déjà un compte utilisateur"
            });
        }

        var userDto = new CreateUserDto
        {
            Username = createUserForClientDto.Username,
            Email = createUserForClientDto.Email,
            Password = createUserForClientDto.Password,
            CanWrite = createUserForClientDto.CanWrite,
            IsActive = createUserForClientDto.IsActive
        };

        var result = await _userAdminService.CreateUserAccountForExistingClientAsync(
            createUserForClientDto.ClientId, userDto);
        
        if (!result.Success)
            return BadRequest(result);
            
        return CreatedAtAction(nameof(GetAllUsers), result);
    }

    /// <summary>
    /// Crée simultanément un nouveau client et son compte utilisateur (opération complète)
    /// 
    /// Fonctionnalité Métier:
    /// - Création atomique client commercial + compte d'accès numérique
    /// - Onboarding complet nouveau client avec accès immédiat
    /// - Liaison automatique entité commerciale et compte utilisateur
    /// - Optimisation workflow acquisition client avec digitalisation
    /// 
    /// Sécurité et Conformité:
    /// - Transaction atomique pour cohérence données client-compte
    /// - Validation complète données commerciales et personnelles
    /// - Audit trail complet création pour traçabilité commerciale
    /// - Chiffrement toutes informations sensibles selon standards
    /// 
    /// Cas d'Usage:
    /// - Acquisition nouveau client avec accès numérique immédiat
    /// - Onboarding express pour services propriété intellectuelle
    /// - Création compte commercial et technique en une opération
    /// - Optimisation processus vente avec activation automatique
    /// </summary>
    /// <param name="createClientWithUserDto">Données création client complet avec compte</param>
    /// <returns>Compte utilisateur créé pour le nouveau client commercial</returns>
    [HttpPost("create-new-client-with-user")]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateNewClientWithUser(
        [FromBody] CreateClientWithUserDto createClientWithUserDto)
    {
        Console.WriteLine($"🎯 ENDPOINT APPELÉ - create-new-client-with-user: {createClientWithUserDto.NomClient}");
        
        if (!ModelState.IsValid)
        {
            Console.WriteLine("❌ ModelState invalide");
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()
            });
        }

        var result = await _userAdminService.CreateNewClientWithUserAsync(createClientWithUserDto);
        
        if (!result.Success)
            return BadRequest(result);
            
        return CreatedAtAction(nameof(GetAllUsers), result);
    }

    /// <summary>
    /// Met à jour les permissions d'accès d'un utilisateur (gestion fine des droits)
    /// 
    /// Fonctionnalité Métier:
    /// - Modification granulaire des permissions utilisateur (lecture/écriture)
    /// - Adaptation droits d'accès selon évolution rôle ou responsabilités
    /// - Gestion dynamique des autorisations système
    /// - Support principe moindre privilège pour sécurité optimale
    /// 
    /// Sécurité et Conformité:
    /// - Validation existence utilisateur avant modification permissions
    /// - Audit trail détaillé des changements pour traçabilité
    /// - Contrôle administrateur exclusif pour modifications critiques
    /// - Vérification cohérence permissions avec rôle organisationnel
    /// 
    /// Cas d'Usage:
    /// - Promotion employé avec extension permissions d'écriture
    /// - Restriction accès suite changement fonction ou départ
    /// - Ajustement permissions client selon contrat services
    /// - Gestion temporaire accès pour projets spécifiques
    /// </summary>
    /// <param name="userId">Identifiant unique de l'utilisateur</param>
    /// <param name="permissionsDto">Nouvelles permissions à appliquer (lecture/écriture)</param>
    /// <returns>Confirmation de mise à jour des permissions utilisateur</returns>
    [HttpPut("user/{userId}/permissions")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateUserPermissions(
        int userId,
        [FromBody] UpdateUserPermissionsDto permissionsDto)
    {
        var result = await _userAdminService.UpdateUserPermissionsAsync(
            userId, permissionsDto.CanRead, permissionsDto.CanWrite);
        
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Active un compte utilisateur (restauration accès système)
    /// 
    /// Fonctionnalité Métier:
    /// - Réactivation accès utilisateur suite suspension temporaire
    /// - Restauration complète permissions selon profil utilisateur
    /// - Support retour employé ou réactivation compte client
    /// - Gestion lifecycle compte avec activation contrôlée
    /// 
    /// Sécurité et Conformité:
    /// - Validation existence utilisateur avant activation
    /// - Audit trail complet de l'activation pour traçabilité
    /// - Vérification autorisation administrative pour activation
    /// - Contrôle cohérence activation avec statut organisationnel
    /// 
    /// Cas d'Usage:
    /// - Retour employé après congé ou suspension temporaire
    /// - Réactivation compte client après résolution litige
    /// - Activation compte créé en attente validation
    /// - Restauration accès après correction problème technique
    /// </summary>
    /// <param name="userId">Identifiant unique de l'utilisateur à activer</param>
    /// <returns>Confirmation d'activation du compte utilisateur</returns>
    [HttpPut("user/{userId}/activate")]
    public async Task<ActionResult<ApiResponse<bool>>> ActivateUser(int userId)
    {
        var result = await _userAdminService.ActivateUserAsync(userId);
        
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Désactive un compte utilisateur (suspension sécurisée d'accès)
    /// 
    /// Fonctionnalité Métier:
    /// - Suspension temporaire ou permanente accès utilisateur
    /// - Blocage immédiat connexions sans suppression données
    /// - Gestion départs employés ou suspension comptes clients
    /// - Préservation données avec révocation accès système
    /// 
    /// Sécurité et Conformité:
    /// - Validation existence utilisateur avant désactivation
    /// - Audit trail complet de la désactivation pour traçabilité
    /// - Révocation immédiate sessions actives utilisateur
    /// - Préservation données conformément réglementations RGPD
    /// 
    /// Cas d'Usage:
    /// - Départ employé avec préservation historique activité
    /// - Suspension temporaire compte client pour investigation
    /// - Blocage préventif suite détection activité suspecte
    /// - Désactivation automatique suite non-paiement services
    /// </summary>
    /// <param name="userId">Identifiant unique de l'utilisateur à désactiver</param>
    /// <returns>Confirmation de désactivation du compte utilisateur</returns>
    [HttpPut("user/{userId}/deactivate")]
    public async Task<ActionResult<ApiResponse<bool>>> DeactivateUser(int userId)
    {
        var result = await _userAdminService.DeactivateUserAsync(userId);
        
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Supprime définitivement un compte utilisateur (opération irréversible critique)
    /// 
    /// Fonctionnalité Métier:
    /// - Suppression complète compte utilisateur et données associées
    /// - Nettoyage définitif accès et permissions système
    /// - Gestion RGPD du droit à l'effacement des données
    /// - Purge sécurisée avec préservation audit trail minimal
    /// 
    /// Sécurité et Conformité:
    /// - Validation absence activité critique avant suppression
    /// - Audit trail permanent de la suppression pour traçabilité légale
    /// - Vérification autorisation administrative pour opération critique
    /// - Conformité RGPD Article 17 (droit à l'effacement)
    /// 
    /// Cas d'Usage:
    /// - Suppression compte fictif créé par erreur administrative
    /// - Respect demande légale d'effacement données personnelles
    /// - Nettoyage base données suite fusion organisationnelle
    /// - Purge comptes test ou comptes sans activité réelle
    /// 
    /// ⚠️ ATTENTION: Opération irréversible avec impact système critique
    /// </summary>
    /// <param name="userId">Identifiant unique de l'utilisateur à supprimer définitivement</param>
    /// <returns>Confirmation de suppression définitive du compte utilisateur</returns>
    [HttpDelete("user/{userId}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int userId)
    {
        var result = await _userAdminService.DeleteUserAsync(userId);
        
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère l'historique d'activité détaillé d'un utilisateur spécifique
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation complète de l'historique d'activité utilisateur
    /// - Filtrage temporel pour analyse période spécifique
    /// - Monitoring comportement et utilisation système
    /// - Support investigation et audit activité individuelle
    /// 
    /// Sécurité et Conformité:
    /// - Accès administrateur exclusif pour protection vie privée
    /// - Audit trail des consultations d'activité pour traçabilité
    /// - Chiffrement données sensibles activité utilisateur
    /// - Conformité RGPD pour traitement données personnelles
    /// 
    /// Cas d'Usage:
    /// - Investigation activité suspecte ou non conforme
    /// - Audit utilisation système pour optimisation ressources
    /// - Génération rapports activité pour évaluation performance
    /// - Support résolution incidents ou problèmes utilisateur
    /// - Analyse patterns utilisation pour amélioration UX
    /// </summary>
    /// <param name="userId">Identifiant unique de l'utilisateur</param>
    /// <param name="fromDate">Date début pour filtrage temporel (optionnel)</param>
    /// <param name="toDate">Date fin pour filtrage temporel (optionnel)</param>
    /// <returns>Historique complet d'activité avec détails des actions</returns>
    [HttpGet("user/{userId}/activity")]
    public async Task<ActionResult<ApiResponse<List<LogDto>>>> GetUserActivity(
        int userId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _userAdminService.GetUserActivityAsync(userId, fromDate, toDate);
        return Ok(result);
    }

    /// <summary>
    /// Assigne un utilisateur à un client spécifique (post-création)
    /// </summary>
    /// <param name="userId">Identifiant de l'utilisateur</param>
    /// <param name="clientId">Identifiant du client</param>
    /// <returns>Confirmation d'assignation</returns>
    [HttpPost("user/{userId}/assign-client/{clientId}")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignUserToClient(int userId, int clientId)
    {
        var result = await _userAdminService.AssignUserToClientAsync(userId, clientId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Retire l'association d'un utilisateur avec un client (post-création)
    /// </summary>
    /// <param name="userId">Identifiant de l'utilisateur</param>
    /// <returns>Confirmation de retrait</returns>
    [HttpPost("user/{userId}/remove-client")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveUserFromClient(int userId)
    {
        var result = await _userAdminService.RemoveUserFromClientAsync(userId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }
}

/// <summary>
/// DTO pour créer un employé StartingBloch
/// </summary>
public class CreateEmployeeDto
{
    [StringLength(100, ErrorMessage = "Le nom d'utilisateur ne peut pas dépasser 100 caractères")]
    public string Username { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    [StringLength(100, ErrorMessage = "L'email ne peut pas dépasser 100 caractères")]
    public string Email { get; set; } = string.Empty;

    [StringLength(100, MinimumLength = 6, ErrorMessage = "Le mot de passe doit contenir entre 6 et 100 caractères")]
    public string Password { get; set; } = string.Empty;

    [RegularExpression("^(admin|user)$", ErrorMessage = "Le rôle doit être 'admin' ou 'user'")]
    public string Role { get; set; } = "user";

    public bool CanWrite { get; set; } = false;
    public bool IsActive { get; set; } = true;
}
