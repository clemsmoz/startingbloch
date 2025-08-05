/*
 * ================================================================================================
 * INTERFACE SERVICE DÉPOSANTS - CONTRAT GESTION INVENTEURS ET DÉPOSANTS PI
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service déposants StartingBloch définissant gestion créateurs PI.
 * Spécification méthodes administration déposants avec nationalités multiples.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération déposants avec pagination et recherche
 * 🔍 DÉTAIL → Accès déposant spécifique avec nationalités complètes
 * ➕ CRÉATION → Nouveau déposant avec gestion pays
 * ✏️ MODIFICATION → Mise à jour informations déposant
 * 🗑️ SUPPRESSION → Suppression déposant avec audit
 * 🌍 NATIONALITÉS → Gestion pays multiples déposant
 * 🔗 RELATIONS → Assignation/retrait pays Many-to-Many
 * 
 * GESTION NATIONALITÉS MULTIPLES :
 * ===============================
 * 🌍 PAYS → Récupération nationalités déposant spécifique
 * ➕ ASSIGNATION → Attribution nouvelle nationalité
 * ❌ RETRAIT → Suppression nationalité existante
 * 🔄 GESTION → Administration relations Many-to-Many
 * 
 * DONNÉES DÉPOSANTS GÉRÉES :
 * =========================
 * 👤 IDENTITÉ → Nom, prénom, coordonnées personnelles
 * 📧 COMMUNICATION → Email contact principal
 * 🌍 GÉOLOCALISATION → Pays nationalités multiples
 * 🔗 RELATIONS → Liens avec brevets déposés
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, prénom, email)
 * ✅ Filtrage par pays ou nationalité
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri alphabétique par défaut
 * 
 * CONFORMITÉ INTERNATIONALE :
 * ==========================
 * ✅ Standards OMPI (Organisation Mondiale Propriété Intellectuelle)
 * ✅ Relations Many-to-Many avec pays via table liaison
 * ✅ Validation existence pays référentiels
 * ✅ Audit trail complet modifications
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
/// Interface service métier gestion déposants et inventeurs propriété intellectuelle.
/// Contrat complet opérations CRUD avec gestion nationalités multiples sécurisées.
/// </summary>
public interface IDeposantService
{
    /// <summary>
    /// Récupère liste paginée déposants avec recherche textuelle multi-champs.
    /// Support recherche nom, prénom, email avec nationalités complètes.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée déposants avec pays nationalités</returns>
    Task<PagedResponse<List<DeposantDto>>> GetDeposaatsAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère déposant spécifique avec nationalités complètes détaillées.
    /// Chargement optimisé déposant avec pays multiples associés.
    /// </summary>
    /// <param name="id">Identifiant unique déposant recherché</param>
    /// <returns>Déposant détaillé avec liste pays nationalités</returns>
    Task<ApiResponse<DeposantDto>> GetDeposantByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau déposant avec informations de base et audit trail.
    /// Initialisation déposant sans pays, assignation ultérieure via méthodes.
    /// </summary>
    /// <param name="createDeposantDto">Données création déposant de base</param>
    /// <returns>Déposant créé avec identifiant système généré</returns>
    Task<ApiResponse<DeposantDto>> CreateDeposantAsync(CreateDeposantDto createDeposantDto);
    
    /// <summary>
    /// Met à jour déposant existant avec nouvelles informations personnelles.
    /// Modification informations de base, gestion pays via méthodes spécialisées.
    /// </summary>
    /// <param name="id">Identifiant déposant à modifier</param>
    /// <param name="updateDeposantDto">Nouvelles données personnelles déposant</param>
    /// <returns>Déposant modifié avec informations mises à jour</returns>
    Task<ApiResponse<DeposantDto>> UpdateDeposantAsync(int id, UpdateDeposantDto updateDeposantDto);
    
    /// <summary>
    /// Supprime déposant avec gestion relations pays dépendantes.
    /// Vérification contraintes avant suppression définitive déposant.
    /// </summary>
    /// <param name="id">Identifiant déposant à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit trail</returns>
    Task<ApiResponse<bool>> DeleteDeposantAsync(int id);
    
    /// <summary>
    /// Récupère liste complète pays nationalités déposant spécifique.
    /// Chargement optimisé nationalités multiples avec détails pays.
    /// </summary>
    /// <param name="deposantId">Identifiant déposant pour recherche pays</param>
    /// <returns>Liste pays nationalités avec codes ISO complets</returns>
    Task<ApiResponse<List<PaysDto>>> GetDeposantPaysAsync(int deposantId);
    
    /// <summary>
    /// Assigne nouvelle nationalité à déposant avec validation unicité.
    /// Création relation Many-to-Many sécurisée avec vérification existence.
    /// </summary>
    /// <param name="deposantId">Identifiant déposant cible assignation</param>
    /// <param name="paysId">Identifiant pays à assigner comme nationalité</param>
    /// <returns>Confirmation succès assignation pays déposant</returns>
    Task<ApiResponse<bool>> AssignPaysToDeposantAsync(int deposantId, int paysId);
    
    /// <summary>
    /// Retire nationalité déposant avec validation existence relation.
    /// Suppression relation Many-to-Many avec vérification préalable.
    /// </summary>
    /// <param name="deposantId">Identifiant déposant cible retrait</param>
    /// <param name="paysId">Identifiant pays à retirer des nationalités</param>
    /// <returns>Confirmation succès retrait pays déposant</returns>
    Task<ApiResponse<bool>> RemovePaysFromDeposantAsync(int deposantId, int paysId);
}
