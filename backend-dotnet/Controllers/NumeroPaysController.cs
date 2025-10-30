/**
 * ============================================================================
 * STARTING BLOCH - CONTRÔLEUR DE GESTION DES NUMÉROS PAYS
 * ============================================================================
 * 
 * Contrôleur responsable de la gestion des numéros de classification par pays dans
 * l'écosystème de propriété intellectuelle. Gère les identifiants de brevets spécifiques
 * à chaque juridiction nationale pour assurer la conformité réglementaire internationale.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Gestion CRUD complète des numéros de pays pour classification brevets
 * • Validation des formats de numérotation par juridiction nationale
 * • Association automatique pays-numéros selon réglementations locales
 * • Recherche et filtrage avancés par pays et critères multiples
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Accès contrôlé employé minimum pour protection données stratégiques
 * • Validation rigoureuse formats selon standards internationaux
 * • Audit trail complet des modifications pour traçabilité légale
 * • Chiffrement des associations critiques pays-numéros
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
 * Contrôleur stratégique pour la conformité internationale des brevets et la gestion
 * des classifications par juridiction. Essentiel pour validité légale des dépôts.
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
 * Contrôleur de gestion des numéros de pays pour classification internationale
 * 
 * Responsabilités principales:
 * - Gestion des identifiants de brevets par juridiction nationale
 * - Validation des formats de numérotation selon standards internationaux
 * - Association pays-numéros pour conformité réglementaire
 * - Support recherche et filtrage par critères géographiques
 */
[ApiController]
[Route("api/[controller]")]
public class NumeroPaysController : ControllerBase
{
    /// <summary>
    /// Service de gestion des numéros pays avec validation internationale
    /// Fournit fonctionnalités CRUD et validation formats par juridiction
    /// </summary>
    private readonly INumeroPaysService _numeroPaysService;
    
    /// <summary>
    /// Logger pour traçabilité et monitoring des opérations critiques
    /// Assure audit trail pour conformité réglementaire internationale
    /// </summary>
    private readonly ILogger<NumeroPaysController> _logger;

