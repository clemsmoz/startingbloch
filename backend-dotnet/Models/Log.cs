/*
 * ================================================================================================
 * MODÈLE LOG - SYSTÈME D'AUDIT ET DE JOURNALISATION SÉCURISÉ
 * ================================================================================================
 * 
 * Description: Enregistrement centralisé de toutes les activités système pour audit,
 *              sécurité, débogage et conformité réglementaire
 * 
 * Types de logs capturés:
 * - Actions utilisateurs (CRUD, authentification, navigation)
 * - Événements système (erreurs, performances, sécurité)
 * - Modifications de données (avant/après pour traçabilité)
 * - Tentatives d'intrusion et violations de sécurité
 * 
 * Niveaux de log supportés:
 * - DEBUG: Informations détaillées pour le développement
 * - INFO: Événements normaux d'information
 * - WARN: Situations anormales non critiques
 * - ERROR: Erreurs d'application nécessitant attention
 * - FATAL: Erreurs critiques compromettant le système
 * 
 * Conformité RGPD:
 * - Conservation limitée dans le temps
 * - Pseudonymisation des données personnelles
 * - Traçabilité des accès aux données sensibles
 * 
 * Sécurité:
 * - Logs inaltérables une fois créés
 * - Capture des tentatives d'intrusion
 * - Monitoring des accès privilégiés
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StartingBloch.Backend.Models;

[Table("Logs")]
public class Log
{
    /// <summary>
    /// Identifiant unique du log
    /// Clé primaire auto-incrémentée pour ordre chronologique
    /// </summary>
    [Key]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Niveau de gravité du log
    /// Valeurs: DEBUG, INFO, WARN, ERROR, FATAL
    /// Permet le filtrage et l'alerting automatique
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("level")]
    public string Level { get; set; } = string.Empty;

    /// <summary>
    /// Message principal du log
    /// Description claire et structurée de l'événement
    /// Champ obligatoire pour tous les logs
    /// </summary>
    [Required]
    [Column("message")]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Horodatage précis de l'événement
    /// UTC pour cohérence internationale
    /// Index automatique pour performance des requêtes temporelles
    /// </summary>
    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Identifiant de l'utilisateur à l'origine de l'action
    /// Null pour les actions système automatiques
    /// Permet la traçabilité des actions utilisateur
    /// </summary>
    [MaxLength(100)]
    [Column("userId")]
    public string? UserId { get; set; }

    /// <summary>
    /// Type d'action effectuée
    /// Ex: "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "EXPORT"
    /// Standardisation pour faciliter l'analyse et le reporting
    /// </summary>
    [MaxLength(100)]
    [Column("action")]
    public string? Action { get; set; }

    /// <summary>
    /// Nom de la table/entité concernée par l'action
    /// Permet de filtrer les logs par type d'objet métier
    /// Ex: "Brevets", "Clients", "Users"
    /// </summary>
    [MaxLength(100)]
    [Column("table_name")]
    public string? TableName { get; set; }

    /// <summary>
    /// Identifiant de l'enregistrement concerné
    /// Permet de tracer l'historique d'un objet spécifique
    /// Null pour les actions globales
    /// </summary>
    [Column("record_id")]
    public int? RecordId { get; set; }

    /// <summary>
    /// Valeurs avant modification (format JSON)
    /// Capture l'état précédent pour audit complet
    /// Essentiel pour retracer les changements et rollback
    /// </summary>
    [Column("old_values")]
    public string? OldValues { get; set; }

    /// <summary>
    /// Valeurs après modification (format JSON)
    /// Capture le nouvel état après l'action
    /// Permet de reconstituer l'historique complet
    /// </summary>
    [Column("new_values")]
    public string? NewValues { get; set; }

    /// <summary>
    /// Adresse IP de l'utilisateur
    /// Traçabilité géographique et détection d'intrusions
    /// Supporte IPv4 et IPv6
    /// </summary>
    [MaxLength(45)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Agent utilisateur (navigateur/client)
    /// Informations sur l'environnement client
    /// Utile pour le débogage et l'analyse d'usage
    /// </summary>
    [MaxLength(500)]
    [Column("user_agent")]
    public string? UserAgent { get; set; }

    /// <summary>
    /// Date de création de l'enregistrement de log
    /// Généralement identique à Timestamp, mais peut différer en cas de traitement différé
    /// </summary>
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Détails supplémentaires en format libre
    /// Informations contextuelles spécifiques à l'événement
    /// Stack traces, paramètres de requête, données métier
    /// </summary>
    [Column("details")]
    public string? Details { get; set; }
}
