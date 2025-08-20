using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Middleware;
using StartingBloch.Backend.Services;

namespace StartingBloch.Backend.Controllers;

/// <summary>
/// CabinetController - Contrôleur pour la gestion des cabinets de propriété intellectuelle
/// 
/// RÔLE MÉTIER :
/// - Gestion des cabinets partenaires et sous-traitants en propriété intellectuelle
/// - Interface API pour les opérations CRUD sur les cabinets
/// - Gestion des relations cabinet-client et cabinet-pays
/// - Administration des réseaux de correspondants internationaux
/// 
/// CONTEXTE BUSINESS :
/// - Les cabinets sont des partenaires clés pour la gestion internationale des brevets
/// - Ils représentent les clients dans différentes juridictions
/// - Relation many-to-many : un cabinet peut avoir plusieurs clients, un client plusieurs cabinets
/// - Organisation géographique pour optimiser la couverture mondiale
/// 
/// SÉCURITÉ ET ACCÈS :
/// - Accès strictement réservé aux employés et administrateurs
/// - Aucun accès client (données sensibles de partenariat)
/// - Permissions granulaires selon le niveau d'habilitation
/// 
/// FONCTIONNALITÉS PRINCIPALES :
/// 1. Gestion CRUD complète des cabinets
/// 2. Association et dissociation cabinet-client
/// 3. Recherche et filtrage par pays/région
/// 4. Administration des portefeuilles clients par cabinet
/// 
/// INTÉGRATIONS :
/// - ICabinetService : Logique métier et accès aux données
/// - Système de permissions : Contrôle d'accès par rôle
/// - Audit trail : Traçabilité des modifications de partenariats
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class CabinetController : ControllerBase
{
    // Service métier pour la gestion des cabinets et leurs relations
    private readonly ICabinetService _cabinetService;

    /// <summary>
    /// Constructeur du contrôleur de gestion des cabinets
    /// Injection du service métier pour l'accès aux données et la logique
    /// </summary>
    /// <param name="cabinetService">Service métier pour les opérations sur les cabinets</param>
    public CabinetController(ICabinetService cabinetService)
    {
        _cabinetService = cabinetService;
    }

    /// <summary>
    /// Récupère la liste paginée des cabinets avec fonctionnalité de recherche avancée
    /// 
    /// FONCTIONNALITÉS DE RECHERCHE :
    /// - Pagination optimisée pour gérer de gros volumes de cabinets
    /// - Recherche textuelle dans nom, adresse, pays
    /// - Tri par pertinence et critères métier
    /// 
    /// OPTIMISATIONS :
    /// - Index de recherche full-text pour performances
    /// - Cache intelligent des résultats fréquents
    /// - Limitation de la taille des pages pour sécurité
    /// 
    /// PERMISSIONS :
    /// - Accès réservé aux employés uniquement
    /// - Filtrage automatique selon le niveau d'habilitation
    /// </summary>
    /// <param name="page">Numéro de page (commence à 1)</param>
    /// <param name="pageSize">Nombre d'éléments par page (max 100)</param>
    /// <param name="search">Terme de recherche optionnel (nom, pays, adresse)</param>
    /// <returns>Liste paginée des cabinets correspondant aux critères</returns>
    [HttpGet]
    [EmployeeOnly] // Restriction : employés uniquement
    public async Task<ActionResult<PagedResponse<List<CabinetDto>>>> GetCabinets(
        int page = 1, 
        int pageSize = 10, 
        string? search = null)
    {
        // Délégation au service métier avec gestion de la pagination et recherche
        var result = await _cabinetService.GetCabinetsAsync(page, pageSize, search);
        
        // Gestion des erreurs de requête
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère les cabinets du client connecté (portail client).
    /// </summary>
    [HttpGet("my")]
    [ClientOnly]
    public async Task<ActionResult<ApiResponse<List<CabinetDto>>>> GetMyCabinets()
    {
        var clientIdStr = User.FindFirst("clientId")?.Value;
        if (!int.TryParse(clientIdStr, out var clientId))
        {
            return BadRequest(new ApiResponse<List<CabinetDto>>
            {
                Success = false,
                Message = "Utilisateur non associé à un client"
            });
        }

        var result = await _cabinetService.GetCabinetsByClientAsync(clientId);
        return Ok(result);
    }

    /// <summary>
    /// Récupère les détails complets d'un cabinet spécifique par son identifiant
    /// 
    /// INFORMATIONS RETOURNÉES :
    /// - Données complètes du cabinet (nom, adresse, contacts)
    /// - Liste des clients associés
    /// - Statistiques de performance et volumes traités
    /// - Informations de contact et représentants locaux
    /// 
    /// SÉCURITÉ :
    /// - Vérification de l'existence avant retour des données
    /// - Masquage automatique des informations sensibles
    /// - Audit des consultations pour compliance
    /// 
    /// CAS D'USAGE :
    /// - Consultation détaillée pour gestion de relation
    /// - Préparation de missions et mandats
    /// - Analyse de performance des partenariats
    /// </summary>
    /// <param name="id">Identifiant unique du cabinet</param>
    /// <returns>Détails complets du cabinet ou erreur si inexistant</returns>
    [HttpGet("{id}")]
    [EmployeeOnly] // Restriction : employés uniquement
    public async Task<ActionResult<ApiResponse<CabinetDto>>> GetCabinet(int id)
    {
        // Récupération des détails complets du cabinet
        var result = await _cabinetService.GetCabinetByIdAsync(id);
        
        // Gestion des erreurs (cabinet inexistant)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Crée un nouveau cabinet dans le réseau de partenaires
    /// 
    /// PROCESSUS DE CRÉATION :
    /// - Validation complète des données obligatoires
    /// - Vérification de l'unicité (nom, adresse, juridiction)
    /// - Création avec génération automatique des références
    /// - Initialisation des relations et paramètres par défaut
    /// 
    /// DONNÉES REQUISES :
    /// - Nom et raison sociale du cabinet
    /// - Adresse complète et juridiction
    /// - Contacts principaux et informations légales
    /// - Spécialisations et domaines d'expertise
    /// 
    /// VALIDATION MÉTIER :
    /// - Contrôle de la cohérence géographique
    /// - Vérification des informations légales
    /// - Validation des contacts et moyens de communication
    /// 
    /// AUDIT :
    /// - Logging complet de la création
    /// - Notification aux équipes concernées
    /// </summary>
    /// <param name="createCabinetDto">Données du nouveau cabinet à créer</param>
    /// <returns>Cabinet créé avec ID généré ou erreurs de validation</returns>
    [HttpPost]
    [WritePermission] // Nécessite canWrite=true ou Admin
    public async Task<ActionResult<ApiResponse<CabinetDto>>> CreateCabinet(CreateCabinetDto createCabinetDto)
    {
        // Validation préalable du modèle de données
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Délégation de la création au service métier
        var result = await _cabinetService.CreateCabinetAsync(createCabinetDto);
        
        // Gestion des erreurs de création
        if (!result.Success)
            return BadRequest(result);
            
        // Retour HTTP 201 Created avec localisation de la ressource
        return CreatedAtAction(nameof(GetCabinet), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Crée un cabinet et le lie au client courant (portail client).
    /// </summary>
    [HttpPost("my")]
    [ClientOnly]
    [WritePermission]
    public async Task<ActionResult<ApiResponse<CabinetDto>>> CreateCabinetForMe(CreateCabinetDto createCabinetDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var clientIdStr = User.FindFirst("clientId")?.Value;
        if (!int.TryParse(clientIdStr, out var clientId))
        {
            return BadRequest(new ApiResponse<CabinetDto>
            {
                Success = false,
                Message = "Utilisateur non associé à un client"
            });
        }

        var result = await _cabinetService.CreateCabinetForClientAsync(clientId, createCabinetDto);
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetCabinet), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Lie un cabinet existant au client courant.
    /// </summary>
    [HttpPost("my/link/{cabinetId}")]
    [ClientOnly]
    [WritePermission]
    public async Task<ActionResult<ApiResponse<bool>>> LinkExistingCabinetToMe(int cabinetId)
    {
        var clientIdStr = User.FindFirst("clientId")?.Value;
        if (!int.TryParse(clientIdStr, out var clientId))
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Utilisateur non associé à un client"
            });
        }

        var result = await _cabinetService.LinkExistingCabinetToClientAsync(clientId, cabinetId);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Met à jour les informations d'un cabinet existant
    /// 
    /// GESTION DES MODIFICATIONS :
    /// - Mise à jour partielle ou complète des données
    /// - Validation de l'intégrité référentielle
    /// - Préservation des relations existantes
    /// - Contrôle de concurrence optimiste
    /// 
    /// TYPES DE MODIFICATIONS :
    /// - Informations générales (nom, adresse, contacts)
    /// - Spécialisations et domaines d'expertise
    /// - Paramètres de collaboration et tarification
    /// - Statut d'activité et préférences
    /// 
    /// VALIDATION :
    /// - Vérification de l'existence du cabinet
    /// - Contrôle des contraintes métier
    /// - Validation des nouvelles données
    /// 
    /// AUDIT :
    /// - Historique complet des modifications
    /// - Comparaison avant/après pour traçabilité
    /// </summary>
    /// <param name="id">Identifiant unique du cabinet à modifier</param>
    /// <param name="updateCabinetDto">Nouvelles données du cabinet</param>
    /// <returns>Cabinet mis à jour ou erreurs de validation</returns>
    [HttpPut("{id}")]
    [WritePermission] // Nécessite canWrite=true ou Admin
    public async Task<ActionResult<ApiResponse<CabinetDto>>> UpdateCabinet(int id, UpdateCabinetDto updateCabinetDto)
    {
        // Validation préalable du modèle de données
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Délégation de la mise à jour au service métier
        var result = await _cabinetService.UpdateCabinetAsync(id, updateCabinetDto);
        
        // Gestion des erreurs (cabinet inexistant, contraintes)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Supprime définitivement un cabinet du réseau de partenaires - Opération critique
    /// 
    /// RESTRICTIONS MAXIMALES :
    /// - Accès exclusivement réservé aux administrateurs
    /// - Opération irréversible avec impact sur les relations clients
    /// - Vérifications préalables obligatoires des dépendances
    /// 
    /// VÉRIFICATIONS PRÉALABLES :
    /// - Contrôle des clients encore associés
    /// - Vérification des dossiers en cours
    /// - Validation de l'absence de mandats actifs
    /// - Confirmation des obligations contractuelles
    /// 
    /// PROCESSUS DE SUPPRESSION :
    /// - Sauvegarde automatique avant destruction
    /// - Notification aux clients concernés
    /// - Transfert ou archivage des dossiers actifs
    /// - Mise à jour des statuts de dossiers
    /// 
    /// CONFORMITÉ :
    /// - Respect des obligations contractuelles
    /// - Conservation des données d'audit obligatoires
    /// - Notification aux autorités si requis
    /// </summary>
    /// <param name="id">Identifiant unique du cabinet à supprimer</param>
    /// <returns>Confirmation de suppression ou erreur si contraintes</returns>
    [HttpDelete("{id}")]
    [AdminOnly] // Restriction maximale : administrateurs uniquement
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCabinet(int id)
    {
        // Délégation de la suppression au service métier avec toutes les vérifications
        var result = await _cabinetService.DeleteCabinetAsync(id);
        
        // Gestion des erreurs (cabinet inexistant, contraintes relationnelles)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère la liste complète des clients associés à un cabinet spécifique
    /// 
    /// INFORMATIONS RETOURNÉES :
    /// - Liste exhaustive des clients du cabinet
    /// - Statuts des relations et collaborations
    /// - Historique des mandats et missions
    /// - Volumes de dossiers traités par client
    /// 
    /// UTILITÉ MÉTIER :
    /// - Vue d'ensemble du portefeuille client du cabinet
    /// - Analyse de la répartition des affaires
    /// - Préparation des revues de performance
    /// - Gestion des conflits d'intérêts potentiels
    /// 
    /// SÉCURITÉ :
    /// - Validation de l'existence du cabinet
    /// - Filtrage selon les permissions utilisateur
    /// - Masquage des données sensibles si nécessaire
    /// 
    /// OPTIMISATIONS :
    /// - Requête optimisée avec jointures efficaces
    /// - Cache des relations stables
    /// </summary>
    /// <param name="id">Identifiant unique du cabinet</param>
    /// <returns>Liste des clients associés au cabinet ou erreur si inexistant</returns>
    [HttpGet("{id}/clients")]
    [EmployeeOnly] // Restriction : employés uniquement
    public async Task<ActionResult<ApiResponse<List<ClientDto>>>> GetCabinetClients(int id)
    {
        // Récupération de la liste des clients associés au cabinet
        var result = await _cabinetService.GetCabinetClientsAsync(id);
        
        // Gestion des erreurs (cabinet inexistant)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Assigne un client à un cabinet - Création d'une relation de partenariat
    /// 
    /// GESTION DES RELATIONS :
    /// - Création d'une nouvelle association cabinet-client
    /// - Validation de la compatibilité géographique/juridique
    /// - Vérification de l'absence de conflits d'intérêts
    /// - Paramétrage des conditions de collaboration
    /// 
    /// VALIDATIONS MÉTIER :
    /// - Existence et validité du cabinet et du client
    /// - Contrôle des restrictions géographiques
    /// - Vérification des spécialisations requises
    /// - Validation des conditions contractuelles
    /// 
    /// PROCESSUS D'ASSIGNATION :
    /// - Création de la relation en base
    /// - Initialisation des paramètres par défaut
    /// - Notification aux parties concernées
    /// - Mise à jour des tableaux de bord
    /// 
    /// AUDIT :
    /// - Logging de la création de relation
    /// - Historique des assignations pour compliance
    /// </summary>
    /// <param name="cabinetId">Identifiant unique du cabinet</param>
    /// <param name="clientId">Identifiant unique du client</param>
    /// <returns>Confirmation d'assignation ou erreur si échec</returns>
    [HttpPost("{cabinetId}/clients/{clientId}")]
    [EmployeeOnly] // Restriction : employés autorisés uniquement
    public async Task<ActionResult<ApiResponse<bool>>> AssignClientToCabinet(int cabinetId, int clientId)
    {
        // Délégation de l'assignation au service métier avec toutes les validations
        var result = await _cabinetService.AssignClientToCabinetAsync(cabinetId, clientId);
        
        // Gestion des erreurs (entités inexistantes, conflits, contraintes)
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Retire un client d'un cabinet - Dissolution d'une relation de partenariat
    /// 
    /// GESTION DE LA RUPTURE :
    /// - Suppression sécurisée de l'association cabinet-client
    /// - Vérification préalable des dossiers en cours
    /// - Gestion de la transition des mandats actifs
    /// - Préservation de l'historique pour audit
    /// 
    /// VÉRIFICATIONS PRÉALABLES :
    /// - Contrôle des dossiers actifs nécessitant transition
    /// - Validation des obligations contractuelles
    /// - Vérification des échéances à venir
    /// - Contrôle des mandats de représentation
    /// 
    /// PROCESSUS DE DISSOCIATION :
    /// - Suspension des nouveaux mandats
    /// - Notification des parties concernées
    /// - Transfert ou finalisation des dossiers actifs
    /// - Archive de la relation pour historique
    /// 
    /// CONFORMITÉ :
    /// - Respect des préavis contractuels
    /// - Conservation des données d'audit
    /// - Notification aux autorités si requis
    /// </summary>
    /// <param name="cabinetId">Identifiant unique du cabinet</param>
    /// <param name="clientId">Identifiant unique du client</param>
    /// <returns>Confirmation de dissociation ou erreur si contraintes</returns>
    [HttpDelete("{cabinetId}/clients/{clientId}")]
    [EmployeeOnly] // Restriction : employés autorisés uniquement
    public async Task<ActionResult<ApiResponse<bool>>> RemoveClientFromCabinet(int cabinetId, int clientId)
    {
        // Délégation de la dissociation au service métier avec toutes les vérifications
        var result = await _cabinetService.RemoveClientFromCabinetAsync(cabinetId, clientId);
        
        // Gestion des erreurs (relation inexistante, contraintes actives)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère tous les cabinets présents dans un pays spécifique - Recherche géographique
    /// 
    /// UTILITÉ GÉOGRAPHIQUE :
    /// - Identification des correspondants locaux par juridiction
    /// - Mapping du réseau de partenaires internationaux
    /// - Sélection de cabinets pour nouvelles procédures
    /// - Analyse de couverture géographique
    /// 
    /// FONCTIONNALITÉS :
    /// - Recherche par nom de pays (français ou anglais)
    /// - Tri par ordre de préférence/performance
    /// - Inclusion des informations de contact principales
    /// - Statut d'activité et disponibilité
    /// 
    /// CAS D'USAGE :
    /// - Planification de dépôts internationaux
    /// - Sélection de correspondants pour nouveaux clients
    /// - Audit de couverture géographique
    /// - Analyse concurrentielle par marché
    /// 
    /// OPTIMISATIONS :
    /// - Index géographique pour performances
    /// - Cache des résultats par pays populaires
    /// - Validation de la cohérence des données pays
    /// </summary>
    /// <param name="country">Nom du pays (français ou anglais acceptés)</param>
    /// <returns>Liste des cabinets présents dans le pays spécifié</returns>
    [HttpGet("by-country/{country}")]
    [EmployeeOnly] // Restriction : employés uniquement
    public async Task<ActionResult<ApiResponse<List<CabinetDto>>>> GetCabinetsByCountry(string country)
    {
        // Récupération des cabinets filtrés par pays
        var result = await _cabinetService.GetCabinetsByCountryAsync(country);
        
        // Gestion des erreurs (pays invalide, aucun cabinet trouvé)
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }
}
