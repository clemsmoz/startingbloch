/*
 * ================================================================================================
 * MODÈLE PAYS - RÉFÉRENTIEL GÉOGRAPHIQUE INTERNATIONAL
 * ================================================================================================
 * 
 * Description: Référentiel central des pays et territoires pour la gestion 
 *              de la propriété intellectuelle internationale
 * 
 * Contexte métier:
 * - Chaque brevet peut être déposé dans multiple territoires
 * - Règles juridiques spécifiques par pays/région
 * - Gestion des unions internationales (UE, PCT, Madrid, La Haye)
 * - Correspondances avec les codes officiels internationaux
 * 
 * Standards supportés:
 * - ISO 3166-1 alpha-2 (codes 2 lettres: FR, US, JP)
 * - ISO 3166-1 alpha-3 (codes 3 lettres: FRA, USA, JPN)
 * - Noms français normalisés pour interface utilisateur
 * 
 * Cas d'usage spéciaux:
 * - EP: Office Européen des Brevets (territoire spécial)
 * - WO: WIPO/PCT (dépôt international)
 * - Regional offices: ARIPO, OAPI, etc.
 * 
 * Relations:
 * - 1:N avec InformationDepot (dépôts par territoire)
 * - 1:N avec InventeurPays (nationalités des inventeurs)
 * - 1:N avec DeposantPays (nationalités des déposants)
 * - 1:N avec TitulairePays (nationalités des titulaires)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Pays")]
public class Pays
{
    /// <summary>
    /// Identifiant unique du pays dans le système
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom du pays en français
    /// Nom officiel utilisé dans l'interface utilisateur française
    /// Ex: "France", "États-Unis", "Office Européen des Brevets"
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("nom_fr_fr")]
    public string NomFrFr { get; set; } = string.Empty;

    /// <summary>
    /// Code ISO 3166-1 alpha-2 du pays
    /// Standard international à 2 lettres
    /// Ex: "FR", "US", "JP", "EP" (Office Européen)
    /// </summary>
    [MaxLength(10)]
    [Column("code_iso")]
    public string? CodeIso { get; set; }

    /// <summary>
    /// Code ISO 3166-1 alpha-3 du pays
    /// Standard international à 3 lettres pour compatibilité étendue
    /// Ex: "FRA", "USA", "JPN", "EPO"
    /// </summary>
    [MaxLength(10)]
    [Column("code_iso3")]
    public string? CodeIso3 { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement pays
    /// Traçabilité d'ajout au référentiel
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification
    /// Suivi des mises à jour de nomenclature
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Informations de dépôt associées à ce pays
    /// Permet de retrouver tous les brevets déposés dans ce territoire
    /// </summary>
    public virtual ICollection<InformationDepot> InformationsDepot { get; set; } = new List<InformationDepot>();

    /// <summary>
    /// Relations inventeurs-pays 
    /// Suivi des pays  inventeurs
    /// </summary>
    public virtual ICollection<InventeurPays> InventeurPays { get; set; } = new List<InventeurPays>();

    /// <summary>
    /// Relations déposants-pays 
    /// Suivi des pays  des déposants
    /// </summary>
    public virtual ICollection<DeposantPays> DeposantPays { get; set; } = new List<DeposantPays>();

    /// <summary>
    /// Relations titulaires-pays 
    /// Suivi des pays des titulaires
    /// </summary>
    public virtual ICollection<TitulairePays> TitulairePays { get; set; } = new List<TitulairePays>();
}
