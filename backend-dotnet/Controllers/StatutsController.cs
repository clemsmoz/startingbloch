/**
 * ============================================================================
 * STARTING BLOCH - CONTRÔLEUR DE GESTION DES STATUTS DE BREVETS
 * ============================================================================
 * 
 * Contrôleur responsable de la gestion des statuts et états des brevets dans
 * l'écosystème de propriété intellectuelle. Fournit le référentiel des états
 * légaux et administratifs critiques pour le suivi du cycle de vie des brevets.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Consultation du référentiel complet des statuts de brevets
 * • Fourniture des états légaux standardisés (en cours, accordé, rejeté, etc.)
 * • Support du workflow de gestion et suivi des brevets
 * • Base référentielle pour tous les processus de statut système
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Accès contrôlé employé pour protection données stratégiques
 * • Validation rigoureuse des statuts selon standards légaux
 * • Audit trail des consultations pour traçabilité réglementaire
 * • Conformité aux exigences juridiques de classification des états
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
 * Contrôleur critique pour le suivi légal et administratif des brevets.
 * Essentiel pour la conformité réglementaire et la gestion du cycle de vie.
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
 * Contrôleur de gestion des statuts de brevets et états légaux
 * 
 * Responsabilités principales:
 * - Fourniture du référentiel des statuts légaux standardisés
 * - Support du workflow de gestion des états de brevets
 * - Gestion des transitions d'états selon réglementations
 * - Base référentielle pour tous les processus de statut
 */
[ApiController]
[Route("api/[controller]")]
public class StatutsController : ControllerBase
{
    /// <summary>
    /// Service de gestion des statuts avec validation légale
    /// Fournit accès aux états standardisés pour cycle de vie des brevets
    /// </summary>
    private readonly IStatutsService _statutsService;

    /// <summary>
    /// Initialise le contrôleur de statuts avec injection de dépendance
    /// 
    /// Configure l'accès aux services de gestion pour:
    /// - Consultation du référentiel des statuts légaux
    /// - Validation des états selon réglementations en vigueur
    /// - Support du workflow de gestion des brevets
    /// - Base référentielle pour processus de statut système
    /// </summary>
    /// <param name="statutsService">Service de gestion des statuts de brevets</param>
    public StatutsController(IStatutsService statutsService)
    {
        _statutsService = statutsService;
    }

    /// <summary>
    /// Récupère la liste complète des statuts de brevets avec validation légale
    /// 
    /// Fonctionnalité Métier:
    /// - Consultation du référentiel des statuts légaux standardisés
    /// - Fourniture des états officiels du cycle de vie des brevets
    /// - Support de la classification des états selon réglementations
    /// - Base référentielle pour workflow de gestion et suivi
    /// 
    /// Sécurité et Conformité:
    /// - Accès contrôlé employé pour protection données stratégiques
    /// - Validation intégrité référentiel selon standards légaux
    /// - Audit trail des consultations pour traçabilité réglementaire
    /// - Conformité aux exigences juridiques de classification des états
    /// 
    /// Cas d'Usage:
    /// - Population listes déroulantes statuts dans interfaces de gestion
    /// - Validation états pour workflow de brevets et transitions légales
    /// - Référentiel pour rapports de suivi et analyses de statuts
    /// - Support processus d'audit et conformité réglementaire
    /// - Base données pour alertes automatiques de changements d'états
    /// 
    /// Statuts Typiques:
    /// - En cours d'examen, Accordé, Rejeté, Expiré, Abandonné
    /// - Suspendu, En opposition, En recours, etc.
    /// </summary>
    /// <returns>Liste complète des statuts avec codes standardisés et descriptions légales</returns>
    [HttpGet]
    [EmployeeOnly]
    public async Task<ActionResult<ApiResponse<List<StatutDto>>>> GetStatuts()
    {
        var result = await _statutsService.GetStatutsAsync();
        
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }
}
