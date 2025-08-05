/*
 * ================================================================================================
 * MODÈLE CABINET - PARTENAIRES JURIDIQUES ET CONSEILS
 * ================================================================================================
 * 
 * Description: Représente un cabinet d'avocats ou de conseil en propriété intellectuelle
 * 
 * Rôle métier:
 * - Gestion des brevets pour le compte des clients
 * - Expertise juridique et procédurale en PI
 * - Interface avec les offices de brevets nationaux/internationaux
 * - Conseil stratégique en propriété intellectuelle
 * 
 * Relations:
 * - N:N avec Client (un cabinet peut servir plusieurs clients)
 * - N:N avec Brevet (gestion partagée possible)
 * - 1:N avec Contact (équipe du cabinet)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

/// <summary>
/// Types de spécialisation pour les cabinets de conseil en propriété intellectuelle
/// </summary>
public enum CabinetType
{
    /// <summary>
    /// Cabinet spécialisé dans la gestion des annuités et maintien en vigueur des brevets
    /// </summary>
    Annuite = 1,

    /// <summary>
    /// Cabinet spécialisé dans les procédures de dépôt et contentieux
    /// </summary>
    Procedure = 2
}

[Table("Cabinets")]
public class Cabinet
{
    /// <summary>
    /// Identifiant unique du cabinet dans le système
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom officiel du cabinet d'avocats ou de conseil en PI
    /// Dénomination sociale complète utilisée dans les actes juridiques
    /// Champ obligatoire pour identification légale
    /// </summary>
    [Required]
    [MaxLength(255)]
    [Column("nom_cabinet")]
    public string NomCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Alias pour compatibilité avec l'ancienne API
    /// Propriété calculée redirigeant vers NomCabinet
    /// Maintient la rétrocompatibilité des intégrations
    /// </summary>
    [NotMapped]
    public string Nom
    {
        get => NomCabinet;
        set => NomCabinet = value;
    }

    /// <summary>
    /// Adresse postale complète du cabinet
    /// Siège social ou adresse de correspondance officielle
    /// Utilisée pour envois officiels et notifications légales
    /// </summary>
    [MaxLength(255)]
    [Column("adresse_cabinet")]
    public string? AdresseCabinet { get; set; }

    /// <summary>
    /// Code postal du cabinet
    /// Complément d'adresse pour localisation précise
    /// </summary>
    [MaxLength(50)]
    [Column("code_postal")]
    public string? CodePostal { get; set; }

    /// <summary>
    /// Pays de domiciliation du cabinet
    /// Détermine la juridiction applicable et les règles professionnelles
    /// Important pour habilitação internationale
    /// </summary>
    [MaxLength(100)]
    [Column("pays_cabinet")]
    public string? PaysCabinet { get; set; }

    /// <summary>
    /// Email principal du cabinet
    /// Adresse de contact officielle pour correspondances
    /// Canal privilégié pour communications urgentes
    /// </summary>
    [MaxLength(100)]
    [Column("email_cabinet")]
    public string? EmailCabinet { get; set; }

    /// <summary>
    /// Numéro de téléphone principal du cabinet
    /// Contact direct pour urgences et coordination
    /// </summary>
    [MaxLength(50)]
    [Column("telephone_cabinet")]
    public string? TelephoneCabinet { get; set; }

    /// <summary>
    /// Type du cabinet : Annuité ou Procédure
    /// Détermine le type de spécialisation du cabinet
    /// </summary>
    [Required]
    [Column("type")]
    public CabinetType Type { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement cabinet
    /// Traçabilité d'ajout au réseau de partenaires
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
    /// Brevets gérés par ce cabinet
    /// Relation many-to-many via BrevetCabinet avec spécialisation par type de mandat
    /// </summary>
    public virtual ICollection<BrevetCabinet> BrevetCabinets { get; set; } = new List<BrevetCabinet>();

    /// <summary>
    /// Contacts et équipe du cabinet
    /// Avocats, assistants, paralegals travaillant dans ce cabinet
    /// </summary>
    public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();

    /// <summary>
    /// Relations contractuelles avec les clients
    /// Mandats et accords de conseil par type de mission
    /// </summary>
    public virtual ICollection<ClientCabinet> ClientCabinets { get; set; } = new List<ClientCabinet>();
}
