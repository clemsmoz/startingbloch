/*
 * ================================================================================================
 * MODÈLE DÉPOSANT - ENTITÉS PROCÉDURALES DE DÉPÔT
 * ================================================================================================
 * 
 * Description: Représente les entités qui effectuent matériellement le dépôt de brevet
 * 
 * Distinction importante:
 * - Déposant ≠ Titulaire (déposant peut être mandataire)
 * - Déposant = entité administrative pour la procédure
 * - Titulaire = propriétaire légal des droits
 * 
 * Cas d'usage:
 * - Cabinet déposant pour compte du titulaire
 * - Filiale déposant pour compte de la maison mère
 * - Inventeur déposant puis cédant à l'entreprise
 * - Mandataire professionnel en PI
 * 
 * Importance administrative:
 * - Point de contact officiel avec l'office de brevets
 * - Responsable de la procédure d'examen
 * - Interlocuteur pour notifications officielles
 * 
 * Relations:
 * - N:N avec Brevet (un déposant peut gérer plusieurs brevets)
 * - N:N avec Pays (dépôts multi-juridictionnels)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Deposants")]
public class Deposant
{
    /// <summary>
    /// Identifiant unique du déposant dans le système
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom de famille du déposant (personne physique) ou dénomination sociale (personne morale)
    /// Identification officielle utilisée dans les actes de dépôt
    /// Ex: "Cabinet Martin & Associés" ou "TechCorp SAS"
    /// </summary>
    [MaxLength(100)]
    [Column("nom")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom du déposant (uniquement pour personnes physiques)
    /// Complète l'identification des déposants individuels
    /// Null pour les personnes morales
    /// </summary>
    [MaxLength(100)]
    [Column("prenom")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Adresse postale complète du déposant
    /// Adresse officielle pour correspondances avec les offices de brevets
    /// Utilisée pour toutes notifications officielles et procédurales
    /// </summary>
    [MaxLength(255)]
    [Column("adresse")]
    public string? Adresse { get; set; }

    /// <summary>
    /// Numéro de téléphone de contact du déposant
    /// Ligne directe pour urgences procédurales et coordination
    /// Essentiel pour réactivité dans les délais administratifs
    /// </summary>
    [MaxLength(50)]
    [Column("telephone")]
    public string? Telephone { get; set; }

    /// <summary>
    /// Adresse email du déposant
    /// Canal privilégié pour échanges avec offices de brevets
    /// Notifications automatiques sur l'avancement des procédures
    /// </summary>
    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement déposant
    /// Traçabilité d'ajout au réseau de déposants
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification des informations
    /// Suivi des mises à jour de coordonnées
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevets déposés par cette entité
    /// Relation many-to-many via BrevetDeposant pour gestion de co-dépôts
    /// Représente la responsabilité procédurale par brevet
    /// </summary>
    public virtual ICollection<BrevetDeposant> BrevetDeposants { get; set; } = new List<BrevetDeposant>();

    /// <summary>
    /// Pays de nationalité/domiciliation du déposant
    /// Relation many-to-many pour entités multi-juridictionnelles
    /// Impact sur capacité juridique et règles de dépôt
    /// </summary>
    public virtual ICollection<DeposantPays> DeposantPays { get; set; } = new List<DeposantPays>();
}
