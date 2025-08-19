/*
 * ================================================================================================
 * MODÈLE INFORMATION DÉPÔT - SUIVI DES PROCÉDURES NATIONALES DE BREVETS
 * ================================================================================================
 * 
 * Description: Gère les informations spécifiques de dépôt, publication et délivrance 
 *              pour chaque territoire national d'un brevet
 * 
 * Contexte métier:
 * - Un brevet peut être déposé dans plusieurs pays (famille de brevets)
 * - Chaque pays a ses propres numéros, dates et procédures
 * - Suivi des étapes clés: dépôt → publication → délivrance
 * - Gestion des statuts juridiques par territoire
 * 
 * Cas d'usage:
 * - Suivi des délais de réponse par pays
 * - Calcul des annuités à payer
 * - Rapport de statut par territoire
 * - Gestion des licences territoriales
 * 
 * Relations:
 * - N:1 avec Brevet (un brevet, plusieurs territoires)
 * - N:1 avec Pays (définit la juridiction)
 * - N:1 avec Statuts (état de la procédure)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("InformationsDepot")]
public class InformationDepot
{
    /// <summary>
    /// Identifiant unique de l'information de dépôt
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers le brevet parent
    /// Lien obligatoire - chaque information appartient à un brevet spécifique
    /// </summary>
    [Column("id_brevet")]
    public int IdBrevet { get; set; }

    /// <summary>
    /// Référence vers le pays de dépôt
    /// Détermine la juridiction et les règles applicables
    /// </summary>
    [Column("id_pays")]
    public int? IdPays { get; set; }

    /// <summary>
    /// Référence vers le statut actuel de la procédure
    /// Ex: "En cours d'examen", "Délivré", "Rejeté", "Abandonné"
    /// </summary>
    [Column("id_statuts")]
    public int? IdStatuts { get; set; }

    /// <summary>
    /// Numéro officiel de dépôt attribué par l'office national
    /// Format varie selon les pays (ex: FR2313456, US17/123456)
    /// </summary>
    [MaxLength(100)]
    [Column("numero_depot")]
    public string? NumeroDepot { get; set; }

    /// <summary>
    /// Numéro de publication officielle du brevet
    /// Publié généralement 18 mois après le dépôt
    /// </summary>
    [MaxLength(100)]
    [Column("numero_publication")]
    public string? NumeroPublication { get; set; }

    /// <summary>
    /// Numéro de délivrance du brevet
    /// Attribué après examen favorable et acceptation finale
    /// </summary>
    [MaxLength(100)]
    [Column("numero_delivrance")]
    public string? NumeroDelivrance { get; set; }

    /// <summary>
    /// Date officielle de dépôt de la demande
    /// Date critique pour le calcul des priorités et délais
    /// </summary>
    [Column("date_depot")]
    public DateTime? DateDepot { get; set; }

    /// <summary>
    /// Date de publication officielle du brevet
    /// Généralement 18 mois après la date de dépôt
    /// </summary>
    [Column("date_publication")]
    public DateTime? DatePublication { get; set; }

    /// <summary>
    /// Date de délivrance effective du brevet
    /// Marque le début de la protection juridique
    /// </summary>
    [Column("date_delivrance")]
    public DateTime? DateDelivrance { get; set; }

    /// <summary>
    /// Indicateur de licence accordée sur ce territoire
    /// True si des licences d'exploitation ont été concédées
    /// </summary>
    [Column("licence")]
    public bool Licence { get; set; } = false;

    /// <summary>
    /// Commentaires libres sur la procédure dans ce territoire
    /// Ex: "Objection sur la revendication 3", "Traduction requise"
    /// </summary>
    [MaxLength(500)]
    [Column("commentaire")]
    public string? Commentaire { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement
    /// Traçabilité de saisie des informations
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification de l'enregistrement
    /// Suivi des mises à jour des procédures
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevet parent auquel appartient cette information (navigation property)
    /// Permet d'accéder aux données complètes du brevet
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet? Brevet { get; set; }

    /// <summary>
    /// Pays de dépôt associé (navigation property)
    /// Donne accès aux informations du territoire et ses spécificités juridiques
    /// </summary>
    [ForeignKey("IdPays")]
    public virtual Pays? Pays { get; set; }

    /// <summary>
    /// Statut actuel de la procédure (navigation property)
    /// Permet d'accéder aux détails du statut et ses implications
    /// </summary>
    [ForeignKey("IdStatuts")]
    public virtual Statuts? Statuts { get; set; }

    // Cabinets liés à cette information de dépôt (par catégorie)
    public virtual ICollection<InformationDepotCabinet> InformationDepotCabinets { get; set; } = new List<InformationDepotCabinet>();
}
