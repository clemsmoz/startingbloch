/*
 * ================================================================================================
 * MODÈLE UTILISATEUR - ENTITÉ CENTRALE DU SYSTÈME D'AUTHENTIFICATION
 * ================================================================================================
 * 
 * Description: Représente un utilisateur du système avec ses permissions et informations personnelles
 * 
 * Fonctionnalités:
 * - Authentification et autorisation
 * - Gestion des rôles et permissions (lecture/écriture)
 * - Association avec un client spécifique pour isolation des données
 * - Système de blocage pour sécurité
 * - Traçabilité complète (création, dernière connexion)
 * 
 * Sécurité:
 * - Mots de passe hachés avec PBKDF2 + sel
 * - Validation stricte des données en entrée
 * - Support du système de permissions granulaires
 * 
 * Relations:
 * - N:1 avec Client (isolation des données par client)
 * - N:N avec Role (via UserRole pour permissions avancées)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

/// <summary>
/// Entité représentant un utilisateur du système StartingBloch
/// Table principale pour l'authentification et la gestion des permissions
/// </summary>
[Table("Users")]
public class User
{
    /// <summary>
    /// Identifiant unique de l'utilisateur (clé primaire)
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom d'utilisateur pour la connexion (doit être unique)
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("username")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Adresse email de l'utilisateur (unique, utilisée pour notifications)
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Mot de passe haché (JAMAIS stocké en clair)
    /// Utilise PBKDF2 + SHA-256 avec sel aléatoire pour sécurité maximale
    /// </summary>
    [Required]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Rôle de l'utilisateur dans le système
    /// Valeurs possibles: "admin", "user", "readonly"
    /// </summary>
    [MaxLength(50)]
    [Column("role")]
    public string Role { get; set; } = "user";

    /// <summary>
    /// Permission d'écriture (création, modification, suppression)
    /// False = utilisateur en lecture seule
    /// </summary>
    // Stockage base en entier (0/1) pour compatibilité historique
    [Column("canWrite")]
    public int CanWriteInt { get; set; } = 0;

    // Propriété de confort bool (non mappée) conservant l'API existante
    [NotMapped]
    public bool CanWrite
    {
        get => CanWriteInt == 1;
        set => CanWriteInt = value ? 1 : 0;
    }

    /// <summary>
    /// Permission de lecture (consultation des données)
    /// True par défaut - très rarement désactivé
    /// </summary>
    [Column("canRead")]
    public int CanReadInt { get; set; } = 1;

    [NotMapped]
    public bool CanRead
    {
        get => CanReadInt == 1;
        set => CanReadInt = value ? 1 : 0;
    }

    /// <summary>
    /// Statut actif de l'utilisateur
    /// False = compte désactivé (soft delete)
    /// </summary>
    [Column("isActive")]
    public int IsActiveInt { get; set; } = 1;

    [NotMapped]
    public bool IsActive
    {
        get => IsActiveInt == 1;
        set => IsActiveInt = value ? 1 : 0;
    }

    /// <summary>
    /// Statut de blocage de sécurité
    /// True = compte temporairement bloqué (tentatives de connexion échouées, etc.)
    /// </summary>
    [Column("isBlocked")]
    public int IsBlockedInt { get; set; } = 0;

    [NotMapped]
    public bool IsBlocked
    {
        get => IsBlockedInt == 1;
        set => IsBlockedInt = value ? 1 : 0;
    }

    /// <summary>
    /// Nom de famille de l'utilisateur (optionnel)
    /// </summary>
    [MaxLength(100)]
    [Column("nom")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom de l'utilisateur (optionnel)
    /// </summary>
    [MaxLength(100)]
    [Column("prenom")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Date et heure de la dernière connexion réussie
    /// Utilisé pour audit et sécurité
    /// </summary>
    [Column("lastLogin")]
    public DateTime? LastLogin { get; set; }

    /// <summary>
    /// Date de création du compte utilisateur
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière mise à jour du compte
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ============================================================================================
    // RELATIONS ET ASSOCIATIONS
    // ============================================================================================

    /// <summary>
    /// Identifiant du client auquel cet utilisateur appartient
    /// Permet l'isolation des données (chaque utilisateur ne voit que les données de son client)
    /// Null = utilisateur administrateur global
    /// </summary>
    [Column("clientId")]
    public int? ClientId { get; set; }

    /// <summary>
    /// Navigation property vers le client associé
    /// Relation Many-to-One (plusieurs utilisateurs par client)
    /// </summary>
    [ForeignKey("ClientId")]
    public virtual Client? Client { get; set; }

    /// <summary>
    /// Collection des rôles associés à cet utilisateur
    /// Relation Many-to-Many via table de liaison UserRole
    /// Permet des permissions granulaires avancées
    /// </summary>
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
