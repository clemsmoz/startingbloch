/*
 * ================================================================================================
 * INTERFACE SERVICE INVENTEURS - CONTRAT GESTION CRÉATEURS ET INNOVATEURS PI
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service inventeurs StartingBloch définissant gestion créateurs PI.
 * Spécification méthodes administration inventeurs avec nationalités multiples.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération inventeurs avec pagination et recherche
 * 🔍 DÉTAIL → Accès inventeur spécifique avec nationalités complètes
 * ➕ CRÉATION → Nouvel inventeur avec gestion pays
 * ✏️ MODIFICATION → Mise à jour informations inventeur
 * 🗑️ SUPPRESSION → Suppression inventeur avec audit
 * 🌍 NATIONALITÉS → Gestion pays multiples inventeur
 * 🔗 RELATIONS → Assignation/retrait pays Many-to-Many
 * 
 * GESTION NATIONALITÉS MULTIPLES :
 * ===============================
 * 🌍 PAYS → Récupération nationalités inventeur spécifique
 * ➕ ASSIGNATION → Attribution nouvelle nationalité
 * ❌ RETRAIT → Suppression nationalité existante
 * 🔄 GESTION → Administration relations Many-to-Many
 * 
 * DONNÉES INVENTEURS GÉRÉES :
 * ==========================
 * 👤 IDENTITÉ → Nom, prénom, coordonnées personnelles
 * 📧 COMMUNICATION → Email contact principal
 * 🌍 GÉOLOCALISATION → Pays nationalités multiples
 * 🔗 RELATIONS → Liens avec brevets créés/conçus
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, prénom, email)
 * ✅ Filtrage par pays ou nationalité
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri alphabétique par défaut
 * 
 * CONFORMITÉ INNOVATION :
 * ======================
 * ✅ Standards OMPI (Organisation Mondiale Propriété Intellectuelle)
 * ✅ Relations Many-to-Many avec pays via table liaison
 * ✅ Validation existence pays référentiels
 * ✅ Audit trail complet modifications
 * ✅ Protection droits créateurs internationaux
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
/// Interface service métier gestion inventeurs et créateurs propriété intellectuelle.
/// Contrat complet opérations CRUD avec gestion nationalités multiples sécurisées.
/// </summary>
public interface IInventeurService
{
    /// <summary>
    /// Récupère liste paginée inventeurs avec recherche textuelle multi-champs.
    /// Support recherche nom, prénom, email avec nationalités complètes.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée inventeurs avec pays nationalités</returns>
    Task<PagedResponse<List<InventeurDto>>> GetInventeursAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère inventeur spécifique avec nationalités complètes détaillées.
    /// Chargement optimisé inventeur avec pays multiples associés.
    /// </summary>
    /// <param name="id">Identifiant unique inventeur recherché</param>
    /// <returns>Inventeur détaillé avec liste pays nationalités</returns>
    Task<ApiResponse<InventeurDto>> GetInventeurByIdAsync(int id);
    
    /// <summary>
    /// Crée nouvel inventeur avec informations de base et audit trail.
    /// Initialisation inventeur sans pays, assignation ultérieure via méthodes.
    /// </summary>
    /// <param name="createInventeurDto">Données création inventeur de base</param>
    /// <returns>Inventeur créé avec identifiant système généré</returns>
    Task<ApiResponse<InventeurDto>> CreateInventeurAsync(CreateInventeurDto createInventeurDto);
    
    /// <summary>
    /// Met à jour inventeur existant avec nouvelles informations personnelles.
    /// Modification informations de base, gestion pays via méthodes spécialisées.
    /// </summary>
    /// <param name="id">Identifiant inventeur à modifier</param>
    /// <param name="updateInventeurDto">Nouvelles données personnelles inventeur</param>
    /// <returns>Inventeur modifié avec informations mises à jour</returns>
    Task<ApiResponse<InventeurDto>> UpdateInventeurAsync(int id, UpdateInventeurDto updateInventeurDto);
    
    /// <summary>
    /// Supprime inventeur avec gestion relations pays dépendantes.
    /// Vérification contraintes avant suppression définitive inventeur.
    /// </summary>
    /// <param name="id">Identifiant inventeur à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit trail</returns>
    Task<ApiResponse<bool>> DeleteInventeurAsync(int id);
    
    /// <summary>
    /// Récupère liste complète pays nationalités inventeur spécifique.
    /// Chargement optimisé nationalités multiples avec détails pays.
    /// </summary>
    /// <param name="inventeurId">Identifiant inventeur pour recherche pays</param>
    /// <returns>Liste pays nationalités avec codes ISO complets</returns>
    Task<ApiResponse<List<PaysDto>>> GetInventeurPaysAsync(int inventeurId);
    
    /// <summary>
    /// Assigne nouvelle nationalité à inventeur avec validation unicité.
    /// Création relation Many-to-Many sécurisée avec vérification existence.
    /// </summary>
    /// <param name="inventeurId">Identifiant inventeur cible assignation</param>
    /// <param name="paysId">Identifiant pays à assigner comme nationalité</param>
    /// <returns>Confirmation succès assignation pays inventeur</returns>
    Task<ApiResponse<bool>> AssignPaysToInventeurAsync(int inventeurId, int paysId);
    
    /// <summary>
    /// Retire nationalité inventeur avec validation existence relation.
    /// Suppression relation Many-to-Many avec vérification préalable.
    /// </summary>
    /// <param name="inventeurId">Identifiant inventeur cible retrait</param>
    /// <param name="paysId">Identifiant pays à retirer des nationalités</param>
    /// <returns>Confirmation succès retrait pays inventeur</returns>
    Task<ApiResponse<bool>> RemovePaysFromInventeurAsync(int inventeurId, int paysId);
}
