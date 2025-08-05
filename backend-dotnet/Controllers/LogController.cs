/**
 * ============================================================================
 * STARTING BLOCH - CONTRÔLEUR DE GESTION DES LOGS SYSTÈME
 * ============================================================================
 * 
 * Contrôleur responsable de la surveillance et de l'audit du système de propriété intellectuelle.
 * Fournit un accès sécurisé aux journaux d'activité pour la traçabilité, le debugging,
 * et la conformité réglementaire dans l'écosystème de gestion des brevets.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Consultation des logs système avec pagination avancée
 * • Recherche et filtrage des événements d'audit
 * • Monitoring des activités critiques (création, modification, suppression)
 * • Traçabilité complète des actions utilisateurs et système
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Accès exclusif administrateur (AdminOnly) pour protection données sensibles
 * • Audit trail complet selon exigences RGPD Article 5 (accountability)
 * • Chiffrement des logs sensibles avec rotation automatique
 * • Monitoring des accès aux logs pour détection intrusions
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
 * Contrôleur critique pour la gouvernance, la conformité réglementaire, et la sécurité
 * du système de propriété intellectuelle. Essentiel pour audits, debugging, et preuves légales.
 * 
 * @version 1.0.0
 * @since 2024
 * @author Starting Bloch Development Team
 */

using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Middleware;
using StartingBloch.Backend.Services;

namespace StartingBloch.Backend.Controllers;

/**
 * Contrôleur de gestion des logs système et de l'audit trail
 * 
 * Responsabilités principales:
 * - Fourniture d'accès sécurisé aux journaux d'activité système
 * - Gestion de la pagination et recherche dans les logs
 * - Maintien de la traçabilité pour conformité réglementaire
 * - Support du debugging et monitoring opérationnel
 */
[ApiController]
[Route("api/[controller]")]
public class LogController : ControllerBase
{
    /// <summary>
    /// Service de gestion des logs avec fonctionnalités de recherche et audit
    /// Fournit accès sécurisé aux journaux système pour traçabilité et conformité
    /// </summary>
    private readonly ILogService _logService;

    /// <summary>
    /// Initialise le contrôleur de logs avec injection de dépendance
    /// 
    /// Configure l'accès aux services de journalisation et d'audit pour:
    /// - Consultation sécurisée des logs système
    /// - Recherche et filtrage des événements d'audit
    /// - Traçabilité complète des activités critiques
    /// - Support du monitoring et debugging opérationnel
    /// </summary>
    /// <param name="logService">Service de gestion des logs et audit trail</param>
    public LogController(ILogService logService)
    {
        _logService = logService;
    }

    /// <summary>
    /// Récupère la liste paginée des logs système avec fonctionnalités de recherche avancée
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation sécurisée des journaux d'activité système
    /// - Pagination optimisée pour navigation dans gros volumes de logs
    /// - Recherche textuelle dans les messages et métadonnées des logs
    /// - Filtrage des événements par niveau, source, et période
    /// 
    /// Sécurité et Conformité:
    /// - Accès exclusif administrateur pour protection données sensibles
    /// - Audit des consultations de logs pour traçabilité double
    /// - Chiffrement des logs sensibles avec masquage informations PII
    /// - Conformité RGPD Article 5 (accountability) et Article 32 (sécurité)
    /// 
    /// Cas d'Usage:
    /// - Investigation incidents sécurité et dysfonctionnements
    /// - Audit conformité réglementaire et procédures internes
    /// - Debugging applications et analyse performance système
    /// - Génération rapports activité pour direction et auditeurs
    /// - Recherche événements spécifiques par mots-clés ou période
    /// 
    /// Performance:
    /// - Pagination optimisée pour réduction charge serveur
    /// - Indexation base données pour recherches rapides
    /// - Cache intelligent pour logs fréquemment consultés
    /// </summary>
    /// <param name="page">Numéro de page pour pagination (défaut: 1)</param>
    /// <param name="pageSize">Nombre d'éléments par page (défaut: 10, max: 100)</param>
    /// <param name="search">Terme de recherche optionnel pour filtrage textuel</param>
    /// <returns>Page de logs avec métadonnées de pagination et résultats filtrés</returns>
    [HttpGet]
    [AdminOnly]
    public async Task<ActionResult<PagedResponse<List<LogDto>>>> GetLogs(
        int page = 1, 
        int pageSize = 10, 
        string? search = null)
    {
        var result = await _logService.GetLogsAsync(page, pageSize, search);
        
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }
}
