/*
 * ================================================================================================
 * MODÈLE RÔLE - SYSTÈME DE GESTION DES PERMISSIONS (RBAC)
 * ================================================================================================
 * 
 * Description: Définition des rôles utilisateur pour contrôle d'accès basé sur les rôles
 *              (Role-Based Access Control - RBAC)
 * 
 * Architecture sécurisée:
 * - Séparation claire des responsabilités
 * - Principe du moindre privilège
 * - Attribution granulaire des permissions
 * - Évolutivité des droits d'accès
 * 
 * Rôles métier types:
 * - SUPER_ADMIN: Administrateur système complet
 * - ADMIN_CLIENT: Gestionnaire d'un portefeuille client
 * - CONSEILLER_PI: Consultant en propriété intellectuelle
 * - ASSISTANT_JURIDIQUE: Support aux procédures
 * - LECTEUR: Consultation seule des données
 * 
 * Fonctionnalités:
 * - Attribution multiple de rôles par utilisateur
 * - Héritage hiérarchique possible
 * - Audit des changements de rôles
 * - Gestion temporaire des permissions
 * 
 * Relations:
 * - N:M avec User via UserRole (utilisateurs multi-rôles)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Roles")]
public class Role
{
    /// <summary>
    /// Identifiant unique du rôle
    /// Clé primaire pour référencement dans les relations
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Nom du rôle
    /// Identifiant métier unique et parlant
    /// Convention: MAJUSCULES_AVEC_UNDERSCORES
    /// Ex: "SUPER_ADMIN", "CONSEILLER_PI", "LECTEUR"
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description détaillée du rôle et de ses permissions
    /// Documentation des responsabilités et limites
    /// Ex: "Accès complet à la gestion des brevets et clients"
    /// </summary>
    [StringLength(255)]
    public string? Description { get; set; }

    /// <summary>
    /// Date de création du rôle
    /// Traçabilité de l'évolution du système de permissions
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification du rôle
    /// Suivi des ajustements de permissions
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Relations avec les utilisateurs via table de jonction
    /// Permet l'attribution multiple de rôles par utilisateur
    /// Modèle flexible pour gestion complexe des permissions
    /// </summary>
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
