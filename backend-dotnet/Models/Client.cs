/*
 * ================================================================================================
 * MODÈLE CLIENT - ENTITÉ D'ORGANISATION ET D'ISOLATION
 * ================================================================================================
 * 
 * Description: Représente une organisation cliente utilisant le système StartingBloch
 * 
 * Rôle central:
 * - Isolation des données (chaque client ne voit que ses brevets)
 * - Organisation hiérarchique des utilisateurs et brevets
 * - Point de facturation et de contact commercial
 * - Gestion des relations avec les cabinets de conseil
 * 
 * Sécurité:
 * - Garantit la séparation stricte des données entre clients
 * - Base du système d'autorisation multi-tenant
 * - Audit trail par organisation
 * 
 * Relations:
 * - 1:N avec User (utilisateurs de l'organisation)
 * - 1:N avec Brevet (portefeuille de brevets)
 * - N:N avec Cabinet (partenariats conseil juridique)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

/// <summary>
/// Entité représentant une organisation cliente du système StartingBloch
/// Point central pour l'isolation des données et la gestion multi-tenant
/// </summary>
[Table("Clients")]
public class Client
{
    /// <summary>
    /// Identifiant unique du client (clé primaire)
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom officiel de l'organisation cliente
    /// Utilisé pour identification et facturation
    /// </summary>
    [Required]
    [MaxLength(255)]
    [Column("nom_client")]
    public string NomClient { get; set; } = string.Empty;

    /// <summary>
    /// Propriété de commodité pour accès uniforme au nom
    /// Facilite l'intégration avec interfaces génériques
    /// </summary>
    [NotMapped]
    public string Nom
    {
        get => NomClient;
        set => NomClient = value;
    }

    /// <summary>
    /// Référence interne du client dans le système
    /// Code métier pour identification rapide
    /// </summary>
    [MaxLength(255)]
    [Column("reference_client")]
    public string? ReferenceClient { get; set; }

    /// <summary>
    /// Adresse postale complète de l'organisation
    /// </summary>
    [MaxLength(500)]
    [Column("adresse_client")]
    public string? AdresseClient { get; set; }

    /// <summary>
    /// Code postal de l'adresse du client
    /// </summary>
    [MaxLength(20)]
    [Column("code_postal")]
    public string? CodePostal { get; set; }

    /// <summary>
    /// Pays de domiciliation du client
    /// Important pour juridiction et réglementation
    /// </summary>
    [MaxLength(100)]
    [Column("pays_client")]
    public string? PaysClient { get; set; }

    /// <summary>
    /// Adresse email principale du client
    /// Utilisée pour communications officielles
    /// </summary>
    /// <summary>
    /// Adresse email principale du client
    /// Canal de communication privilégié pour notifications
    /// </summary>
    [MaxLength(255)]
    [Column("email_client")]
    public string? EmailClient { get; set; }

    /// <summary>
    /// Numéro de téléphone principal du client
    /// Contact direct pour urgences et support
    /// </summary>
    [MaxLength(50)]
    [Column("telephone_client")]
    public string? TelephoneClient { get; set; }

    /// <summary>
    /// Permission d'écriture pour ce client
    /// Contrôle l'autorisation de création/modification des données
    /// False = client en lecture seule (consultation/audit)
    /// </summary>
    [Column("can_write")]
    public int CanWriteInt { get; set; } = 0;

    [NotMapped]
    public bool CanWrite
    {
        get => CanWriteInt == 1;
        set => CanWriteInt = value ? 1 : 0;
    }

    /// <summary>
    /// Permission de lecture pour ce client
    /// Contrôle l'accès en consultation aux données
    /// True par défaut pour accès minimal garanti
    /// </summary>
    [Column("can_read")]
    public int CanReadInt { get; set; } = 1;

    [NotMapped]
    public bool CanRead
    {
        get => CanReadInt == 1;
        set => CanReadInt = value ? 1 : 0;
    }

    /// <summary>
    /// Indicateur de blocage du client
    /// True = client suspendu (accès désactivé)
    /// Utilisé pour gestion des impayés ou violations
    /// </summary>
    [Column("is_blocked")]
    public int IsBlockedInt { get; set; } = 0;

    [NotMapped]
    public bool IsBlocked
    {
        get => IsBlockedInt == 1;
        set => IsBlockedInt = value ? 1 : 0;
    }

    /// <summary>
    /// Date de création de l'enregistrement client
    /// Traçabilité d'ouverture du compte
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification des informations client
    /// Suivi des mises à jour de profil et permissions
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevets associés à ce client
    /// Relation many-to-many pour gestion de portefeuilles
    /// </summary>
    public virtual ICollection<BrevetClient> BrevetClients { get; set; } = new List<BrevetClient>();

    /// <summary>
    /// Contacts rattachés à ce client
    /// Équipe et interlocuteurs de l'organisation
    /// </summary>
    public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();

    /// <summary>
    /// Relations avec les cabinets conseils
    /// Mandats juridiques par type de mission
    /// </summary>
    public virtual ICollection<ClientCabinet> ClientCabinets { get; set; } = new List<ClientCabinet>();

    /// <summary>
    /// Utilisateurs ayant accès aux données de ce client
    /// Contrôle d'accès multi-tenant et isolation des données
    /// </summary>
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
