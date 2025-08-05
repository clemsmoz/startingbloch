/*
 * ================================================================================================
 * MODÈLE DÉPOSANT PAYS - NATIONALITÉS DES ENTITÉS DÉPOSANTES
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre déposants et pays
 *              pour la gestion des nationalités/juridictions des entités déposantes
 * 
 * Enjeux juridiques et procéduraux:
 * - Détermination de la capacité juridique de dépôt
 * - Respect des restrictions nationales d'exportation
 * - Calcul des taxes officielles selon nationalité
 * - Application des accords de réciprocité internationale
 * 
 * Complexités multi-juridictionnelles:
 * - Entreprises multi-nationales avec filiales diverses
 * - Entités holding avec domiciliations multiples
 * - Structures juridiques offshore ou européennes
 * - Consortiums internationaux temporaires
 * 
 * Impact opérationnel:
 * - Choix de l'entité déposante optimale par territoire
 /// - Gestion des privilèges fiscaux et diplomatiques
 * - Conformité aux réglementations d'embargo
 * - Stratégies de protection multi-territoriale
 * 
 * Relations:
 * - N:1 avec Deposant (entité juridique)
 * - N:1 avec Pays (territoire de nationalité/domiciliation)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("DeposantPays")]
public class DeposantPays
{
    /// <summary>
    /// Identifiant unique de l'association déposant-pays
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers l'entité déposante
    /// Clé étrangère vers la table Deposants
    /// </summary>
    [Column("id_deposant")]
    public int IdDeposant { get; set; }

    /// <summary>
    /// Référence vers le pays de nationalité/domiciliation
    /// Clé étrangère vers la table Pays
    /// </summary>
    [Column("id_pays")]
    public int IdPays { get; set; }

    /// <summary>
    /// Date d'établissement de la relation déposant-pays
    /// Traçabilité des changements de nationalité/domiciliation
    /// Important pour suivi des capacités juridiques
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Entité déposante concernée (navigation property)
    /// Accès aux informations juridiques et procédurales
    /// </summary>
    [ForeignKey("IdDeposant")]
    public virtual Deposant Deposant { get; set; } = null!;

    /// <summary>
    /// Pays de nationalité/domiciliation (navigation property)
    /// Accès aux informations géographiques et réglementaires
    /// </summary>
    [ForeignKey("IdPays")]
    public virtual Pays Pays { get; set; } = null!;
}
