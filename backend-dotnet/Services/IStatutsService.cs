/*
 * ================================================================================================
 * INTERFACE SERVICE STATUTS - CONTRAT GESTION ÉTATS BREVETS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service statuts StartingBloch définissant gestion états brevets.
 * Spécification méthodes CRUD statuts avec cycle vie juridique propriété intellectuelle.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération complète statuts disponibles
 * 🔍 DÉTAIL → Accès statut spécifique avec métadonnées
 * ✨ CRÉATION → Ajout nouveaux statuts système
 * ❌ SUPPRESSION → Retrait statuts obsolètes avec validation
 * 
 * STATUTS CYCLE VIE BREVET :
 * ==========================
 * 📝 EN_PREPARATION → Brevet en cours de rédaction
 * 📤 DÉPOSÉ → Demande brevet déposée officiellement
 * 🔍 EN_EXAMEN → Examen en cours par office
 * ✅ ACCORDÉ → Brevet accordé et valide
 * ❌ REJETÉ → Demande rejetée définitivement
 * 💸 ABANDONNÉ → Procédure abandonnée volontairement
 * ⏳ EXPIRÉ → Brevet arrivé à expiration
 * 🔄 EN_OPPOSITION → Procédure opposition en cours
 * 📋 MAINTENU → Brevet maintenu après opposition
 * 🗑️ RÉVOQUÉ → Brevet révoqué par autorité
 * 
 * TRANSITIONS ÉTAT AUTORISÉES :
 * =============================
 * EN_PREPARATION → DÉPOSÉ → EN_EXAMEN → ACCORDÉ/REJETÉ
 * ACCORDÉ → EN_OPPOSITION → MAINTENU/RÉVOQUÉ
 * ACCORDÉ → EXPIRÉ (fin protection)
 * Toute étape → ABANDONNÉ (procédure stop)
 * 
 * MÉTADONNÉES STATUT :
 * ===================
 * 🏷️ LIBELLÉ → Nom statut français/anglais
 * 📝 DESCRIPTION → Explication détaillée statut
 * 🔄 TRANSITIONS → États suivants possibles
 * ⚖️ IMPLICATIONS → Conséquences juridiques
 * 📅 DURÉE → Durée typique dans statut
 * 
 * CONFORMITÉ JURIDIQUE :
 * ======================
 * ✅ INPI → Institut National Propriété Industrielle
 * ✅ EPO → European Patent Office standards
 * ✅ WIPO → World Intellectual Property Organization
 * ✅ TRIPS → Trade-Related Aspects IP Rights
 * 
 * INTÉGRATION SYSTÈME :
 * ====================
 * 🔗 BREVETS → Association statuts aux brevets
 * 📊 REPORTING → Statistiques répartition statuts
 * 🔔 ALERTES → Notifications changements statut
 * 📋 WORKFLOW → Automatisation transitions
 * 
 * CONTRÔLES VALIDATION :
 * =====================
 * ✅ Unicité libellés statuts système
 * ✅ Cohérence transitions état autorisées
 * ✅ Validation suppression si brevets associés
 * ✅ Audit trail modifications statuts
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
/// Interface service métier gestion statuts brevets avec cycle vie juridique.
/// Contrat CRUD statuts avec validation transitions et conformité PI.
/// </summary>
public interface IStatutsService
{
    /// <summary>
    /// Récupère liste complète statuts brevets système disponibles.
    /// Chargement optimisé statuts avec métadonnées cycle vie.
    /// </summary>
    /// <returns>Liste statuts avec descriptions et transitions autorisées</returns>
    Task<ApiResponse<List<StatutDto>>> GetStatutsAsync();
    
    /// <summary>
    /// Récupère statut spécifique avec informations détaillées complètes.
    /// Chargement optimisé statut avec transitions et implications juridiques.
    /// </summary>
    /// <param name="id">Identifiant unique statut recherché</param>
    /// <returns>Statut détaillé avec métadonnées ou erreur</returns>
    Task<ApiResponse<StatutDto>> GetStatutByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau statut brevet avec validation métier complète.
    /// Création sécurisée avec contrôle unicité et cohérence système.
    /// </summary>
    /// <param name="createStatutDto">Données création statut avec libellé unique</param>
    /// <returns>Statut créé avec identifiant et métadonnées</returns>
    Task<ApiResponse<StatutDto>> CreateStatutAsync(CreateStatutDto createStatutDto);
    
    /// <summary>
    /// Supprime statut système avec validation contraintes référentielles.
    /// Suppression sécurisée avec vérification brevets associés existants.
    /// </summary>
    /// <param name="id">Identifiant statut à supprimer du système</param>
    /// <returns>Confirmation suppression avec audit trail</returns>
    Task<ApiResponse<bool>> DeleteStatutAsync(int id);
}
