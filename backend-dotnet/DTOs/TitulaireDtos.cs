/*
 * ================================================================================================
 * DTOs TITULAIRES - PROPRIÉTAIRES DROITS PATRIMONIAUX BREVETS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données titulaires droits patrimoniaux exploitation brevets.
 * Propriétaires légaux autorisés commercialisation et licensing innovations.
 * 
 * DROITS PATRIMONIAUX :
 * ====================
 * 👑 TITULAIRE → Propriétaire droits exploitation commerciale
 * 🌍 MULTI-PAYS → Droits territoriaux selon juridictions
 * 💼 COMMERCIAL → Autorisation licensing et transferts
 * ⚖️ JURIDIQUE → Responsabilité protection et défense droits
 * 
 * VALIDATIONS PROPRIÉTÉ :
 * ======================
 * ✅ Nom obligatoire (identification propriétaire)
 * ✅ Email validé (communications juridiques)
 * ✅ Relations pays territoires
 * ✅ Cohérence données propriété
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO titulaire complet avec pays territoires pour gestion droits.
/// Propriétaire légal droits patrimoniaux avec compétences géographiques.
/// Inclut relations territoriales pour exploitation commerciale.
/// </summary>
public class TitulaireDto
{
    /// <summary>Identifiant unique titulaire système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom titulaire OBLIGATOIRE - propriétaire droits patrimoniaux.</summary>
    public string Nom { get; set; } = string.Empty;
    
    /// <summary>Prénom titulaire optionnel si personne physique propriétaire.</summary>
    public string? Prenom { get; set; }
    
    /// <summary>Email titulaire optionnel pour communications juridiques.</summary>
    public string? Email { get; set; }
    
    /// <summary>Liste pays territoires où titulaire détient droits.</summary>
    public List<PaysDto> Pays { get; set; } = new();
}

/// <summary>
/// DTO création nouveau titulaire avec validations propriété strictes.
/// Assure identification appropriée propriétaire et qualité données juridiques.
/// </summary>
public class CreateTitulaireDto
{
    /// <summary>Nom titulaire OBLIGATOIRE - propriétaire droits exploitation.</summary>
    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string Nom { get; set; } = string.Empty;

    /// <summary>Prénom titulaire optionnel pour identification complète.</summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>Email titulaire optionnel avec validation format.</summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }
}

/// <summary>
/// DTO modification titulaire existant préservant droits propriété.
/// Maintient contraintes identification pour continuité juridique.
/// </summary>
public class UpdateTitulaireDto
{
    /// <summary>Nom titulaire OBLIGATOIRE maintenu pour continuité droits.</summary>
    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string Nom { get; set; } = string.Empty;

    /// <summary>Prénom titulaire modifiable pour corrections identification.</summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>Email titulaire modifiable avec validation format maintenue.</summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }
}
