/*
 * ================================================================================================
 * DTOs CLIENTS - GESTION PORTEFEUILLES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données clients propriétaires brevets et comptes utilisateurs associés.
 * Centrale gestion permissions, authentification et relations multi-entités complexes.
 * 
 * MODÈLES CLIENTS :
 * ================
 * 
 * 📋 CLIENT SIMPLE → ClientDto informations de base + permissions
 * ➕ CRÉATION → CreateClientDto avec validations métier
 * ✏️ MODIFICATION → UpdateClientDto champs optionnels flexibles  
 * 👤 AVEC COMPTE → ClientWithUserStatusDto + métriques activité
 * 🔐 CRÉATION COMPTE → CreateUserForClientDto client existant
 * 📦 PACK COMPLET → CreateClientWithUserDto client + utilisateur simultané
 * 
 * PERMISSIONS SÉCURITÉ :
 * =====================
 * ✅ CanWrite : Autorisation modification données brevets
 * ✅ CanRead : Autorisation consultation portefeuille  
 * ✅ IsBlocked : Suspension temporaire accès système
 * ✅ IsActive : Statut activation compte utilisateur
 * 
 * AUDIT & COMPLIANCE :
 * ===================
 * ✅ Timestamps création/modification automatiques
 * ✅ Validation email stricte communications
 * ✅ Contraintes longueur conformité internationale
 * ✅ Notes administratives traçabilité RGPD
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO client de base avec informations essentielles et permissions système.
/// Modèle standard consultation et gestion portefeuilles propriété intellectuelle.
/// Inclut audit trail et contrôles accès granulaires par client.
/// </summary>
public class ClientDto
{
    /// <summary>
    /// Identifiant unique client dans système StartingBloch.
    /// Clé primaire pour toutes relations et permissions utilisateur.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Dénomination sociale ou nom client pour identification.
    /// Champ obligatoire référence principale dans interfaces.
    /// </summary>
    public string NomClient { get; set; } = string.Empty;
    
    /// <summary>
    /// Référence interne client pour classification métier (optionnel).
    /// Code personnalisé organisation ou système référencement externe.
    /// </summary>
    public string? ReferenceClient { get; set; }
    
    /// <summary>
    /// Adresse postale complète client pour correspondances (optionnel).
    /// Informations géographiques et contact physique si nécessaire.
    /// </summary>
    public string? AdresseClient { get; set; }
    
    /// <summary>
    /// Code postal client pour précision géolocalisation (optionnel).
    /// Complément adresse selon standards postaux internationaux.
    /// </summary>
    public string? CodePostal { get; set; }
    
    /// <summary>
    /// Pays client pour juridiction et réglementation applicable (optionnel).
    /// Contexte légal important gestion propriété intellectuelle.
    /// </summary>
    public string? PaysClient { get; set; }
    
    /// <summary>
    /// Email contact principal client pour communications (optionnel).
    /// Canal privilégié échanges électroniques sécurisés.
    /// </summary>
    public string? EmailClient { get; set; }
    
    /// <summary>
    /// Téléphone contact client pour communications urgentes (optionnel).
    /// Moyen communication direct selon besoins métier.
    /// </summary>
    public string? TelephoneClient { get; set; }
    
    /// <summary>
    /// Permission modification données brevets par ce client.
    /// Contrôle accès critique sécurité propriété intellectuelle.
    /// </summary>
    public bool CanWrite { get; set; }
    
    /// <summary>
    /// Permission consultation portefeuille brevets par ce client.
    /// Accès lecture données propriété intellectuelle possédées.
    /// </summary>
    public bool CanRead { get; set; }
    
    /// <summary>
    /// Statut blocage temporaire accès client au système.
    /// Suspension sécuritaire sans suppression définitive données.
    /// </summary>
    public bool IsBlocked { get; set; }
    
    /// <summary>
    /// Date création UTC client pour audit trail RGPD.
    /// Timestamp immutable première inscription système.
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Date dernière modification UTC données client pour traçabilité.
    /// Timestamp automatique toute mise à jour informations.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO création nouveau client avec validations strictes champs obligatoires.
/// Assure intégrité données dès inscription et permissions sécurisées par défaut.
/// Configuration initiale conservative avec possibilité évolution ultérieure.
/// </summary>
public class CreateClientDto
{
    /// <summary>
    /// Nom client OBLIGATOIRE - identification principale système.
    /// </summary>
    [StringLength(255, ErrorMessage = "Le nom du client ne peut pas dépasser 255 caractères")]
    public string NomClient { get; set; } = string.Empty;

    /// <summary>
    /// Référence interne optionnelle pour organisation métier.
    /// </summary>
    [StringLength(255, ErrorMessage = "La référence ne peut pas dépasser 255 caractères")]
    public string? ReferenceClient { get; set; }

    /// <summary>
    /// Adresse postale optionnelle client pour correspondances.
    /// </summary>
    [StringLength(500, ErrorMessage = "L'adresse ne peut pas dépasser 500 caractères")]
    public string? AdresseClient { get; set; }

    /// <summary>
    /// Code postal optionnel selon standards internationaux.
    /// </summary>
    [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères")]
    public string? CodePostal { get; set; }

    /// <summary>
    /// Pays client optionnel pour contexte juridique.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le pays ne peut pas dépasser 100 caractères")]
    public string? PaysClient { get; set; }

    /// <summary>
    /// Email contact optionnel avec validation format strict.
    /// </summary>
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? EmailClient { get; set; }

    /// <summary>
    /// Téléphone contact optionnel format international.
    /// </summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? TelephoneClient { get; set; }

    /// <summary>
    /// Permission écriture par défaut false - sécurité maximale.
    /// </summary>
    public bool CanWrite { get; set; } = false;
    
    /// <summary>
    /// Permission lecture par défaut true - accès consultation standard.
    /// </summary>
    public bool CanRead { get; set; } = true;
    
    /// <summary>
    /// Statut blocage par défaut false - client actif création.
    /// </summary>
    public bool IsBlocked { get; set; } = false;
}

/// <summary>
/// DTO modification client existant avec champs optionnels pour flexibilité.
/// Permet mise à jour partielle sans impact données non modifiées.
/// Validation maintenue sur champs modifiés pour intégrité continue.
/// </summary>
public class UpdateClientDto
{
    /// <summary>Nom client modifiable avec validation longueur.</summary>
    [StringLength(255, ErrorMessage = "Le nom du client ne peut pas dépasser 255 caractères")]
    public string? NomClient { get; set; }

    /// <summary>Référence client modifiable pour évolution organisation.</summary>
    [StringLength(255, ErrorMessage = "La référence ne peut pas dépasser 255 caractères")]
    public string? ReferenceClient { get; set; }

    /// <summary>Adresse client modifiable selon changements géographiques.</summary>
    [StringLength(500, ErrorMessage = "L'adresse ne peut pas dépasser 500 caractères")]
    public string? AdresseClient { get; set; }

    /// <summary>Code postal modifiable évolutions organisationnelles.</summary>
    [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères")]
    public string? CodePostal { get; set; }

    /// <summary>Pays client modifiable changements juridiction.</summary>
    [StringLength(100, ErrorMessage = "Le pays ne peut pas dépasser 100 caractères")]
    public string? PaysClient { get; set; }

    /// <summary>Email contact modifiable avec validation format maintenue.</summary>
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? EmailClient { get; set; }

    /// <summary>Téléphone modifiable évolution moyens communication.</summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? TelephoneClient { get; set; }

    /// <summary>Permission écriture modifiable gestion droits évolutive.</summary>
    public bool? CanWrite { get; set; }
    
    /// <summary>Permission lecture modifiable contrôle accès granulaire.</summary>
    public bool? CanRead { get; set; }
    
    /// <summary>Statut blocage modifiable gestion incidents sécurité.</summary>
    public bool? IsBlocked { get; set; }
}

/// <summary>
/// DTO client enrichi avec statut compte utilisateur et métriques activité.
/// Extend ClientDto avec informations compte associé et statistiques portefeuille.
/// Vision complète relation client-utilisateur et engagement plateforme.
/// </summary>
public class ClientWithUserStatusDto : ClientDto
{
    /// <summary>Indicateur existence compte utilisateur associé client.</summary>
    public bool HasUserAccount { get; set; }
    
    /// <summary>Détails compte utilisateur associé si existant (optionnel).</summary>
    public UserDto? UserAccount { get; set; }
    
    /// <summary>Nombre brevets dans portefeuille client pour métriques.</summary>
    public int BrevetCount { get; set; }
    
    /// <summary>Date dernière connexion utilisateur pour audit activité.</summary>
    public DateTime? LastUserLogin { get; set; }
}

/// <summary>
/// DTO création compte utilisateur pour client existant dans système.
/// Associe authentification à client déjà enregistré avec validations strictes.
/// Sécurité renforcée mot de passe et permissions configurables.
/// </summary>
public class CreateUserForClientDto
{
    /// <summary>ID client existant OBLIGATOIRE pour association compte.</summary>
    public int ClientId { get; set; }

    /// <summary>Nom utilisateur OBLIGATOIRE unique dans système authentification.</summary>
    [StringLength(100, ErrorMessage = "Le nom d'utilisateur ne peut pas dépasser 100 caractères")]
    public string Username { get; set; } = string.Empty;

    /// <summary>Email utilisateur OBLIGATOIRE distinct email client possible.</summary>
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    [StringLength(100, ErrorMessage = "L'email ne peut pas dépasser 100 caractères")]
    public string Email { get; set; } = string.Empty;

    /// <summary>Mot de passe OBLIGATOIRE minimum 6 caractères sécurité.</summary>
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Le mot de passe doit contenir entre 6 et 100 caractères")]
    public string Password { get; set; } = string.Empty;

    /// <summary>Permission écriture par défaut false - principe moindre privilège.</summary>
    public bool CanWrite { get; set; } = false;
    
    /// <summary>Statut activation par défaut true - compte immédiatement utilisable.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Notes administratives optionnelles pour contexte création compte.</summary>
    [StringLength(500, ErrorMessage = "Les notes ne peuvent pas dépasser 500 caractères")]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO création simultanée client et compte utilisateur pour intégration complète.
/// Workflow optimisé inscription nouvelle entité avec authentification immédiate.
/// Validation croisée informations client et utilisateur pour cohérence globale.
/// </summary>
public class CreateClientWithUserDto
{
    // === INFORMATIONS CLIENT ===
    
    /// <summary>Nom client OBLIGATOIRE - dénomination entité propriétaire brevets.</summary>
    [StringLength(255, ErrorMessage = "Le nom du client ne peut pas dépasser 255 caractères")]
    public string NomClient { get; set; } = string.Empty;

    /// <summary>Référence client optionnelle pour classification interne.</summary>
    [StringLength(255, ErrorMessage = "La référence ne peut pas dépasser 255 caractères")]
    public string? ReferenceClient { get; set; }

    /// <summary>Adresse client optionnelle pour correspondances physiques.</summary>
    [StringLength(500, ErrorMessage = "L'adresse ne peut pas dépasser 500 caractères")]
    public string? AdresseClient { get; set; }

    /// <summary>Code postal client optionnel selon standards géographiques.</summary>
    [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères")]
    public string? CodePostal { get; set; }

    /// <summary>Pays client optionnel pour contexte juridique propriété intellectuelle.</summary>
    [StringLength(100, ErrorMessage = "Le pays ne peut pas dépasser 100 caractères")]
    public string? PaysClient { get; set; }

    /// <summary>Email contact client optionnel distinct email authentification utilisateur.</summary>
    [EmailAddress(ErrorMessage = "L'email client n'est pas valide")]
    [StringLength(255, ErrorMessage = "L'email client ne peut pas dépasser 255 caractères")]
    public string? EmailClient { get; set; }

    /// <summary>Téléphone client optionnel pour communications directes urgentes.</summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? TelephoneClient { get; set; }

    // === INFORMATIONS COMPTE UTILISATEUR ===
    
    /// <summary>Nom utilisateur OBLIGATOIRE unique authentification système.</summary>
    [StringLength(100, ErrorMessage = "Le nom d'utilisateur ne peut pas dépasser 100 caractères")]
    public string Username { get; set; } = string.Empty;

    /// <summary>Email utilisateur OBLIGATOIRE connexion et récupération mot de passe.</summary>
    [EmailAddress(ErrorMessage = "L'email utilisateur n'est pas valide")]
    [StringLength(100, ErrorMessage = "L'email utilisateur ne peut pas dépasser 100 caractères")]
    public string UserEmail { get; set; } = string.Empty;

    /// <summary>Mot de passe OBLIGATOIRE sécurité minimale 6 caractères.</summary>
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Le mot de passe doit contenir entre 6 et 100 caractères")]
    public string Password { get; set; } = string.Empty;

    // === PERMISSIONS UTILISATEUR ===
    
    /// <summary>Permission écriture par défaut false - accès lecture seule initial.</summary>
    public bool CanWrite { get; set; } = false;
    
    /// <summary>Permission lecture par défaut true - consultation portefeuille standard.</summary>
    public bool CanRead { get; set; } = true;
    
    /// <summary>Statut activation par défaut true - compte immédiatement opérationnel.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Notes administratives optionnelles pour contexte création intégrée.</summary>
    [StringLength(500, ErrorMessage = "Les notes ne peuvent pas dépasser 500 caractères")]
    public string? Notes { get; set; }
}
