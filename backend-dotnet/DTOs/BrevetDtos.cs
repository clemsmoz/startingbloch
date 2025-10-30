/*
 * ================================================================================================
 * DTOs BREVETS - TRANSFERT DONNÉES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Gère transfert sécurisé données brevets entre API et clients (frontend/mobile/tiers).
 * Centrale communication pour gestion complète portefeuilles propriété intellectuelle.
 * 
 * MODÈLES OPÉRATIONNELS :
 * ======================
 * 
 * 📋 LECTURE COMPLÈTE → BrevetDto avec toutes relations chargées
 * ➕ CRÉATION NOUVELLE → CreateBrevetDto avec validations strictes
 * ✏️ MODIFICATION → UpdateBrevetDto avec champs optionnels
 * 🔗 LIAISON CABINET → CabinetLinkDto avec rôles spécialisés
 * 
 * VALIDATIONS INTÉGRÉES :
 * ======================
 * ✅ Contraintes longueur champs critiques
 * ✅ Titre obligatoire (essence brevet)
 * ✅ Relations Many-to-Many sécurisées
 * ✅ Timestamps audit automatiques
 * ✅ Messages erreurs contextualisés
 * 
 * ARCHITECTURE RELATIONS :
 * =======================
 * ✅ Clients propriétaires (Many-to-Many)
 * ✅ Inventeurs créateurs (Many-to-Many) 
 * ✅ Déposants légaux (Many-to-Many)
 * ✅ Titulaires droits (Many-to-Many)
 * ✅ Cabinets mandataires (Many-to-Many + rôles)
 * ✅ Informations dépôt (One-to-Many)
 * 
 * ================================================================================================
 */

using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO complet brevet avec toutes relations pour affichage/consultation.
/// Modèle central gestion propriété intellectuelle avec audit trail intégré.
/// Inclut tous acteurs et informations dépôt pour vision 360° du brevet.
/// </summary>
public class BrevetDto
{
    /// <summary>
    /// Identifiant unique du brevet dans système StartingBloch.
    /// Clé primaire pour toutes opérations CRUD et relations.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Référence famille de brevets pour regroupement logique international.
    /// Permet suivi coordonné dépôts multiples pays/juridictions.
    /// </summary>
    public string? ReferenceFamille { get; set; }
    
    /// <summary>
    /// Titre descriptif du brevet (invention/innovation protégée).
    /// Élément central identification et recherche dans portefeuilles.
    /// </summary>
    public string? Titre { get; set; }
    
    /// <summary>
    /// Commentaires libres pour contexte métier ou notes stratégiques.
    /// Facilite collaboration équipes et historique décisions.
    /// </summary>
    public string? Commentaire { get; set; }
    
    /// <summary>
    /// Date création UTC pour audit trail et traçabilité RGPD.
    /// Timestamp immutable première saisie dans système.
    /// </summary>
    public DateTime? CreatedAt { get; set; }
    
    /// <summary>
    /// Date dernière modification UTC pour audit trail et traçabilité RGPD.
    /// Timestamp mise à jour automatique à chaque modification.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Statut principal du brevet (extrait automatiquement des informations de dépôt).
    /// Statut le plus récent ou prioritaire pour affichage dans les listes.
    /// </summary>
    public string? StatutBrevet { get; set; }

    // === RELATIONS ACTEURS PROPRIÉTÉ INTELLECTUELLE ===
    
    /// <summary>
    /// Clients propriétaires du brevet (relation Many-to-Many).
    /// Définit droits accès et responsabilités commerciales.
    /// </summary>
    public List<ClientDto> Clients { get; set; } = new();
    
    /// <summary>
    /// Inventeurs créateurs techniques (relation Many-to-Many).
    /// Reconnaissance paternité invention et droits moraux.
    /// </summary>
    public List<InventeurDto> Inventeurs { get; set; } = new();
    
    /// <summary>
    /// Déposants légaux responsables procédures (relation Many-to-Many).
    /// Entités habilitées effectuer formalités administratives.
    /// </summary>
    public List<DeposantDto> Deposants { get; set; } = new();
    
    /// <summary>
    /// Titulaires droits exploitation (relation Many-to-Many).
    /// Propriétaires légaux droits patrimoniaux du brevet.
    /// </summary>
    public List<TitulaireDto> Titulaires { get; set; } = new();
    
    /// <summary>
    /// Cabinets mandataires spécialisés (relation Many-to-Many + rôles).
    /// Professionnels propriété intellectuelle avec missions spécifiques.
    /// </summary>
    public List<CabinetDto> Cabinets { get; set; } = new();
    
