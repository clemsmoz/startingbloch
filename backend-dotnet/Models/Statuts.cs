/*
 * ================================================================================================
 * MODÈLE STATUTS - ÉTATS DES PROCÉDURES DE PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * Description: Référentiel des statuts juridiques pour le suivi de l'avancement 
 *              des procédures de brevets par territoire
 * 
 * Statuts de procédure types:
 * - "Demande déposée": État initial après dépôt
 * - "En cours d'examen": Instruction par l'office
 * - "Publication effectuée": Publication à 18 mois
 * - "Observations reçues": Objections de tiers
 * - "Réponse requise": Action attendue du déposant
 * - "Brevet délivré": Droits accordés
 * - "Demande rejetée": Refus définitif
 * - "Demande abandonnée": Arrêt de la procédure
 * - "Brevet expiré": Fin de protection
 * - "Annuité impayée": Défaut de paiement
 * 
 * Utilisation:
 * - Workflow automatisé des procédures
 * - Calcul des échéances et délais
 * - Reporting de statut par portefeuille
 * - Alertes pro-actives
 * 
 * Relations:
 * - 1:N avec InformationDepot (statut par territoire)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Statuts")]
public class Statuts
{
    /// <summary>
    /// Identifiant unique du statut
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Description du statut juridique
    /// Libellé officiel de l'état de la procédure
    /// Ex: "Brevet délivré", "En cours d'examen", "Demande rejetée"
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Alias pour compatibilité avec l'ancienne API
    /// Propriété calculée pour maintenir la rétrocompatibilité
    /// Redirige vers Description pour cohérence
    /// </summary>
    [NotMapped]
    public string NomStatut
    {
        get => Description;
        set => Description = value;
    }

    /// <summary>
    /// Date de création du statut dans le référentiel
    /// Traçabilité d'ajout de nouveaux statuts métier
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification du statut
    /// Suivi des évolutions de libellés
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Informations de dépôt utilisant ce statut
    /// Permet de retrouver tous les brevets dans cet état
    /// Relation inverse pour navigation depuis le statut
    /// </summary>
    public virtual ICollection<InformationDepot> InformationsDepot { get; set; } = new List<InformationDepot>();
}
