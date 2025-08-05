/*
 * ================================================================================================
 * INTERFACE SERVICE CLIENTS - CONTRAT GESTION PORTFOLIO CLIENTS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service clients StartingBloch définissant gestion portfolio clients.
 * Spécification méthodes administration clients avec comptes utilisateurs associés.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération clients avec pagination et recherche
 * 🔍 DÉTAIL → Accès client spécifique avec informations complètes
 * ➕ CRÉATION → Nouveau client avec validation données
 * ✏️ MODIFICATION → Mise à jour client existant
 * 🗑️ SUPPRESSION → Suppression client avec gestion dépendances
 * 🔍 RECHERCHE → Recherche textuelle avancée multi-critères
 * 👤 COMPTES → Gestion comptes utilisateurs clients
 * 
 * GESTION COMPTES UTILISATEURS :
 * =============================
 * 🔗 ASSOCIATION → Liaison clients avec comptes utilisateurs
 * 📊 STATUT → Vérification état compte utilisateur client
 * 📋 ORPHELINS → Identification clients sans compte utilisateur
 * 🔍 DÉTAIL → Information complète client avec statut compte
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Pagination optimisée pour navigation efficace
 * ✅ Recherche textuelle multi-champs (nom, email, secteur)
 * ✅ Filtrage par statut compte utilisateur
 * ✅ Tri alphabétique par défaut
 * 
 * SÉCURITÉ ET PERMISSIONS :
 * ========================
 * ✅ Isolation données clients selon permissions
 * ✅ Validation existence avant opérations
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
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service métier gestion portfolio clients propriété intellectuelle.
/// Contrat complet opérations CRUD avec gestion comptes utilisateurs associés.
/// </summary>
public interface IClientService
{
    /// <summary>
    /// Récupère liste paginée clients avec navigation optimisée.
    /// Support pagination pour gestion efficace portfolios volumineux.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <returns>Réponse paginée clients avec métadonnées navigation</returns>
    Task<PagedResponse<List<ClientDto>>> GetClientsAsync(int page = 1, int pageSize = 10);
    
    /// <summary>
    /// Récupère client spécifique avec informations détaillées complètes.
    /// Chargement optimisé données client avec relations associées.
    /// </summary>
    /// <param name="id">Identifiant unique client recherché</param>
    /// <returns>Client détaillé avec informations complètes ou erreur</returns>
    Task<ApiResponse<ClientDto>> GetClientByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau client avec validation données et audit trail.
    /// Initialisation client avec informations de base et métadonnées.
    /// </summary>
    /// <param name="createClientDto">Données création client complètes</param>
    /// <returns>Client créé avec identifiant système généré</returns>
    Task<ApiResponse<ClientDto>> CreateClientAsync(CreateClientDto createClientDto);
    
    /// <summary>
    /// Met à jour client existant avec validation et préservation historique.
    /// Modification informations client avec audit trail automatique.
    /// </summary>
    /// <param name="id">Identifiant client à modifier</param>
    /// <param name="updateClientDto">Nouvelles données client partielles</param>
    /// <returns>Client modifié avec informations mises à jour</returns>
    Task<ApiResponse<ClientDto>> UpdateClientAsync(int id, CreateClientDto updateClientDto);
    
    /// <summary>
    /// Supprime client avec gestion relations dépendantes et audit.
    /// Vérification contraintes avant suppression définitive.
    /// </summary>
    /// <param name="id">Identifiant client à supprimer</param>
    /// <returns>Confirmation succès suppression avec audit</returns>
    Task<ApiResponse<bool>> DeleteClientAsync(int id);
    
    /// <summary>
    /// Recherche textuelle avancée clients avec matching multi-champs.
    /// Recherche optimisée nom, email, secteur activité avec pertinence.
    /// </summary>
    /// <param name="searchTerm">Terme recherche pour matching multi-champs</param>
    /// <returns>Liste clients correspondants avec score pertinence</returns>
    Task<ApiResponse<List<ClientDto>>> SearchClientsAsync(string searchTerm);
    
    /// <summary>
    /// Récupère clients sans compte utilisateur associé pour identification.
    /// Recherche clients orphelins nécessitant création compte utilisateur.
    /// </summary>
    /// <returns>Liste clients sans compte utilisateur avec détails</returns>
    Task<ApiResponse<List<ClientDto>>> GetClientsWithoutUserAccountAsync();
    
    /// <summary>
    /// Vérifie existence compte utilisateur pour client spécifique.
    /// Contrôle association client-utilisateur pour gestion accès.
    /// </summary>
    /// <param name="clientId">Identifiant client pour vérification compte</param>
    /// <returns>Statut booléen existence compte utilisateur client</returns>
    Task<ApiResponse<bool>> ClientHasUserAccountAsync(int clientId);
    
    /// <summary>
    /// Récupère client avec statut détaillé compte utilisateur associé.
    /// Information complète client enrichie statut compte et permissions.
    /// </summary>
    /// <param name="clientId">Identifiant client pour information complète</param>
    /// <returns>Client avec statut compte utilisateur détaillé</returns>
    Task<ApiResponse<ClientWithUserStatusDto>> GetClientWithUserStatusAsync(int clientId);
}
