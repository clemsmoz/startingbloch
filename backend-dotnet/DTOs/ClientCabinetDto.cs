/*
 * ================================================================================================
 * DTOs RELATIONS CLIENT-CABINET - MANDATS PROFESSIONNELS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère relations mandats entre clients StartingBloch et cabinets mandataires.
 * Facilite collaboration multi-cabinet et spécialisations géographiques/techniques.
 * 
 * MODÈLES MANDATS :
 * ================
 * 
 * 📋 RELATION COMPLÈTE → ClientCabinetDto avec entités chargées
 * ➕ CRÉATION MANDAT → CreateClientCabinetDto avec validations
 * ✏️ MODIFICATION → UpdateClientCabinetDto pour évolutions collaboration
 * 
 * GESTION LIFECYCLE :
 * ==================
 * ✅ Statut actif/inactif mandats (IsActive)
 * ✅ Type collaboration spécialisée (géo/technique)
 * ✅ Audit trail création mandats
 * ✅ Relations bidirectionnelles sécurisées
 * 
 * BUSINESS RULES :
 * ===============
 * ✅ Un client peut avoir multiples cabinets
 * ✅ Un cabinet peut servir multiples clients  
 * ✅ Types mandats configurables (conseil, dépôt, contentieux)
 * ✅ Activation/désactivation sans suppression historique
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO complet relation mandat client-cabinet avec entités associées.
/// Modèle central gestion partenariats professionnels et collaborations spécialisées.
/// Inclut informations lifecycle et contexte métier du mandat.
/// </summary>
public class ClientCabinetDto
{
    /// <summary>
    /// Identifiant unique relation mandat dans système.
    /// Clé primaire pour gestion lifecycle collaboration.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Identifiant client bénéficiaire du mandat.
    /// Référence propriétaire brevets et décisions stratégiques.
    /// </summary>
    public int ClientId { get; set; }
    
    /// <summary>
    /// Identifiant cabinet mandataire professionnel.
    /// Référence prestataire services propriété intellectuelle.
    /// </summary>
    public int CabinetId { get; set; }
    
    /// <summary>
    /// Type spécialisation mandat (optionnel).
    /// Exemples : "conseil", "dépôt", "contentieux", "international".
    /// </summary>
    public string? Type { get; set; }
    
    /// <summary>
    /// Statut activation mandat pour gestion lifecycle.
    /// False = suspension temporaire sans suppression historique.
    /// </summary>
    public bool IsActive { get; set; }
    
    /// <summary>
    /// Date création UTC mandat pour audit trail.
    /// Timestamp début collaboration professionnelle.
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Entité client complète (chargement optionnel).
    /// Accès informations complètes bénéficiaire mandat.
    /// </summary>
    public ClientDto? Client { get; set; }
    
    /// <summary>
    /// Entité cabinet complète (chargement optionnel).
    /// Accès informations complètes mandataire professionnel.
    /// </summary>
    public CabinetDto? Cabinet { get; set; }
}

/// <summary>
/// DTO création nouveau mandat client-cabinet avec validations strictes.
/// Assure intégrité relation et cohérence partenariat professionnel.
/// Activation automatique nouveau mandat sauf indication contraire.
/// </summary>
public class CreateClientCabinetDto
{
    /// <summary>
    /// Identifiant client OBLIGATOIRE pour mandat.
    /// Validation existence côté contrôleur avant persistance.
    /// </summary>
    [Required(ErrorMessage = "L'ID du client est obligatoire")]
    public int ClientId { get; set; }

    /// <summary>
    /// Identifiant cabinet OBLIGATOIRE pour mandat.
    /// Validation existence côté contrôleur avant persistance.
    /// </summary>
    [Required(ErrorMessage = "L'ID du cabinet est obligatoire")]
    public int CabinetId { get; set; }

    /// <summary>
    /// Type spécialisation mandat optionnel mais recommandé.
    /// Clarification nature collaboration et expertise mobilisée.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le type ne peut pas dépasser 100 caractères")]
    public string? Type { get; set; }

    /// <summary>
    /// Statut activation par défaut true pour nouveau mandat.
    /// Collaboration immédiatement opérationnelle sauf cas particulier.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO modification mandat existant pour évolution collaboration.
/// Permet ajustement type spécialisation et gestion statut activation.
/// Champs optionnels pour modification partielle sans impact global.
/// </summary>
public class UpdateClientCabinetDto
{
    /// <summary>
    /// Type spécialisation mandat modifiable selon évolution besoins.
    /// Adaptation expertise cabinet aux nouveaux défis client.
    /// </summary>
    [StringLength(100, ErrorMessage = "Le type ne peut pas dépasser 100 caractères")]
    public string? Type { get; set; }

    /// <summary>
    /// Statut activation modifiable pour gestion lifecycle mandat.
    /// Null = conservation état actuel, false = suspension, true = réactivation.
    /// </summary>
    public bool? IsActive { get; set; }
}