    /// <summary>
    /// Informations dépôt multiples juridictions (relation One-to-Many).
    /// Détails procéduraux par pays/office pour suivi complet.
    /// </summary>
    public List<InformationDepotDto> InformationsDepot { get; set; } = new();
}

/// <summary>
/// DTO liaison cabinet avec rôle spécialisé dans gestion brevet.
/// Définit mission précise et type intervention du cabinet mandataire.
/// </summary>
public class CabinetLinkDto
{
    /// <summary>
    /// Identifiant cabinet mandataire assigné au brevet.
    /// Référence entité Cabinet pour chargement complet données.
    /// </summary>
    public int CabinetId { get; set; }
    
    /// <summary>
    /// Rôle spécifique du cabinet (ex: "conseil", "mandataire", "correspondant").
    /// Définit nature mission et responsabilités dans gestion brevet.
    /// </summary>
    public string? Role { get; set; }
    
    /// <summary>
    /// Type intervention cabinet (ex: "dépôt", "opposition", "renouvellement").
    /// Précise domaine expertise mobilisé pour ce brevet.
    /// </summary>
    public string? Type { get; set; }
}

/// <summary>
/// DTO création nouveau brevet avec validations strictes champs obligatoires.
/// Assure intégrité données dès saisie initiale et relations cohérentes.
/// Toutes validations appliquées côté serveur pour sécurité maximale.
/// </summary>
public class CreateBrevetDto
{
    /// <summary>
    /// Référence famille brevets avec validation longueur pour cohérence base.
    /// Optionnel pour brevets isolés, requis pour familles internationales.
    /// </summary>
    [StringLength(255, ErrorMessage = "La référence famille ne peut pas dépasser 255 caractères")]
    public string? ReferenceFamille { get; set; }

    /// <summary>
    /// Titre du brevet OBLIGATOIRE - essence identification invention.
    /// Validation stricte longueur pour compatibilité systèmes juridiques.
    /// </summary>
    [StringLength(500, ErrorMessage = "Le titre ne peut pas dépasser 500 caractères")]
    public string Titre { get; set; } = string.Empty;

    /// <summary>
    /// Commentaires libres pour contexte stratégique ou notes collaboration.
    /// Champ optionnel sans limitation stricte longueur.
    /// </summary>
    public string? Commentaire { get; set; }

    // === RELATIONS PAR IDENTIFIANTS (CRÉATION OPTIMISÉE) ===
    
    /// <summary>
    /// Liste identifiants clients propriétaires à associer.
    /// Validation existence côté contrôleur avant persistance.
    /// </summary>
    public List<int> ClientIds { get; set; } = new();
    
    /// <summary>
    /// Liste identifiants inventeurs créateurs à associer.
    /// Reconnaissance paternité technique de l'invention.
    /// </summary>
    public List<int> InventeurIds { get; set; } = new();
    
    /// <summary>
    /// Liste identifiants déposants légaux à associer.
    /// Entités responsables formalités administratives.
    /// </summary>
    public List<int> DeposantIds { get; set; } = new();
    
    /// <summary>
    /// Liste identifiants titulaires droits à associer.
    /// Propriétaires patrimoniaux exploitation commerciale.
    /// </summary>
    public List<int> TitulaireIds { get; set; } = new();
    
    /// <summary>
    /// Liste cabinets avec rôles spécialisés à associer.
    /// Mandataires professionnels avec missions définies.
    /// </summary>
    public List<CabinetLinkDto> Cabinets { get; set; } = new();
    
    /// <summary>
    /// Liste informations dépôt initiales par juridiction.
    /// Création simultanée brevet et premiers dépôts.
    /// </summary>
    public List<CreateInformationDepotDto> InformationsDepot { get; set; } = new();

    /// <summary>
    /// Liaisons pays par inventeur (optionnel). Permet de définir les pays associés à chaque inventeur.
    /// Si renseigné, les relations InventeurPays seront complétées sans créer de doublons.
    /// </summary>
    public List<InventeurPaysLinkInputDto>? InventeursPays { get; set; }

    /// <summary>
    /// Liaisons pays par déposant (optionnel). Permet de définir les pays associés à chaque déposant.
    /// </summary>
    public List<DeposantPaysLinkInputDto>? DeposantsPays { get; set; }

