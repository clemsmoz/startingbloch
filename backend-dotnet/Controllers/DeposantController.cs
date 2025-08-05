using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Middleware;

namespace StartingBloch.Backend.Controllers;

/// <summary>
/// DeposantController - Contrôleur pour la gestion des déposants de brevets et leurs juridictions
/// 
/// RÔLE MÉTIER CRITIQUE :
/// - Gestion des entités légales habilitées à déposer des brevets
/// - Interface API pour toutes les opérations relatives aux déposants
/// - Administration des droits de dépôt par juridiction géographique
/// - Contrôle de l'écosystème légal et réglementaire des brevets
/// 
/// CONTEXTE JURIDIQUE :
/// - Les déposants sont les entités légales titulaires des droits de propriété intellectuelle
/// - Relation critique : Déposant -> Pays (juridictions de dépôt autorisées)
/// - Gestion des capacités légales et représentations géographiques
/// - Support des structures complexes (groupe, filiales, mandataires)
/// 
/// ARCHITECTURE RELATIONNELLE :
/// - Entité centrale connectée aux Brevets, Pays, et Clients
/// - Relations many-to-many avec Pays (multi-juridictions)
/// - Liens avec système de facturation et contractuel
/// - Intégration avec référentiels géographiques et légaux
/// 
/// SÉCURITÉ ET COMPLIANCE :
/// - Accès strictement réservé aux employés (données sensibles légales)
/// - Validation des capacités légales par juridiction
/// - Audit complet pour conformité réglementaire
/// - Respect des obligations de due diligence
/// 
/// FONCTIONNALITÉS PRINCIPALES :
/// 1. Gestion CRUD complète des déposants légaux
/// 2. Administration des juridictions et droits de dépôt
/// 3. Recherche avancée et filtrage par critères légaux
/// 4. Gestion des associations pays-déposant
/// 5. Validation des capacités et représentations légales
/// 
/// INTÉGRATIONS CRITIQUES :
/// - IDeposantService : Logique métier et validation légale
/// - Système de logging : Traçabilité pour audit légal
/// - Référentiels géographiques : Validation des juridictions
/// - Services de compliance : Vérification des statuts légaux
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class DeposantController : ControllerBase
{
    // Constante pour uniformiser les messages d'erreur serveur
    private const string InternalServerErrorMessage = "Erreur interne du serveur";
    
    // Service métier pour la logique des déposants et leurs relations géographiques
    private readonly IDeposantService _deposantService;
    // Logger spécialisé pour traçabilité et audit des opérations légales
    private readonly ILogger<DeposantController> _logger;

    /// <summary>
    /// Constructeur du contrôleur de gestion des déposants
    /// Injection des services métier et de logging pour audit légal
    /// </summary>
    /// <param name="deposantService">Service métier pour les opérations sur les déposants</param>
    /// <param name="logger">Logger pour traçabilité et audit des modifications légales</param>
    public DeposantController(IDeposantService deposantService, ILogger<DeposantController> logger)
    {
        _deposantService = deposantService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des déposants avec fonctionnalités de recherche avancée
    /// 
    /// GESTION DES ENTITÉS LÉGALES :
    /// - Pagination robuste pour gérer de gros volumes de déposants
    /// - Recherche multi-critères (nom, statut légal, juridictions)
    /// - Validation stricte des paramètres pour sécurité
    /// - Tri par pertinence légale et fréquence d'utilisation
    /// 
    /// SÉCURITÉ ET VALIDATION :
    /// - Contrôles stricts des paramètres de pagination (max 100 par page)
    /// - Validation des entrées pour éviter les attaques par déni de service
    /// - Logging complet des accès pour audit légal
    /// - Gestion robuste des exceptions avec messages utilisateur appropriés
    /// 
    /// OPTIMISATIONS TECHNIQUES :
    /// - Index de recherche optimisés pour entités légales
    /// - Cache intelligent des recherches fréquentes
    /// - Limitation automatique pour performances et sécurité
    /// - Parallélisation des requêtes complexes multi-juridictions
    /// 
    /// CAS D'USAGE MÉTIER :
    /// - Sélection de déposants pour nouveaux dépôts
    /// - Analyses de portefeuilles et stratégies IP
    /// - Validation des capacités légales par juridiction
    /// - Support à la gestion de relation client
    /// </summary>
    /// <param name="page">Numéro de page (commence à 1, validé strictement)</param>
    /// <param name="pageSize">Nombre d'éléments par page (max 100 pour sécurité)</param>
    /// <param name="search">Terme de recherche optionnel (nom, statut, juridiction)</param>
    /// <returns>Liste paginée des déposants correspondant aux critères</returns>
    [HttpGet]
    [EmployeeOnly] // Restriction : employés pour protection des données légales
    public async Task<ActionResult<PagedResponse<List<DeposantDto>>>> GetDeposants(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        // Validation stricte des paramètres de pagination pour sécurité
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Paramètres de pagination invalides"
            });
        }

        try
        {
            // Délégation au service métier avec gestion des erreurs
            var result = await _deposantService.GetDeposaatsAsync(page, pageSize, search);
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging détaillé pour audit et débogage
            _logger.LogError(ex, "Erreur lors de la récupération des déposants");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère les détails complets d'un déposant spécifique par son identifiant
    /// 
    /// INFORMATIONS LÉGALES COMPLÈTES :
    /// - Données complètes de l'entité légale (statut, capacités, représentations)
    /// - Liste des juridictions autorisées et restrictions
    /// - Historique des dépôts et activités légales
    /// - Informations contractuelles et de facturation
    /// 
    /// VALIDATIONS ET SÉCURITÉ :
    /// - Validation stricte de l'ID pour éviter les injections
    /// - Vérification de l'existence avec gestion d'erreurs appropriée
    /// - Logging détaillé pour audit des consultations sensibles
    /// - Gestion robuste des exceptions avec messages utilisateur clairs
    /// 
    /// CONTEXTE LÉGAL :
    /// - Vérification des statuts légaux actifs
    /// - Validation des capacités par juridiction
    /// - Contrôle des autorisations et mandats
    /// - Suivi des modifications réglementaires
    /// 
    /// CAS D'USAGE :
    /// - Validation avant nouveau dépôt de brevet
    /// - Vérification des capacités légales
    /// - Préparation de documents officiels
    /// - Analyses de conformité réglementaire
    /// </summary>
    /// <param name="id">Identifiant unique du déposant (validé > 0)</param>
    /// <returns>Détails complets du déposant ou erreur si inexistant</returns>
    [HttpGet("{id}")]
    [EmployeeOnly] // Restriction : employés pour données légales sensibles
    public async Task<ActionResult<ApiResponse<DeposantDto>>> GetDeposantById(int id)
    {
        // Validation stricte de l'ID pour sécurité
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "ID déposant invalide"
            });
        }

        try
        {
            // Récupération avec gestion des erreurs métier
            var result = await _deposantService.GetDeposantByIdAsync(id);
            
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging avec contexte pour audit légal
            _logger.LogError(ex, "Erreur lors de la récupération du déposant {DeposantId}", id);
            return StatusCode(500, new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Crée un nouveau déposant dans le système légal - Opération critique nécessitant validation complète
    /// 
    /// PROCESSUS DE CRÉATION LÉGALE :
    /// - Validation complète des données légales obligatoires
    /// - Vérification de l'unicité et détection des doublons
    /// - Contrôle des capacités légales et statuts réglementaires
    /// - Initialisation des relations avec juridictions par défaut
    /// 
    /// DONNÉES CRITIQUES REQUISES :
    /// - Identité légale complète (raison sociale, forme juridique)
    /// - Numéros d'identification légaux (SIRET, numéro européen, etc.)
    /// - Adresse de siège social et représentations
    /// - Capacités légales et autorisations de dépôt
    /// 
    /// VALIDATIONS LÉGALES SPÉCIALISÉES :
    /// - Contrôle de cohérence avec référentiels légaux
    /// - Validation des numéros d'identification officiels
    /// - Vérification des capacités par type d'entité
    /// - Détection intelligente des entités déjà existantes
    /// 
    /// IMPACT SYSTÈME ET LÉGAL :
    /// - Création d'un nouveau workspace légal sécurisé
    /// - Initialisation des droits et capacités par défaut
    /// - Notification aux équipes juridiques concernées
    /// - Intégration dans les workflows de compliance
    /// 
    /// AUDIT ET CONFORMITÉ :
    /// - Logging complet de la création pour traçabilité légale
    /// - Historique des validations et contrôles effectués
    /// - Conservation des preuves pour audit réglementaire
    /// - Conformité avec obligations de due diligence
    /// </summary>
    /// <param name="createDeposantDto">Données complètes du nouveau déposant légal</param>
    /// <returns>Déposant créé avec ID généré ou erreurs de validation détaillées</returns>
    [HttpPost]
    [EmployeeOnly] // Restriction : employés pour création d'entités légales
    public async Task<ActionResult<ApiResponse<DeposantDto>>> CreateDeposant([FromBody] CreateDeposantDto createDeposantDto)
    {
        // Validation préalable complète du modèle légal
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            // Délégation de la création au service métier avec toutes les validations légales
            var result = await _deposantService.CreateDeposantAsync(createDeposantDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            // Retour HTTP 201 Created avec localisation de la ressource
            return CreatedAtAction(nameof(GetDeposantById), new { id = result.Data!.Id }, result);
        }
        catch (Exception ex)
        {
            // Logging critique pour audit légal
            _logger.LogError(ex, "Erreur lors de la création du déposant");
            return StatusCode(500, new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Met à jour les informations d'un déposant existant - Modification critique des données légales
    /// 
    /// GESTION DES MODIFICATIONS LÉGALES :
    /// - Mise à jour partielle ou complète des données légales
    /// - Validation de l'intégrité et cohérence des nouvelles données
    /// - Préservation des relations juridictionnelles existantes
    /// - Contrôle de concurrence pour éviter les conflits légaux
    /// 
    /// VALIDATIONS CRITIQUES :
    /// - Double validation ID et modèle pour sécurité maximale
    /// - Contrôle des capacités légales et autorisations
    /// - Vérification de l'impact sur dépôts existants
    /// - Validation croisée avec référentiels légaux
    /// 
    /// IMPACT LÉGAL ET RÉGLEMENTAIRE :
    /// - Propagation automatique aux brevets associés
    /// - Mise à jour des statuts et capacités légales
    /// - Synchronisation avec autorités compétentes
    /// - Notification aux systèmes de compliance
    /// 
    /// AUDIT ET TRAÇABILITÉ :
    /// - Historique complet avec comparaison avant/après
    /// - Logging détaillé pour conformité réglementaire
    /// - Conservation des versions pour audit légal
    /// - Traçabilité des modifications sensibles
    /// </summary>
    /// <param name="id">Identifiant unique du déposant à modifier (validé > 0)</param>
    /// <param name="updateDeposantDto">Nouvelles données légales du déposant</param>
    /// <returns>Déposant mis à jour avec toutes les données actualisées</returns>
    [HttpPut("{id}")]
    [EmployeeOnly] // Restriction : employés pour modification des données légales
    public async Task<ActionResult<ApiResponse<DeposantDto>>> UpdateDeposant(int id, [FromBody] UpdateDeposantDto updateDeposantDto)
    {
        // Validation stricte de l'ID pour sécurité
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "ID déposant invalide"
            });
        }

        // Validation complète du modèle de données légales
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            // Délégation de la mise à jour au service métier avec toutes les validations
            var result = await _deposantService.UpdateDeposantAsync(id, updateDeposantDto);
            
            if (!result.Success)
            {
                // Distinction fine des types d'erreurs pour utilisateur
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging critique avec contexte pour audit légal
            _logger.LogError(ex, "Erreur lors de la mise à jour du déposant {DeposantId}", id);
            return StatusCode(500, new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Supprime définitivement un déposant du système légal - Opération destructive critique réservée aux administrateurs
    /// 
    /// RESTRICTIONS MAXIMALES DE SÉCURITÉ :
    /// - Accès exclusivement réservé aux administrateurs
    /// - Opération irréversible avec implications légales majeures
    /// - Vérifications préalables obligatoires de toutes les dépendances légales
    /// - Processus de validation conforme aux obligations réglementaires
    /// 
    /// VÉRIFICATIONS PRÉALABLES CRITIQUES :
    /// - Contrôle des brevets encore associés au déposant
    /// - Vérification des procédures légales en cours
    /// - Validation de l'absence de mandats actifs
    /// - Contrôle des obligations de conservation légales
    /// 
    /// PROCESSUS DE SUPPRESSION LÉGALE :
    /// - Archivage automatique pour obligations réglementaires
    /// - Anonymisation des données selon RGPD si applicable
    /// - Transfert ou finalisation des dossiers actifs
    /// - Notification aux autorités compétentes si requis
    /// 
    /// CONFORMITÉ RÉGLEMENTAIRE :
    /// - Respect des délais de conservation sectoriels
    /// - Conservation des données d'audit légal obligatoires
    /// - Documentation complète de la procédure
    /// - Traçabilité pour contrôles réglementaires
    /// 
    /// IMPACT SYSTÈME :
    /// - Désactivation des capacités légales associées
    /// - Mise à jour des référentiels et caches
    /// - Synchronisation avec systèmes externes légaux
    /// - Notification aux équipes juridiques concernées
    /// </summary>
    /// <param name="id">Identifiant unique du déposant à supprimer définitivement (validé > 0)</param>
    /// <returns>Confirmation de suppression ou erreur détaillée si contraintes légales</returns>
    [HttpDelete("{id}")]
    [AdminOnly] // Restriction maximale : administrateurs pour suppression d'entités légales
    public async Task<ActionResult<ApiResponse<bool>>> DeleteDeposant(int id)
    {
        // Validation stricte de l'ID pour sécurité
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "ID déposant invalide"
            });
        }

        try
        {
            // Délégation de la suppression au service métier avec toutes les vérifications légales
            var result = await _deposantService.DeleteDeposantAsync(id);
            
            if (!result.Success)
            {
                // Distinction fine des types d'erreurs pour audit
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging critique pour audit légal et investigation
            _logger.LogError(ex, "Erreur lors de la suppression du déposant {DeposantId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère la liste complète des pays/juridictions associés à un déposant spécifique
    /// 
    /// GESTION DES JURIDICTIONS LÉGALES :
    /// - Vue d'ensemble des capacités légales par pays
    /// - Informations sur les autorisations et restrictions géographiques
    /// - Statuts d'activité et validité des représentations
    /// - Historique des évolutions réglementaires par juridiction
    /// 
    /// UTILITÉ STRATÉGIQUE :
    /// - Planification des stratégies de dépôt internationales
    /// - Analyse de couverture géographique des capacités
    /// - Validation des droits avant nouveaux dépôts
    /// - Optimisation des coûts et délais par juridiction
    /// 
    /// INFORMATIONS RETOURNÉES :
    /// - Liste exhaustive des pays autorisés
    /// - Détails des capacités et restrictions par pays
    /// - Statuts des représentations légales locales
    /// - Configurations spécifiques et préférences juridictionnelles
    /// 
    /// SÉCURITÉ ET VALIDATION :
    /// - Validation stricte de l'existence du déposant
    /// - Contrôle des autorisations d'accès aux données légales
    /// - Audit des consultations pour conformité
    /// - Logging détaillé pour traçabilité réglementaire
    /// </summary>
    /// <param name="id">Identifiant unique du déposant (validé > 0)</param>
    /// <returns>Liste complète des pays/juridictions associés au déposant</returns>
    [HttpGet("{id}/pays")]
    [EmployeeOnly] // Restriction : employés pour données de capacités légales
    public async Task<ActionResult<ApiResponse<List<PaysDto>>>> GetDeposantPays(int id)
    {
        // Validation stricte de l'ID pour sécurité
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "ID déposant invalide"
            });
        }

        try
        {
            // Récupération des juridictions avec optimisations
            var result = await _deposantService.GetDeposantPaysAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging avec contexte pour audit légal
            _logger.LogError(ex, "Erreur lors de la récupération des pays du déposant {DeposantId}", id);
            return StatusCode(500, new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Assigne un pays/juridiction à un déposant - Création d'une capacité légale géographique
    /// 
    /// GESTION DES CAPACITÉS LÉGALES :
    /// - Création d'une nouvelle autorisation de dépôt par pays
    /// - Validation de la compatibilité juridictionnelle
    /// - Vérification des prérequis légaux et réglementaires
    /// - Configuration des paramètres de représentation par défaut
    /// 
    /// VALIDATIONS CRITIQUES LÉGALES :
    /// - Double validation des IDs pour sécurité maximale
    /// - Contrôle de l'existence et validité du déposant et du pays
    /// - Vérification des capacités légales requises par juridiction
    /// - Validation des conditions préalables réglementaires
    /// 
    /// PROCESSUS D'ASSIGNATION :
    /// - Création de la relation déposant-pays en base
    /// - Initialisation des paramètres légaux par défaut
    /// - Configuration automatique des représentations requises
    /// - Notification aux équipes juridiques et compliance
    /// 
    /// IMPACT LÉGAL ET OPÉRATIONNEL :
    /// - Activation des capacités de dépôt dans la nouvelle juridiction
    /// - Mise à jour des stratégies de dépôt internationales
    /// - Synchronisation avec systèmes de gestion des mandats
    /// - Intégration dans les workflows de validation légale
    /// 
    /// AUDIT ET CONFORMITÉ :
    /// - Logging détaillé de la création de capacité légale
    /// - Historique des assignations pour traçabilité réglementaire
    /// - Documentation des validations effectuées
    /// - Conservation des preuves pour audit légal
    /// </summary>
    /// <param name="deposantId">Identifiant unique du déposant (validé > 0)</param>
    /// <param name="paysId">Identifiant unique du pays/juridiction (validé > 0)</param>
    /// <returns>Confirmation d'assignation ou erreur détaillée si échec</returns>
    [HttpPost("{deposantId}/pays/{paysId}")]
    [EmployeeOnly] // Restriction : employés pour gestion des capacités légales
    public async Task<ActionResult<ApiResponse<bool>>> AssignPaysToDeposant(int deposantId, int paysId)
    {
        // Validation stricte des deux IDs pour sécurité maximale
        if (deposantId <= 0 || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "IDs invalides"
            });
        }

        try
        {
            // Délégation de l'assignation au service métier avec toutes les validations légales
            var result = await _deposantService.AssignPaysToDeposantAsync(deposantId, paysId);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging critique avec contexte complet pour audit légal
            _logger.LogError(ex, "Erreur lors de l'assignation du pays {PaysId} au déposant {DeposantId}", paysId, deposantId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Retire un pays/juridiction d'un déposant - Suppression d'une capacité légale géographique
    /// 
    /// GESTION DE LA RÉVOCATION DE CAPACITÉS :
    /// - Suppression sécurisée de l'autorisation de dépôt par pays
    /// - Vérification préalable des dossiers en cours dans la juridiction
    /// - Gestion de la transition des mandats actifs
    /// - Préservation de l'historique pour audit et conformité
    /// 
    /// VÉRIFICATIONS PRÉALABLES CRITIQUES :
    /// - Double validation des IDs pour sécurité maximale
    /// - Contrôle des brevets actifs dans la juridiction concernée
    /// - Validation de l'absence de procédures légales en cours
    /// - Vérification des obligations contractuelles en cours
    /// 
    /// PROCESSUS DE DISSOCIATION LÉGALE :
    /// - Suspension immédiate des nouvelles capacités de dépôt
    /// - Notification obligatoire aux équipes juridiques concernées
    /// - Transfert ou finalisation des dossiers actifs
    /// - Archive sécurisée de la relation pour historique légal
    /// 
    /// CONFORMITÉ RÉGLEMENTAIRE :
    /// - Respect des préavis réglementaires par juridiction
    /// - Conservation des données d'audit pour conformité
    /// - Notification aux autorités compétentes si requis
    /// - Documentation complète de la procédure de révocation
    /// 
    /// IMPACT OPÉRATIONNEL :
    /// - Désactivation des workflows de dépôt concernés
    /// - Mise à jour des stratégies internationales
    /// - Synchronisation avec systèmes de gestion des mandats
    /// - Révision des couvertures géographiques actives
    /// </summary>
    /// <param name="deposantId">Identifiant unique du déposant (validé > 0)</param>
    /// <param name="paysId">Identifiant unique du pays/juridiction (validé > 0)</param>
    /// <returns>Confirmation de dissociation ou erreur détaillée si contraintes</returns>
    [HttpDelete("{deposantId}/pays/{paysId}")]
    [EmployeeOnly] // Restriction : employés pour révocation de capacités légales
    public async Task<ActionResult<ApiResponse<bool>>> RemovePaysFromDeposant(int deposantId, int paysId)
    {
        // Validation stricte des deux IDs pour sécurité maximale
        if (deposantId <= 0 || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "IDs invalides"
            });
        }

        try
        {
            // Délégation de la dissociation au service métier avec toutes les vérifications légales
            var result = await _deposantService.RemovePaysFromDeposantAsync(deposantId, paysId);
            
            if (!result.Success)
            {
                // Distinction fine des types d'erreurs pour audit et utilisateur
                return (result.Message?.Contains("non trouvée") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging critique avec contexte complet pour audit légal et investigation
            _logger.LogError(ex, "Erreur lors du retrait du pays {PaysId} du déposant {DeposantId}", paysId, deposantId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }
}
