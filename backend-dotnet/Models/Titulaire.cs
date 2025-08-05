/*
 * ================================================================================================
 * MODÈLE TITULAIRE - PROPRIÉTAIRES LÉGAUX DES BREVETS
 * ================================================================================================
 * 
 * Description: Représente les entités détenant les droits patrimoniaux sur les brevets
 * 
 * Droits et responsabilités:
 * - Propriété légale exclusive du brevet
 * - Droit d'exploitation commerciale
 * - Pouvoir de cession, licence, abandon
 * - Responsabilité des maintien et renouvellements
 * - Droit de poursuite en contrefaçon
 * 
 * Types de titulaires:
 * - Personnes physiques (inventeurs-propriétaires)
 * - Personnes morales (entreprises, universités)
 * - Co-propriété possible (plusieurs titulaires)
 * 
 * Relations:
 * - N:N avec Brevet (co-propriété fréquente)
 * - N:N avec Pays (gestion multi-juridictionnelle)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Titulaires")]
public class Titulaire
{
    /// <summary>
    /// Identifiant unique du titulaire dans le système
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom de famille du titulaire (personne physique) ou dénomination sociale (personne morale)
    /// Champ essentiel pour identification légale et actes de propriété
    /// Ex: "Dupont" ou "Société Anonyme TechCorp"
    /// </summary>
    [MaxLength(100)]
    [Column("nom")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom du titulaire (uniquement pour personnes physiques)
    /// Complète l'identification pour éviter les ambiguïtés
    /// Null pour les personnes morales
    /// </summary>
    [MaxLength(100)]
    [Column("prenom")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Adresse postale complète du titulaire
    /// Siège social pour personnes morales, domicile pour personnes physiques
    /// Utilisée pour significations légales et correspondances officielles
    /// </summary>
    [MaxLength(255)]
    [Column("adresse")]
    public string? Adresse { get; set; }

    /// <summary>
    /// Numéro de téléphone de contact du titulaire
    /// Communication directe pour gestion des droits et revenus
    /// Essentiel pour notifications urgentes sur les brevets
    /// </summary>
    [MaxLength(50)]
    [Column("telephone")]
    public string? Telephone { get; set; }

    /// <summary>
    /// Adresse email du titulaire
    /// Canal privilégié pour gestion des licences et revenus de PI
    /// Notifications automatiques sur l'état des brevets
    /// </summary>
    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement titulaire
    /// Traçabilité d'ajout au système
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification des informations
    /// Suivi des mises à jour de coordonnées et statut
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevets détenus en propriété par ce titulaire
    /// Relation many-to-many via BrevetTitulaire pour gestion de co-propriété
    /// Représente le portefeuille de propriété intellectuelle
    /// </summary>
    public virtual ICollection<BrevetTitulaire> BrevetTitulaires { get; set; } = new List<BrevetTitulaire>();

    /// <summary>
    /// Pays de nationalité/domiciliation du titulaire
    /// Relation many-to-many pour structures multi-juridictionnelles
    /// Impact sur fiscalité des revenus de PI et optimisation
    /// </summary>
    public virtual ICollection<TitulairePays> TitulairePays { get; set; } = new List<TitulairePays>();
}
