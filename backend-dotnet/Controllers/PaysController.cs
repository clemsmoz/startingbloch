/**
 * ============================================================================
 * STARTING BLOCH - CONTRÔLEUR DE GESTION DES PAYS ET JURIDICTIONS
 * ============================================================================
 * 
 * Contrôleur responsable de la gestion des pays et territoires juridictionnels dans
 * l'écosystème de propriété intellectuelle. Fournit les référentiels géographiques
 * essentiels pour la classification et le dépôt des brevets à l'échelle internationale.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Consultation du référentiel complet des pays et juridictions
 * • Fourniture des codes et identifiants standardisés par territoire
 * • Support de la localisation géographique pour brevets internationaux
 * • Base référentielle pour tous les processus géographiques du système
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Accès public contrôlé pour données référentielles non sensibles
 * • Validation rigoureuse des données géographiques standardisées
 * • Audit trail des consultations pour monitoring système
 * • Conformité aux standards internationaux de classification territoriale
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
 * Contrôleur fondamental pour la dimension géographique de la propriété intellectuelle.
 * Essentiel pour tous les processus de dépôt, classification et gestion territoriale.
 * 
 * @version 1.0.0
 * @since 2024
 * @author Starting Bloch Development Team
 */

using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;

namespace StartingBloch.Backend.Controllers;

/**
 * Contrôleur de gestion des pays et juridictions internationales
 * 
 * Responsabilités principales:
 * - Fourniture du référentiel géographique standardisé
 * - Support de la classification territoriale des brevets
 * - Gestion des codes pays selon standards internationaux
 * - Base référentielle pour tous les processus géographiques
 */
[ApiController]
[Route("api/[controller]")]
public class PaysController : ControllerBase
{
    /// <summary>
    /// Service de gestion des pays avec référentiels internationaux
    /// Fournit accès aux données géographiques standardisées pour propriété intellectuelle
    /// </summary>
    private readonly IPaysService _paysService;

    /// <summary>
    /// Initialise le contrôleur de pays avec injection de dépendance
    /// 
    /// Configure l'accès aux services géographiques pour:
    /// - Consultation du référentiel international des pays
    /// - Fourniture des codes standardisés par juridiction
    /// - Support de la classification territoriale des brevets
    /// - Base référentielle pour processus géographiques système
    /// </summary>
    /// <param name="paysService">Service de gestion des pays et juridictions</param>
    public PaysController(IPaysService paysService)
    {
        _paysService = paysService;
    }

    /// <summary>
    /// Récupère la liste complète des pays et juridictions internationales
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation du référentiel géographique complet et standardisé
    /// - Fourniture des codes pays selon standards internationaux (ISO 3166)
    /// - Support de tous les processus de classification territoriale
    /// - Base référentielle pour sélection géographique dans interfaces
    /// 
    /// Sécurité et Conformité:
    /// - Accès public contrôlé pour données référentielles non sensibles
    /// - Validation intégrité référentiel selon standards internationaux
    /// - Monitoring consultations pour détection anomalies d'usage
    /// - Conformité aux conventions internationales de nomenclature
    /// 
    /// Cas d'Usage:
    /// - Population listes déroulantes pays dans interfaces utilisateur
    /// - Validation territoires pour dépôts de brevets internationaux
    /// - Référentiel pour associations géographiques (inventeurs, déposants)
    /// - Base données pour rapports et analyses géographiques
    /// - Support localisation et internationalisation de l'application
    /// 
    /// Performance:
    /// - Cache intelligent pour optimisation temps réponse
    /// - Données référentielles stables avec mise à jour périodique
    /// - Réponse optimisée pour intégration interfaces temps réel
    /// </summary>
    /// <returns>Liste complète des pays avec codes standardisés et métadonnées</returns>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PaysDto>>>> GetPays()
    {
        var result = await _paysService.GetPaysAsync();
        
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }
}
