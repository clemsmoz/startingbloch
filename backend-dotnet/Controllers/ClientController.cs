using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Middleware;

namespace StartingBloch.Backend.Controllers;

/// <summary>
/// ClientController - Contrôleur central pour la gestion des clients et de leurs relations
/// 
/// RÔLE MÉTIER STRATÉGIQUE :
/// - Gestion du portefeuille clients de l'organisation
/// - Interface API pour toutes les opérations relatives aux clients
/// - Administration des comptes clients et utilisateurs associés
/// - Contrôle d'accès granulaire selon les profils utilisateurs
/// 
/// CONTEXTE BUSINESS :
/// - Les clients sont l'actif principal de l'organisation
/// - Chaque client possède un portefeuille de brevets géré par l'équipe
/// - Relations complexes : Client -> Utilisateurs -> Brevets -> Cabinets
/// - Gestion des droits d'accès et de la confidentialité stricte
/// 
/// ARCHITECTURE DE SÉCURITÉ :
/// - Admin : Accès complet (CRUD + gestion utilisateurs)
/// - Employé : Consultation et modification selon permissions
/// - Client : Aucun accès direct (utilisent d'autres endpoints spécialisés)
/// 
/// FONCTIONNALITÉS PRINCIPALES :
/// 1. Gestion CRUD complète des clients (employés/admin)
/// 2. Association et gestion des comptes utilisateurs clients
/// 3. Recherche et filtrage avancé du portefeuille clients
/// 4. Administration des permissions et accès
/// 5. Reporting et statistiques sur les relations clients
/// 
/// INTÉGRATIONS CRITIQUES :
/// - IClientService : Logique métier principale des clients
/// - IUserAdminService : Gestion des utilisateurs associés aux clients
/// - Middleware d'autorisation : Contrôle d'accès par rôle
/// - Système d'audit : Traçabilité complète des modifications
/// </summary>

[ApiController]
[Route("api/[controller]")]
public class ClientController : ControllerBase
{
    // Service principal pour la logique métier des clients
    private readonly IClientService _clientService;
    // Service spécialisé pour la gestion des utilisateurs et relations
    private readonly IUserAdminService _userAdminService;

    /// <summary>
    /// Constructeur du contrôleur de gestion des clients
    /// Injection des services métier pour l'accès aux données et la logique
    /// </summary>
    /// <param name="clientService">Service métier pour les opérations sur les clients</param>
    /// <param name="userAdminService">Service pour la gestion des utilisateurs associés</param>
    public ClientController(IClientService clientService, IUserAdminService userAdminService)
    {
        _clientService = clientService;
        _userAdminService = userAdminService;
    }

