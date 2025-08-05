/*
 * ================================================================================================
 * INTERFACE SERVICE NUMÉROS PAYS - CONTRAT GESTION CODES BREVETS NATIONAUX
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service numéros pays StartingBloch définissant gestion codes brevets.
 * Spécification méthodes administration numérotation brevets par juridiction nationale.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération numéros avec pagination et recherche
 * 🔍 DÉTAIL → Accès numéro spécifique avec validation
 * ➕ CRÉATION → Nouveau numéro avec validation format
 * ✏️ MODIFICATION → Mise à jour numéro existant
 * 🗑️ SUPPRESSION → Suppression numéro avec audit
 * 🌍 PAYS → Filtrage numéros par juridiction
 * ✅ VALIDATION → Contrôle format selon pays
 * 
 * GESTION NUMÉROTATION INTERNATIONALE :
 * ====================================
 * 🇫🇷 FRANCE → Format INPI français (ex: FR3012345)
 * 🇺🇸 USA → Format USPTO américain (ex: US10,123,456)
 * 🇪🇺 EUROPE → Format OEB européen (ex: EP3456789)
 * 🇬🇧 UK → Format UKIPO britannique (ex: GB2345678)
 * 🌍 INTERNATIONAL → Format PCT/OMPI (ex: WO2023/123456)
 * 
 * VALIDATION FORMATS NATIONAUX :
 * ==============================
 * ✅ Contrôle syntaxe selon juridiction
 * ✅ Validation caractères autorisés
 * ✅ Vérification longueur réglementaire
 * ✅ Contrôle cohérence préfixes pays
 * ✅ Détection doublons par juridiction
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Pagination optimisée grandes collections
 * ✅ Recherche textuelle dans numéros
 * ✅ Filtrage par pays/juridiction
 * ✅ Tri par date création/numéro
 * 
 * CONFORMITÉ INTERNATIONALE :
 * ==========================
 * ✅ Standards OMPI (Organisation Mondiale Propriété Intellectuelle)
 * ✅ Conventions Paris/PCT pour numérotation
 * ✅ Normes ISO pour codes pays
 * ✅ Règles nationales spécifiques
 * 
 * INTÉGRITÉ DONNÉES :
 * ==================
 * ✅ Relations référentielles avec pays
 * ✅ Contraintes unicité par juridiction
 * ✅ Validation existence pays avant assignation
 * ✅ Audit trail modifications numéros
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
/// Interface service métier gestion numérotation brevets par juridictions nationales.
/// Contrat complet validation formats nationaux avec recherche optimisée.
/// </summary>
public interface INumeroPaysService
{
    /// <summary>
    /// Récupère liste paginée numéros pays avec recherche textuelle.
    /// Support filtrage par numéro, pays avec validation formats.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel dans numéros</param>
    /// <returns>Réponse paginée numéros avec détails juridictions</returns>
    Task<PagedResponse<List<NumeroPaysDto>>> GetNumeroPaysAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère numéro pays spécifique avec validation et détails.
    /// Chargement optimisé numéro avec informations juridiction complètes.
    /// </summary>
    /// <param name="id">Identifiant unique numéro pays recherché</param>
    /// <returns>Numéro détaillé avec validation format ou erreur</returns>
    Task<ApiResponse<NumeroPaysDto>> GetNumeroPaysByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau numéro pays avec validation format juridiction.
    /// Contrôle syntaxe selon règles nationales et unicité.
    /// </summary>
    /// <param name="createNumeroPaysDto">Données création numéro avec pays</param>
    /// <returns>Numéro créé avec validation format confirmée</returns>
    Task<ApiResponse<NumeroPaysDto>> CreateNumeroPaysAsync(CreateNumeroPaysDto createNumeroPaysDto);
    
    /// <summary>
    /// Met à jour numéro pays existant avec revalidation format.
    /// Modification numéro avec contrôle cohérence juridiction.
    /// </summary>
    /// <param name="id">Identifiant numéro à modifier</param>
    /// <param name="updateNumeroPaysDto">Nouvelles données numéro</param>
    /// <returns>Numéro modifié avec validation mise à jour</returns>
    Task<ApiResponse<NumeroPaysDto>> UpdateNumeroPaysAsync(int id, UpdateNumeroPaysDto updateNumeroPaysDto);
    
    /// <summary>
    /// Supprime numéro pays avec vérification dépendances brevets.
    /// Contrôle utilisation avant suppression définitive.
    /// </summary>
    /// <param name="id">Identifiant numéro à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit</returns>
    Task<ApiResponse<bool>> DeleteNumeroPaysAsync(int id);
    
    /// <summary>
    /// Récupère numéros associés à pays spécifique (méthode dupliquée).
    /// Filtrage numéros par juridiction avec formats validés.
    /// </summary>
    /// <param name="paysId">Identifiant pays pour filtrage numéros</param>
    /// <returns>Liste numéros pays avec formats validés</returns>
    Task<ApiResponse<List<NumeroPaysDto>>> GetNumeroPayssByPaysIdAsync(int paysId);
    
    /// <summary>
    /// Récupère numéros associés à pays spécifique.
    /// Filtrage numéros par juridiction avec formats validés.
    /// </summary>
    /// <param name="paysId">Identifiant pays pour filtrage numéros</param>
    /// <returns>Liste numéros pays avec formats validés</returns>
    Task<ApiResponse<List<NumeroPaysDto>>> GetNumeroPaysByPaysIdAsync(int paysId);
    
    /// <summary>
    /// Valide format numéro selon règles juridiction spécifique.
    /// Contrôle syntaxe, longueur, caractères selon standards nationaux.
    /// </summary>
    /// <param name="numero">Numéro à valider selon format pays</param>
    /// <param name="paysId">Identifiant pays pour règles validation</param>
    /// <returns>Statut validation format selon juridiction</returns>
    Task<ApiResponse<bool>> ValidateNumeroForPaysAsync(string numero, int paysId);
}
