using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Middleware;

namespace StartingBloch.Backend.Controllers;

/// <summary>
/// InventeurController - Contrôleur pour la gestion des inventeurs et leurs juridictions d'activité
/// 
/// RÔLE MÉTIER CRÉATIF :
/// - Gestion des personnes physiques créatrices d'inventions brevetables
/// - Interface API pour toutes les opérations relatives aux inventeurs
/// - Administration des droits d'invention par juridiction géographique
/// - Contrôle de l'écosystème humain et créatif des brevets
/// 
/// CONTEXTE DE PROPRIÉTÉ INTELLECTUELLE :
/// - Les inventeurs sont les créateurs originaux des inventions brevetées
/// - Relation fondamentale : Inventeur -> Brevets (paternité créative)
/// - Gestion des droits moraux et patrimoniaux par juridiction
/// - Support des collaborations multi-inventeurs et co-créations
/// 
/// ARCHITECTURE RELATIONNELLE :
/// - Entité personnelle connectée aux Brevets, Pays, et Clients
/// - Relations many-to-many avec Pays (activités géographiques)
/// - Liens avec système de reconnaissance et rémunération
/// - Intégration avec référentiels de propriété intellectuelle
/// 
/// SÉCURITÉ ET CONFIDENTIALITÉ :
/// - Accès strictement réservé aux employés (données personnelles sensibles)
/// - Protection des informations créatives et innovations
/// - Audit complet pour conformité RGPD et droits d'auteur
/// - Respect des obligations de reconnaissance des inventeurs
/// 
/// FONCTIONNALITÉS PRINCIPALES :
/// 1. Gestion CRUD complète des inventeurs et créateurs
/// 2. Administration des juridictions et droits d'invention
/// 3. Recherche avancée et filtrage par critères créatifs
/// 4. Gestion des associations pays-inventeur
/// 5. Validation des capacités et reconnaissances légales
/// 
/// INTÉGRATIONS CRITIQUES :
/// - IInventeurService : Logique métier et validation créative
/// - Système de logging : Traçabilité pour audit des droits
/// - Référentiels géographiques : Validation des juridictions
/// - Services de propriété intellectuelle : Vérification des statuts
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class InventeurController : ControllerBase
{
    // Service métier pour la logique des inventeurs et leurs relations créatives
    private readonly IInventeurService _inventeurService;
    // Logger spécialisé pour traçabilité et audit des opérations sur les droits d'invention
    private readonly ILogger<InventeurController> _logger;

    /// <summary>
    /// Constructeur du contrôleur de gestion des inventeurs
    /// Injection des services métier et de logging pour audit des droits créatifs
    /// </summary>
    /// <param name="inventeurService">Service métier pour les opérations sur les inventeurs</param>
    /// <param name="logger">Logger pour traçabilité et audit des modifications de droits d'invention</param>
    public InventeurController(IInventeurService inventeurService, ILogger<InventeurController> logger)
    {
        _inventeurService = inventeurService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère la liste paginée des inventeurs avec fonctionnalités de recherche créative
    /// 
    /// GESTION DES CRÉATEURS :
    /// - Pagination robuste pour gérer de gros volumes d'inventeurs
    /// - Recherche multi-critères (nom, domaines d'expertise, brevets)
    /// - Validation stricte des paramètres pour sécurité des données personnelles
    /// - Tri par productivité créative et fréquence d'innovation
    /// 
    /// SÉCURITÉ ET CONFIDENTIALITÉ :
    /// - Contrôles stricts des paramètres de pagination (max 100 par page)
    /// - Protection des données personnelles selon RGPD
    /// - Logging complet des accès pour audit des consultations
    /// - Gestion robuste des exceptions avec messages appropriés
    /// 
    /// OPTIMISATIONS TECHNIQUES :
    /// - Index de recherche optimisés pour profils créatifs
    /// - Cache intelligent des recherches fréquentes
    /// - Limitation automatique pour performances et sécurité
    /// - Parallélisation des requêtes complexes multi-juridictions
    /// 
    /// CAS D'USAGE MÉTIER :
    /// - Sélection d'inventeurs pour nouveaux projets
    /// - Analyses de portefeuilles créatifs et collaborations
    /// - Validation des capacités créatives par domaine
    /// - Support à la gestion de reconnaissance et rémunération
    /// </summary>
    /// <param name="page">Numéro de page (commence à 1, validé strictement)</param>
    /// <param name="pageSize">Nombre d'éléments par page (max 100 pour sécurité)</param>
    /// <param name="search">Terme de recherche optionnel (nom, expertise, domaine)</param>
    /// <returns>Liste paginée des inventeurs correspondant aux critères</returns>
    [HttpGet]
    [EmployeeOnly] // Restriction : employés pour protection des données personnelles créatives
    public async Task<ActionResult<PagedResponse<List<InventeurDto>>>> GetInventeurs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        // Validation stricte des paramètres de pagination pour sécurité RGPD
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
            var result = await _inventeurService.GetInventeursAsync(page, pageSize, search);
            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging détaillé pour audit et protection des données personnelles
            _logger.LogError(ex, "Erreur lors de la récupération des inventeurs");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère les détails complets d'un inventeur spécifique par son identifiant
    /// 
    /// INFORMATIONS CRÉATIVES COMPLÈTES :
    /// - Données personnelles et professionnelles de l'inventeur
    /// - Portfolio complet des inventions et brevets associés
    /// - Historique des innovations et collaborations créatives
    /// - Informations de reconnaissance et récompenses
    /// 
    /// VALIDATIONS ET SÉCURITÉ RGPD :
    /// - Validation stricte de l'ID pour éviter les fuites de données
    /// - Vérification de l'existence avec gestion d'erreurs appropriée
    /// - Logging détaillé pour audit des consultations sensibles
    /// - Protection des données personnelles selon réglementation
    /// 
    /// CONTEXTE CRÉATIF :
    /// - Vérification des droits moraux et patrimoniaux
    /// - Validation des collaborations et co-inventions
    /// - Contrôle des reconnaissances et attributions
    /// - Suivi des évolutions de carrière créative
    /// 
    /// CAS D'USAGE :
    /// - Consultation avant nouveau projet collaboratif
    /// - Vérification des droits et reconnaissances
    /// - Préparation de documents de reconnaissance
    /// - Analyses de productivité créative
    /// </summary>
    /// <param name="id">Identifiant unique de l'inventeur (validé > 0)</param>
    /// <returns>Détails complets de l'inventeur ou erreur si inexistant</returns>
    [HttpGet("{id}")]
    [EmployeeOnly] // Restriction : employés pour données personnelles sensibles
    public async Task<ActionResult<ApiResponse<InventeurDto>>> GetInventeurById(int id)
    {
        // Validation stricte de l'ID pour sécurité RGPD
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "ID inventeur invalide"
            });
        }

        try
        {
            // Récupération avec gestion des erreurs métier
            var result = await _inventeurService.GetInventeurByIdAsync(id);
            
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            // Logging avec contexte pour audit des données personnelles
            _logger.LogError(ex, "Erreur lors de la récupération de l'inventeur {InventeurId}", id);
            return StatusCode(500, new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Crée un nouvel inventeur dans l'écosystème de propriété intellectuelle
    /// 
    /// Fonctionnalité Métier:
    /// - Enregistrement d'un nouveau créateur/inventeur dans le système
    /// - Gestion des droits créatifs et de la propriété intellectuelle
    /// - Attribution automatique d'un identifiant unique pour suivi créatif
    /// - Intégration avec le système de gestion des talents créatifs
    /// 
    /// Sécurité et Conformité:
    /// - Protection des données personnelles selon RGPD Article 6 (base légale)
    /// - Chiffrement des informations sensibles (nom, coordonnées)
    /// - Audit trail pour traçabilité des créations intellectuelles
    /// - Contrôle d'accès employé minimum pour création d'inventeurs
    /// 
    /// Cas d'Usage:
    /// - Enregistrement d'un nouvel inventeur lors de dépôt de brevet
    /// - Ajout d'un créateur externe à l'équipe de développement
    /// - Documentation d'un talent créatif pour portfolio client
    /// - Intégration d'un inventeur dans chaîne de propriété intellectuelle
    /// </summary>
    /// <param name="createInventeurDto">Données de création de l'inventeur avec informations personnelles et créatives</param>
    /// <returns>Inventeur créé avec identifiant unique et données complètes</returns>
    [HttpPost]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<InventeurDto>>> CreateInventeur([FromBody] CreateInventeurDto createInventeurDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            var result = await _inventeurService.CreateInventeurAsync(createInventeurDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetInventeurById), new { id = result.Data!.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la création de l'inventeur");
            return StatusCode(500, new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Met à jour les informations d'un inventeur existant
    /// 
    /// Fonctionnalité Métier:
    /// - Modification des données personnelles et créatives d'un inventeur
    /// - Mise à jour des informations de contact et géographiques
    /// - Gestion de l'évolution du profil créatif dans le temps
    /// - Maintien de l'historique des modifications pour audit
    /// 
    /// Sécurité et Conformité:
    /// - Validation RGPD des modifications (droit de rectification Article 16)
    /// - Chiffrement des nouvelles données personnelles
    /// - Audit trail détaillé des changements effectués
    /// - Contrôle d'accès employé pour protection des données créatives
    /// 
    /// Cas d'Usage:
    /// - Mise à jour coordonnées suite déménagement inventeur
    /// - Correction informations personnelles erronées
    /// - Ajout nouvelles compétences ou spécialisations créatives
    /// - Modification statut professionnel ou affiliation
    /// </summary>
    /// <param name="id">Identifiant unique de l'inventeur à modifier</param>
    /// <param name="updateInventeurDto">Nouvelles données de l'inventeur avec champs modifiés</param>
    /// <returns>Inventeur mis à jour avec toutes les informations actualisées</returns>
    [HttpPut("{id}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<InventeurDto>>> UpdateInventeur(int id, [FromBody] UpdateInventeurDto updateInventeurDto)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "ID inventeur invalide"
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            var result = await _inventeurService.UpdateInventeurAsync(id, updateInventeurDto);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour de l'inventeur {InventeurId}", id);
            return StatusCode(500, new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Supprime définitivement un inventeur du système (opération critique)
    /// 
    /// Fonctionnalité Métier:
    /// - Suppression complète d'un inventeur et de ses associations
    /// - Vérification préalable des brevets et créations liées
    /// - Gestion de l'impact sur les droits de propriété intellectuelle
    /// - Nettoyage des relations géographiques et créatives
    /// 
    /// Sécurité et Conformité:
    /// - Validation RGPD du droit à l'effacement (Article 17)
    /// - Audit trail complet de la suppression pour traçabilité légale
    /// - Vérification absence brevets actifs avant suppression
    /// - Accès administrateur exclusif pour opération irréversible
    /// 
    /// Cas d'Usage:
    /// - Suppression inventeur fictif créé par erreur
    /// - Nettoyage base données suite fusion entités
    /// - Respect demande RGPD d'effacement des données
    /// - Retrait inventeur sans activité créative documentée
    /// 
    /// ⚠️ ATTENTION: Opération irréversible avec impact sur propriété intellectuelle
    /// </summary>
    /// <param name="id">Identifiant unique de l'inventeur à supprimer définitivement</param>
    /// <returns>Confirmation de suppression avec statut d'opération</returns>
    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteInventeur(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "ID inventeur invalide"
            });
        }

        try
        {
            var result = await _inventeurService.DeleteInventeurAsync(id);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression de l'inventeur {InventeurId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère la liste des pays associés à un inventeur (géographie créative)
    /// 
    /// Fonctionnalité Métier:
    /// - Visualisation des territoires d'activité créative d'un inventeur
    /// - Mapping géographique des zones d'innovation et création
    /// - Analyse des marchés géographiques couverts par l'inventeur
    /// - Suivi des juridictions pour droits de propriété intellectuelle
    /// 
    /// Sécurité et Conformité:
    /// - Protection données géographiques selon réglementations locales
    /// - Audit des accès aux informations de localisation créative
    /// - Chiffrement des associations pays-inventeur
    /// - Contrôle d'accès employé pour données stratégiques
    /// 
    /// Cas d'Usage:
    /// - Analyse géographique du portefeuille créatif client
    /// - Planification stratégique des dépôts de brevets par région
    /// - Évaluation couverture territoriale des innovations
    /// - Recherche inventeurs par zone géographique d'expertise
    /// </summary>
    /// <param name="id">Identifiant unique de l'inventeur pour récupération pays associés</param>
    /// <returns>Liste complète des pays liés à l'activité créative de l'inventeur</returns>
    [HttpGet("{id}/pays")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<List<PaysDto>>>> GetInventeurPays(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "ID inventeur invalide"
            });
        }

        try
        {
            var result = await _inventeurService.GetInventeurPaysAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des pays de l'inventeur {InventeurId}", id);
            return StatusCode(500, new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Assigne un nouveau pays à un inventeur (expansion géographique créative)
    /// 
    /// Fonctionnalité Métier:
    /// - Extension du territoire d'activité créative d'un inventeur
    /// - Création de nouvelle association géographique pour innovation
    /// - Élargissement des marchés couverts par l'inventeur
    /// - Établissement de liens juridictionnels pour propriété intellectuelle
    /// 
    /// Sécurité et Conformité:
    /// - Validation juridique de l'association pays-inventeur
    /// - Audit trail de l'expansion géographique créative
    /// - Vérification conformité réglementations locales
    /// - Contrôle d'accès employé pour modifications stratégiques
    /// 
    /// Cas d'Usage:
    /// - Inventeur étend activité à nouveau marché géographique
    /// - Association inventeur à projet innovation international
    /// - Création lien juridictionnel pour dépôt brevet spécifique
    /// - Expansion portefeuille géographique client par inventeur
    /// </summary>
    /// <param name="inventeurId">Identifiant unique de l'inventeur</param>
    /// <param name="paysId">Identifiant du pays à associer à l'inventeur</param>
    /// <returns>Confirmation de l'association géographique créée</returns>
    [HttpPost("{inventeurId}/pays/{paysId}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<bool>>> AssignPaysToInventeur(int inventeurId, int paysId)
    {
        if (inventeurId <= 0 || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "IDs invalides"
            });
        }

        try
        {
            var result = await _inventeurService.AssignPaysToInventeurAsync(inventeurId, paysId);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'assignation du pays {PaysId} à l'inventeur {InventeurId}", paysId, inventeurId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Retire un pays d'un inventeur (retrait territoire créatif)
    /// 
    /// Fonctionnalité Métier:
    /// - Suppression d'une association géographique inventeur-pays
    /// - Retrait d'un territoire du portefeuille créatif
    /// - Gestion de la réduction d'activité sur marché spécifique
    /// - Nettoyage associations géographiques obsolètes
    /// 
    /// Sécurité et Conformité:
    /// - Validation impact sur brevets existants dans pays retiré
    /// - Audit trail du retrait géographique pour traçabilité
    /// - Vérification absence droits actifs avant suppression
    /// - Contrôle d'accès employé pour modifications critiques
    /// 
    /// Cas d'Usage:
    /// - Inventeur cesse activité sur marché géographique spécifique
    /// - Correction association pays erronée ou obsolète
    /// - Restructuration géographique portefeuille créatif
    /// - Nettoyage données suite changement stratégique client
    /// </summary>
    /// <param name="inventeurId">Identifiant unique de l'inventeur</param>
    /// <param name="paysId">Identifiant du pays à retirer de l'inventeur</param>
    /// <returns>Confirmation du retrait de l'association géographique</returns>
    [HttpDelete("{inventeurId}/pays/{paysId}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<bool>>> RemovePaysFromInventeur(int inventeurId, int paysId)
    {
        if (inventeurId <= 0 || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "IDs invalides"
            });
        }

        try
        {
            var result = await _inventeurService.RemovePaysFromInventeurAsync(inventeurId, paysId);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvée") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du retrait du pays {PaysId} de l'inventeur {InventeurId}", paysId, inventeurId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }
}
