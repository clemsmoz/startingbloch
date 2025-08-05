/*
 * ================================================================================================
 * DTOs RÔLES - SYSTÈME PERMISSIONS GRANULAIRES
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données rôles système authentification StartingBloch.
 * Support architecture permissions granulaires et contrôle accès multi-niveaux.
 * 
 * RÔLES STANDARD :
 * ===============
 * 🔑 ADMIN → Employé StartingBloch accès complet + gestion utilisateurs
 * 👤 USER → Employé StartingBloch droits configurables par client  
 * 🎯 CLIENT → Client externe accès restreint ses propres brevets
 * 
 * ARCHITECTURE SÉCURITÉ :
 * ======================
 * ✅ Rôles prédéfinis système (admin/user/client)
 * ✅ Descriptions métier explicites
 * ✅ Extensibilité rôles futurs
 * ✅ Audit trail création rôles
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO rôle système avec description métier pour permissions granulaires.
/// Élément central architecture autorisation et contrôle accès plateforme.
/// Définit capacités et restrictions par type utilisateur.
/// </summary>
public class RoleDto
{
    /// <summary>Identifiant unique rôle système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom rôle technique (admin/user/client) pour logique métier.</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Description métier détaillée capacités et restrictions rôle.</summary>
    public string? Description { get; set; }
    
    /// <summary>Date création UTC rôle pour audit trail système.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO création nouveau rôle système avec validations strictes.
/// Assure cohérence architecture permissions et nomenclature standard.
/// </summary>
public class CreateRoleDto
{
    /// <summary>Nom rôle OBLIGATOIRE unique dans système permissions.</summary>
    [Required(ErrorMessage = "Le nom du rôle est obligatoire")]
    [StringLength(100, ErrorMessage = "Le nom du rôle ne peut pas dépasser 100 caractères")]
    public string Name { get; set; } = string.Empty;

    /// <summary>Description métier optionnelle pour contexte rôle.</summary>
    [StringLength(255, ErrorMessage = "La description ne peut pas dépasser 255 caractères")]
    public string? Description { get; set; }
}

/// <summary>
/// DTO modification rôle existant pour évolution architecture permissions.
/// Champs optionnels pour modification sélective sans impact global.
/// </summary>
public class UpdateRoleDto
{
    /// <summary>Nom rôle modifiable avec validation longueur maintenue.</summary>
    [StringLength(100, ErrorMessage = "Le nom du rôle ne peut pas dépasser 100 caractères")]
    public string? Name { get; set; }

    /// <summary>Description modifiable pour évolution contexte métier.</summary>
    [StringLength(255, ErrorMessage = "La description ne peut pas dépasser 255 caractères")]
    public string? Description { get; set; }
}

/// <summary>
/// DTO association utilisateur-rôle avec contexte client spécifique.
/// Relation granulaire permissions par utilisateur et périmètre métier.
/// Support architecture rôles contextuels StartingBloch.
/// </summary>
public class UserRoleDto
{
    /// <summary>Identifiant unique association user-role-client.</summary>
    public int Id { get; set; }
    
    /// <summary>Identifiant utilisateur bénéficiaire rôle.</summary>
    public int UserId { get; set; }
    
    /// <summary>Identifiant rôle accordé (admin/user/client).</summary>
    public int RoleId { get; set; }
    
    /// <summary>Identifiant client périmètre si rôle contextuel.</summary>
    public int? ClientId { get; set; }
    
    /// <summary>Entité utilisateur complète (chargement optionnel).</summary>
    public UserDto? User { get; set; }
    
    /// <summary>Entité rôle complète (chargement optionnel).</summary>
    public RoleDto? Role { get; set; }
    
    /// <summary>Entité client périmètre (chargement optionnel).</summary>
    public ClientDto? Client { get; set; }
    
    /// <summary>Date création UTC association pour audit trail.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO assignation rôle utilisateur avec permissions granulaires.
/// Configuration droits contextuels selon architecture sécurité StartingBloch.
/// Support permissions spécialisées par périmètre client.
/// </summary>
public class AssignRoleDto
{
    /// <summary>Utilisateur destinataire OBLIGATOIRE pour assignation.</summary>
    [Required(ErrorMessage = "L'ID de l'utilisateur est obligatoire")]
    public int UserId { get; set; }

    /// <summary>Rôle accordé OBLIGATOIRE (admin/user/client).</summary>
    [Required(ErrorMessage = "L'ID du rôle est obligatoire")]
    public int RoleId { get; set; }

    /// <summary>Client périmètre OBLIGATOIRE pour rôles "client", null pour admin/user.</summary>
    public int? ClientId { get; set; }
    
    /// <summary>Permission lecture spécifique pour configuration granulaire.</summary>
    public bool? CanRead { get; set; }
    
    /// <summary>Permission écriture spécifique pour configuration granulaire.</summary>
    public bool? CanWrite { get; set; }
}
