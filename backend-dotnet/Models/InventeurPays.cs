/*
 * ================================================================================================
 * MODÈLE INVENTEUR PAYS - NATIONALITÉS ET RÉSIDENCES DES INVENTEURS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre inventeurs et pays
 *              pour la gestion des nationalités et résidences multiples
 * 
 * Importance juridique internationale:
 * - Détermination des droits territoriaux d'invention
 * - Calcul des rémunérations selon législations nationales
 * - Respect des accords de propriété intellectuelle bilatéraux
 * - Gestion des privilèges diplomatiques et fiscaux
 * 
 * Cas d'usage complexes:
 * - Inventeurs bi-nationaux ou résidents multi-pays
 * - Collaborations internationales université-industrie
 * - Projets de recherche européens avec mobilité
 * - Expatriés conservant nationalité d'origine
 * 
 * Impact opérationnel:
 * - Choix optimal des territoires de dépôt
 * - Optimisation fiscale des revenus de brevets
 * - Conformité aux réglementations d'exportation
 * - Stratégies de licensing international
 * 
 * Relations:
 * - N:1 avec Inventeur (personne concernée)
 * - N:1 avec Pays (territoire de nationalité/résidence)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("InventeurPays")]
public class InventeurPays
{
    /// <summary>
    /// Identifiant unique de l'association inventeur-pays
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers l'inventeur concerné
    /// Clé étrangère vers la table Inventeurs
    /// </summary>
    [Column("id_inventeur")]
    public int IdInventeur { get; set; }

    /// <summary>
    /// Référence vers le pays de nationalité/résidence
    /// Clé étrangère vers la table Pays
    /// </summary>
    [Column("id_pays")]
    public int IdPays { get; set; }

    /// <summary>
    /// Référence optionnelle vers le brevet auquel cette association s'applique
    /// Permet de lier des pays par inventeur au contexte d'un brevet précis
    /// </summary>
    [Column("id_brevet")]
    public int? IdBrevet { get; set; }

    /// <summary>
    /// Date d'établissement de la relation inventeur-pays
    /// Traçabilité des changements de nationalité/résidence
    /// Important pour calculs de droits territoriaux
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Inventeur concerné par cette nationalité/résidence (navigation property)
    /// Accès aux informations personnelles et inventions
    /// </summary>
    [ForeignKey("IdInventeur")]
    public virtual Inventeur Inventeur { get; set; } = null!;

    /// <summary>
    /// Pays de nationalité/résidence (navigation property)
    /// Accès aux informations géographiques et réglementaires
    /// </summary>
    [ForeignKey("IdPays")]
    public virtual Pays Pays { get; set; } = null!;

    /// <summary>
    /// Brevet concerné (optionnel)
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet? Brevet { get; set; }
}
