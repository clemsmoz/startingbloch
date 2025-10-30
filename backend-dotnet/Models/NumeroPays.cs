/*
 * ================================================================================================
 * MODÈLE NUMÉRO PAYS - GESTION DES NUMÉROTATIONS OFFICIELLES PAR TERRITOIRE
 * ================================================================================================
 * 
 * Description: Référentiel des systèmes de numérotation utilisés par chaque office
 *              national de propriété intellectuelle
 * 
 * Contexte métier:
 * - Chaque pays a ses propres formats de numérotation
 * - Les numéros évoluent selon les réformes administratives
 * - Nécessité de validation automatique des formats
 * - Historisation des changements de numérotation
 * 
 * Exemples concrets:
 * - France: FR + année + numéro séquentiel (ex: FR2313456)
 * - États-Unis: US + série/numéro (ex: US17/123,456)
 * - Europe: EP + année + numéro (ex: EP23456789)
 * - PCT: PCT/pays/année/numéro (ex: PCT/FR2023/000123)
 * 
 * Utilisation:
 * - Validation automatique des saisies
 * - Génération de numéros provisoires
 * - Contrôle de cohérence territoriale
 * - Support multi-format pour migration
 * 
 * Relations:
 * - N:1 avec Pays (formats spécifiques par territoire)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("NumeroPays")]
public class NumeroPays
{
    /// <summary>
    /// Identifiant unique du format de numérotation
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Code ISO du pays concerné
    /// Format ISO 3166-1 alpha-2 (ex: FR, US, EP, WO)
    /// Lien avec le référentiel des pays
    /// </summary>
    [Required]
    [MaxLength(10)]
    [Column("pays_code")]
    public string PaysCode { get; set; } = string.Empty;

    /// <summary>
    /// Pattern ou exemple du format de numérotation
    /// Ex: "FR{YYYY}{NNNNN}", "US{SS}/{NNNNNN}", "EP{NNNNNNN}"
    /// Utilisé pour validation et génération automatique
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("numero")]
    public string Numero { get; set; } = string.Empty;

    /// <summary>
    /// Description du format de numérotation
    /// Explications sur la structure et les règles
    /// Ex: "Format français: FR + année + numéro séquentiel 5 chiffres"
    /// </summary>
    [MaxLength(100)]
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Indicateur si ce format est encore utilisé
    /// Permet de conserver l'historique tout en désactivant les anciens formats
    /// </summary>
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Date de création du format
    /// Traçabilité des évolutions de numérotation
    /// </summary>
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification
    /// Suivi des ajustements de format
    /// </summary>
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Référence vers le pays associé
    /// Clé étrangère pour lier au référentiel géographique
    /// </summary>
    [ForeignKey("PaysId")]
    public int? PaysId { get; set; }

    /// <summary>
    /// Pays associé au format de numérotation (navigation property)
    /// Accès aux informations complètes du territoire
    /// </summary>
    public virtual Pays? Pays { get; set; }
}
