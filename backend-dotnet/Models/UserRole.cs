/*
 * ================================================================================================
 * MODÈLE USER ROLE - TABLE DE JONCTION POUR PERMISSIONS CONTEXTUELLES
 * ================================================================================================
 * 
 * Description: Table de jonction avancée gérant l'attribution des rôles aux utilisateurs
 *              avec possibilité de restriction contextuelle par client
 * 
 * Architecture multi-tenant:
 * - Attribution de rôles par contexte client
 * - Un utilisateur peut avoir différents rôles selon les clients
 * - Isolation sécurisée des données par organisation
 * - Gestion fine des permissions par portefeuille
 * 
 * Exemples d'attribution:
 * - User 1, Role ADMIN, Client A → Admin total pour le client A
 * - User 1, Role LECTEUR, Client B → Lecture seule pour le client B  
 * - User 2, Role SUPER_ADMIN, Client NULL → Admin global tous clients
 * 
 * Cas d'usage:
 * - Consultants externes avec accès limité à leurs clients
 * - Gestionnaires internes avec responsabilités par portefeuille
 * - Administrateurs avec droits transversaux
 * - Auditeurs avec accès temporaire et traçé
 * 
 * Relations:
 * - N:1 avec User (un utilisateur, plusieurs rôles)
 * - N:1 avec Role (un rôle, plusieurs utilisateurs)
 * - N:1 avec Client (optionnel, pour restriction contextuelle)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("UserRoles")]
public class UserRole
{
    /// <summary>
    /// Identifiant unique de l'attribution de rôle
    /// Permet la traçabilité et la gestion individuelle des permissions
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers l'utilisateur concerné
    /// Clé étrangère obligatoire vers la table Users
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// Référence vers le rôle attribué
    /// Clé étrangère obligatoire vers la table Roles
    /// </summary>
    [Required]
    public int RoleId { get; set; }

    /// <summary>
    /// Référence optionnelle vers un client spécifique
    /// NULL = rôle global sur tous les clients
    /// Valeur = rôle restreint à ce client uniquement
    /// Permet l'isolation multi-tenant des permissions
    /// </summary>
    public int? ClientId { get; set; }

    /// <summary>
    /// Date d'attribution du rôle
    /// Traçabilité des changements de permissions
    /// Essentiel pour audit sécurisé
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification de l'attribution
    /// Suivi des ajustements de permissions
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Utilisateur concerné par cette attribution (navigation property)
    /// Accès aux informations complètes de l'utilisateur
    /// </summary>
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Rôle attribué dans cette relation (navigation property)
    /// Accès aux détails du rôle et ses permissions
    /// </summary>
    [ForeignKey("RoleId")]
    public virtual Role Role { get; set; } = null!;

    /// <summary>
    /// Client de restriction optionnel (navigation property)
    /// Permet de définir le périmètre d'action de l'utilisateur
    /// NULL pour permissions globales
    /// </summary>
    [ForeignKey("ClientId")]
    public virtual Client? Client { get; set; }
}
