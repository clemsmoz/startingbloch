/*
 * ================================================================================================
 * MODÈLE BREVET - ENTITÉ MÉTIER CENTRALE
 * ================================================================================================
 * 
 * Description: Représente un brevet dans le système de gestion de propriété intellectuelle
 * 
 * Fonctionnalités:
 * - Gestion complète du cycle de vie d'un brevet
 * - Référencement par famille et numéros internationaux
 * - Association avec clients, cabinets, inventeurs, titulaires
 * - Suivi des statuts et échéances importantes
 * - Traçabilité complète des modifications
 * 
 * Relations métier:
 * - N:N avec Inventeur (un brevet peut avoir plusieurs inventeurs)
 * - N:N avec Titulaire (propriétaires du brevet)
 * - N:1 avec Client (appartenance)
 * - N:N avec Cabinet (gestion par plusieurs cabinets possibles)
 * - 1:N avec InformationDepot (dépôts dans différents pays)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

/// <summary>
/// Entité représentant un brevet dans le système de gestion de propriété intellectuelle
/// Table centrale contenant toutes les informations essentielles d'un brevet
/// </summary>
[Table("Brevets")]
public class Brevet
{
    /// <summary>
    /// Identifiant unique du brevet (clé primaire)
    /// </summary>
    [Key]
    [Column("id_brevet")]
    public int IdBrevet { get; set; }

    /// <summary>
    /// Propriété de commodité pour accéder à l'ID via une interface standardisée
    /// Facilite l'intégration avec des composants génériques
    /// </summary>
    [NotMapped]
    public int Id
    {
        get => IdBrevet;
        set => IdBrevet = value;
    }

    /// <summary>
    /// Référence de la famille de brevets
    /// Permet de regrouper les brevets liés (continuation, division, etc.)
    /// </summary>
    [MaxLength(255)]
    [Column("reference_famille")]
    public string? ReferenceFamille { get; set; }

    /// <summary>
    /// Titre officiel du brevet
    /// Description courte de l'invention protégée
    /// </summary>
    [MaxLength(500)]
    [Column("titre")]
    public string? Titre { get; set; }

    /// <summary>
    /// Commentaires internes sur le brevet
    /// Notes de gestion, observations, instructions spéciales
    /// </summary>
    [Column("commentaire")]
    public string? Commentaire { get; set; }

    /// <summary>
    /// Date de création du brevet dans le système
    /// Horodatage automatique pour traçabilité
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification du brevet
    /// Mise à jour automatique pour audit des changements
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ============================================================================================
    // RELATIONS NAVIGATIONELLES - ARCHITECTURE MANY-TO-MANY
    // ============================================================================================

    /// <summary>
    /// Collection des associations Brevet-Client
    /// Relation Many-to-Many via table de liaison BrevetClient
    /// Permet à un brevet d'appartenir à plusieurs clients (co-propriété)
    /// </summary>
    public virtual ICollection<BrevetClient> BrevetClients { get; set; } = new List<BrevetClient>();
    
    /// <summary>
    /// Collection des informations de dépôt dans différents pays
    /// Relation One-to-Many (un brevet peut être déposé dans plusieurs pays)
    /// Contient les numéros officiels, dates de dépôt, statuts par juridiction
    /// </summary>
    public virtual ICollection<InformationDepot> InformationsDepot { get; set; } = new List<InformationDepot>();
    
    /// <summary>
    /// Collection des associations Brevet-Inventeur
    /// Relation Many-to-Many pour gérer les co-inventions
    /// Un brevet peut avoir plusieurs inventeurs, un inventeur plusieurs brevets
    /// </summary>
    public virtual ICollection<BrevetInventeur> BrevetInventeurs { get; set; } = new List<BrevetInventeur>();
    
    /// <summary>
    /// Collection des associations Brevet-Déposant
    /// Relation Many-to-Many pour les entités qui effectuent le dépôt
    /// Peut différer du titulaire (déposant mandataire vs propriétaire)
    /// </summary>
    public virtual ICollection<BrevetDeposant> BrevetDeposants { get; set; } = new List<BrevetDeposant>();
    
    /// <summary>
    /// Collection des associations Brevet-Titulaire
    /// Relation Many-to-Many pour la propriété légale du brevet
    /// Titulaires = propriétaires légaux ayant droits patrimoniaux
    /// </summary>
    public virtual ICollection<BrevetTitulaire> BrevetTitulaires { get; set; } = new List<BrevetTitulaire>();
    
    /// <summary>
    /// Collection des associations Brevet-Cabinet
    /// Relation Many-to-Many pour gestion par cabinets d'avocats/conseils
    /// Un brevet peut être géré par plusieurs cabinets selon les juridictions
    /// </summary>
    public virtual ICollection<BrevetCabinet> BrevetCabinets { get; set; } = new List<BrevetCabinet>();
}