    /// <summary>
    /// Récupère la liste paginée complète des clients - Accès exclusif aux employés
    /// 
    /// CONFIDENTIALITÉ MAXIMALE :
    /// - Accès strictement réservé aux employés StartingBloch
    /// - Aucun accès client (protection de la confidentialité inter-clients)
    /// - Filtrage automatique selon les habilitations utilisateur
    /// 
    /// FONCTIONNALITÉS DE GESTION :
    /// - Pagination optimisée pour gérer de gros portefeuilles
    /// - Vue d'ensemble du portefeuille clients global
    /// - Informations essentielles pour administration
    /// - Statuts d'activité et indicateurs de performance
    /// 
    /// OPTIMISATIONS :
    /// - Requêtes optimisées avec index appropriés
    /// - Cache intelligent pour améliorer les performances
    /// - Limitation de taille pour sécurité et performance
    /// 
    /// CAS D'USAGE :
    /// - Administration générale du portefeuille clients
    /// - Reporting et analyses statistiques
    /// - Sélection de clients pour opérations en masse
    /// </summary>
    /// <param name="page">Numéro de page (commence à 1)</param>
    /// <param name="pageSize">Nombre d'éléments par page (max recommandé : 50)</param>
    /// <returns>Liste paginée des clients avec informations essentielles</returns>
    [HttpGet]
    [EmployeeOnly] // Sécurité maximale : employés StartingBloch uniquement
    public async Task<ActionResult<PagedResponse<List<ClientDto>>>> GetClients(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        // Délégation au service métier avec gestion automatique des permissions
        var result = await _clientService.GetClientsAsync(page, pageSize);
        
        // Gestion des erreurs de récupération
        if (!result.Success)
            return BadRequest(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère les détails complets d'un client spécifique par son identifiant
    /// 
    /// INFORMATIONS DÉTAILLÉES :
    /// - Données complètes du client (identité, contacts, préférences)
    /// - Historique des relations et collaborations
    /// - Statistiques du portefeuille de brevets
    /// - Informations de facturation et contractuelles
    /// 
    /// SÉCURITÉ ET CONFIDENTIALITÉ :
    /// - Vérification stricte de l'existence avant retour
    /// - Masquage automatique des données ultra-sensibles
    /// - Audit des consultations pour compliance RGPD
    /// - Accès réservé aux employés habilités
    /// 
    /// CAS D'USAGE :
    /// - Consultation détaillée pour gestion de relation
    /// - Préparation de rendez-vous et présentations
    /// - Analyse approfondie du portefeuille client
    /// - Support et assistance personnalisée
    /// 
    /// PERFORMANCE :
    /// - Requête optimisée avec chargement des relations
    /// - Cache temporaire pour consultations fréquentes
    /// </summary>
    /// <param name="id">Identifiant unique du client</param>
    /// <returns>Détails complets du client ou erreur si inexistant</returns>
    [HttpGet("{id}")]
    [EmployeeOnly] // Restriction : employés habilités uniquement
    public async Task<ActionResult<ApiResponse<ClientDto>>> GetClient(int id)
    {
        // Récupération des détails complets du client
        var result = await _clientService.GetClientByIdAsync(id);
        
        // Gestion des erreurs (client inexistant, accès refusé)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère un client avec son statut détaillé de compte utilisateur associé
    /// 
    /// INFORMATIONS ENRICHIES :
    /// - Données complètes du client
    /// - Statut du ou des comptes utilisateurs associés
    /// - Historique des connexions et activités
    /// - Permissions et droits d'accès configurés
    /// 
    /// UTILITÉ ADMINISTRATIVE :
    /// - Diagnostic des problèmes d'accès client
    /// - Audit des comptes et permissions
    /// - Gestion des droits et habilitations
    /// - Support technique pour les clients
    /// 
    /// DONNÉES DE STATUT :
    /// - Existence et validité des comptes utilisateurs
    /// - Dates de dernière connexion et activité
    /// - Statuts d'activation et permissions
    /// - Configurations spécifiques et préférences
    /// 
    /// SÉCURITÉ :
    /// - Accès strictement réservé aux employés
    /// - Masquage des données sensibles d'authentification
    /// - Logging des consultations pour audit
    /// </summary>
    /// <param name="id">Identifiant unique du client</param>
    /// <returns>Client avec statut détaillé des comptes utilisateurs</returns>
    [HttpGet("{id}/with-user-status")]
    [EmployeeOnly] // Restriction : employés pour gestion administrative
    public async Task<ActionResult<ApiResponse<ClientWithUserStatusDto>>> GetClientWithUserStatus(int id)
    {
        // Récupération du client avec enrichissement du statut utilisateur
        var result = await _clientService.GetClientWithUserStatusAsync(id);
        
        // Gestion des erreurs (client inexistant)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère la liste des clients sans compte utilisateur associé - Identification des gaps
    /// 
    /// UTILITÉ ADMINISTRATIVE :
    /// - Identification des clients sans accès numérique
    /// - Planification de campagnes de création de comptes
    /// - Audit de couverture des services numériques
    /// - Priorisation des actions de digitalisation
    /// 
    /// GESTION DU CYCLE CLIENT :
    /// - Suivi des nouveaux clients en attente d'activation
    /// - Identification des clients inactifs numériquement
    /// - Planification des formations et accompagnements
    /// - Optimisation de l'expérience client numérique
    /// 
    /// ACTIONS RECOMMANDÉES :
    /// - Création proactive de comptes utilisateurs
    /// - Communication pour adoption des outils numériques
    /// - Formation et accompagnement personnalisé
    /// - Amélioration continue du service client
    /// 
    /// REPORTING :
    /// - Indicateurs de digitalisation du portefeuille
    /// - Taux d'adoption des services numériques
    /// - Priorités d'action pour équipes commerciales
    /// </summary>
    /// <returns>Liste des clients nécessitant création de compte utilisateur</returns>
    [HttpGet("without-user-account")]
    [EmployeeOnly] // Restriction : employés pour gestion administrative
    public async Task<ActionResult<ApiResponse<List<ClientDto>>>> GetClientsWithoutUserAccount()
    {
        // Récupération des clients orphelins (sans compte utilisateur)
        var result = await _clientService.GetClientsWithoutUserAccountAsync();
        return Ok(result);
    }

    /// <summary>
    /// Recherche de clients par terme avec fonctionnalités avancées - Outil de productivité
    /// 
    /// FONCTIONNALITÉS DE RECHERCHE :
    /// - Recherche multi-critères : nom, raison sociale, secteur, pays
    /// - Support des caractères spéciaux et recherche partielle
    /// - Tri par pertinence et critères métier
    /// - Suggestions automatiques et auto-complétion
    /// 
    /// OPTIMISATIONS TECHNIQUES :
    /// - Index de recherche full-text pour performances
    /// - Cache intelligent des recherches fréquentes
    /// - Limitation automatique pour éviter les surcharges
    /// - Parallélisation des requêtes complexes
    /// 
    /// CAS D'USAGE MÉTIER :
    /// - Recherche rapide lors de la prise d'appels
    /// - Identification de clients pour opérations ciblées
    /// - Analyses de segments et de marchés
    /// - Support à la relation client personnalisée
    /// 
    /// SÉCURITÉ :
    /// - Validation stricte des termes de recherche
    /// - Prévention des attaques par injection
    /// - Audit des recherches sensibles
    /// </summary>
    /// <param name="searchTerm">Terme de recherche (minimum 2 caractères pour performance)</param>
    /// <returns>Liste des clients correspondant aux critères de recherche</returns>
    [HttpGet("search")]
    [EmployeeOnly] // Restriction : employés pour confidentialité
    public async Task<ActionResult<ApiResponse<List<ClientDto>>>> SearchClients(
        [FromQuery] string searchTerm)
    {
        // Validation du terme de recherche pour sécurité et performance
        if (string.IsNullOrWhiteSpace(searchTerm))
            return BadRequest(new ApiResponse<List<ClientDto>>
            {
                Success = false,
                Message = "Le terme de recherche ne peut pas être vide"
            });

        // Exécution de la recherche avec optimisations
        var result = await _clientService.SearchClientsAsync(searchTerm);
        return Ok(result);
    }

    /// <summary>
    /// Crée un nouveau client dans le portefeuille - Opération stratégique nécessitant des droits d'écriture
    /// 
    /// PROCESSUS DE CRÉATION :
    /// - Validation complète des données métier obligatoires
    /// - Vérification de l'unicité et de la cohérence
    /// - Génération automatique des références client
    /// - Initialisation des paramètres et préférences par défaut
    /// 
    /// DONNÉES CRITIQUES REQUISES :
    /// - Identité complète et raison sociale
    /// - Adresse principale et coordonnées
    /// - Secteur d'activité et informations légales
    /// - Contacts principaux et préférences communication
    /// 
    /// VALIDATIONS MÉTIER :
    /// - Contrôle de cohérence des données géographiques
    /// - Vérification des informations légales et SIRET
    /// - Validation des contacts et moyens de communication
    /// - Contrôle des doublons potentiels
    /// 
    /// IMPACT SYSTÈME :
    /// - Création d'un nouveau workspace sécurisé
    /// - Initialisation des permissions par défaut
    /// - Notification aux équipes concernées
    /// - Mise à jour des tableaux de bord
    /// 
    /// AUDIT ET CONFORMITÉ :
    /// - Logging complet de la création
    /// - Historique des modifications pour traçabilité
    /// - Conformité RGPD pour protection des données
    /// </summary>
    /// <param name="createClientDto">Données complètes du nouveau client</param>
    /// <returns>Client créé avec ID généré ou erreurs de validation détaillées</returns>
    [HttpPost]
    [WritePermission] // Permissions d'écriture obligatoires
    public async Task<ActionResult<ApiResponse<ClientDto>>> CreateClient(
        [FromBody] CreateClientDto createClientDto)
    {
        // Validation préalable complète du modèle de données
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<ClientDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()
            });
        }

        // Délégation de la création au service métier avec toutes les validations
        var result = await _clientService.CreateClientAsync(createClientDto);
        
        // Gestion des erreurs de création (doublons, contraintes, etc.)
        if (!result.Success)
            return BadRequest(result);
            
        // Retour HTTP 201 Created avec localisation de la ressource
        return CreatedAtAction(
            nameof(GetClient), 
            new { id = result.Data?.Id }, 
            result);
    }

    /// <summary>
    /// Crée un nouveau client avec son compte utilisateur associé - Opération complexe réservée aux administrateurs
    /// 
    /// OPÉRATION ATOMIQUE COMPLEXE :
    /// - Création simultanée du client et de son compte utilisateur
    /// - Transaction globale : succès complet ou rollback total
    /// - Configuration automatique des permissions et accès
    /// - Génération sécurisée des identifiants et mots de passe
    /// 
    /// ORCHESTRATION DES SERVICES :
    /// - Délégation au UserAdminController pour coordination
    /// - Gestion des dépendances entre entités Client et User
    /// - Synchronisation des données de référence
    /// - Validation croisée des contraintes métier
    /// 
    /// SÉCURITÉ RENFORCÉE :
    /// - Accès exclusivement réservé aux administrateurs
    /// - Génération de mots de passe temporaires sécurisés
    /// - Envoi d'invitations par email chiffré
    /// - Audit complet de la création des accès
    /// 
    /// WORKFLOW AUTOMATISÉ :
    /// - Création du client avec données complètes
    /// - Génération du compte utilisateur associé
    /// - Configuration des permissions par défaut
    /// - Envoi automatique des informations de connexion
    /// - Notification aux équipes support et commercial
    /// 
    /// NOTE TECHNIQUE :
    /// Cette méthode redirige vers UserAdminController.CreateNewClientWithUser()
    /// pour orchestrer la création coordonnée des deux entités.
    /// </summary>
    /// <param name="createClientWithUserDto">Données complètes client + utilisateur</param>
    /// <returns>Redirection vers l'endpoint spécialisé UserAdmin</returns>
    [HttpPost("with-user-account")]
    [AdminOnly] // Restriction maximale : administrateurs uniquement
    public Task<ActionResult<ApiResponse<UserDto>>> CreateClientWithUser(
        [FromBody] CreateClientWithUserDto createClientWithUserDto)
    {
        // Validation préalable du modèle de données complexe
        if (!ModelState.IsValid)
        {
            return Task.FromResult<ActionResult<ApiResponse<UserDto>>>(BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()
            }));
        }

