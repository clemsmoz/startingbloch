/*
 * ================================================================================================
 * MODÈLE BREVET TITULAIRE - PROPRIÉTÉ ÉCONOMIQUE DES BREVETS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre brevets et titulaires
 * 
 * Droits économiques fondamentaux:
 * - Propriété exclusive des droits patrimoniaux
 * - Droit d'exploiter commercialement l'invention
 * - Pouvoir de cession, licence et transfert
 * - Bénéfice des revenus de propriété intellectuelle
 * 
 * Distinction juridique cruciale:
 * - Titulaire = Propriétaire économique final
 * - Titulaire ≠ Inventeur (propriétaire vs créateur)
 * - Titulaire ≠ Déposant (propriétaire vs responsable procédural)
 * - Évolution possible par cessions et acquisitions
 * 
 * Contexte métier:
 * - Un brevet peut avoir plusieurs co-titulaires (copropriété)
 * - Un titulaire peut détenir un vaste portefeuille
 * - Base des accords de licence et royalties
 * - Élément clé pour valorisation d'entreprise
 * 
 * Relations:
 * - N:1 avec Brevet (droits sur l'invention)
 * - N:1 avec Titulaire (propriétaire des droits)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("BrevetTitulaires")]
public class BrevetTitulaire
{
    /// <summary>
    /// Identifiant unique de l'association brevet-titulaire
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
    /// Référence vers l'entité titulaire des droits
    /// Clé étrangère vers la table Titulaires
    /// </summary>
    [Column("id_titulaire")]
    public int IdTitulaire { get; set; }

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
    /// Propriété calculée redirigeant vers IdTitulaire
    /// </summary>
    [NotMapped]
    public int TitulaireId
    {
        get => IdTitulaire;
        set => IdTitulaire = value;
    }

    /// <summary>
    /// Date d'établissement de la propriété titulaire-brevet
    /// Traçabilité des droits économiques et cessions
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevet détenu en propriété (navigation property)
    /// Accès aux informations complètes de l'invention
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet Brevet { get; set; } = null!;

    /// <summary>
    /// Propriétaire des droits économiques (navigation property)
    /// Accès aux informations complètes du titulaire
    /// </summary>
    [ForeignKey("IdTitulaire")]
    public virtual Titulaire Titulaire { get; set; } = null!;
}
