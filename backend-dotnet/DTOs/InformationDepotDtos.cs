/*
 * ================================================================================================
 * DTOs INFORMATIONS DÉPÔT - DONNÉES PROCÉDURALES BREVETS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données procédurales dépôts brevets par juridiction.
 * Suivi complet lifecycle administratif depuis dépôt jusqu'à délivrance.
 * 
 * DONNÉES PROCÉDURALES :
 * =====================
 * 📋 NUMÉROS OFFICIELS → Dépôt, Publication, Délivrance par office
 * 📅 DATES CRITIQUES → Timeline procédure avec deadlines légales
 * 🌍 JURIDICTION → Pays/office compétent pour procédure
 * 📊 STATUT → État avancement procédure (en cours, accordé, rejeté)
 * 📄 LICENCE → Indicateur disponibilité licensing
 * 
 * COMPLIANCE INTERNATIONALE :
 * ==========================
 * ✅ Standards offices brevets internationaux
 * ✅ Numérotation officielle normalisée
 * ✅ Dates procédurales précises UTC
 * ✅ Statuts harmonisés systèmes nationaux
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO information dépôt complète avec données procédurales et relations.
/// Détails complets procédure brevet dans juridiction spécifique.
/// Inclut timeline administrative et statut avancement officiel.
/// </summary>
public class InformationDepotDto
{
    /// <summary>Identifiant unique information dépôt système.</summary>
    public int Id { get; set; }
    
    /// <summary>Identifiant brevet parent pour relation One-to-Many.</summary>
    public int IdBrevet { get; set; }
    
    /// <summary>Identifiant pays juridiction dépôt (optionnel).</summary>
    public int? IdPays { get; set; }
    
    /// <summary>Identifiant statut procédure actuel (optionnel).</summary>
    public int? IdStatuts { get; set; }
    
    /// <summary>Numéro officiel dépôt attribué par office brevets.</summary>
    public string? NumeroDepot { get; set; }
    
    /// <summary>Numéro officiel publication si procédure avancée.</summary>
    public string? NumeroPublication { get; set; }
    
    /// <summary>Numéro officiel délivrance si brevet accordé.</summary>
    public string? NumeroDelivrance { get; set; }
    
    /// <summary>Date officielle dépôt UTC pour priorité légale.</summary>
    public DateTime? DateDepot { get; set; }
    
    /// <summary>Date officielle publication UTC si applicable.</summary>
    public DateTime? DatePublication { get; set; }
    
    /// <summary>Date officielle délivrance UTC si brevet accordé.</summary>
    public DateTime? DateDelivrance { get; set; }
    
    /// <summary>Indicateur disponibilité licence exploitation commerciale.</summary>
    public bool Licence { get; set; }
    
    /// <summary>Commentaires procéduraux libres pour contexte.</summary>
    public string? Commentaire { get; set; }
    
    /// <summary>Date création UTC information pour audit trail.</summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>Date modification UTC information pour traçabilité.</summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>Entité pays juridiction complète (chargement optionnel).</summary>
    public PaysDto? Pays { get; set; }
    
    /// <summary>Entité statut procédure complète (chargement optionnel).</summary>
    public StatutDto? Statuts { get; set; }

    // Cabinets par information de dépôt
    public List<InformationDepotCabinetItemDto> CabinetsAnnuites { get; set; } = new();
    public List<InformationDepotCabinetItemDto> CabinetsProcedures { get; set; } = new();
}

/// <summary>
/// DTO création nouvelle information dépôt avec données procédurales.
/// Enregistrement initial procédure brevet dans juridiction spécifique.
/// Licence désactivée par défaut - activation explicite si pertinente.
/// </summary>
public class CreateInformationDepotDto
{
    /// <summary>Pays juridiction dépôt pour localisation procédure.</summary>
    public int? IdPays { get; set; }
    
    /// <summary>Statut initial procédure si connu dès création.</summary>
    public int? IdStatuts { get; set; }

    /// <summary>Numéro dépôt officiel avec validation longueur standard.</summary>
    [StringLength(100, ErrorMessage = "Le numéro de dépôt ne peut pas dépasser 100 caractères")]
    public string? NumeroDepot { get; set; }

    /// <summary>Numéro publication si disponible lors création.</summary>
    [StringLength(100, ErrorMessage = "Le numéro de publication ne peut pas dépasser 100 caractères")]
    public string? NumeroPublication { get; set; }

    /// <summary>Numéro délivrance si brevet déjà accordé lors création.</summary>
    [StringLength(100, ErrorMessage = "Le numéro de délivrance ne peut pas dépasser 100 caractères")]
    public string? NumeroDelivrance { get; set; }

    /// <summary>Date dépôt officielle pour établissement priorité.</summary>
    public DateTime? DateDepot { get; set; }
    
    /// <summary>Date publication officielle si procédure avancée.</summary>
    public DateTime? DatePublication { get; set; }
    
    /// <summary>Date délivrance officielle si brevet accordé.</summary>
    public DateTime? DateDelivrance { get; set; }
    
    /// <summary>Licence désactivée par défaut - activation explicite ultérieure.</summary>
    public bool Licence { get; set; } = false;
    
    /// <summary>Commentaires contextuels procédure avec validation longueur.</summary>
    [StringLength(500, ErrorMessage = "Le commentaire ne peut pas dépasser 500 caractères")]
    public string? Commentaire { get; set; }

    // Création: cabinets rattachés à cette info de dépôt
    public List<InformationDepotCabinetInputDto> CabinetsAnnuites { get; set; } = new();
    public List<InformationDepotCabinetInputDto> CabinetsProcedures { get; set; } = new();
}

/// <summary>
/// DTO modification information dépôt pour évolution procédure.
/// Mise à jour données administratives selon avancement officiel.
/// </summary>
public class UpdateInformationDepotDto
{
    /// <summary>Identifiant information dépôt à modifier.</summary>
    public int Id { get; set; }
    
    /// <summary>Pays juridiction modifiable pour corrections.</summary>
    public int? IdPays { get; set; }
    
    /// <summary>Statut procédure modifiable selon évolution.</summary>
    public int? IdStatuts { get; set; }

    /// <summary>Numéro dépôt modifiable pour corrections officielles.</summary>
    [StringLength(100, ErrorMessage = "Le numéro de dépôt ne peut pas dépasser 100 caractères")]
    public string? NumeroDepot { get; set; }

    /// <summary>Numéro publication modifiable lors avancement procédure.</summary>
    [StringLength(100, ErrorMessage = "Le numéro de publication ne peut pas dépasser 100 caractères")]
    public string? NumeroPublication { get; set; }

    /// <summary>Numéro délivrance modifiable lors accord brevet.</summary>
    [StringLength(100, ErrorMessage = "Le numéro de délivrance ne peut pas dépasser 100 caractères")]
    public string? NumeroDelivrance { get; set; }

    /// <summary>Date dépôt modifiable pour corrections administratives.</summary>
    public DateTime? DateDepot { get; set; }
    
    /// <summary>Date publication modifiable selon notifications officielles.</summary>
    public DateTime? DatePublication { get; set; }
    
    /// <summary>Date délivrance modifiable lors finalisation procédure.</summary>
    public DateTime? DateDelivrance { get; set; }
    
    /// <summary>Licence modifiable selon stratégie commerciale évolutive.</summary>
    public bool Licence { get; set; } = false;
}

public class InformationDepotCabinetItemDto
{
    public int CabinetId { get; set; }
    public string? CabinetNom { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<ContactDto> Contacts { get; set; } = new();
}

public class InformationDepotCabinetInputDto
{
    public int CabinetId { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<int> ContactIds { get; set; } = new();
}