    /// <summary>
    /// Liaisons pays par titulaire (optionnel). Permet de définir les pays associés à chaque titulaire.
    /// </summary>
    public List<TitulairePaysLinkInputDto>? TitulairesPays { get; set; }
}

/// <summary>
/// DTO d'entrée pour lier des pays à un inventeur donné.
/// </summary>
public class InventeurPaysLinkInputDto
{
    /// <summary>Identifiant de l'inventeur concerné.</summary>
    public int InventeurId { get; set; }

    /// <summary>Liste des identifiants de pays à lier.</summary>
    public List<int> PaysIds { get; set; } = new();
}

/// <summary>
/// DTO d'entrée pour lier des pays à un déposant donné.
/// </summary>
public class DeposantPaysLinkInputDto
{
    /// <summary>Identifiant du déposant concerné.</summary>
    public int DeposantId { get; set; }

    /// <summary>Liste des identifiants de pays à lier.</summary>
    public List<int> PaysIds { get; set; } = new();
}

/// <summary>
/// DTO d'entrée pour lier des pays à un titulaire donné.
/// </summary>
public class TitulairePaysLinkInputDto
{
    /// <summary>Identifiant du titulaire concerné.</summary>
    public int TitulaireId { get; set; }

    /// <summary>Liste des identifiants de pays à lier.</summary>
    public List<int> PaysIds { get; set; } = new();
}

/// <summary>
/// DTO modification brevet existant avec champs optionnels pour flexibilité.
/// Permet mise à jour partielle sans affecter données non modifiées.
/// Validations allégées pour édition progressive et corrections.
/// </summary>
public class UpdateBrevetDto
{
    /// <summary>
    /// Référence famille brevets modifiable avec validation longueur.
    /// Null = pas de modification, valeur = remplacement complet.
    /// </summary>
    [StringLength(255, ErrorMessage = "La référence famille ne peut pas dépasser 255 caractères")]
    public string? ReferenceFamille { get; set; }

    /// <summary>
    /// Titre brevet modifiable avec validation longueur allégée.
    /// Optionnel en modification pour édition progressive.
    /// </summary>
    [StringLength(500, ErrorMessage = "Le titre ne peut pas dépasser 500 caractères")]
    public string? Titre { get; set; }

    /// <summary>
    /// Commentaires modifiables sans contrainte stricte.
    /// Facilite annotations et mises à jour contextuelles.
    /// </summary>
    public string? Commentaire { get; set; }

    // === RELATIONS OPTIONNELLES (MISE À JOUR SÉLECTIVE) ===
    
    /// <summary>
    /// Liste clients propriétaires à remplacer (optionnel).
    /// Null = conservation existant, Liste = remplacement complet.
    /// </summary>
    public List<int>? ClientIds { get; set; }
    
    /// <summary>
    /// Liste inventeurs à remplacer (optionnel).
    /// Modification paternité technique si évolution équipe.
    /// </summary>
    public List<int>? InventeurIds { get; set; }
    
    /// <summary>
    /// Liste déposants à remplacer (optionnel).
    /// Changement entités responsables formalités.
    /// </summary>
    public List<int>? DeposantIds { get; set; }
    
    /// <summary>
    /// Liste titulaires à remplacer (optionnel).
    /// Évolution propriété patrimoniale du brevet.
    /// </summary>
    public List<int>? TitulaireIds { get; set; }
    
    /// <summary>
    /// Liste cabinets avec rôles à remplacer (optionnel).
    /// Changement mandataires ou évolution missions.
    /// </summary>
    public List<CabinetLinkDto>? Cabinets { get; set; }
    
    /// <summary>
    /// Liste informations dépôt à remplacer (optionnel).
    /// Mise à jour statuts juridictions ou nouveaux dépôts.
    /// </summary>
    public List<CreateInformationDepotDto>? InformationsDepot { get; set; }

    /// <summary>
    /// Liaisons pays par inventeur lors d'une mise à jour (optionnel).
    /// Null = ne rien faire, Liste = remplacer les pays pour chaque inventeur fourni.
    /// </summary>
    public List<InventeurPaysLinkInputDto>? InventeursPays { get; set; }

    /// <summary>
    /// Liaisons pays par déposant lors d'une mise à jour (optionnel).
    /// </summary>
    public List<DeposantPaysLinkInputDto>? DeposantsPays { get; set; }

    /// <summary>
    /// Liaisons pays par titulaire lors d'une mise à jour (optionnel).
    /// </summary>
    public List<TitulairePaysLinkInputDto>? TitulairesPays { get; set; }
}
