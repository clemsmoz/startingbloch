/*
 * ================================================================================================
 * DTOs CABINETS - MANDATAIRES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données cabinets mandataires spécialisés propriété intellectuelle.
 * Facilite collaboration client-cabinet et suivi mandats internationaux complexes.
 * 
 * MODÈLES GESTION :
 * ================
 * 
 * 📋 CABINET COMPLET → CabinetDto avec clients rattachés et métriques
 * ➕ CRÉATION → CreateCabinetDto avec validations strictes conformité
 * ✏️ MODIFICATION → UpdateCabinetDto avec champs requis maintenus
 * 
 * VALIDATIONS PROFESSIONNELLES :
 * =============================
 * ✅ Nom cabinet obligatoire (identification légale)
 * ✅ Adresse complète requise (correspondance officielle)
 * ✅ Pays obligatoire (juridiction compétence)
 * ✅ Email validé format (communication sécurisée)
 * ✅ Téléphone international (contact urgence)
 * 
 * MÉTRIQUES BUSINESS :
 * ===================
 * ✅ Nombre clients rattachés (charge cabinet)
 * ✅ Audit trail création/modification
 * ✅ Relations Many-to-Many sécurisées
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO complet cabinet mandataire avec clients rattachés et métriques activité.
/// Modèle central gestion partenaires professionnels propriété intellectuelle.
/// Inclut informations contact complètes et statistiques collaboration.
/// </summary>
public class CabinetDto
{
    /// <summary>
    /// Identifiant unique cabinet dans système StartingBloch.
    /// Clé primaire pour toutes opérations et relations mandats.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Dénomination sociale officielle du cabinet mandataire.
    /// Nom légal utilisé correspondances et contrats clients.
    /// </summary>
    public string NomCabinet { get; set; } = string.Empty;
    
    /// <summary>
    /// Adresse postale complète siège social ou bureau principal.
    /// Adresse référence pour correspondances officielles et juridiques.
    /// </summary>
    public string AdresseCabinet { get; set; } = string.Empty;
    
    /// <summary>
    /// Code postal pour précision géolocalisation et tri courrier.
    /// Optionnel selon standards postaux internationaux variables.
    /// </summary>
    public string? CodePostal { get; set; }
    
    /// <summary>
    /// Pays implantation cabinet pour juridiction compétence.
    /// Détermine réglementation applicable et zones intervention.
    /// </summary>
    public string PaysCabinet { get; set; } = string.Empty;
    
    /// <summary>
    /// Adresse email principale contact cabinet (optionnel).
    /// Canal privilégié communication rapide et échanges documents.
    /// </summary>
    public string? EmailCabinet { get; set; }
    
    /// <summary>
    /// Numéro téléphone principal cabinet (optionnel).
    /// Contact direct urgences et communications verbales importantes.
    /// </summary>
    public string? TelephoneCabinet { get; set; }
    
    /// <summary>
    /// Type de spécialisation du cabinet : Annuité ou Procédure.
    /// Détermine le domaine d'expertise principal du cabinet.
    /// </summary>
    public CabinetType Type { get; set; }
    
    /// <summary>
    /// Date création UTC cabinet dans système pour audit trail.
    /// Timestamp première intégration partenaire professionnel.
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Date dernière modification UTC données cabinet pour traçabilité.
    /// Timestamp mise à jour automatique modifications informations.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// Nombre clients actuellement rattachés à ce cabinet.
    /// Métrique charge travail et indicateur activité partenaire.
    /// </summary>
    public int NombreClients { get; set; }
    
    /// <summary>
    /// Liste clients collaborant avec ce cabinet (optionnel chargement).
    /// Relations Many-to-Many pour mandats multiples et flexibles.
    /// </summary>
    public List<ClientDto>? Clients { get; set; }
}

/// <summary>
/// DTO création nouveau cabinet avec validations strictes conformité professionnelle.
/// Assure intégrité données mandataire et respect standards communication.
/// Tous champs critiques validés pour fiabilité partenariat.
/// </summary>
public class CreateCabinetDto
{
    /// <summary>
    /// Nom cabinet OBLIGATOIRE - dénomination légale mandataire.
    /// Validation stricte longueur pour compatibilité bases données.
    /// </summary>
    [Required(ErrorMessage = "Le nom du cabinet est requis")]
    [StringLength(255, ErrorMessage = "Le nom du cabinet ne peut pas dépasser 255 caractères")]
    public string NomCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Adresse cabinet OBLIGATOIRE - siège social correspondances.
    /// Validation longueur pour adresses internationales complexes.
    /// </summary>
    [Required(ErrorMessage = "L'adresse est requise")]
    [StringLength(500, ErrorMessage = "L'adresse ne peut pas dépasser 500 caractères")]
    public string AdresseCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Code postal optionnel selon standards nationaux variables.
    /// Validation longueur adaptée formats internationaux divers.
    /// </summary>
    [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères")]
    public string? CodePostal { get; set; }

    /// <summary>
    /// Pays cabinet OBLIGATOIRE - juridiction et réglementation.
    /// Détermine compétences légales et zones intervention autorisées.
    /// </summary>
    [Required(ErrorMessage = "Le pays est requis")]
    [StringLength(100, ErrorMessage = "Le pays ne peut pas dépasser 100 caractères")]
    public string PaysCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Email cabinet optionnel avec validation format stricte.
    /// Canal communication privilégié échanges documents sécurisés.
    /// </summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? EmailCabinet { get; set; }

    /// <summary>
    /// Téléphone cabinet optionnel pour communications urgentes.
    /// Format international flexible selon standards nationaux.
    /// </summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? TelephoneCabinet { get; set; }

    /// <summary>
    /// Type de spécialisation du cabinet : Annuité ou Procédure.
    /// Détermine le domaine d'expertise principal du cabinet.
    /// </summary>
    [Required(ErrorMessage = "Le type de cabinet est requis")]
    public CabinetType Type { get; set; }
}

/// <summary>
/// DTO modification cabinet existant avec validations maintenues intégrité.
/// Préserve contraintes obligatoires pour fiabilité données partenaire.
/// Permet mise à jour complète informations contact et identification.
/// </summary>
public class UpdateCabinetDto
{
    /// <summary>
    /// Nom cabinet OBLIGATOIRE maintenu en modification.
    /// Dénomination légale ne peut être vide pour cohérence partenariat.
    /// </summary>
    [Required(ErrorMessage = "Le nom du cabinet est requis")]
    [StringLength(255, ErrorMessage = "Le nom du cabinet ne peut pas dépasser 255 caractères")]
    public string NomCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Adresse cabinet OBLIGATOIRE maintenue en modification.
    /// Siège social requis pour correspondances officielles continues.
    /// </summary>
    [Required(ErrorMessage = "L'adresse est requise")]
    [StringLength(500, ErrorMessage = "L'adresse ne peut pas dépasser 500 caractères")]
    public string AdresseCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Code postal modifiable selon évolutions organisationnelles.
    /// Mise à jour flexible déménagements ou restructurations.
    /// </summary>
    [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères")]
    public string? CodePostal { get; set; }

    /// <summary>
    /// Pays cabinet OBLIGATOIRE maintenu en modification.
    /// Juridiction compétence ne peut être indéterminée.
    /// </summary>
    [Required(ErrorMessage = "Le pays est requis")]
    [StringLength(100, ErrorMessage = "Le pays ne peut pas dépasser 100 caractères")]
    public string PaysCabinet { get; set; } = string.Empty;

    /// <summary>
    /// Email cabinet modifiable avec validation format maintenue.
    /// Mise à jour canaux communication selon évolutions organisation.
    /// </summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? EmailCabinet { get; set; }

    /// <summary>
    /// Téléphone cabinet modifiable pour actualisation contacts.
    /// Flexibilité mise à jour moyens communication directs.
    /// </summary>
    [StringLength(50, ErrorMessage = "Le téléphone ne peut pas dépasser 50 caractères")]
    public string? TelephoneCabinet { get; set; }

    /// <summary>
    /// Type de spécialisation du cabinet : Annuité ou Procédure.
    /// Peut être modifié selon évolution des compétences du cabinet.
    /// </summary>
    [Required(ErrorMessage = "Le type de cabinet est requis")]
    public CabinetType Type { get; set; }
}
