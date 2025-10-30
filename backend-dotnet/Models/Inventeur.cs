/*
 * ================================================================================================
 * MODÈLE INVENTEUR - CRÉATEURS DES INNOVATIONS
 * ================================================================================================
 * 
 * Description: Représente les personnes physiques créatrices des inventions brevetées
 * 
 * Importance juridique:
 * - Reconnaissance légale des droits moraux d'auteur
 * - Obligation légale de mention dans les brevets
 * - Base pour calcul des rémunérations d'invention
 * - Traçabilité de l'innovation en entreprise
 * 
 * Particularités:
 * - Toujours des personnes physiques (jamais morales)
 * - Droits inaliénables même si brevets cédés
 * - Multi-nationalité possible pour inventions collaboratives
 * 
 * Relations:
 * - N:N avec Brevet (co-inventions fréquentes)
 * - N:N avec Pays (pour gestion internationale)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Inventeurs")]
public class Inventeur
{
    /// <summary>
    /// Identifiant unique de l'inventeur dans le système
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom de famille de l'inventeur
    /// Champ essentiel pour identification légale et mentions obligatoires
    /// Utilisé dans les publications officielles des brevets
    /// </summary>
    [MaxLength(100)]
    [Column("nom")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom de l'inventeur
    /// Complète l'identification pour éviter les ambiguïtés
    /// Requis pour conformité avec standards internationaux
    /// </summary>
    [MaxLength(100)]
    [Column("prenom")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Adresse complète de l'inventeur
    /// Lieu de résidence au moment de l'invention
    /// Important pour détermination de la juridiction applicable
    /// Peut influencer les droits et obligations légales
    /// </summary>
    [MaxLength(255)]
    [Column("adresse")]
    public string? Adresse { get; set; }

    /// <summary>
    /// Numéro de téléphone de contact
    /// Communication directe pour procédures urgentes
    /// Utile pour rémunérations d'invention salariée
    /// </summary>
    [MaxLength(50)]
    [Column("telephone")]
    public string? Telephone { get; set; }

    /// <summary>
    /// Adresse email de l'inventeur
    /// Canal privilégié pour notifications et correspondances
    /// Essentiel pour gestion des droits et rémunérations
    /// </summary>
    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement inventeur
    /// Traçabilité d'ajout au système
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
    /// Brevets co-inventés par cette personne
    /// Relation many-to-many via table BrevetInventeur
    /// Permet de retrouver tout le portefeuille d'inventions
    /// </summary>
    public virtual ICollection<BrevetInventeur> BrevetInventeurs { get; set; } = new List<BrevetInventeur>();

    /// <summary>
    /// Pays de nationalité/résidence de l'inventeur
    /// Relation many-to-many pour gestion des bi-nationalités
    /// Impact sur droits territoriaux et fiscalité des brevets
    /// </summary>
    public virtual ICollection<InventeurPays> InventeurPays { get; set; } = new List<InventeurPays>();
}
