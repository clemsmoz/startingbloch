/*
 * ================================================================================================
 * INTERFACE SERVICE RELATIONS CLIENT-CABINET - CONTRAT GESTION ASSOCIATIONS PI
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service relations Client-Cabinet StartingBloch.
 * Spécification méthodes gestion associations clients-conseils propriété intellectuelle.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération relations avec pagination
 * 🔍 DÉTAIL → Accès relation spécifique avec informations
 * ➕ CRÉATION → Nouvelle relation client-cabinet typée
 * ✏️ MODIFICATION → Mise à jour relation existante
 * 🗑️ SUPPRESSION → Suppression relation avec audit
 * 🔗 LIAISONS → Gestion liens bidirectionnels clients-cabinets
 * 🏢 NAVIGATION → Navigation relations Many-to-Many optimisée
 * 
 * GESTION RELATIONS BIDIRECTIONNELLES :
 * ====================================
 * 👥 CLIENT→CABINETS → Récupération cabinets assignés client
 * 🏢 CABINET→CLIENTS → Récupération clients cabinet spécifique
 * 🔗 LIAISON → Création relation typée avec métadonnées
 * ❌ DÉLIAISON → Suppression relation avec validation
 * 
 * TYPES RELATIONS SUPPORTÉES :
 * ============================
 * ✅ Relation standard client-conseil
 * ✅ Relation temporaire/ponctuelle
 * ✅ Relation exclusive/préférentielle
 * ✅ Relation collaborative multi-cabinets
 * ✅ Métadonnées personnalisées relations
 * 
 * RECHERCHE ET NAVIGATION :
 * ========================
 * ✅ Pagination optimisée relations volumineuses
 * ✅ Navigation bidirectionnelle efficace
 * ✅ Filtrage par type relation
 * ✅ Recherche relations complexes
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
/// Interface service métier gestion relations bidirectionnelles Client-Cabinet.
/// Contrat complet associations clients-conseils avec types relations multiples.
/// </summary>
public interface IClientCabinetService
{
    /// <summary>
    /// Récupère liste paginée relations Client-Cabinet avec métadonnées.
    /// Navigation optimisée associations avec informations complètes.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <returns>Réponse paginée relations avec métadonnées navigation</returns>
    Task<PagedResponse<List<ClientCabinetDto>>> GetClientCabinetsAsync(int page = 1, int pageSize = 10);
    
    /// <summary>
    /// Récupère relation Client-Cabinet spécifique avec détails complets.
    /// Chargement optimisé relation avec informations client et cabinet.
    /// </summary>
    /// <param name="id">Identifiant unique relation recherchée</param>
    /// <returns>Relation détaillée avec informations complètes ou erreur</returns>
    Task<ApiResponse<ClientCabinetDto>> GetClientCabinetByIdAsync(int id);
    
    /// <summary>
    /// Crée nouvelle relation Client-Cabinet avec validation et audit.
    /// Établissement association typée avec métadonnées personnalisées.
    /// </summary>
    /// <param name="createDto">Données création relation avec type</param>
    /// <returns>Relation créée avec identifiant système généré</returns>
    Task<ApiResponse<ClientCabinetDto>> CreateClientCabinetAsync(CreateClientCabinetDto createDto);
    
    /// <summary>
    /// Met à jour relation Client-Cabinet existante avec validation.
    /// Modification type relation et métadonnées avec audit trail.
    /// </summary>
    /// <param name="id">Identifiant relation à modifier</param>
    /// <param name="updateDto">Nouvelles données relation partielles</param>
    /// <returns>Relation modifiée avec informations mises à jour</returns>
    Task<ApiResponse<ClientCabinetDto>> UpdateClientCabinetAsync(int id, UpdateClientCabinetDto updateDto);
    
    /// <summary>
    /// Supprime relation Client-Cabinet avec validation dépendances.
    /// Vérification contraintes avant suppression définitive relation.
    /// </summary>
    /// <param name="id">Identifiant relation à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit</returns>
    Task<ApiResponse<bool>> DeleteClientCabinetAsync(int id);
    
    /// <summary>
    /// Récupère liste cabinets assignés à client spécifique.
    /// Navigation optimisée relations client vers conseils multiples.
    /// </summary>
    /// <param name="clientId">Identifiant client pour recherche cabinets</param>
    /// <returns>Liste cabinets assignés avec détails relations</returns>
    Task<ApiResponse<List<CabinetDto>>> GetCabinetsByClientAsync(int clientId);
    
    /// <summary>
    /// Récupère liste clients assignés à cabinet spécifique.
    /// Navigation optimisée relations cabinet vers clients multiples.
    /// </summary>
    /// <param name="cabinetId">Identifiant cabinet pour recherche clients</param>
    /// <returns>Liste clients assignés avec détails relations</returns>
    Task<ApiResponse<List<ClientDto>>> GetClientsByCabinetAsync(int cabinetId);
    
    /// <summary>
    /// Établit liaison directe Client-Cabinet avec type relation optionnel.
    /// Création relation bidirectionnelle avec métadonnées personnalisées.
    /// </summary>
    /// <param name="clientId">Identifiant client pour liaison</param>
    /// <param name="cabinetId">Identifiant cabinet pour liaison</param>
    /// <param name="type">Type relation optionnel pour catégorisation</param>
    /// <returns>Confirmation succès liaison avec détails</returns>
    Task<ApiResponse<bool>> LinkClientToCabinetAsync(int clientId, int cabinetId, string? type = null);
    
    /// <summary>
    /// Supprime liaison Client-Cabinet avec validation existence.
    /// Déliaison bidirectionnelle avec préservation historique.
    /// </summary>
    /// <param name="clientId">Identifiant client pour déliaison</param>
    /// <param name="cabinetId">Identifiant cabinet pour déliaison</param>
    /// <returns>Confirmation succès déliaison avec audit</returns>
    Task<ApiResponse<bool>> UnlinkClientFromCabinetAsync(int clientId, int cabinetId);
}
