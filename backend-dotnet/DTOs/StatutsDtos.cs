/*
 * ================================================================================================
 * DTOs STATUTS - ÉTATS PROCÉDURES BREVETS INTERNATIONAUX
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données statuts procédures brevets selon standards offices.
 * Suivi états avancement administratif et juridique dépôts internationaux.
 * 
 * STATUTS STANDARDS :
 * ==================
 * 📋 EPO STATUTS → États Office Européen Brevets
 * 🌍 WIPO STATUTS → États Organisation Mondiale PI
 * 🏛️ NATIONAUX → États offices nationaux spécifiques
 * ⚖️ CONTENTIEUX → États procédures opposition/recours
 * 
 * LIFECYCLE BREVETS :
 * ==================
 * ✅ EN COURS → Procédure active en instruction
 * ✅ ACCORDÉ → Brevet délivré et valide
 * ✅ REJETÉ → Demande refusée définitivement  
 * ✅ ABANDONNÉ → Procédure interrompue volontaire
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO statut procédure brevet avec description contexte juridique.
/// État standardisé avancement administratif selon offices brevets.
/// Support navigation lifecycle et reporting activité.
/// </summary>
public class StatutDto
{
    /// <summary>Identifiant unique statut système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom statut officiel selon nomenclature office brevets.</summary>
    public string NomStatut { get; set; } = string.Empty;
    
    /// <summary>Description détaillée contexte juridique et implications.</summary>
    public string? Description { get; set; }
    
    /// <summary>Date création UTC statut pour audit trail référentiel.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO création nouveau statut procédure avec validation nomenclature.
/// Enregistrement état standardisé selon offices brevets internationaux.
/// </summary>
public class CreateStatutDto
{
    /// <summary>Nom statut OBLIGATOIRE selon standards offices brevets.</summary>
    [Required(ErrorMessage = "Le nom du statut est requis")]
    [StringLength(100, ErrorMessage = "Le nom du statut ne peut pas dépasser 100 caractères")]
    public string NomStatut { get; set; } = string.Empty;
}

/// <summary>
/// DTO modification statut existant avec contraintes nomenclature maintenues.
/// </summary>
public class UpdateStatutDto
{
    /// <summary>Nom statut OBLIGATOIRE maintenu pour cohérence référentiel.</summary>
    [Required(ErrorMessage = "Le nom du statut est requis")]
    [StringLength(100, ErrorMessage = "Le nom du statut ne peut pas dépasser 100 caractères")]
    public string NomStatut { get; set; } = string.Empty;
}
