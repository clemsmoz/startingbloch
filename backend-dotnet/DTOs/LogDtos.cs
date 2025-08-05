/*
 * ================================================================================================
 * DTOs LOGS - AUDIT TRAIL ET TRAÇABILITÉ SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données logs système pour audit trail RGPD et sécurité.
 * Traçabilité complète actions utilisateurs et opérations critiques brevets.
 * 
 * NIVEAUX AUDIT :
 * ==============
 * 📋 SYSTEM LOGS → Messages système, erreurs, warnings
 * 👤 USER ACTIONS → Traçabilité actions utilisateurs RGPD
 * 🔒 SECURITY → Tentatives accès, authentifications
 * 📊 DATA CHANGES → Modifications entités avec before/after
 * 🌐 REQUEST LOGS → IP, UserAgent, géolocalisation
 * 
 * COMPLIANCE LÉGALE :
 * ==================
 * ✅ RGPD - Traçabilité accès données personnelles
 * ✅ Audit trail modifications brevets
 * ✅ Sécurité - Détection intrusions
 * ✅ Debugging - Support technique avancé
 * 
 * ================================================================================================
 */

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO log complet avec toutes métadonnées audit trail et sécurité.
/// Enregistrement exhaustif pour compliance RGPD et traçabilité système.
/// Support debugging, sécurité et audit métier propriété intellectuelle.
/// </summary>
public class LogDto
{
    /// <summary>Identifiant unique log dans système audit trail.</summary>
    public int Id { get; set; }
    
    /// <summary>Message principal log pour compréhension contexte.</summary>
    public string? Message { get; set; }
    
    /// <summary>Niveau log (INFO, WARN, ERROR, DEBUG) pour filtrage.</summary>
    public string? Level { get; set; }
    
    /// <summary>Détails exception complète si erreur système.</summary>
    public string? Exception { get; set; }
    
    /// <summary>Propriétés structurées JSON pour contexte métier.</summary>
    public string? Properties { get; set; }
    
    /// <summary>Timestamp UTC précis événement pour chronologie.</summary>
    public DateTime TimeStamp { get; set; }
    
    /// <summary>Logger source émetteur pour traçage composant.</summary>
    public string? Logger { get; set; }
    
    /// <summary>Callsite code source pour debugging précis.</summary>
    public string? Callsite { get; set; }
    
    /// <summary>Identifiant utilisateur responsable action si applicable.</summary>
    public int? UserId { get; set; }
    
    /// <summary>Nom table affectée pour audit données spécifique.</summary>
    public string? TableName { get; set; }
    
    /// <summary>Identifiant enregistrement modifié pour traçage précis.</summary>
    public int? RecordId { get; set; }
    
    /// <summary>Adresse IP origine pour géolocalisation et sécurité.</summary>
    public string? IpAddress { get; set; }
    
    /// <summary>User Agent navigateur pour identification client.</summary>
    public string? UserAgent { get; set; }
    
    /// <summary>Action métier effectuée (CREATE, UPDATE, DELETE, READ).</summary>
    public string? Action { get; set; }
    
    /// <summary>Valeurs avant modification JSON pour audit trail.</summary>
    public string? OldValues { get; set; }
    
    /// <summary>Valeurs après modification JSON pour audit trail.</summary>
    public string? NewValues { get; set; }
    
    /// <summary>Date création UTC log pour audit chronologique.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO création log simple pour enregistrement événements système.
/// Version allégée focus message principal et contexte minimal.
/// </summary>
public class CreateLogDto
{
    /// <summary>Message log principal obligatoire pour compréhension.</summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>Niveau log optionnel pour classification automatique.</summary>
    public string? Level { get; set; }
    
    /// <summary>Exception optionnelle si contexte erreur à tracer.</summary>
    public string? Exception { get; set; }
    
    /// <summary>Logger source optionnel pour identification composant.</summary>
    public string? Logger { get; set; }
    
    /// <summary>Utilisateur responsable optionnel pour audit trail.</summary>
    public int? UserId { get; set; }
}
