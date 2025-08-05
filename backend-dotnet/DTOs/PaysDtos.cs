/*
 * ================================================================================================
 * DTOs PAYS - JURIDICTIONS GÉOGRAPHIQUES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données pays juridictions pour dépôts brevets internationaux.
 * Support navigation géographique et conformité standards internationaux.
 * 
 * STANDARDS GÉOGRAPHIQUES :
 * ========================
 * 🌍 ISO 3166 → Codes pays standards internationaux
 * 🇫🇷 MULTILINGUE → Noms français et localisations
 * 🏛️ JURIDICTIONS → Compétences légales brevets
 * 📊 STATISTIQUES → Métriques activité par région
 * 
 * COMPLIANCE INTERNATIONALE :
 * ==========================
 * ✅ Codes ISO-2 et ISO-3 standards
 * ✅ Noms officiels multilingues  
 * ✅ Juridictions brevets reconnues
 * ✅ Audit trail référentiels
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO pays complet avec codes standards internationaux et localisations.
/// Juridiction géographique pour dépôts brevets avec identifiants normalisés.
/// Support navigation internationale et conformité réglementaire.
/// </summary>
public class PaysDto
{
    /// <summary>Identifiant unique pays système StartingBloch.</summary>
    public int Id { get; set; }
    
    /// <summary>Nom pays principal pour affichage standard.</summary>
    public string NomPays { get; set; } = string.Empty;
    
    /// <summary>Code pays interne système pour référencement.</summary>
    public string CodePays { get; set; } = string.Empty;
    
    /// <summary>Nom officiel français pour interface francophone.</summary>
    public string? NomFrFr { get; set; }
    
    /// <summary>Code ISO 3166-1 alpha-2 standard international.</summary>
    public string? CodeIso { get; set; }
    
    /// <summary>Code ISO 3166-1 alpha-3 pour systèmes étendus.</summary>
    public string? CodeIso3 { get; set; }
    
    /// <summary>Date création UTC pays pour audit trail référentiel.</summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO création nouveau pays avec validations standards géographiques.
/// Enregistrement juridiction avec codes internationaux conformes.
/// </summary>
public class CreatePaysDto
{
    /// <summary>Nom français OBLIGATOIRE pour interface utilisateur.</summary>
    [Required(ErrorMessage = "Le nom du pays est requis")]
    [StringLength(100, ErrorMessage = "Le nom du pays ne peut pas dépasser 100 caractères")]
    public string NomFrFr { get; set; } = string.Empty;

    /// <summary>Code ISO optionnel avec validation longueur standard.</summary>
    [StringLength(10, ErrorMessage = "Le code ISO ne peut pas dépasser 10 caractères")]
    public string? CodeIso { get; set; }
}

/// <summary>
/// DTO modification pays existant avec contraintes géographiques maintenues.
/// </summary>
public class UpdatePaysDto
{
    /// <summary>Nom français OBLIGATOIRE maintenu pour cohérence interface.</summary>
    [Required(ErrorMessage = "Le nom du pays est requis")]
    [StringLength(100, ErrorMessage = "Le nom du pays ne peut pas dépasser 100 caractères")]
    public string NomFrFr { get; set; } = string.Empty;

    /// <summary>Code ISO modifiable selon évolutions standards.</summary>
    [StringLength(10, ErrorMessage = "Le code ISO ne peut pas dépasser 10 caractères")]
    public string? CodeIso { get; set; }
}