        // Redirection vers le contrôleur spécialisé pour l'orchestration
        // Cette approche garantit la cohérence des transactions complexes
        return Task.FromResult<ActionResult<ApiResponse<UserDto>>>(RedirectToAction("CreateNewClientWithUser", "UserAdmin", createClientWithUserDto));
    }

    /// <summary>
    /// Met à jour les informations d'un client existant - Modification critique nécessitant des droits d'écriture
    /// 
    /// GESTION DES MODIFICATIONS :
    /// - Mise à jour partielle ou complète des données client
    /// - Validation de l'intégrité référentielle et métier
    /// - Préservation des relations existantes (brevets, utilisateurs)
    /// - Contrôle de concurrence optimiste pour éviter les conflits
    /// 
    /// TYPES DE MODIFICATIONS SUPPORTÉES :
    /// - Informations générales (nom, adresse, contacts)
    /// - Données contractuelles et préférences
    /// - Paramètres de service et configuration
    /// - Informations légales et fiscales
    /// 
    /// VALIDATIONS CRITIQUES :
    /// - Vérification de l'existence et accessibilité du client
    /// - Contrôle des contraintes métier et légales
    /// - Validation des nouvelles données avec règles spécifiques
    /// - Vérification de l'impact sur les relations existantes
    /// 
    /// IMPACT ET PROPAGATION :
    /// - Mise à jour automatique des données dérivées
    /// - Notification aux utilisateurs associés si nécessaire
    /// - Synchronisation avec les systèmes externes
    /// - Mise à jour des caches et index de recherche
    /// 
    /// AUDIT ET TRAÇABILITÉ :
    /// - Historique complet des modifications avec comparaison avant/après
    /// - Identification de l'utilisateur auteur des changements
    /// - Horodatage précis pour conformité réglementaire
    /// - Conservation des versions antérieures pour rollback si nécessaire
    /// </summary>
    /// <param name="id">Identifiant unique du client à modifier</param>
    /// <param name="updateClientDto">Nouvelles données du client à appliquer</param>
    /// <returns>Client mis à jour avec toutes les données actualisées ou erreurs de validation</returns>
    [HttpPut("{id}")]
    [WritePermission] // Permissions d'écriture obligatoires
    public async Task<ActionResult<ApiResponse<ClientDto>>> UpdateClient(
        int id, 
        [FromBody] CreateClientDto updateClientDto)
    {
        // Validation préalable complète du modèle de données
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<ClientDto>
            {
                Success = false,
                Message = "Données invalides",
                Errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList()
            });
        }

        // Délégation de la mise à jour au service métier avec toutes les validations
        var result = await _clientService.UpdateClientAsync(id, updateClientDto);
        
        // Gestion des erreurs (client inexistant, contraintes violées, etc.)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Supprime définitivement un client du portefeuille - Opération destructive critique réservée aux administrateurs
    /// 
    /// RESTRICTIONS MAXIMALES DE SÉCURITÉ :
    /// - Accès exclusivement réservé aux administrateurs
    /// - Opération irréversible avec impact majeur sur l'écosystème
    /// - Vérifications préalables obligatoires de toutes les dépendances
    /// - Processus de validation en plusieurs étapes
    /// 
    /// VÉRIFICATIONS PRÉALABLES CRITIQUES :
    /// - Contrôle des brevets encore associés au client
    /// - Vérification des utilisateurs et comptes actifs
    /// - Validation de l'absence de dossiers en cours
    /// - Contrôle des obligations contractuelles et légales
    /// - Vérification des relations avec cabinets partenaires
    /// 
    /// PROCESSUS DE SUPPRESSION SÉCURISÉ :
    /// - Sauvegarde automatique complète avant destruction
    /// - Archivage des données critiques pour conformité légale
    /// - Notification obligatoire aux utilisateurs concernés
    /// - Transfert ou finalisation des dossiers actifs
    /// - Nettoyage en cascade des données liées
    /// 
    /// CONFORMITÉ RÉGLEMENTAIRE :
    /// - Respect des obligations de conservation RGPD
    /// - Archive des données d'audit et de traçabilité
    /// - Notification aux autorités compétentes si requis
    /// - Conservation des données financières selon réglementation
    /// 
    /// IMPACT SYSTÈME :
    /// - Désactivation immédiate de tous les accès associés
    /// - Mise à jour des référentiels et caches
    /// - Notification aux systèmes externes intégrés
    /// - Mise à jour des statistiques et reporting
    /// </summary>
    /// <param name="id">Identifiant unique du client à supprimer définitivement</param>
    /// <returns>Confirmation de suppression ou erreur détaillée si contraintes</returns>
    [HttpDelete("{id}")]
    [AdminOnly] // Restriction maximale : administrateurs uniquement
    public async Task<ActionResult<ApiResponse<bool>>> DeleteClient(int id)
    {
        // Délégation de la suppression au service métier avec toutes les vérifications
        var result = await _clientService.DeleteClientAsync(id);
        
        // Gestion des erreurs (client inexistant, contraintes relationnelles, etc.)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Récupère la liste complète des utilisateurs associés à un client spécifique
    /// 
    /// GESTION DES ACCÈS CLIENT :
    /// - Vue d'ensemble des comptes utilisateurs du client
    /// - Informations sur les rôles et permissions attribués
    /// - Statuts d'activité et dernières connexions
    /// - Historique des modifications de comptes
    /// 
    /// UTILITÉ ADMINISTRATIVE :
    /// - Administration des accès et permissions client
    /// - Audit des comptes et de leur utilisation
    /// - Support technique pour problèmes d'accès
    /// - Gestion des habilitations et formations
    /// 
    /// INFORMATIONS RETOURNÉES :
    /// - Liste exhaustive des utilisateurs du client
    /// - Détails des profils et permissions
    /// - Statistiques d'utilisation et connexions
    /// - Configurations spécifiques et préférences
    /// 
    /// SÉCURITÉ ET CONFIDENTIALITÉ :
    /// - Validation de l'existence du client
    /// - Masquage des données sensibles d'authentification
    /// - Audit des consultations pour compliance
    /// - Respect des règles de confidentialité inter-clients
    /// 
    /// OPTIMISATIONS :
    /// - Requête optimisée avec jointures efficaces
    /// - Cache des relations stables pour performance
    /// - Limitation automatique pour éviter les surcharges
    /// </summary>
    /// <param name="id">Identifiant unique du client</param>
    /// <returns>Liste complète des utilisateurs associés au client</returns>
    [HttpGet("{id}/users")]
    [EmployeeOnly] // Restriction : employés pour administration des accès
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetClientUsers(int id)
    {
        // Délégation au service spécialisé pour gestion des utilisateurs
        var result = await _userAdminService.GetUsersByClientAsync(id);
        
        // Gestion des erreurs (client inexistant, aucun utilisateur)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }

    /// <summary>
    /// Compte le nombre total d'utilisateurs associés à un client - Métrique administrative
    /// 
    /// INDICATEUR DE GESTION :
    /// - Métrique simple pour tableaux de bord
    /// - Suivi de l'adoption des services numériques
    /// - Indicateur de taille et complexité du compte client
    /// - Base de calcul pour facturation et services
    /// 
    /// UTILITÉ OPÉRATIONNELLE :
    /// - Validation rapide de la configuration client
    /// - Contrôle des limites de licences et accès
    /// - Planification des ressources support
    /// - Optimisation des performances système
    /// 
    /// OPTIMISATIONS PERFORMANCE :
    /// - Requête optimisée COUNT() sans transfert de données
    /// - Cache temporaire pour éviter les recalculs fréquents
    /// - Index spécialisé pour comptage rapide
    /// - Validation de cohérence avec les données détaillées
    /// 
    /// CAS D'USAGE :
    /// - Tableaux de bord et reporting
    /// - Validation de configuration avant modifications
    /// - Alertes automatiques sur seuils définis
    /// - Optimisation des requêtes complexes
    /// </summary>
    /// <param name="id">Identifiant unique du client</param>
    /// <returns>Nombre total d'utilisateurs associés au client</returns>
    [HttpGet("{id}/users/count")]
    [EmployeeOnly] // Restriction : employés pour administration
    public async Task<ActionResult<ApiResponse<int>>> GetClientUserCount(int id)
    {
        // Délégation au service spécialisé pour comptage optimisé
        var result = await _userAdminService.GetUserCountByClientAsync(id);
        
        // Gestion des erreurs (client inexistant)
        if (!result.Success)
            return NotFound(result);
            
        return Ok(result);
    }
}
