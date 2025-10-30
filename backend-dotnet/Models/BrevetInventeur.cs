/*
 * ================================================================================================
 * MODÈLE BREVET INVENTEUR - PATERNITÉ DES INVENTIONS
 * ================================================================================================
 * 
 * Description: Table de jonction gérant la relation many-to-many entre brevets et inventeurs
 * 
 * Importance juridique fondamentale:
 * - Reconnaissance des droits moraux d'auteur
 * - Obligation légale de citation dans les publications
 * - Base de calcul pour rémunérations d'invention salariée
 * - Respect du droit international de propriété intellectuelle
 * 
 * Contexte métier:
 * - Un brevet peut avoir plusieurs co-inventeurs
 * - Un inventeur peut créer de nombreuses innovations
 * - Co-inventions inter-entreprises fréquentes en R&D
 * - Traçabilité essentielle pour audits et litiges
 * 
 * Cas d'usage spéciaux:
 * - Inventions collaboratives université-industrie
 * - Projets de recherche européens multi-partenaires
 * - Innovations issues de consortiums technologiques
 * - Spin-offs et transferts de technologies
 * 
 * Relations:
 * - N:1 avec Brevet (association à l'invention)
 * - N:1 avec Inventeur (créateur de l'innovation)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("BrevetInventeurs")]
public class BrevetInventeur
{
    /// <summary>
    /// Identifiant unique de l'association brevet-inventeur
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
    /// Référence vers l'inventeur créateur
    /// Clé étrangère vers la table Inventeurs
    /// </summary>
    [Column("id_inventeur")]
    public int IdInventeur { get; set; }

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
    /// Propriété calculée redirigeant vers IdInventeur
    /// </summary>
    [NotMapped]
    public int InventeurId
    {
        get => IdInventeur;
        set => IdInventeur = value;
    }

    /// <summary>
    /// Date d'établissement de la paternité inventeur-brevet
    /// Traçabilité des reconnaissances de co-invention
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Brevet inventé par cette personne (navigation property)
    /// Accès aux informations complètes de l'invention
    /// </summary>
    [ForeignKey("IdBrevet")]
    public virtual Brevet Brevet { get; set; } = null!;

    /// <summary>
    /// Inventeur créateur de ce brevet (navigation property)
    /// Accès aux informations personnelles du créateur
    /// </summary>
    [ForeignKey("IdInventeur")]
    public virtual Inventeur Inventeur { get; set; } = null!;
}
