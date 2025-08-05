/*
 * ================================================================================================
 * DTOs NUMÉROS PAYS - CODES IDENTIFIANTS JURIDICTIONS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données codes numériques pays pour identification juridictions.
 * Support systèmes numérotation internationaux propriété intellectuelle.
 * 
 * STANDARDS INTERNATIONAUX :
 * =========================
 * 🌍 ISO CODES → Codes pays standardisés internationaux
 * 📋 WIPO CODES → Numérotation OMPI propriété intellectuelle  
 * 🏛️ EPO CODES → Codes Office Européen Brevets
 * 🔢 CUSTOM → Numérotation interne système StartingBloch
 * 
 * RELATIONS GÉOGRAPHIQUES :
 * ========================
 * ✅ Association unique pays-numéro
 * ✅ Codes multiples par pays possible
 * ✅ Validation existence pays référence
 * ✅ Audit trail création codes
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO numéro pays complet avec informations géographiques associées.
/// Code identifiant juridiction avec contexte pays pour navigation.
/// Inclut dénomination pays pour affichage interface utilisateur.
/// </summary>
public class NumeroPaysDto
{
    /// <summary>Identifiant unique numéro pays système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Code numérique pays selon standard international utilisé.</summary>
    public string Numero { get; set; } = string.Empty;
    
    /// <summary>Code alphabétique pays pour référence croisée.</summary>
    public string PaysCode { get; set; } = string.Empty;
    
    /// <summary>Identifiant pays référence pour relation géographique.</summary>
    public int PaysId { get; set; }
    
    /// <summary>Nom pays complet pour affichage interface (optionnel).</summary>
    public string? PaysNom { get; set; }
    
    /// <summary>Date création UTC code pour audit trail.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO création nouveau numéro pays avec validations standards.
/// Association code numérique à pays existant avec validation.
/// </summary>
public class CreateNumeroPaysDto
{
    /// <summary>Code numérique OBLIGATOIRE selon standard international.</summary>
    [Required(ErrorMessage = "Le numéro est requis")]
    [StringLength(50, ErrorMessage = "Le numéro ne peut pas dépasser 50 caractères")]
    public string Numero { get; set; } = string.Empty;

    /// <summary>Pays référence OBLIGATOIRE pour association géographique.</summary>
    [Required(ErrorMessage = "L'ID du pays est requis")]
    public int PaysId { get; set; }
}

/// <summary>
/// DTO modification numéro pays avec contraintes validation maintenues.
/// </summary>
public class UpdateNumeroPaysDto
{
    /// <summary>Code numérique OBLIGATOIRE maintenu en modification.</summary>
    [Required(ErrorMessage = "Le numéro est requis")]
    [StringLength(50, ErrorMessage = "Le numéro ne peut pas dépasser 50 caractères")]
    public string Numero { get; set; } = string.Empty;

    /// <summary>Pays référence OBLIGATOIRE maintenu pour cohérence.</summary>
    [Required(ErrorMessage = "L'ID du pays est requis")]
    public int PaysId { get; set; }
}
