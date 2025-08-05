/*
 * =====================================    /// <summary>Email utilisateur pour communications et récupération.</summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>Prénom utilisateur pour identification personnelle.</summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>Nom famille utilisateur pour identification personnelle.</summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>Rôle principal utilisateur (admin/user/client).</summary>
    public string Role { get; set; } = string.Empty;
    
    /// <summary>Permission lecture données brevets accordée.</summary>
    public bool CanRead { get; set; }===================================================
 * DTOs UTILISATEURS - AUTHENTIFICATION ET AUTORISATION SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données utilisateurs authentification StartingBloch.
 * Support connexion sécurisée, gestion sessions et permissions granulaires.
 * 
 * MODÈLES AUTHENTIFICATION :
 * =========================
 * 👤 USER COMPLET → UserDto avec rôles et relations client
 * 🔐 LOGIN → LoginDto credentials + réponse JWT token  
 * ➕ CRÉATION → CreateUserDto avec validations sécurité
 * ✏️ MODIFICATION → UpdateUserDto champs optionnels
 * 🔑 CHANGEMENT → ChangePasswordDto sécurité renforcée
 * 
 * ARCHITECTURE SÉCURITÉ :
 * ======================
 * ✅ JWT Tokens avec expiration
 * ✅ Mots de passe hashés BCrypt
 * ✅ Rôles granulaires (admin/user/client)
 * ✅ Permissions contextuelles par client
 * ✅ Audit trail connexions
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO utilisateur complet avec rôles et permissions pour gestion session.
/// Profil authentifié avec contexte métier et autorisations granulaires.
/// </summary>
public class UserDto
{
    /// <summary>Identifiant unique utilisateur système.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom utilisateur unique pour authentification.</summary>
    public string Username { get; set; } = string.Empty;
    
    /// <summary>Email utilisateur pour communications et récupération.</summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>Prénom utilisateur pour identification personnelle.</summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>Nom famille utilisateur pour identification personnelle.</summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>Rôle principal utilisateur (admin/user/client).</summary>
    public string Role { get; set; } = string.Empty;
    
    /// <summary>Permission lecture données brevets accordée.</summary>
    public bool CanRead { get; set; }
    
    /// <summary>Permission modification données brevets accordée.</summary>
    public bool CanWrite { get; set; }
    
    /// <summary>Statut activation compte utilisateur.</summary>
    public bool IsActive { get; set; }
    
    /// <summary>Statut blocage compte utilisateur pour sécurité.</summary>
    public bool IsBlocked { get; set; }
    
    /// <summary>Mot de passe hashé utilisateur (sensible - usage interne).</summary>
    public string Password { get; set; } = string.Empty;
    
    /// <summary>Dernière connexion UTC pour audit activité.</summary>
    public DateTime? LastLogin { get; set; }
    
    /// <summary>Date création UTC compte pour audit trail.</summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>Client associé si rôle contextuel (optionnel).</summary>
    public int? ClientId { get; set; }
    
    /// <summary>Entité client complète (chargement optionnel).</summary>
    public ClientDto? Client { get; set; }
    
    /// <summary>Liste rôles granulaires utilisateur (système avancé).</summary>
    public List<UserRoleDto> UserRoles { get; set; } = new();
}

/// <summary>
/// DTO réponse connexion avec token JWT et informations session.
/// Données sécurisées post-authentification pour client.
/// </summary>
public class LoginResponseDto
{
    /// <summary>Token JWT signé pour autorisation API.</summary>
    public string Token { get; set; } = string.Empty;
    
    /// <summary>Profil utilisateur authentifié pour session.</summary>
    public UserDto User { get; set; } = new();
    
    /// <summary>Date expiration UTC token pour renouvellement.</summary>
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// DTO création nouvel utilisateur avec validations sécurité strictes.
/// Enregistrement compte avec permissions conservatrices par défaut.
/// </summary>
public class CreateUserDto
{
    /// <summary>Nom utilisateur OBLIGATOIRE unique système.</summary>
    [Required(ErrorMessage = "Le nom d'utilisateur est obligatoire")]
    [StringLength(100, ErrorMessage = "Le nom d'utilisateur ne peut pas dépasser 100 caractères")]
    public string Username { get; set; } = string.Empty;

    /// <summary>Email OBLIGATOIRE avec validation format strict.</summary>
    [Required(ErrorMessage = "L'email est obligatoire")]
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    [StringLength(100, ErrorMessage = "L'email ne peut pas dépasser 100 caractères")]
    public string Email { get; set; } = string.Empty;
    
    /// <summary>Prénom OBLIGATOIRE pour identification personnelle.</summary>
    [Required(ErrorMessage = "Le prénom est obligatoire")]
    [StringLength(50, ErrorMessage = "Le prénom ne peut pas dépasser 50 caractères")]
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>Nom famille OBLIGATOIRE pour identification personnelle.</summary>
    [Required(ErrorMessage = "Le nom est obligatoire")]
    [StringLength(50, ErrorMessage = "Le nom ne peut pas dépasser 50 caractères")]
    public string LastName { get; set; } = string.Empty;

    /// <summary>Mot de passe OBLIGATOIRE minimum 6 caractères sécurité.</summary>
    [Required(ErrorMessage = "Le mot de passe est obligatoire")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Le mot de passe doit faire entre 6 et 100 caractères")]
    public string Password { get; set; } = string.Empty;

    /// <summary>Rôle par défaut "user" - principe moindre privilège.</summary>
    [StringLength(50, ErrorMessage = "Le rôle ne peut pas dépasser 50 caractères")]
    public string Role { get; set; } = "user";
    
    /// <summary>Permission lecture par défaut true - accès consultation.</summary>
    public bool CanRead { get; set; } = true;

    /// <summary>Permission écriture par défaut false - sécurité maximale.</summary>
    public bool CanWrite { get; set; } = false;
    
    /// <summary>Statut activation par défaut true - compte immédiatement utilisable.</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Client associé optionnel pour rôles contextuels.</summary>
    public int? ClientId { get; set; }
}

/// <summary>
/// DTO modification utilisateur existant avec champs optionnels.
/// Permet évolution profil et permissions sans impact global.
/// </summary>
public class UpdateUserDto
{
    /// <summary>Nom utilisateur modifiable avec validation longueur.</summary>
    [StringLength(100, ErrorMessage = "Le nom d'utilisateur ne peut pas dépasser 100 caractères")]
    public string? Username { get; set; }

    /// <summary>Email modifiable avec validation format maintenue.</summary>
    [EmailAddress(ErrorMessage = "L'email n'est pas valide")]
    [StringLength(100, ErrorMessage = "L'email ne peut pas dépasser 100 caractères")]
    public string? Email { get; set; }

    /// <summary>Rôle modifiable pour évolution responsabilités.</summary>
    [StringLength(50, ErrorMessage = "Le rôle ne peut pas dépasser 50 caractères")]
    public string? Role { get; set; }

    /// <summary>Permission écriture modifiable gestion droits granulaire.</summary>
    public bool? CanWrite { get; set; }
    
    /// <summary>Statut activation modifiable pour gestion compte.</summary>
    public bool? IsActive { get; set; }
    
    /// <summary>Client associé modifiable pour réassignation contexte.</summary>
    public int? ClientId { get; set; }
}

/// <summary>
/// DTO changement mot de passe avec validation ancien pour sécurité.
/// Procédure sécurisée modification credentials avec double vérification.
/// </summary>
public class ChangePasswordDto
{
    /// <summary>Ancien mot de passe OBLIGATOIRE pour authentification.</summary>
    [Required(ErrorMessage = "L'ancien mot de passe est obligatoire")]
    public string OldPassword { get; set; } = string.Empty;

    /// <summary>Nouveau mot de passe OBLIGATOIRE minimum 6 caractères.</summary>
    [Required(ErrorMessage = "Le nouveau mot de passe est obligatoire")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Le nouveau mot de passe doit faire entre 6 et 100 caractères")]
    public string NewPassword { get; set; } = string.Empty;
}
