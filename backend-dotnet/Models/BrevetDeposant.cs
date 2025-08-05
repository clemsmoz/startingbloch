/*
 * ================================================================================================
 * MODÈLE BREVET DÉPOSANT - RESPONSABILITÉ PROCÉDURALE DES BREVETS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre brevets et déposants
 * 
 * Rôle procédural essentiel:
 * - Entité légalement responsable du dépôt
 * - Interlocuteur officiel avec les offices de brevets
 * - Responsable des frais et annuités
 * - Mandataire pour toutes procédures administratives
 * 
 * Distinction juridique importante:
 * - Déposant ≠ Inventeur (créateur vs responsable procédural)
 * - Déposant ≠ Titulaire (responsable vs propriétaire final)
 * - Peut changer lors de cessions ou transferts
 * 
 * Contexte métier:
 * - Un brevet peut avoir plusieurs co-déposants
 * - Un déposant peut gérer un large portefeuille
 * - Souvent l'employeur de l'inventeur en contexte salarié
 * - Peut être un mandataire pour dépôts groupés
 * 
 * Relations:
 * - N:1 avec Brevet (procédure de dépôt)
 * - N:1 avec Deposant (entité responsable)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("BrevetDeposants")]
public class BrevetDeposant
{
    /// <summary>
    /// Identifiant unique de l'association brevet-déposant
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers le brevet concerné
    /// Clé étrangère vers la table Brevets
    /// </summary>
    [Column("id_brevet")]
    public int IdBrevet { get; set; }

    /// <summary>
    /// Référence vers l'entité déposante
    /// Clé étrangère vers la table Deposants
    /// </summary>
    [Column("id_deposant")]
    public int IdDeposant { get; set; }

    /// <summary>
    /// Alias pour compatibilité avec conventions de nommage
    /// Propriété calculée redirigeant vers IdBrevet
    /// </summary>
    [NotMapped]
    public int BrevetId
    {
        get => IdBrevet;
        set => IdBrevet = value;
    }

    /// <summary>
    /// Alias pour compatibilité avec conventions de nommage
    /// Propriété calculée redirigeant vers IdDeposant
    /// </summary>
    [NotMapped]
    public int DeposantId
    {
        get => IdDeposant;
        set => IdDeposant = value;
    }

    /// <summary>
    /// Date d'établissement de la responsabilité déposant-brevet
    /// Traçabilité des responsabilités procédurales
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevet déposé par cette entité (navigation property)
    /// Accès aux informations complètes du brevet
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet Brevet { get; set; } = null!;

    /// <summary>
    /// Entité responsable du dépôt (navigation property)
    /// Accès aux informations complètes du déposant
    /// </summary>
    [ForeignKey("IdDeposant")]
    public virtual Deposant Deposant { get; set; } = null!;
}
