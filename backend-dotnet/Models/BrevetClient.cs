/*
 * ================================================================================================
 * MODÈLE BREVET CLIENT - ASSOCIATION BREVETS-CLIENTS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre brevets et clients
 * 
 * Contexte métier:
 * - Un brevet peut appartenir à plusieurs clients (co-propriété)
 * - Un client peut posséder de nombreux brevets (portefeuille)
 * - Gestion des transferts de propriété et licences
 * - Suivi des droits économiques par titulaire
 * 
 * Cas d'usage:
 * - Brevets en copropriété entre plusieurs entreprises
 * - Acquisitions et fusions d'entreprises
 * - Licences exclusives équivalant à quasi-propriété
 * - Portefeuilles clients pour facturation et reporting
 * 
 * Relations:
 * - N:1 avec Brevet (un brevet, plusieurs propriétaires possibles)
 * - N:1 avec Client (un client, plusieurs brevets)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("BrevetClients")]
public class BrevetClient
{
    /// <summary>
    /// Identifiant unique de l'association brevet-client
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
    /// Référence vers le client propriétaire
    /// Clé étrangère vers la table Clients
    /// </summary>
    [Column("id_client")]
    public int IdClient { get; set; }

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
    /// Propriété calculée redirigeant vers IdClient
    /// </summary>
    [NotMapped]
    public int ClientId
    {
        get => IdClient;
        set => IdClient = value;
    }

    /// <summary>
    /// Date d'établissement de la relation brevet-client
    /// Traçabilité des changements de propriété
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevet associé dans cette relation (navigation property)
    /// Accès aux informations complètes du brevet
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet Brevet { get; set; } = null!;

    /// <summary>
    /// Client propriétaire dans cette relation (navigation property)
    /// Accès aux informations complètes du client
    /// </summary>
    [ForeignKey("IdClient")]
    public virtual Client Client { get; set; } = null!;
}
