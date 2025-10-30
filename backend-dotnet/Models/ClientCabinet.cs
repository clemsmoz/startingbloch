/*
 * ================================================================================================
 * MODÈLE CLIENT CABINET - RELATIONS CONTRACTUELLES JURIDIQUES
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre clients et cabinets
 *              avec spécialisation par type de mandat juridique
 * 
 * Types de relations contractuelles:
 * - "principal": Cabinet conseil principal du client
 * - "secondaire": Cabinet spécialisé pour domaines spécifiques
 * - "correspondant": Cabinet local pour procédures territoriales
 * - "contentieux": Cabinet spécialisé en litiges et défense
 * - "fiscal": Cabinet pour optimisation fiscale PI
 * 
 * Enjeux de gestion:
 * - Centralisation des relations conseil-client
 * - Suivi des mandats et responsabilités
 * - Facturation et répartition des honoraires
 * - Gestion des conflits d'intérêts potentiels
 * 
 * Architecture évolutive:
 * - Relations activables/désactivables selon besoins
 * - Historisation des changements de conseil
 * - Gestion des périodes de mandat temporaires
 * - Traçabilité des modifications contractuelles
 * 
 * Relations:
 * - N:1 avec Client (organisation cliente)
 * - N:1 avec Cabinet (conseil juridique)
 * 
 * ================================================================================================
 */

/*
 * ================================================================================================
 * MODÈLE CLIENT CABINET - RELATIONS CONTRACTUELLES JURIDIQUES
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre clients et cabinets
 *              pour la gestion des mandats juridiques spécialisés
 * 
 * Types de mandats juridiques:
 * - "principal": Cabinet conseil principal du client
 * - "secondaire": Cabinet de support ou spécialisé
 * - "correspondant": Cabinet local dans un territoire spécifique
 * - "contentieux": Cabinet spécialisé en litiges et défense
 * - "fiscal": Cabinet pour optimisation fiscale des PI
 * 
 * Contexte métier:
 * - Externalisation sélective de l'expertise juridique
 * - Couverture géographique internationale
 * - Spécialisation par domaine technique ou juridique
 * - Gestion des conflits d'intérêts
 * 
 * Architecture flexible:
 * - Un client peut avoir plusieurs cabinets selon les spécialités
 * - Un cabinet peut servir de nombreux clients
 * - Relations activables/désactivables sans perte d'historique
 * - Évolution des mandats selon les besoins
 * 
 * Relations:
 * - N:1 avec Client (organisation cliente)
 * - N:1 avec Cabinet (conseil juridique)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("ClientCabinets")]
public class ClientCabinet
{
    /// <summary>
    /// Identifiant unique de la relation client-cabinet
    /// </summary>
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Référence vers le client concerné
    /// Clé étrangère obligatoire vers la table Clients
    /// </summary>
    [Required]
    public int ClientId { get; set; }

    /// <summary>
    /// Référence vers le cabinet conseil
    /// Clé étrangère obligatoire vers la table Cabinets
    /// </summary>
    [Required]
    public int CabinetId { get; set; }

    /// <summary>
    /// Type de relation contractuelle
    /// Valeurs: "principal", "secondaire", "correspondant", "contentieux", "fiscal"
    /// Permet la spécialisation des mandats juridiques
    /// </summary>
    [StringLength(100)]
    public string? Type { get; set; }

    /// <summary>
    /// Indicateur d'activation de la relation
    /// Permet de suspendre temporairement sans supprimer l'historique
    /// Utile pour gestion des conflits d'intérêts
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Date d'établissement de la relation contractuelle
    /// Traçabilité des mandats et historique juridique
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification de la relation
    /// Suivi des évolutions contractuelles et mandats
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Client concerné par cette relation (navigation property)
    /// Accès aux informations complètes de l'organisation
    /// </summary>
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; } = null!;

    /// <summary>
    /// Cabinet conseil dans cette relation (navigation property)
    /// Accès aux informations complètes du conseil juridique
    /// </summary>
    [ForeignKey("CabinetId")]
    public virtual Cabinet Cabinet { get; set; } = null!;
}
