/*
 * ================================================================================================
 * INTERFACE SERVICE CABINETS - CONTRAT GESTION CONSEILS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service cabinets StartingBloch définissant gestion conseils PI.
 * Spécification méthodes administration cabinets avec relations clients multiples.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération cabinets avec pagination et recherche
 * 🔍 DÉTAIL → Accès cabinet spécifique avec informations complètes
 * ➕ CRÉATION → Nouveau cabinet avec validation données
 * ✏️ MODIFICATION → Mise à jour cabinet existant
 * 🗑️ SUPPRESSION → Suppression cabinet avec gestion dépendances
 * 👥 CLIENTS → Gestion relations cabinet-clients Many-to-Many
 * 🌍 GÉOLOCALISATION → Filtrage cabinets par pays d'exercice
 * 
 * GESTION RELATIONS CLIENTS :
 * ==========================
 * 🔗 ASSIGNATION → Attribution clients à cabinets conseil
 * 📋 PORTFOLIO → Récupération clients cabinet spécifique
 * ❌ RETRAIT → Suppression relation cabinet-client
 * 🔄 TRANSFERT → Réassignation clients entre cabinets
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Pagination optimisée pour navigation efficace
 * ✅ Recherche textuelle multi-champs (nom, pays, spécialité)
 * ✅ Filtrage géographique par pays d'exercice
 * ✅ Tri alphabétique par défaut
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
/// Interface service métier gestion cabinets conseil propriété intellectuelle.
/// Contrat complet opérations CRUD avec gestion relations clients multiples.
/// </summary>
public interface ICabinetService
{
    /// <summary>
    /// Récupère liste paginée cabinets avec recherche textuelle multi-champs.
    /// Support pagination optimisée et filtrage par nom, pays, spécialités.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée cabinets avec métadonnées navigation</returns>
    Task<PagedResponse<List<CabinetDto>>> GetCabinetsAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère cabinet spécifique avec informations détaillées complètes.
    /// Chargement optimisé données cabinet avec relations clients.
    /// </summary>
    /// <param name="id">Identifiant unique cabinet recherché</param>
    /// <returns>Cabinet détaillé avec informations complètes ou erreur</returns>
    Task<ApiResponse<CabinetDto>> GetCabinetByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau cabinet avec validation données et audit trail.
    /// Initialisation cabinet avec informations de base et métadonnées.
    /// </summary>
    /// <param name="createCabinetDto">Données création cabinet complètes</param>
    /// <returns>Cabinet créé avec identifiant système généré</returns>
    Task<ApiResponse<CabinetDto>> CreateCabinetAsync(CreateCabinetDto createCabinetDto);
    
    /// <summary>
    /// Met à jour cabinet existant avec validation et préservation historique.
    /// Modification informations cabinet avec audit trail automatique.
    /// </summary>
    /// <param name="id">Identifiant cabinet à modifier</param>
    /// <param name="updateCabinetDto">Nouvelles données cabinet partielles</param>
    /// <returns>Cabinet modifié avec informations mises à jour</returns>
    Task<ApiResponse<CabinetDto>> UpdateCabinetAsync(int id, UpdateCabinetDto updateCabinetDto);
    
    /// <summary>
    /// Supprime cabinet avec gestion relations clients dépendantes.
    /// Vérification contraintes avant suppression définitive.
    /// </summary>
    /// <param name="id">Identifiant cabinet à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit</returns>
    Task<ApiResponse<bool>> DeleteCabinetAsync(int id);
    
    /// <summary>
    /// Récupère liste complète clients assignés cabinet spécifique.
    /// Chargement optimisé portfolio clients avec relations actives.
    /// </summary>
    /// <param name="cabinetId">Identifiant cabinet pour recherche clients</param>
    /// <returns>Liste clients cabinet avec informations détaillées</returns>
    Task<ApiResponse<List<ClientDto>>> GetCabinetClientsAsync(int cabinetId);
    
    /// <summary>
    /// Assigne client à cabinet avec validation relation unique.
    /// Création relation Many-to-Many sécurisée cabinet-client.
    /// </summary>
    /// <param name="cabinetId">Identifiant cabinet destinataire</param>
    /// <param name="clientId">Identifiant client à assigner</param>
    /// <returns>Confirmation succès assignation relation</returns>
    Task<ApiResponse<bool>> AssignClientToCabinetAsync(int cabinetId, int clientId);
    
    /// <summary>
    /// Retire client de cabinet avec validation existence relation.
    /// Suppression relation Many-to-Many avec vérification préalable.
    /// </summary>
    /// <param name="cabinetId">Identifiant cabinet source retrait</param>
    /// <param name="clientId">Identifiant client à retirer</param>
    /// <returns>Confirmation succès retrait relation</returns>
    Task<ApiResponse<bool>> RemoveClientFromCabinetAsync(int cabinetId, int clientId);
    
    /// <summary>
    /// Récupère cabinets filtrés par pays d'exercice spécifique.
    /// Recherche géographique optimisée pour localisation services.
    /// </summary>
    /// <param name="country">Nom pays pour filtrage géographique</param>
    /// <returns>Liste cabinets pays spécifique avec détails</returns>
    Task<ApiResponse<List<CabinetDto>>> GetCabinetsByCountryAsync(string country);

    /// <summary>
    /// Récupère la liste des cabinets liés à un client donné via la table de jonction.
    /// </summary>
    /// <param name="clientId">Identifiant du client</param>
    /// <returns>Liste des cabinets du client</returns>
    Task<ApiResponse<List<CabinetDto>>> GetCabinetsByClientAsync(int clientId);

    /// <summary>
    /// Crée un cabinet et le lie immédiatement au client spécifié.
    /// </summary>
    /// <param name="clientId">Identifiant du client propriétaire</param>
    /// <param name="createCabinetDto">Données de création du cabinet</param>
    /// <returns>Cabinet créé</returns>
    Task<ApiResponse<CabinetDto>> CreateCabinetForClientAsync(int clientId, CreateCabinetDto createCabinetDto);

    /// <summary>
    /// Lie un cabinet existant au client spécifié s'il n'est pas déjà lié.
    /// </summary>
    /// <param name="clientId">Identifiant du client</param>
    /// <param name="cabinetId">Identifiant du cabinet à lier</param>
    /// <returns>Confirmation de liaison</returns>
    Task<ApiResponse<bool>> LinkExistingCabinetToClientAsync(int clientId, int cabinetId);
}
