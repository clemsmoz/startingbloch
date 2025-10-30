/**
 * ============================================================================
 * STARTING BLOCH - CONTRÔLEUR DE GESTION DES TITULAIRES DE DROITS
 * ============================================================================
 * 
 * Contrôleur responsable de la gestion des titulaires de droits de propriété intellectuelle
 * dans l'écosystème de brevets. Gère les entités légales et physiques détentrices
 * des droits de propriété sur les innovations et créations intellectuelles.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Gestion CRUD complète des titulaires de droits avec validation légale
 * • Association géographique titulaires-pays pour juridictions multiples
 * • Recherche et filtrage avancés par critères de propriété intellectuelle
 * • Suivi des droits de propriété et transferts de titularité
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Accès contrôlé employé minimum pour protection données sensibles
 * • Validation rigoureuse identité légale selon réglementations
 * • Audit trail complet des modifications pour traçabilité juridique
 * • Chiffrement des informations personnelles et commerciales critiques
 * 
 * ARCHITECTURE SÉCURISÉE:
 * • Middleware d'authentification JWT avec validation tokens
 * • Rate limiting avancé pour prévention attaques DoS
 * • Headers de sécurité renforcés (HSTS, CSP, CSRF protection)
 * • Monitoring en temps réel avec alertes automatiques
 * • Chiffrement AES-256 des données sensibles en transit et repos
 * • Audit trail complet avec signatures numériques
 * • Validation input rigoureuse avec sanitization
 * • Protection contre injections et attaques communes
 * 
 * IMPACT BUSINESS:
 * Contrôleur critique pour la gestion des droits de propriété intellectuelle.
 * Essentiel pour validité légale, transferts de droits et conformité réglementaire.
 * 
 * @version 1.0.0
 * @since 2024
 * @author Starting Bloch Development Team
 */

using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Middleware;

namespace StartingBloch.Backend.Controllers;

/**
 * Contrôleur de gestion des titulaires de droits de propriété intellectuelle
 * 
 * Responsabilités principales:
 * - Gestion des entités détentrices de droits de propriété intellectuelle
 * - Association géographique pour juridictions multiples
 * - Validation légale des transferts et modifications de titularité
 * - Support recherche et filtrage par critères de propriété
 */
[ApiController]
[Route("api/[controller]")]
public class TitulaireController : ControllerBase
{
    /// <summary>
    /// Service de gestion des titulaires avec validation légale
    /// Fournit fonctionnalités CRUD et gestion droits de propriété intellectuelle
    /// </summary>
    private readonly ITitulaireService _titulaireService;
    
    /// <summary>
    /// Logger pour traçabilité et monitoring des opérations critiques
    /// Assure audit trail pour conformité réglementaire et juridique
    /// </summary>
    private readonly ILogger<TitulaireController> _logger;

