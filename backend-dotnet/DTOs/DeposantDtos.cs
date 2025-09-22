/*
 * ================================================================================================
 * DTOs DÉPOSANTS - ENTITÉS LÉGALES DÉPÔT BREVETS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert données déposants légaux responsables procédures brevets.
 * Entités habilitées effectuer formalités administratives auprès offices brevets.
 * 
 * RÔLE JURIDIQUE :
 * ===============
 * 📋 DÉPOSANT → Entité légale effectuant dépôt officiel brevet
 * 🌍 MULTI-PAYS → Relation Many-to-Many pour dépôts internationaux
 * 📧 COMMUNICATION → Contact direct pour notifications offices
 * ⚖️ RESPONSABILITÉ → Engagement légal procédures et taxes
 * 
 * VALIDATIONS LÉGALES :
 * ====================
 * ✅ Nom obligatoire (identification légale)
 * ✅ Email validé (communications officielles)
 * ✅ Relations pays multiples (juridictions)
 * ✅ Cohérence données personnelles/morales
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO déposant complet avec pays juridictions pour affichage consultation.
/// Entité légale responsable dépôt brevets avec compétences géographiques.
/// Inclut relations pays pour vision complète capacités juridictionnelles.
/// </summary>
public class DeposantDto
{
    /// <summary>
    /// Identifiant unique déposant dans système StartingBloch.
    /// Clé primaire pour toutes relations et responsabilités légales.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Nom déposant OBLIGATOIRE - dénomination légale officielle.
    /// Identification principale pour formalités administratives brevets.
    /// </summary>
    public string Nom { get; set; } = string.Empty;
    
    /// <summary>
    /// Prénom déposant optionnel si personne physique.
    /// Complément identification pour déposants individuels.
    /// </summary>
    public string? Prenom { get; set; }
    
    /// <summary>
    /// Email déposant optionnel pour communications officielles.
    /// Canal direct notifications offices brevets et procédures.
    /// </summary>
    public string? Email { get; set; }
    
    /// <summary>
    /// Liste pays juridictions où déposant peut effectuer dépôts.
    /// Relation Many-to-Many définit compétences géographiques légales.
    /// </summary>
    public List<PaysDto> Pays { get; set; } = new();
}

/// <summary>
/// DTO création nouveau déposant avec validations légales strictes.
/// Assure conformité identification et qualité données procédurales.
/// Base solide établissement responsabilités juridiques futures.
/// </summary>
public class CreateDeposantDto
{
    /// <summary>
    /// Nom déposant OBLIGATOIRE - dénomination légale pour dépôts.
    /// Validation stricte conformité identification officielle.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string Nom { get; set; } = string.Empty;

    /// <summary>
    /// Prénom déposant optionnel si personne physique déposante.
    /// Complément identification individuelle selon contexte juridique.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Email déposant optionnel avec validation format strict.
    /// Canal communication directe avec offices brevets internationaux.
    /// </summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }
}

/// <summary>
/// DTO modification déposant existant avec contraintes légales maintenues.
/// Préserve validations identification pour continuité procédures.
/// Permet évolution données contact sans affecter responsabilités.
/// </summary>
public class UpdateDeposantDto
{
    /// <summary>
    /// Nom déposant OBLIGATOIRE maintenu en modification.
    /// Identification légale ne peut être supprimée pour continuité procédures.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères")]
    public string Nom { get; set; } = string.Empty;

    /// <summary>
    /// Prénom déposant modifiable pour corrections identification.
    /// Mise à jour flexible selon évolutions statut juridique.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères")]
    public string? Prenom { get; set; }

    /// <summary>
    /// Email déposant modifiable avec validation format maintenue.
    /// Actualisation canal communication officielle avec offices.
    /// </summary>
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    [StringLength(255, ErrorMessage = "L'email ne peut pas dépasser 255 caractères")]
    public string? Email { get; set; }
}
