/*
 * ================================================================================================
 * MODÈLE TITULAIRE PAYS - NATIONALITÉS DES PROPRIÉTAIRES DE BREVETS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre titulaires et pays
 *              pour la gestion des nationalités/domiciliations des propriétaires finaux
 * 
 * Enjeux économiques et fiscaux:
 * - Optimisation fiscale des revenus de propriété intellectuelle
 * - Application des conventions de double imposition
 * - Respect des réglementations de transfert de profits
 * - Gestion des withholding taxes sur royalties
 * 
 * Complexités structurelles:
 * - Holdings multi-nationales avec optimisation fiscale
 * - Structures de licensing international sophistiquées
 * - Entités SPV (Special Purpose Vehicle) dédiées aux IP
 * - Trusts et fondations pour gestion patrimoniale
 * 
 * Impact stratégique:
 * - Choix de juridiction optimale pour détention de brevets
 * - Structuration des flux de royalties inter-groupes
 * - Conformité aux règles BEPS (Base Erosion Profit Shifting)
 * - Protection contre expropriations et sanctions
 * 
 * Relations:
 * - N:1 avec Titulaire (propriétaire des droits)
 * - N:1 avec Pays (territoire de nationalité/domiciliation)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("TitulairePays")]
public class TitulairePays
{
    /// <summary>
    /// Identifiant unique de l'association titulaire-pays
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers l'entité titulaire des droits
    /// Clé étrangère vers la table Titulaires
    /// </summary>
    [Column("id_titulaire")]
    public int IdTitulaire { get; set; }

    /// <summary>
    /// Référence vers le pays de nationalité/domiciliation fiscale
    /// Clé étrangère vers la table Pays
    /// </summary>
    [Column("id_pays")]
    public int IdPays { get; set; }

    /// <summary>
    /// Date d'établissement de la relation titulaire-pays
    /// Traçabilité des restructurations et optimisations fiscales
    /// Crucial pour historique des revenus de PI
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Propriétaire des droits concerné (navigation property)
    /// Accès aux informations de propriété et structuration
    /// </summary>
    [ForeignKey("IdTitulaire")]
    public virtual Titulaire Titulaire { get; set; } = null!;

    /// <summary>
    /// Pays de nationalité/domiciliation fiscale (navigation property)
    /// Accès aux informations réglementaires et fiscales
    /// </summary>
    [ForeignKey("IdPays")]
    public virtual Pays Pays { get; set; } = null!;
}