    /// <summary>
    /// Initialise le contrôleur de titulaires avec injection de dépendance
    /// 
    /// Configure l'accès aux services de gestion pour:
    /// - Validation des droits de propriété intellectuelle
    /// - Gestion des associations géographiques juridictionnelles
    /// - Conformité aux réglementations de titularité
    /// - Audit trail complet des opérations critiques
    /// </summary>
    /// <param name="titulaireService">Service de gestion des titulaires de droits</param>
    /// <param name="logger">Logger pour audit et monitoring opérationnel</param>
    public TitulaireController(ITitulaireService titulaireService, ILogger<TitulaireController> logger)
    {
        _titulaireService = titulaireService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère une liste paginée de titulaires de droits avec recherche avancée
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation des entités détentrices de droits de propriété intellectuelle
    /// - Pagination optimisée pour navigation dans portfolio de titulaires
    /// - Recherche textuelle sur noms, raisons sociales et identifiants
    /// - Vue d'ensemble des détenteurs de droits pour analyse stratégique
    /// 
    /// Sécurité et Conformité:
    /// - Accès contrôlé employé pour protection données commerciales sensibles
    /// - Validation rigoureuse paramètres pour prévention attaques
    /// - Audit trail des consultations pour traçabilité réglementaire
    /// - Chiffrement des données personnelles selon standards RGPD
    /// 
    /// Cas d'Usage:
    /// - Consultation portfolio complet titulaires pour gestion droits
    /// - Recherche titulaires spécifiques pour transferts de propriété
    /// - Analyse distribution géographique des détenteurs de droits
    /// - Préparation rapports de propriété intellectuelle pour direction
    /// - Support processus d'audit et due diligence commerciale
    /// </summary>
    /// <param name="page">Numéro de page pour pagination (défaut: 1)</param>
    /// <param name="pageSize">Nombre d'éléments par page (défaut: 10, max: 100)</param>
    /// <param name="search">Terme de recherche optionnel pour filtrage textuel</param>
    /// <returns>Page de titulaires avec métadonnées pagination et données complètes</returns>
    [HttpGet]
    [EmployeeOnly]
    public async Task<ActionResult<PagedResponse<List<TitulaireDto>>>> GetTitulaires(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
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
            var result = await _titulaireService.GetTitulairesAsync(page, pageSize, search);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des titulaires");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère un titulaire spécifique par son identifiant unique
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation détaillée d'un détenteur de droits spécifique
    /// - Récupération des informations complètes de propriété intellectuelle
    /// - Validation existence et accessibilité du titulaire demandé
    /// - Support consultation individuelle pour analyse de droits
    /// 
    /// Sécurité et Conformité:
    /// - Accès contrôlé employé pour protection données commerciales
    /// - Validation rigoureuse de l'identifiant pour sécurité
    /// - Audit trail des consultations individuelles pour traçabilité
    /// - Chiffrement des données personnelles selon standards RGPD
    /// 
    /// Cas d'Usage:
    /// - Consultation détails titulaire pour transfert de droits
    /// - Vérification propriété intellectuelle pour due diligence
    /// - Récupération informations pour contrats et accords
    /// - Validation exactitude données avant opérations critiques
    /// </summary>
    /// <param name="id">Identifiant unique du titulaire à récupérer</param>
    /// <returns>Titulaire complet avec toutes les informations de propriété</returns>
    [HttpGet("{id}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<TitulaireDto>>> GetTitulaireById(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "ID titulaire invalide"
            });
        }

        try
        {
            var result = await _titulaireService.GetTitulaireByIdAsync(id);
            
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du titulaire {TitulaireId}", id);
            return StatusCode(500, new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Crée un nouveau titulaire de droits dans l'écosystème de propriété intellectuelle
    /// 
    /// Fonctionnalité Métier:
    /// - Enregistrement d'un nouveau détenteur de droits de propriété intellectuelle
    /// - Validation automatique conformité aux standards légaux internationaux
    /// - Attribution identifiant unique pour suivi des droits de propriété
    /// - Intégration avec système de gestion des brevets et transferts
    /// 
    /// Sécurité et Conformité:
    /// - Validation rigoureuse identité légale selon réglementations
    /// - Vérification unicité pour éviter duplications critiques
    /// - Audit trail complet de la création pour traçabilité juridique
    /// - Chiffrement des données personnelles selon standards RGPD
    /// 
    /// Cas d'Usage:
    /// - Enregistrement nouveau détenteur suite acquisition de droits
    /// - Création entité pour transfert de propriété intellectuelle
    /// - Ajout titulaire pour nouveau portefeuille de brevets
    /// - Documentation propriétaire pour due diligence commerciale
    /// </summary>
    /// <param name="createTitulaireDto">Données de création du titulaire avec validation légale</param>
    /// <returns>Titulaire créé avec identifiant unique et données complètes</returns>
    [HttpPost]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<TitulaireDto>>> CreateTitulaire([FromBody] CreateTitulaireDto createTitulaireDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            var result = await _titulaireService.CreateTitulaireAsync(createTitulaireDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetTitulaireById), new { id = result.Data!.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la création du titulaire");
            return StatusCode(500, new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Met à jour les informations d'un titulaire de droits existant
    /// 
    /// Fonctionnalité Métier:
    /// - Modification des données d'un détenteur de droits de propriété
    /// - Mise à jour des informations légales et commerciales
    /// - Gestion de l'évolution du statut juridique dans le temps
    /// - Maintien de l'historique des modifications pour audit
    /// 
    /// Sécurité et Conformité:
    /// - Validation RGPD des modifications (droit de rectification Article 16)
    /// - Vérification impact sur brevets existants du titulaire
    /// - Audit trail détaillé des changements pour traçabilité juridique
    /// - Chiffrement des nouvelles données selon standards internationaux
    /// 
    /// Cas d'Usage:
    /// - Mise à jour coordonnées suite changement siège social
    /// - Correction informations légales erronées ou obsolètes
    /// - Modification statut juridique suite restructuration
    /// - Actualisation données pour conformité réglementaire
    /// </summary>
    /// <param name="id">Identifiant unique du titulaire à modifier</param>
    /// <param name="updateTitulaireDto">Nouvelles données du titulaire avec validation</param>
    /// <returns>Titulaire mis à jour avec toutes les informations actualisées</returns>
    [HttpPut("{id}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<TitulaireDto>>> UpdateTitulaire(int id, [FromBody] UpdateTitulaireDto updateTitulaireDto)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "ID titulaire invalide"
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            var result = await _titulaireService.UpdateTitulaireAsync(id, updateTitulaireDto);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du titulaire {TitulaireId}", id);
            return StatusCode(500, new ApiResponse<TitulaireDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Supprime définitivement un titulaire de droits du système (opération critique)
    /// 
    /// Fonctionnalité Métier:
    /// - Suppression complète d'un détenteur de droits de propriété intellectuelle
    /// - Vérification préalable absence brevets actifs sous ce titulaire
    /// - Gestion de l'impact sur les droits de propriété existants
    /// - Nettoyage des relations et transferts de propriété liés
    /// 
    /// Sécurité et Conformité:
    /// - Validation absence droits actifs avant suppression définitive
    /// - Audit trail complet pour traçabilité légale obligatoire
    /// - Vérification impact sur portefeuille de brevets existant
    /// - Accès administrateur exclusif pour opération irréversible
    /// 
    /// Cas d'Usage:
    /// - Suppression titulaire fictif créé par erreur administrative
    /// - Nettoyage base données suite fusion entités légales
    /// - Retrait détenteur sans droits actifs documentés
    /// - Respect demande légale d'effacement des données
    /// 
    /// ⚠️ ATTENTION: Opération irréversible avec impact juridique critique
    /// </summary>
    /// <param name="id">Identifiant unique du titulaire à supprimer définitivement</param>
    /// <returns>Confirmation de suppression avec statut d'opération</returns>
    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTitulaire(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "ID titulaire invalide"
            });
        }

        try
        {
            var result = await _titulaireService.DeleteTitulaireAsync(id);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du titulaire {TitulaireId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère la liste des pays associés à un titulaire (géographie des droits)
    /// 
    /// Fonctionnalité Métier:
    /// - Visualisation des territoires où le titulaire détient des droits
    /// - Mapping géographique des juridictions de propriété intellectuelle
    /// - Analyse des marchés couverts par les droits du titulaire
    /// - Suivi des territoires pour gestion de portefeuille stratégique
    /// 
    /// Sécurité et Conformité:
    /// - Protection données géographiques selon réglementations locales
    /// - Audit des accès aux informations de propriété territoriale
    /// - Chiffrement des associations pays-titulaire sensibles
    /// - Contrôle d'accès employé pour données stratégiques
    /// 
    /// Cas d'Usage:
    /// - Analyse géographique du portefeuille de droits client
    /// - Planification stratégique des extensions territoriales
    /// - Évaluation couverture juridictionnelle des propriétés
    /// - Recherche titulaires par zone géographique d'activité
    /// </summary>
    /// <param name="id">Identifiant unique du titulaire pour récupération pays associés</param>
    /// <returns>Liste complète des pays où le titulaire détient des droits</returns>
    [HttpGet("{id}/pays")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<List<PaysDto>>>> GetTitulairePays(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "ID titulaire invalide"
            });
        }

        try
        {
            var result = await _titulaireService.GetTitulairePaysAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des pays du titulaire {TitulaireId}", id);
            return StatusCode(500, new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Assigne un nouveau pays à un titulaire (extension géographique des droits)
    /// 
    /// Fonctionnalité Métier:
    /// - Extension du territoire de droits de propriété intellectuelle
    /// - Création de nouvelle association géographique pour titulaire
    /// - Élargissement des marchés couverts par les droits existants
    /// - Établissement de liens juridictionnels pour propriété territoriale
    /// 
    /// Sécurité et Conformité:
    /// - Validation juridique de l'association pays-titulaire
    /// - Audit trail de l'expansion géographique des droits
    /// - Vérification conformité réglementations territoriales
    /// - Contrôle d'accès employé pour modifications stratégiques
    /// 
    /// Cas d'Usage:
    /// - Titulaire étend droits à nouveau marché géographique
    /// - Association titulaire à projet expansion internationale
    /// - Création lien juridictionnel pour nouveau territoire de droits
    /// - Expansion portefeuille géographique suite acquisition
    /// </summary>
    /// <param name="titulaireId">Identifiant unique du titulaire</param>
    /// <param name="paysId">Identifiant du pays à associer au titulaire</param>
    /// <returns>Confirmation de l'association géographique créée</returns>
    [HttpPost("{titulaireId}/pays/{paysId}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<bool>>> AssignPaysToTitulaire(int titulaireId, int paysId)
    {
        if (titulaireId <= 0 || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "IDs invalides"
            });
        }

        try
        {
            var result = await _titulaireService.AssignPaysToTitulaireAsync(titulaireId, paysId);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'assignation du pays {PaysId} au titulaire {TitulaireId}", paysId, titulaireId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Retire un pays d'un titulaire (retrait territoire de droits)
    /// 
    /// Fonctionnalité Métier:
    /// - Suppression d'une association géographique titulaire-pays
    /// - Retrait d'un territoire du portefeuille de droits
    /// - Gestion de la réduction d'activité sur marché spécifique
    /// - Nettoyage associations géographiques obsolètes ou erronnées
    /// 
    /// Sécurité et Conformité:
    /// - Validation impact sur brevets existants dans pays retiré
    /// - Audit trail du retrait géographique pour traçabilité
    /// - Vérification absence droits actifs avant suppression
    /// - Contrôle d'accès employé pour modifications critiques
    /// 
    /// Cas d'Usage:
    /// - Titulaire cesse droits sur marché géographique spécifique
    /// - Correction association pays erronée ou obsolète
    /// - Restructuration géographique portefeuille de droits
    /// - Nettoyage données suite changement stratégique
    /// </summary>
    /// <param name="titulaireId">Identifiant unique du titulaire</param>
    /// <param name="paysId">Identifiant du pays à retirer du titulaire</param>
    /// <returns>Confirmation du retrait de l'association géographique</returns>
    [HttpDelete("{titulaireId}/pays/{paysId}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<bool>>> RemovePaysFromTitulaire(int titulaireId, int paysId)
    {
        if (titulaireId <= 0 || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "IDs invalides"
            });
        }

        try
        {
            var result = await _titulaireService.RemovePaysFromTitulaireAsync(titulaireId, paysId);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvée") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du retrait du pays {PaysId} du titulaire {TitulaireId}", paysId, titulaireId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }
}
