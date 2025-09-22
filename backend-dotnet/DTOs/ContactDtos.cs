/*
 * ================================================================================================
 * DTOs CONTACTS - PERSONNES RÉFÉRENTES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données contacts personnels dans écosystème brevets.
 * Facilite communication directe avec interlocuteurs spécialisés clients/cabinets.
 * 
 * MODÈLES COMMUNICATION :
 * ======================
 * 📋 CONTACT COMPLET → ContactDto avec multiples moyens communication
 * ➕ CRÉATION → CreateContactDto avec validations professionnelles
 * ✏️ MODIFICATION → UpdateContactDto flexible et optionnelle
 * 
 * FEATURES AVANCÉES :
 * ==================
 * ✅ Emails/téléphones multiples (collections JSON)
 * ✅ Rôles spécialisés (technique, juridique, commercial)
 * ✅ Association flexible client OU cabinet
 * ✅ Audit trail création/modification
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO contact professionnel avec moyens communication multiples.
/// Personne référente spécialisée dans écosystème propriété intellectuelle.
/// Support emails/téléphones multiples pour flexibilité organisationnelle.
/// </summary>
public class ContactDto
{
    /// <summary>Identifiant unique contact système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom famille contact pour identification officielle.</summary>
    public string? Nom { get; set; }
    
    /// <summary>Prénom contact pour personnalisation relation.</summary>
    public string? Prenom { get; set; }
    
    /// <summary>Email principal contact pour communication rapide.</summary>
    public string? Email { get; set; }
    
    /// <summary>Téléphone principal contact pour urgences.</summary>
    public string? Telephone { get; set; }
    
    /// <summary>Rôle spécialisé contact (technique, juridique, commercial).</summary>
    public string? Role { get; set; }
    
    /// <summary>Identifiant cabinet employeur si applicable.</summary>
    public int? IdCabinet { get; set; }
    
    /// <summary>Identifiant client employeur si applicable.</summary>
    public int? IdClient { get; set; }
    
    /// <summary>Date création UTC contact pour audit trail.</summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>Date modification UTC contact pour traçabilité.</summary>
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>Collection emails multiples stockage JSON flexible.</summary>
    public List<string> Emails { get; set; } = new();
    
    /// <summary>Collection téléphones multiples stockage JSON flexible.</summary>
    public List<string> Phones { get; set; } = new();
    
    /// <summary>Collection rôles multiples pour spécialisations diverses.</summary>
    public List<string> Roles { get; set; } = new();
    
    /// <summary>Nom cabinet employeur pour affichage interface (optionnel).</summary>
    public string? CabinetNom { get; set; }
    
    /// <summary>Nom client employeur pour affichage interface (optionnel).</summary>
    public string? ClientNom { get; set; }
}

/// <summary>
/// DTO création nouveau contact avec validations professionnelles strictes.
/// Assure qualité données contact et relations cohérentes client/cabinet.
/// Collections optionnelles pour moyens communication multiples dès création.
/// </summary>
public class CreateContactDto
{
    /// <summary>
    /// Nom contact OBLIGATOIRE pour identification professionnelle.
    /// Élément central référencement et communication formelle.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom contact optionnel pour personnalisation relation.
    /// Facilite communication directe et convivialité professionnelle.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Email principal contact avec validation format stricte.
    /// Canal privilégié communications électroniques sécurisées.
    /// </summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }

    /// <summary>
    /// Téléphone principal contact pour communications urgentes.
    /// Format international flexible selon standards géographiques.
    /// </summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? Telephone { get; set; }

    /// <summary>
    /// Rôle spécialisé contact dans organisation (technique, juridique, etc.).
    /// Définit expertise et domaine intervention principal.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le rôle ne peut pas dépasser 100 caractères")]
    public string? Role { get; set; }

    /// <summary>
    /// Identifiant cabinet employeur si contact externe mandataire.
    /// Association exclusive avec IdClient pour cohérence organisation.
    /// </summary>
    public int? IdCabinet { get; set; }

    /// <summary>
    /// Identifiant client employeur si contact interne organisation.
    /// Association exclusive avec IdCabinet pour cohérence organisation.
    /// </summary>
    public int? IdClient { get; set; }

    /// <summary>
    /// Collection emails multiples pour communication diversifiée.
    /// Stockage JSON flexible selon besoins organisationnels.
    /// </summary>
    public List<string>? Emails { get; set; }
    
    /// <summary>
    /// Collection téléphones multiples pour accessibilité optimale.
    /// Support numéros fixes, mobiles, internationaux selon contexte.
    /// </summary>
    public List<string>? Phones { get; set; }
    
    /// <summary>
    /// Collection rôles multiples pour expertise transversale.
    /// Permet spécialisations diverses dans même organisation.
    /// </summary>
    public List<string>? Roles { get; set; }
}

/// <summary>
/// DTO modification contact existant avec validations maintenues.
/// Préserve contraintes qualité données tout en permettant évolution.
/// Flexibilité mise à jour informations et moyens communication.
/// </summary>
public class UpdateContactDto
{
    /// <summary>
    /// Nom contact OBLIGATOIRE maintenu en modification.
    /// Identification professionnelle ne peut être supprimée.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string? Nom { get; set; }

    /// <summary>
    /// Prénom contact modifiable pour évolution personnalisation.
    /// Mise à jour flexible selon préférences relationnelles.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Email principal modifiable avec validation format maintenue.
    /// Actualisation canaux communication selon évolutions organisation.
    /// </summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }

    /// <summary>
    /// Téléphone principal modifiable pour accessibilité continue.
    /// Adaptation moyens communication directs selon mobilité.
    /// </summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? Telephone { get; set; }

    /// <summary>
    /// Rôle spécialisé modifiable selon évolution expertise.
    /// Adaptation responsabilités et domaines intervention.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le rôle ne peut pas dépasser 100 caractères")]
    public string? Role { get; set; }

    /// <summary>
    /// Affiliation cabinet modifiable pour mobilité professionnelle.
    /// Changement employeur ou évolution statut mandataire.
    /// </summary>
    public int? IdCabinet { get; set; }

    /// <summary>
    /// Affiliation client modifiable pour restructurations organisationnelles.
    /// Évolution rattachement interne selon réorganisations.
    /// </summary>
    public int? IdClient { get; set; }

    /// <summary>
    /// Collection emails modifiable pour communication optimisée.
    /// Mise à jour canaux multiples selon besoins évolutifs.
    /// </summary>
    public List<string>? Emails { get; set; }
    
    /// <summary>
    /// Collection téléphones modifiable pour accessibilité renforcée.
    /// Évolution moyens communication selon contexte professionnel.
    /// </summary>
    public List<string>? Phones { get; set; }
    
    /// <summary>
    /// Collection rôles modifiable pour expertise évolutive.
    /// Adaptation spécialisations selon développement compétences.
    /// </summary>
    public List<string>? Roles { get; set; }
}
