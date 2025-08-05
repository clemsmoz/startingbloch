/*
 * ================================================================================================
 * INTERFACE SERVICE LOGS - CONTRAT AUDIT TRAIL ET TRAÇABILITÉ SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service logs StartingBloch définissant audit trail complet.
 * Spécification méthodes traçabilité actions utilisateurs et événements système.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération logs avec pagination et recherche
 * 👤 UTILISATEUR → Logs spécifiques utilisateur pour audit
 * ➕ CRÉATION → Nouveau log événement avec métadonnées
 * 🧹 MAINTENANCE → Purge logs anciens pour optimisation
 * 🔍 RECHERCHE → Filtrage logs par critères multiples
 * 
 * AUDIT TRAIL COMPLET :
 * ====================
 * 🔐 AUTHENTIFICATION → Connexions, déconnexions, tentatives
 * 📝 MODIFICATIONS → CRUD sur toutes entités métier
 * 🔍 CONSULTATIONS → Accès données sensibles
 * ⚠️ ERREURS → Exceptions et erreurs système
 * 🔒 SÉCURITÉ → Tentatives accès non autorisées
 * 
 * TYPES ÉVÉNEMENTS TRACÉS :
 * =========================
 * ✅ Actions utilisateurs (CRUD, recherche, export)
 * ✅ Événements sécurité (auth, permissions, violations)
 * ✅ Erreurs système (exceptions, timeouts, corruptions)
 * ✅ Performance (requêtes lentes, ressources)
 * ✅ Maintenance (backups, purges, migrations)
 * 
 * GESTION RÉTENTION DONNÉES :
 * ==========================
 * 📅 ARCHIVAGE → Conservation logs selon politiques
 * 🧹 PURGE → Suppression automatique logs anciens
 * 📊 STATISTIQUES → Agrégations pour reporting
 * 🔒 PROTECTION → Chiffrement logs sensibles
 * 
 * CONFORMITÉ RÉGLEMENTAIRE :
 * =========================
 * ✅ RGPD → Traçabilité accès données personnelles
 * ✅ ISO 27001 → Audit sécurité informations
 * ✅ SOX → Contrôles internes financiers
 * ✅ ANSSI → Recommandations cybersécurité
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Pagination optimisée volumes importants
 * ✅ Recherche textuelle dans messages/actions
 * ✅ Filtrage par utilisateur, date, type
 * ✅ Export pour analyses externes
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
/// Interface service métier gestion audit trail et traçabilité système complet.
/// Contrat logs événements utilisateurs avec recherche et maintenance optimisées.
/// </summary>
public interface ILogService
{
    /// <summary>
    /// Récupère liste paginée logs avec recherche textuelle optimisée.
    /// Support filtrage par action, utilisateur, date avec navigation efficace.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel dans actions/messages</param>
    /// <returns>Réponse paginée logs avec métadonnées audit</returns>
    Task<PagedResponse<List<LogDto>>> GetLogsAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère historique complet actions utilisateur spécifique.
    /// Audit trail personnalisé pour analyse comportement utilisateur.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour historique</param>
    /// <returns>Liste chronologique logs utilisateur avec détails</returns>
    Task<ApiResponse<List<LogDto>>> GetLogsByUserAsync(int userId);
    
    /// <summary>
    /// Crée nouveau log événement avec horodatage et métadonnées.
    /// Enregistrement audit trail avec informations contextuelles complètes.
    /// </summary>
    /// <param name="createLogDto">Données log avec action, utilisateur, contexte</param>
    /// <returns>Confirmation succès création log audit</returns>
    Task<ApiResponse<bool>> CreateLogAsync(CreateLogDto createLogDto);
    
    /// <summary>
    /// Purge logs antérieurs à date spécifiée pour optimisation stockage.
    /// Maintenance automatique avec respect politiques rétention données.
    /// </summary>
    /// <param name="beforeDate">Date limite pour purge logs anciens</param>
    /// <returns>Confirmation succès purge avec statistiques</returns>
    Task<ApiResponse<bool>> ClearOldLogsAsync(DateTime beforeDate);
}
