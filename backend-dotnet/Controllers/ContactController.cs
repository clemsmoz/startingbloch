using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Middleware;
using StartingBloch.Backend.Services;

namespace StartingBloch.Backend.Controllers;

/// <summary>
/// ContactController - Contrôleur pour la gestion des contacts et relations interpersonnelles
/// 
/// RÔLE MÉTIER STRATÉGIQUE :
/// - Gestion du carnet d'adresses professionnel de l'organisation
/// - Interface API pour toutes les opérations relatives aux contacts
/// - Administration des relations interpersonnelles dans l'écosystème IP
/// - Point central pour la gestion des communications et interactions
/// 
/// CONTEXTE RELATIONNEL :
/// - Les contacts sont les interlocuteurs humains dans le processus IP
/// - Relations complexes : Contact -> Client/Cabinet/Inventeur/Déposant
/// - Gestion multi-rôles : un contact peut avoir plusieurs fonctions
/// - Support de la communication omnicanale (email, téléphone, courrier)
/// 
/// ÉCOSYSTÈME DE DONNÉES :
/// - Liens avec entités Contact, ContactEmail, ContactPhone, ContactRole
/// - Gestion des hiérarchies et relations organisationnelles
/// - Support des préférences de communication individuelles
/// - Historique complet des interactions et échanges
/// 
/// SÉCURITÉ ET CONFIDENTIALITÉ :
/// - Accès strictement réservé aux employés (données sensibles)
/// - Respect du RGPD pour protection des données personnelles
/// - Audit complet des consultations et modifications
/// - Chiffrement des données sensibles de contact
/// 
/// FONCTIONNALITÉS PRINCIPALES :
/// 1. Gestion CRUD complète des contacts professionnels
/// 2. Recherche avancée et filtrage par critères multiples
/// 3. Gestion des moyens de communication (emails, téléphones)
/// 4. Administration des rôles et fonctions des contacts
/// 5. Historique des interactions et communications
/// 
/// INTÉGRATIONS CRITIQUES :
/// - IContactService : Logique métier et accès aux données
/// - Système de communication : emails et notifications
/// - CRM intégré : synchronisation des données client
/// - Outils de collaboration : planning et rendez-vous
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    // Service métier pour la gestion des contacts et leurs relations
    private readonly IContactService _contactService;

    /// <summary>
    /// Constructeur du contrôleur de gestion des contacts
    /// Injection du service métier pour l'accès aux données et la logique relationnelle
    /// </summary>
    /// <param name="contactService">Service métier pour les opérations sur les contacts</param>
    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    /// <summary>
    /// Récupère la liste paginée des contacts avec fonctionnalités de recherche avancée
    /// 
    /// FONCTIONNALITÉS DE RECHERCHE :
    /// - Pagination optimisée pour gérer de gros carnets d'adresses
    /// - Recherche textuelle dans nom, prénom, entreprise, fonction
    /// - Filtrage par critères métier (rôle, organisation, statut)
    /// - Tri intelligent par pertinence et fréquence d'interaction
    /// 
    /// CONFIDENTIALITÉ ET SÉCURITÉ :
    /// - Accès strictement réservé aux employés habilités
    /// - Masquage automatique des données ultra-sensibles
    /// - Respect des préférences de confidentialité des contacts
    /// - Audit automatique des consultations pour RGPD
    /// 
    /// OPTIMISATIONS TECHNIQUES :
    /// - Index de recherche full-text pour performances
    /// - Cache intelligent des recherches fréquentes
    /// - Limitation automatique pour éviter les surcharges
    /// - Parallélisation des requêtes complexes
    /// 
    /// CAS D'USAGE MÉTIER :
    /// - Recherche rapide lors de communications urgentes
    /// - Constitution d'équipes projet et groupes de travail
    /// - Analyses relationnelles et mapping d'écosystème
    /// - Support à la gestion de relation client personnalisée
    /// </summary>
    /// <param name="page">Numéro de page (commence à 1)</param>
    /// <param name="pageSize">Nombre d'éléments par page (max recommandé : 50)</param>
    /// <param name="search">Terme de recherche optionnel (nom, fonction, entreprise)</param>
    /// <returns>Liste paginée des contacts correspondant aux critères</returns>
    [HttpGet]
    [EmployeeOnly] // Restriction : employés pour confidentialité des données personnelles
    public async Task<ActionResult<PagedResponse<List<ContactDto>>>> GetContacts(
        int page = 1, 
        int pageSize = 10, 
        string? search = null)
    {
        // Délégation au service métier avec gestion de la pagination et recherche
        var result = await _contactService.GetContactsAsync(page, pageSize, search);
        
        // Gestion des erreurs de requête
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère les détails complets d'un contact spécifique par son identifiant
    /// 
    /// INFORMATIONS COMPLÈTES RETOURNÉES :
    /// - Données personnelles et professionnelles complètes
    /// - Tous les moyens de communication (emails, téléphones)
    /// - Rôles et fonctions dans les différentes organisations
    /// - Historique des interactions et dernières communications
    /// - Préférences de communication et disponibilités
    /// 
    /// RELATIONS ET CONTEXTE :
    /// - Liens avec clients, cabinets, et autres entités
    /// - Hiérarchies organisationnelles et reporting
    /// - Participations aux projets et dossiers
    /// - Réseaux professionnels et recommandations
    /// 
    /// SÉCURITÉ ET CONFORMITÉ :
    /// - Vérification stricte de l'existence avant retour
    /// - Respect des autorisations de diffusion RGPD
    /// - Masquage automatique des données restreintes
    /// - Audit des consultations pour traçabilité
    /// 
    /// CAS D'USAGE :
    /// - Préparation de communications personnalisées
    /// - Constitution de dossiers et équipes projet
    /// - Analyses relationnelles et influence
    /// - Support client et assistance technique
    /// </summary>
    /// <param name="id">Identifiant unique du contact</param>
    /// <returns>Détails complets du contact ou erreur si inexistant</returns>
    [HttpGet("{id}")]
    [EmployeeOnly] // Restriction : employés pour protection des données personnelles
    public async Task<ActionResult<ApiResponse<ContactDto>>> GetContact(int id)
    {
        // Récupération des détails complets du contact
        var result = await _contactService.GetContactByIdAsync(id);
        
        // Gestion des erreurs (contact inexistant, accès refusé)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère la liste paginée des contacts associés à un client spécifique
    /// </summary>
    /// <param name="clientId">Identifiant du client</param>
    /// <param name="page">Numéro de page</param>
    /// <param name="pageSize">Taille de la page</param>
    /// <returns>Liste paginée des contacts du client</returns>
    [HttpGet("client/{clientId}")]
    [EmployeeOnly]
    public async Task<ActionResult<PagedResponse<List<ContactDto>>>> GetContactsByClient(int clientId, int page = 1, int pageSize = 10)
    {
        var result = await _contactService.GetContactsByClientAsync(clientId, page, pageSize);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Récupère la liste paginée des contacts associés à un cabinet spécifique
    /// </summary>
    /// <param name="cabinetId">Identifiant du cabinet</param>
    /// <param name="page">Numéro de page</param>
    /// <param name="pageSize">Taille de la page</param>
    /// <returns>Liste paginée des contacts du cabinet</returns>
    [HttpGet("cabinet/{cabinetId}")]
    [EmployeeOnly]
    public async Task<ActionResult<PagedResponse<List<ContactDto>>>> GetContactsByCabinet(int cabinetId, int page = 1, int pageSize = 10)
    {
        var result = await _contactService.GetContactsByCabinetAsync(cabinetId, page, pageSize);
        if (!result.Success)
            return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Crée un nouveau contact dans le carnet d'adresses professionnel
    /// 
    /// PROCESSUS DE CRÉATION SÉCURISÉ :
    /// - Validation complète des données personnelles et professionnelles
    /// - Vérification de l'unicité et détection des doublons potentiels
    /// - Création coordonnée avec moyens de communication associés
    /// - Initialisation des préférences et paramètres par défaut
    /// 
    /// DONNÉES CRITIQUES REQUISES :
    /// - Identité complète (nom, prénom, fonction)
    /// - Organisation et contexte professionnel
    /// - Au moins un moyen de communication fiable
    /// - Consentement RGPD pour utilisation des données
    /// 
    /// VALIDATIONS MÉTIER SPÉCIALISÉES :
    /// - Contrôle de cohérence des informations géographiques
    /// - Validation des formats d'adresses email et téléphones
    /// - Vérification des fonctions et organisations existantes
    /// - Détection intelligente des doublons par algorithmes
    /// 
    /// IMPACT RELATIONNEL :
    /// - Création automatique des liens avec entités associées
    /// - Initialisation des rôles et permissions par défaut
    /// - Notification aux équipes concernées selon contexte
    /// - Intégration dans les workflows de communication
    /// 
    /// CONFORMITÉ RGPD :
    /// - Enregistrement du consentement et de sa source
    /// - Paramétrage des préférences de communication
    /// - Respect du droit à l'oubli et à la portabilité
    /// - Audit complet de la création pour traçabilité
    /// </summary>
    /// <param name="createContactDto">Données complètes du nouveau contact</param>
    /// <returns>Contact créé avec ID généré ou erreurs de validation détaillées</returns>
    [HttpPost]
    [WritePermission] // Nécessite canWrite=true ou Admin
    public async Task<ActionResult<ApiResponse<ContactDto>>> CreateContact(CreateContactDto createContactDto)
    {
        // Validation préalable complète du modèle de données RGPD
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Délégation de la création au service métier avec toutes les validations
        var result = await _contactService.CreateContactAsync(createContactDto);
        
        // Gestion des erreurs de création (doublons, contraintes, validation)
        if (!result.Success)
            return BadRequest(result);
            
        // Retour HTTP 201 Created avec localisation de la ressource
        return CreatedAtAction(nameof(GetContact), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Met à jour les informations d'un contact existant avec respect des contraintes RGPD
    /// 
    /// GESTION DES MODIFICATIONS PERSONNELLES :
    /// - Mise à jour partielle ou complète des données personnelles
    /// - Validation de l'intégrité et cohérence des nouvelles données
    /// - Préservation des relations et historiques existants
    /// - Contrôle de concurrence pour éviter les conflits
    /// 
    /// TYPES DE MODIFICATIONS SUPPORTÉES :
    /// - Informations personnelles (nom, fonction, organisation)
    /// - Moyens de communication (emails, téléphones)
    /// - Préférences et paramètres de confidentialité
    /// - Rôles et responsabilités professionnelles
    /// 
    /// VALIDATIONS CRITIQUES RGPD :
    /// - Vérification des droits de modification des données
    /// - Contrôle du consentement pour nouvelles utilisations
    /// - Validation des formats et cohérence géographique
    /// - Respect des préférences de communication existantes
    /// 
    /// IMPACT ET PROPAGATION :
    /// - Mise à jour automatique des données dérivées
    /// - Synchronisation avec les systèmes de communication
    /// - Notification aux systèmes externes intégrés
    /// - Mise à jour des caches et index de recherche
    /// 
    /// AUDIT ET TRAÇABILITÉ :
    /// - Historique complet avec comparaison avant/après
    /// - Identification de l'utilisateur auteur des changements
    /// - Conformité RGPD pour droit de rectification
    /// - Conservation des versions pour audit réglementaire
    /// </summary>
    /// <param name="id">Identifiant unique du contact à modifier</param>
    /// <param name="updateContactDto">Nouvelles données du contact à appliquer</param>
    /// <returns>Contact mis à jour avec toutes les données actualisées</returns>
    [HttpPut("{id}")]
    [WritePermission] // Nécessite canWrite=true ou Admin
    public async Task<ActionResult<ApiResponse<ContactDto>>> UpdateContact(int id, UpdateContactDto updateContactDto)
    {
        // Validation préalable complète du modèle de données
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Délégation de la mise à jour au service métier avec toutes les validations
        var result = await _contactService.UpdateContactAsync(id, updateContactDto);
        
        // Gestion des erreurs (contact inexistant, contraintes violées)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Supprime définitivement un contact du carnet d'adresses - Opération critique respectant le RGPD
    /// 
    /// RESTRICTIONS MAXIMALES DE SÉCURITÉ :
    /// - Accès exclusivement réservé aux administrateurs
    /// - Opération irréversible avec implications juridiques RGPD
    /// - Vérifications préalables obligatoires de toutes les dépendances
    /// - Processus de validation conforme au droit à l'oubli
    /// 
    /// VÉRIFICATIONS PRÉALABLES CRITIQUES :
    /// - Contrôle des relations actives avec autres entités
    /// - Vérification des communications et échanges en cours
    /// - Validation de l'absence de mandats légaux actifs
    /// - Contrôle des obligations de conservation réglementaires
    /// 
    /// PROCESSUS DE SUPPRESSION CONFORME RGPD :
    /// - Respect du droit à l'oubli et à l'effacement
    /// - Anonymisation des données dans les archives légales
    /// - Suppression coordonnée des données liées
    /// - Conservation minimale pour obligations légales
    /// 
    /// CONFORMITÉ RÉGLEMENTAIRE :
    /// - Application stricte des règles RGPD
    /// - Respect des délais de conservation sectoriels
    /// - Documentation complète de la procédure
    /// - Notification aux systèmes externes si requis
    /// 
    /// IMPACT RELATIONNEL :
    /// - Analyse d'impact sur les relations existantes
    /// - Transfert ou archivage des communications critiques
    /// - Notification aux parties concernées selon contexte
    /// - Mise à jour des réseaux et organigrammes
    /// </summary>
    /// <param name="id">Identifiant unique du contact à supprimer définitivement</param>
    /// <returns>Confirmation de suppression ou erreur détaillée si contraintes</returns>
    [HttpDelete("{id}")]
    [AdminOnly] // Restriction maximale : administrateurs pour conformité RGPD
    public async Task<ActionResult<ApiResponse<bool>>> DeleteContact(int id)
    {
        // Délégation de la suppression au service métier avec toutes les vérifications RGPD
        var result = await _contactService.DeleteContactAsync(id);
        
        // Gestion des erreurs (contact inexistant, contraintes relationnelles)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }
}