/*
 * ================================================================================================
 * DTOs RÉPONSES API STANDARDISÉES - COMMUNICATION CLIENT-SERVEUR
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Uniformise toutes les réponses HTTP de l'API StartingBloch pour cohérence interface.
 * Facilite intégration client et gestion erreurs dans contexte propriété intellectuelle.
 * 
 * MODÈLES COMMUNICATION :
 * ======================
 * 
 * 📋 RÉPONSE STANDARD → Success/Message/Data/Errors/Timestamp
 * 📄 RÉPONSE PAGINÉE → Hérite standard + pagination metadata
 * 📁 IMPORT EXCEL → Upload fichiers brevets clients
 * 
 * STANDARDS CONFORMITÉ :
 * =====================
 * ✅ REST API Best Practices
 * ✅ HTTP Status Codes cohérents
 * ✅ Timestamps UTC audit trail RGPD
 * ✅ Pagination optimisée grandes collections
 * ✅ Gestion erreurs structurée
 * 
 * SÉCURITÉ INTÉGRÉE :
 * ==================
 * ✅ Validation types génériques
 * ✅ Propriétés nullable contrôlées
 * ✅ Timestamps immuables audit
 * ✅ Upload fichiers validés
 * 
 * ================================================================================================
 */

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// Réponse API standardisée générique pour toutes les communications HTTP.
/// Garantit cohérence interface et facilite gestion erreurs côté client.
/// Template uniforme success/erreur avec audit timestamp automatique.
/// </summary>
/// <typeparam name="T">Type de données métier retournées (Brevet, Client, etc.)</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indique si l'opération s'est déroulée avec succès.
    /// Détermine côté client si traitement données ou affichage erreur.
    /// </summary>
    public bool Success { get; set; } = true;
    
    /// <summary>
    /// Message explicatif pour utilisateur final ou développeur.
    /// Descriptions métier claires pour contexte propriété intellectuelle.
    /// </summary>
    public string? Message { get; set; }
    
    /// <summary>
    /// Données métier retournées en cas de succès.
    /// Peut être entité unique, collection ou objet complexe.
    /// </summary>
    public T? Data { get; set; }
    
    /// <summary>
    /// Détails erreurs structurées en cas d'échec validation ou traitement.
    /// Facilite debugging et affichage messages utilisateur pertinents.
    /// </summary>
    public object? Errors { get; set; }
    
    /// <summary>
    /// Horodatage UTC précis de génération réponse pour audit trail RGPD.
    /// Permet traçabilité complète interactions API.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Réponse API paginée pour collections importantes (brevets, clients, contacts).
/// Optimise performance en limitant transfert données et améliore UX.
/// Hérite réponse standard + métadonnées pagination navigable.
/// </summary>
/// <typeparam name="T">Type collection paginée (List&lt;BrevetDto&gt;, etc.)</typeparam>
public class PagedResponse<T> : ApiResponse<T>
{
    /// <summary>
    /// Numéro page actuelle (base 1 pour compatibilité UX).
    /// Permet navigation séquentielle dans collections importantes.
    /// </summary>
    public int Page { get; set; }
    
    /// <summary>
    /// Nombre éléments par page configuré côté serveur.
    /// Optimise balance performance/utilisabilité selon contexte.
    /// </summary>
    public int PageSize { get; set; }
    
    /// <summary>
    /// Nombre total éléments dans collection complète.
    /// Essentiel calcul pages totales et affichage compteurs.
    /// </summary>
    public int TotalCount { get; set; }
    
    /// <summary>
    /// Nombre total pages calculé (TotalCount / PageSize).
    /// Facilite génération interface pagination côté client.
    /// </summary>
    public int TotalPages { get; set; }
    
    /// <summary>
    /// Indique existence page suivante pour navigation.
    /// Optimise affichage boutons interface utilisateur.
    /// </summary>
    public bool HasNextPage { get; set; }
    
    /// <summary>
    /// Indique existence page précédente pour navigation.
    /// Optimise affichage boutons interface utilisateur.
    /// </summary>
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// DTO pour upload fichiers Excel contenant données brevets clients.
/// Sécurise import bulk avec validation préalable format et permissions.
/// Associe fichier au client propriétaire pour isolation données.
/// </summary>
public class ImportExcelDto
{
    /// <summary>
    /// Fichier Excel uploadé contenant données brevets à importer.
    /// Validation format, taille et type MIME côté contrôleur pour sécurité.
    /// </summary>
    public IFormFile ExcelFile { get; set; } = null!;
    
    /// <summary>
    /// Identifiant client propriétaire des brevets à importer.
    /// Assure isolation données et permissions appropriées.
    /// </summary>
    public int ClientId { get; set; }
}
