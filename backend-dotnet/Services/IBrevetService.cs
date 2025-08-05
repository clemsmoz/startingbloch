/*
 * ================================================================================================
 * INTERFACE SERVICE BREVETS - CONTRAT GESTION PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service brevets StartingBloch définissant opérations CRUD complètes.
 * Spécification méthodes gestion portfolio propriété intellectuelle avec sécurité utilisateur.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération brevets avec pagination et filtrage utilisateur
 * 🔍 DÉTAIL → Accès brevet spécifique avec vérification permissions
 * ➕ CRÉATION → Nouveau brevet avec validation données complètes
 * ✏️ MODIFICATION → Mise à jour brevet existant avec audit trail
 * 🗑️ SUPPRESSION → Suppression logique/physique selon politiques
 * 🔍 RECHERCHE → Recherche textuelle avancée multi-critères
 * 📊 IMPORT → Import Excel brevets avec validation massive
 * 
 * SÉCURITÉ ET PERMISSIONS :
 * ========================
 * 🔐 ISOLATION → Accès brevets limité selon utilisateur connecté
 * 🛡️ VÉRIFICATION → Contrôle permissions avant toute opération
 * 👥 MULTI-TENANT → Support utilisateurs multiples avec isolation données
 * 🔒 AUDIT → Traçabilité complète accès et modifications
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Pagination optimisée pour grandes collections
 * ✅ Filtrage automatique selon droits utilisateur
 * ✅ Recherche textuelle dans champs multiples
 * ✅ Filtrage par client/cabinet spécifique
 * ✅ Import/Export Excel pour gestion massive
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
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service métier gestion brevets et propriété intellectuelle.
/// Contrat complet opérations CRUD avec sécurité utilisateur et recherche avancée.
/// </summary>
public interface IBrevetService
{
    /// <summary>
    /// Récupère liste paginée brevets avec filtrage sécurisé par utilisateur.
    /// Isolation automatique données selon permissions utilisateur connecté.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="currentUserId">Identifiant utilisateur pour filtrage sécurisé</param>
    /// <returns>Réponse paginée brevets autorisés avec métadonnées</returns>
    Task<PagedResponse<List<BrevetDto>>> GetBrevetsAsync(int page = 1, int pageSize = 10, int? currentUserId = null);
    
    /// <summary>
    /// Récupère brevet spécifique avec vérification permissions utilisateur.
    /// Contrôle accès automatique avant retour données sensibles.
    /// </summary>
    /// <param name="id">Identifiant unique brevet recherché</param>
    /// <param name="currentUserId">Identifiant utilisateur pour vérification droits</param>
    /// <returns>Brevet détaillé si autorisé ou erreur permissions</returns>
    Task<ApiResponse<BrevetDto>> GetBrevetByIdAsync(int id, int? currentUserId = null);
    
    /// <summary>
    /// Crée nouveau brevet avec validation complète données et relations.
    /// Assignation automatique propriétaire et génération audit trail.
    /// </summary>
    /// <param name="createBrevetDto">Données création brevet avec relations</param>
    /// <returns>Brevet créé avec identifiant système et métadonnées</returns>
    Task<ApiResponse<BrevetDto>> CreateBrevetAsync(CreateBrevetDto createBrevetDto);
    
    /// <summary>
    /// Met à jour brevet existant avec validation permissions et intégrité.
    /// Préservation historique modifications avec audit trail complet.
    /// </summary>
    /// <param name="id">Identifiant brevet à modifier</param>
    /// <param name="updateBrevetDto">Nouvelles données brevet partielles</param>
    /// <returns>Brevet modifié avec informations mises à jour</returns>
    Task<ApiResponse<BrevetDto>> UpdateBrevetAsync(int id, UpdateBrevetDto updateBrevetDto);
    
    /// <summary>
    /// Supprime brevet avec gestion relations dépendantes et audit.
    /// Suppression logique ou physique selon configuration système.
    /// </summary>
    /// <param name="id">Identifiant brevet à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit trail</returns>
    Task<ApiResponse<bool>> DeleteBrevetAsync(int id);
    
    /// <summary>
    /// Recherche textuelle avancée brevets avec filtrage utilisateur automatique.
    /// Recherche multi-champs optimisée avec pertinence résultats.
    /// </summary>
    /// <param name="searchTerm">Terme recherche pour matching multi-champs</param>
    /// <param name="currentUserId">Identifiant utilisateur pour filtrage sécurisé</param>
    /// <returns>Liste brevets correspondants avec score pertinence</returns>
    Task<ApiResponse<List<BrevetDto>>> SearchBrevetsAsync(string searchTerm, int? currentUserId = null);
    
    /// <summary>
    /// Récupère portfolio complet brevets client spécifique.
    /// Filtrage automatique brevets selon assignation client.
    /// </summary>
    /// <param name="clientId">Identifiant client pour filtrage portfolio</param>
    /// <returns>Liste complète brevets client avec détails</returns>
    Task<ApiResponse<List<BrevetDto>>> GetBrevetsByClientAsync(int clientId);
    
    /// <summary>
    /// Import massif brevets depuis fichier Excel avec validation complète.
    /// Traitement batch optimisé avec gestion erreurs détaillée.
    /// </summary>
    /// <param name="clientId">Identifiant client destinataire import</param>
    /// <param name="excelFile">Fichier Excel contenant données brevets</param>
    /// <returns>Rapport import avec succès/erreurs détaillés</returns>
    Task<ApiResponse<bool>> ImportBrevetsFromExcelAsync(int clientId, IFormFile excelFile);
    
    /// <summary>
    /// Vérifie permissions utilisateur accès brevet spécifique.
    /// Contrôle sécurité préalable avant toute opération sensible.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour vérification</param>
    /// <param name="brevetId">Identifiant brevet pour contrôle accès</param>
    /// <returns>Autorisation booléenne accès brevet demandé</returns>
    Task<bool> UserCanAccessBrevetAsync(int userId, int brevetId);
}
