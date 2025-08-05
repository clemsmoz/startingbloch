/*
 * ================================================================================================
 * MODÈLE BREVET CABINET - MANDATS JURIDIQUES SPÉCIALISÉS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre brevets et cabinets
 *              avec spécialisation par type de mandat
 * 
 * Types de mandats juridiques:
 * - "procedure": Cabinet responsable des procédures de dépôt et examen
 * - "annuite": Cabinet gérant les renouvellements et annuités
 * - "litigation": Cabinet spécialisé en contentieux et défense
 * - "foreign": Cabinet correspondant à l'étranger
 * 
 * Contexte métier:
 * - Externalisation des expertises juridiques spécialisées
 * - Mandats géographiques pour procédures internationales
 * - Séparation des responsabilités par type d'activité
 * - Optimisation des coûts par spécialisation
 * 
 * Architecture flexible:
 * - Un brevet peut avoir plusieurs cabinets selon les spécialités
 * - Un cabinet peut gérer de nombreux brevets clients
 * - Évolution des mandats selon les besoins procéduraux
 * - Traçabilité des responsabilités juridiques
 * 
 * Relations:
 * - N:1 avec Brevet (dossier géré)
 * - N:1 avec Cabinet (mandataire spécialisé)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("BrevetCabinets")]
public class BrevetCabinet
{
    /// <summary>
    /// Identifiant unique de l'association brevet-cabinet
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
    /// Référence vers le cabinet mandataire
    /// Clé étrangère vers la table Cabinets
    /// </summary>
    [Column("id_cabinet")]
    public int IdCabinet { get; set; }

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
    /// Propriété calculée redirigeant vers IdCabinet
    /// </summary>
    [NotMapped]
    public int CabinetId
    {
        get => IdCabinet;
        set => IdCabinet = value;
    }

    /// <summary>
    /// Date d'établissement du mandat cabinet-brevet
    /// Traçabilité des responsabilités juridiques et changements de mandataires
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevet géré par le cabinet (navigation property)
    /// Accès aux informations complètes du dossier
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet Brevet { get; set; } = null!;

    /// <summary>
    /// Cabinet mandataire du brevet (navigation property)
    /// Accès aux informations complètes du conseil juridique
    /// </summary>
    [ForeignKey("IdCabinet")]
    public virtual Cabinet Cabinet { get; set; } = null!;
}
