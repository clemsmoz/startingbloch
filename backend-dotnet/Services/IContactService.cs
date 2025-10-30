/*
 * ================================================================================================
 * INTERFACE SERVICE CONTACTS - CONTRAT GESTION RELATIONS PROFESSIONNELLES PI
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service contacts StartingBloch définissant gestion relations professionnelles.
 * Spécification méthodes administration contacts cabinets-clients propriété intellectuelle.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération contacts avec pagination et recherche
 * 🔍 DÉTAIL → Accès contact spécifique avec relations complètes
 * ➕ CRÉATION → Nouveau contact avec assignation entité
 * ✏️ MODIFICATION → Mise à jour informations contact
 * 🗑️ SUPPRESSION → Suppression contact avec audit
 * 🔗 RELATIONS → Gestion liens cabinets/clients/rôles
 * 
 * DONNÉES CONTACTS GÉRÉES :
 * ========================
 * 👤 IDENTITÉ → Nom, prénom, coordonnées complètes
 * 📧 COMMUNICATION → Email, téléphone, moyens contact
 * 🎭 RÔLE → Fonction professionnelle dans entité
 * 🏢 AFFECTATION → Cabinet conseil ou client assigné
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, prénom, email, rôle)
 * ✅ Filtrage par cabinet ou client spécifique
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri alphabétique par défaut
 * 
 * SÉCURITÉ ET PERMISSIONS :
 * ========================
 * ✅ Validation existence entités avant assignation
 * ✅ Contrôle intégrité référentielle
 * ✅ Audit trail complet modifications
 * ✅ Protection données personnelles RGPD
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
/// Interface service métier gestion contacts professionnels propriété intellectuelle.
/// Contrat complet opérations CRUD avec relations cabinets-clients sécurisées.
/// </summary>
public interface IContactService
{
    /// <summary>
    /// Récupère liste paginée contacts avec recherche textuelle multi-champs.
    /// Support recherche nom, prénom, email, rôle avec relations complètes.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée contacts avec relations cabinet/client</returns>
    Task<PagedResponse<List<ContactDto>>> GetContactsAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère contact spécifique avec relations cabinet/client complètes.
    /// Chargement optimisé contact avec entités associées détaillées.
    /// </summary>
    /// <param name="id">Identifiant unique contact recherché</param>
    /// <returns>Contact détaillé avec relations complètes ou erreur</returns>
    Task<ApiResponse<ContactDto>> GetContactByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau contact professionnel avec validation et assignation.
    /// Création contact avec relations cabinet/client et audit trail.
    /// </summary>
    /// <param name="createContactDto">Données création contact avec relations</param>
    /// <returns>Contact créé avec identifiant système et relations</returns>
    Task<ApiResponse<ContactDto>> CreateContactAsync(CreateContactDto createContactDto);
    
    /// <summary>
    /// Met à jour contact existant avec nouvelles informations et relations.
    /// Modification contact avec préservation historique et audit trail.
    /// </summary>
    /// <param name="id">Identifiant contact à modifier</param>
    /// <param name="updateContactDto">Nouvelles données contact partielles</param>
    /// <returns>Contact modifié avec informations mises à jour</returns>
    Task<ApiResponse<ContactDto>> UpdateContactAsync(int id, UpdateContactDto updateContactDto);
    
    /// <summary>
    /// Supprime contact professionnel avec gestion relations dépendantes.
    /// Vérification contraintes avant suppression définitive contact.
    /// </summary>
    /// <param name="id">Identifiant contact à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit trail</returns>
    Task<ApiResponse<bool>> DeleteContactAsync(int id);

    /// <summary>
    /// Récupère la liste paginée des contacts associés à un client spécifique.
    /// </summary>
    /// <param name="clientId">Identifiant du client</param>
    /// <param name="page">Numéro de page</param>
    /// <param name="pageSize">Taille de la page</param>
    /// <returns>Réponse paginée des contacts du client</returns>
    Task<PagedResponse<List<ContactDto>>> GetContactsByClientAsync(int clientId, int page = 1, int pageSize = 10);

    /// <summary>
    /// Récupère la liste paginée des contacts associés à un cabinet spécifique.
    /// </summary>
    /// <param name="cabinetId">Identifiant du cabinet</param>
    /// <param name="page">Numéro de page</param>
    /// <param name="pageSize">Taille de la page</param>
    /// <returns>Réponse paginée des contacts du cabinet</returns>
    Task<PagedResponse<List<ContactDto>>> GetContactsByCabinetAsync(int cabinetId, int page = 1, int pageSize = 10);
}
