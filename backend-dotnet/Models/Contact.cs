/*
 * ================================================================================================
 * MODÈLE CONTACT - RÉPERTOIRE DES INTERLOCUTEURS
 * ================================================================================================
 * 
 * Description: Représente les personnes de contact dans l'écosystème de la propriété intellectuelle
 * 
 * Types de contacts:
 * - Contacts clients (chefs de projet, juristes internes)
 * - Contacts cabinets (avocats, assistants, paralegals)
 * - Contacts officiels (examinateurs, greffiers)
 * - Contacts techniques (experts, traducteurs)
 * 
 * Données gérées:
 * - Informations personnelles et professionnelles
 * - Coordonnées multiples (emails, téléphones)
 * - Rôles et responsabilités spécifiques
 * - Historique des interactions
 * 
 * Architecture flexible:
 * - Emails multiples (pro/perso/backup)
 * - Téléphones multiples (fixe/mobile/fax)
 * - Rôles configurables par contexte
 * 
 * Relations:
 * - N:N avec Client (contacts multi-clients possibles)
 * - N:N avec Cabinet (équipes partagées)
 * - 1:N avec ContactEmail (gestion multi-emails)
 * - 1:N avec ContactPhone (gestion multi-téléphones)
 * - 1:N avec ContactRole (rôles contextuels)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace StartingBloch.Backend.Models;

[Table("Contacts")]
public class Contact
{
    /// <summary>
    /// Identifiant unique du contact dans le système
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Nom de famille du contact
    /// Champ essentiel pour l'identification et la recherche
    /// </summary>
    [MaxLength(100)]
    [Column("nom")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom du contact
    /// Permet l'identification complète et la personnalisation des interactions
    /// </summary>
    [MaxLength(100)]
    [Column("prenom")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Email principal du contact
    /// Email de référence pour les communications officielles
    /// Peut être complété par la collection Emails pour les emails multiples
    /// </summary>
    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    /// <summary>
    /// Numéro de téléphone principal
    /// Téléphone de référence pour les urgences et contacts directs
    /// Peut être complété par la collection Phones pour les numéros multiples
    /// </summary>
    [MaxLength(50)]
    [Column("telephone")]
    public string? Telephone { get; set; }

    /// <summary>
    /// Rôle principal du contact dans l'organisation
    /// Ex: "Directeur PI", "Assistant juridique", "Traducteur technique"
    /// Peut être complété par la collection Roles pour les rôles multiples
    /// </summary>
    [MaxLength(100)]
    [Column("role")]
    public string? Role { get; set; }

    /// <summary>
    /// Référence vers le cabinet d'avocats associé (optionnel)
    /// Permet de lier le contact à une organisation juridique externe
    /// </summary>
    [Column("id_cabinet")]
    public int? IdCabinet { get; set; }

    /// <summary>
    /// Référence vers le client associé (optionnel)
    /// Permet de lier le contact à une organisation cliente
    /// </summary>
    [Column("id_client")]
    public int? IdClient { get; set; }

    /// <summary>
    /// Date de création du contact dans le système
    /// Timestamp automatique pour traçabilité et audit
    /// </summary>
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date de dernière modification du contact
    /// Mise à jour automatique pour suivi des changements
    /// </summary>
    /// <summary>
    /// Date de dernière modification du contact
    /// Mise à jour automatique pour suivi des changements
    /// </summary>
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ========================================
    // STOCKAGE JSON POUR COLLECTIONS MULTIPLES
    // ========================================
    // Solution hybride permettant de stocker des collections complexes 
    // tout en maintenant la simplicité d'une base de données relationnelle

    /// <summary>
    /// Stockage JSON des emails multiples du contact
    /// Format: ["email1@domain.com", "email2@domain.com"]
    /// Permet de gérer email pro, perso, backup, etc.
    /// </summary>
    [Column("emails_json", TypeName = "TEXT")]
    public string EmailsJson { get; set; } = "[]";

    /// <summary>
    /// Stockage JSON des téléphones multiples du contact
    /// Format: ["+33123456789", "+33987654321"]
    /// Permet de gérer fixe, mobile, fax, etc.
    /// </summary>
    [Column("phones_json", TypeName = "TEXT")]
    public string PhonesJson { get; set; } = "[]";

    /// <summary>
    /// Stockage JSON des rôles multiples du contact
    /// Format: ["Directeur PI", "Expert technique", "Négociateur"]
    /// Permet de gérer les responsabilités multiples dans différents contextes
    /// </summary>
    [Column("roles_json", TypeName = "TEXT")]
    public string RolesJson { get; set; } = "[]";

    // ========================================
    // PROPRIÉTÉS CALCULÉES POUR MANIPULATION DES COLLECTIONS
    // ========================================
    // Ces propriétés permettent de manipuler les données JSON comme des collections .NET

    /// <summary>
    /// Collection typée des emails du contact
    /// Sérialisation/désérialisation automatique depuis EmailsJson
    /// Utilisation: contact.Emails.Add("nouveau@email.com")
    /// </summary>
    [NotMapped]
    public List<string> Emails
    {
        get => JsonSerializer.Deserialize<List<string>>(EmailsJson) ?? new List<string>();
        set => EmailsJson = JsonSerializer.Serialize(value ?? new List<string>());
    }

    /// <summary>
    /// Collection typée des téléphones du contact
    /// Sérialisation/désérialisation automatique depuis PhonesJson
    /// Utilisation: contact.Phones.Add("+33123456789")
    /// </summary>
    [NotMapped]
    public List<string> Phones
    {
        get => JsonSerializer.Deserialize<List<string>>(PhonesJson) ?? new List<string>();
        set => PhonesJson = JsonSerializer.Serialize(value ?? new List<string>());
    }

    /// <summary>
    /// Collection typée des rôles du contact
    /// Sérialisation/désérialisation automatique depuis RolesJson
    /// Utilisation: contact.Roles.Add("Expert technique")
    /// </summary>
    [NotMapped]
    public List<string> Roles
    {
        get => JsonSerializer.Deserialize<List<string>>(RolesJson) ?? new List<string>();
        set => RolesJson = JsonSerializer.Serialize(value ?? new List<string>());
    }

    // ========================================
    // RELATIONS ENTITY FRAMEWORK
    // ========================================

    /// <summary>
    /// Cabinet d'avocats associé au contact (navigation property)
    /// Permet d'accéder aux informations complètes du cabinet
    /// Relation optionnelle - un contact peut être indépendant
    /// </summary>
    [ForeignKey("IdCabinet")]
    public virtual Cabinet? Cabinet { get; set; }

    /// <summary>
    /// Client associé au contact (navigation property)
    /// Permet d'accéder aux informations complètes du client
    /// Relation optionnelle - un contact peut être générique
    /// </summary>
    [ForeignKey("IdClient")]
    public virtual Client? Client { get; set; }
}