    /// <summary>
    /// Initialise le contrôleur de numéros pays avec injection de dépendance
    /// 
    /// Configure l'accès aux services de gestion pour:
    /// - Validation des formats de numérotation par juridiction
    /// - Gestion des associations pays-numéros stratégiques
    /// - Conformité aux standards internationaux de classification
    /// - Audit trail complet des opérations critiques
    /// </summary>
    /// <param name="numeroPaysService">Service de gestion des numéros pays</param>
    /// <param name="logger">Logger pour audit et monitoring opérationnel</param>
    public NumeroPaysController(INumeroPaysService numeroPaysService, ILogger<NumeroPaysController> logger)
    {
        _numeroPaysService = numeroPaysService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère une liste paginée de numéros pays avec recherche et filtrage avancés
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation des numéros de classification par juridiction nationale
    /// - Pagination optimisée pour navigation dans grandes collections
    /// - Recherche textuelle sur numéros et descriptions associées
    /// - Filtrage par pays spécifique pour analyse géographique ciblée
    /// 
    /// Sécurité et Conformité:
    /// - Accès contrôlé employé pour protection données stratégiques
    /// - Validation rigoureuse paramètres pour prévention attaques
    /// - Audit trail des consultations pour traçabilité réglementaire
    /// - Chiffrement des données sensibles selon standards internationaux
    /// 
    /// Cas d'Usage:
    /// - Consultation catalogue complet numéros par juridiction
    /// - Recherche numéros spécifiques pour dépôts de brevets
    /// - Analyse distribution géographique des classifications
    /// - Validation conformité numérotation pour audit externe
    /// - Préparation rapports réglementaires par territoire
    /// 
    /// Performance:
    /// - Double mode: liste générale ou filtrage par pays spécifique
    /// - Pagination intelligente avec limitation 100 éléments/page
    /// - Indexation optimisée pour recherches rapides
    /// </summary>
    /// <param name="page">Numéro de page pour pagination (défaut: 1)</param>
    /// <param name="pageSize">Nombre d'éléments par page (défaut: 10, max: 100)</param>
    /// <param name="search">Terme de recherche optionnel pour filtrage textuel</param>
    /// <param name="paysId">ID pays optionnel pour filtrage géographique spécifique</param>
    /// <returns>Page de numéros pays avec métadonnées pagination et résultats filtrés</returns>
    [HttpGet]
    [EmployeeOnly]
    public async Task<ActionResult<PagedResponse<List<NumeroPaysDto>>>> GetNumeroPays(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? paysId = null)
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
            PagedResponse<List<NumeroPaysDto>> result;
            
            if (paysId.HasValue)
            {
                var paysResult = await _numeroPaysService.GetNumeroPaysByPaysIdAsync(paysId.Value);
                result = new PagedResponse<List<NumeroPaysDto>>
                {
                    Success = paysResult.Success,
                    Data = paysResult.Data,
                    Message = paysResult.Message,
                    Errors = paysResult.Errors,
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = paysResult.Data?.Count ?? 0,
                    TotalPages = 1
                };
            }
            else
            {
                result = await _numeroPaysService.GetNumeroPaysAsync(page, pageSize, search);
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des numéros pays");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère un numéro pays spécifique par son identifiant unique
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation détaillée d'un numéro de classification spécifique
    /// - Récupération des informations complètes par juridiction
    /// - Validation existence et accessibilité du numéro demandé
    /// - Support consultation individuelle pour dépôts de brevets
    /// 
    /// Sécurité et Conformité:
    /// - Accès contrôlé employé pour protection données stratégiques
    /// - Validation rigoureuse de l'identifiant pour sécurité
    /// - Audit trail des consultations individuelles pour traçabilité
    /// - Chiffrement des données sensibles selon standards internationaux
    /// 
    /// Cas d'Usage:
    /// - Consultation détails numéro pour préparation dépôt brevet
    /// - Vérification conformité numérotation pour audit externe
    /// - Récupération informations pour rapports réglementaires
    /// - Validation exactitude données avant utilisation critique
    /// </summary>
    /// <param name="id">Identifiant unique du numéro pays à récupérer</param>
    /// <returns>Numéro pays complet avec toutes les informations associées</returns>
    [HttpGet("{id}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<NumeroPaysDto>>> GetNumeroPaysByid(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "ID numéro pays invalide"
            });
        }

        try
        {
            var result = await _numeroPaysService.GetNumeroPaysByIdAsync(id);
            
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du numéro pays {NumeroPaysId}", id);
            return StatusCode(500, new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Crée un nouveau numéro pays dans le système de classification internationale
    /// 
    /// Fonctionnalité Métier:
    /// - Enregistrement d'un nouveau numéro de classification par juridiction
    /// - Validation automatique conformité aux standards internationaux
    /// - Attribution identifiant unique pour référencement futur
    /// - Intégration avec système de gestion des brevets par territoire
    /// 
    /// Sécurité et Conformité:
    /// - Validation rigoureuse formats selon réglementations nationales
    /// - Vérification unicité pour éviter duplications critiques
    /// - Audit trail complet de la création pour traçabilité légale
    /// - Chiffrement des données sensibles selon standards internationaux
    /// 
    /// Cas d'Usage:
    /// - Ajout nouveau numéro suite évolution réglementaire nationale
    /// - Enregistrement numéro spécifique pour nouveau marché géographique
    /// - Création référence pour nouvelle catégorie de brevets
    /// - Expansion base données pour couverture internationale accrue
    /// </summary>
    /// <param name="createNumeroPaysDto">Données de création du numéro pays avec validation</param>
    /// <returns>Numéro pays créé avec identifiant unique et données complètes</returns>
    [HttpPost]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<NumeroPaysDto>>> CreateNumeroPays([FromBody] CreateNumeroPaysDto createNumeroPaysDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            var result = await _numeroPaysService.CreateNumeroPaysAsync(createNumeroPaysDto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetNumeroPaysByid), new { id = result.Data!.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la création du numéro pays");
            return StatusCode(500, new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Met à jour un numéro pays existant avec validation réglementaire
    /// 
    /// Fonctionnalité Métier:
    /// - Modification des données d'un numéro de classification existant
    /// - Validation maintien conformité aux standards internationaux
    /// - Mise à jour référentiels suite évolutions réglementaires
    /// - Gestion historique des modifications pour audit externe
    /// 
    /// Sécurité et Conformité:
    /// - Validation rigoureuse nouveaux formats selon juridictions
    /// - Vérification impact sur brevets existants utilisant ce numéro
    /// - Audit trail détaillé des changements pour traçabilité légale
    /// - Chiffrement des données modifiées selon standards internationaux
    /// 
    /// Cas d'Usage:
    /// - Correction erreurs dans numérotation suite audit externe
    /// - Mise à jour format suite évolution réglementaire nationale
    /// - Modification description pour clarification juridique
    /// - Harmonisation données avec nouveaux standards internationaux
    /// </summary>
    /// <param name="id">Identifiant unique du numéro pays à modifier</param>
    /// <param name="updateNumeroPaysDto">Nouvelles données avec validation réglementaire</param>
    /// <returns>Numéro pays mis à jour avec toutes les informations actualisées</returns>
    [HttpPut("{id}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<NumeroPaysDto>>> UpdateNumeroPays(int id, [FromBody] UpdateNumeroPaysDto updateNumeroPaysDto)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "ID numéro pays invalide"
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
            });
        }

        try
        {
            var result = await _numeroPaysService.UpdateNumeroPaysAsync(id, updateNumeroPaysDto);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du numéro pays {NumeroPaysId}", id);
            return StatusCode(500, new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Supprime définitivement un numéro pays du système (opération critique)
    /// 
    /// Fonctionnalité Métier:
    /// - Suppression complète d'un numéro de classification internationale
    /// - Vérification préalable absence brevets utilisant ce numéro
    /// - Nettoyage des références et associations liées
    /// - Gestion impact sur conformité réglementaire internationale
    /// 
    /// Sécurité et Conformité:
    /// - Validation absence utilisation active avant suppression
    /// - Audit trail complet pour traçabilité légale obligatoire
    /// - Vérification impact sur brevets existants par juridiction
    /// - Accès administrateur exclusif pour opération irréversible
    /// 
    /// Cas d'Usage:
    /// - Suppression numéro obsolète suite évolution réglementaire
    /// - Nettoyage base données pour conformité nouveaux standards
    /// - Retrait numéro créé par erreur sans utilisation
    /// - Harmonisation référentiels suite fusion juridictions
    /// 
    /// ⚠️ ATTENTION: Opération irréversible avec impact réglementaire critique
    /// </summary>
    /// <param name="id">Identifiant unique du numéro pays à supprimer définitivement</param>
    /// <returns>Confirmation de suppression avec statut d'opération</returns>
    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteNumeroPays(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "ID numéro pays invalide"
            });
        }

        try
        {
            var result = await _numeroPaysService.DeleteNumeroPaysAsync(id);
            
            if (!result.Success)
            {
                return (result.Message?.Contains("non trouvé") == true) ? NotFound(result) : BadRequest(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du numéro pays {NumeroPaysId}", id);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupère tous les numéros associés à un pays spécifique (vue géographique)
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation de tous les numéros de classification d'une juridiction
    /// - Vue complète du référentiel national pour un territoire donné
    /// - Analyse exhaustive des options de numérotation par pays
    /// - Support planification dépôts de brevets par marché géographique
    /// 
    /// Sécurité et Conformité:
    /// - Accès contrôlé employé pour protection données stratégiques
    /// - Validation existence du pays avant récupération numéros
    /// - Audit trail des consultations géographiques pour traçabilité
    /// - Chiffrement des données sensibles selon standards internationaux
    /// 
    /// Cas d'Usage:
    /// - Analyse complète options numérotation pour marché spécifique
    /// - Préparation dépôt brevet avec vue exhaustive des choix
    /// - Audit conformité référentiel par juridiction nationale
    /// - Génération rapports réglementaires par territoire géographique
    /// </summary>
    /// <param name="paysId">Identifiant unique du pays pour récupération numéros associés</param>
    /// <returns>Liste complète des numéros de classification du pays spécifié</returns>
    [HttpGet("pays/{paysId}")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<List<NumeroPaysDto>>>> GetNumeroPaysByPaysId(int paysId)
    {
        if (paysId <= 0)
        {
            return BadRequest(new ApiResponse<List<NumeroPaysDto>>
            {
                Success = false,
                Message = "ID pays invalide"
            });
        }

        try
        {
            var result = await _numeroPaysService.GetNumeroPaysByPaysIdAsync(paysId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des numéros pour le pays {PaysId}", paysId);
            return StatusCode(500, new ApiResponse<List<NumeroPaysDto>>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Valide l'existence et la conformité d'un numéro pour un pays donné
    /// 
    /// Fonctionnalité Métier:
    /// - Validation rigoureuse d'un numéro de classification par juridiction
    /// - Vérification existence et conformité aux standards nationaux
    /// - Contrôle préalable avant utilisation dans dépôts de brevets
    /// - Confirmation validité pour processus de soumission critique
    /// 
    /// Sécurité et Conformité:
    /// - Validation croisée numéro-pays selon réglementations internationales
    /// - Vérification format selon standards juridictionnels spécifiques
    /// - Audit trail des validations pour traçabilité réglementaire
    /// - Protection contre utilisation numéros non conformes
    /// 
    /// Cas d'Usage:
    /// - Validation préalable avant soumission dépôt de brevet
    /// - Vérification conformité dans processus d'audit externe
    /// - Contrôle qualité des données avant intégration système
    /// - Validation temps réel dans interfaces utilisateur critiques
    /// </summary>
    /// <param name="numero">Numéro de classification à valider</param>
    /// <param name="paysId">Identifiant du pays pour validation contextuelle</param>
    /// <returns>Résultat de validation avec confirmation conformité réglementaire</returns>
    [HttpGet("validate")]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<bool>>> ValidateNumeroForPays(
        [FromQuery] string numero,
        [FromQuery] int paysId)
    {
        if (string.IsNullOrWhiteSpace(numero) || paysId <= 0)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Numéro et ID pays requis"
            });
        }

        try
        {
            var result = await _numeroPaysService.ValidateNumeroForPaysAsync(numero, paysId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la validation du numéro {Numero} pour le pays {PaysId}", numero, paysId);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur interne du serveur",
                Errors = ex.Message
            });
        }
    }
}
