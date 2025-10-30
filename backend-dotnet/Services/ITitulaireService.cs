/*
 * ================================================================================================
 * INTERFACE SERVICE TITULAIRES - CONTRAT GESTION PROPRIÉTAIRES BREVETS
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service titulaires StartingBloch définissant gestion propriétaires brevets.
 * Spécification méthodes CRUD titulaires avec nationalités et droits propriété intellectuelle.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 📋 CONSULTATION → Récupération paginée titulaires avec recherche
 * 🔍 DÉTAIL → Accès titulaire spécifique avec nationalités
 * ✨ CRÉATION → Ajout nouveaux titulaires système
 * ✏️ MODIFICATION → Mise à jour informations titulaires
 * ❌ SUPPRESSION → Retrait titulaires avec validation brevets
 * 🌍 NATIONALITÉS → Gestion pays attribution titulaires
 * 
 * TYPES TITULAIRES SYSTÈME :
 * ==========================
 * 🏢 ENTREPRISE → Sociétés commerciales détentrices brevets
 * 👤 PERSONNE_PHYSIQUE → Inventeurs individuels propriétaires
 * 🏛️ ORGANISME_PUBLIC → Institutions recherche publique
 * 🎓 UNIVERSITÉ → Établissements enseignement supérieur
 * 🔬 LABORATOIRE → Centres recherche spécialisés
 * 🤝 CONSORTIUM → Groupements collaboratifs recherche
 * 
 * DROITS PROPRIÉTÉ INTELLECTUELLE :
 * =================================
 * ✅ PROPRIÉTAIRE → Détenteur droits complets brevet
 * ✅ CO-PROPRIÉTAIRE → Propriété partagée plusieurs titulaires
 * ✅ CESSIONNAIRE → Bénéficiaire cession droits
 * ✅ LICENCIÉ → Détenteur licence exploitation
 * ✅ USUFRUITIER → Bénéficiaire usufruit temporaire
 * 
 * GESTION NATIONALITÉS MULTIPLES :
 * ================================
 * 🌍 Multi-nationalité support complet système
 * 🏳️ Pays principal définition juridiction référence
 * 🔄 Attribution/retrait pays dynamique
 * 📊 Statistiques répartition géographique
 * ⚖️ Implications juridictionnelles selon pays
 * 
 * RECHERCHE AVANCÉE TITULAIRES :
 * =============================
 * 🔍 NOM → Recherche textuelle nom complet
 * 🏢 TYPE → Filtrage selon type entité
 * 🌍 PAYS → Recherche par nationalité
 * 📧 EMAIL → Localisation par contact email
 * 📱 TÉLÉPHONE → Recherche coordonnées téléphoniques
 * 
 * VALIDATION DONNÉES MÉTIER :
 * ===========================
 * ✅ Unicité noms titulaires selon contexte
 * ✅ Cohérence types juridiques selon pays
 * ✅ Validation adresses selon standards postaux
 * ✅ Contrôle formats contacts (email, téléphone)
 * ✅ Vérification codes pays ISO 3166-1
 * 
 * CONFORMITÉ JURIDIQUE :
 * ======================
 * ✅ RGPD → Protection données personnelles titulaires
 * ✅ INPI → Standards français propriété industrielle
 * ✅ EPO → European Patent Office compliance
 * ✅ WIPO → World Intellectual Property standards
 * 
 * INTÉGRATION SYSTÈME :
 * ====================
 * 🔗 BREVETS → Association titulaires aux brevets
 * 👥 CONTACTS → Liaison personnes contact titulaires
 * 🏢 CABINETS → Relations avec conseils propriété
 * 📊 REPORTING → Analyses portefeuille titulaires
 * 
 * CONFORMITÉ ARCHITECTURALE :
 * ==========================
 * ✅ Pattern Repository avec abstraction complète
 * ✅ Injection dépendances via interface
 * ✅ Séparation responsabilités métier/données
 * ✅ Testabilité maximale via contrats
 * ✅ Évolutivité garantie par découplage
 * 
 * ================================================================================================
 */

using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service métier gestion titulaires brevets avec nationalités multiples.
/// Contrat CRUD titulaires avec droits propriété intellectuelle et validation juridique.
/// </summary>
public interface ITitulaireService
{
    /// <summary>
    /// Récupère liste paginée titulaires avec recherche textuelle avancée.
    /// Navigation optimisée titulaires avec filtrage multi-critères.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel nom/email/téléphone</param>
    /// <returns>Réponse paginée titulaires avec métadonnées complètes</returns>
    Task<PagedResponse<List<TitulaireDto>>> GetTitulairesAsync(int page = 1, int pageSize = 10, string? search = null);
    
    /// <summary>
    /// Récupère titulaire spécifique avec informations détaillées complètes.
    /// Chargement optimisé titulaire avec nationalités et droits PI.
    /// </summary>
    /// <param name="id">Identifiant unique titulaire recherché</param>
    /// <returns>Titulaire détaillé avec nationalités et contacts ou erreur</returns>
    Task<ApiResponse<TitulaireDto>> GetTitulaireByIdAsync(int id);
    
    /// <summary>
    /// Crée nouveau titulaire avec validation métier complète.
    /// Création sécurisée avec contrôle unicité et conformité juridique.
    /// </summary>
    /// <param name="createTitulaireDto">Données création titulaire avec coordonnées</param>
    /// <returns>Titulaire créé avec identifiant et métadonnées</returns>
    Task<ApiResponse<TitulaireDto>> CreateTitulaireAsync(CreateTitulaireDto createTitulaireDto);
    
    /// <summary>
    /// Met à jour informations titulaire avec validation contraintes.
    /// Modification sécurisée avec contrôle cohérence et audit trail.
    /// </summary>
    /// <param name="id">Identifiant titulaire à modifier</param>
    /// <param name="updateTitulaireDto">Données modification titulaire partielles</param>
    /// <returns>Titulaire modifié avec nouvelles informations</returns>
    Task<ApiResponse<TitulaireDto>> UpdateTitulaireAsync(int id, UpdateTitulaireDto updateTitulaireDto);
    
    /// <summary>
    /// Supprime titulaire système avec validation contraintes référentielles.
    /// Suppression sécurisée avec vérification brevets associés existants.
    /// </summary>
    /// <param name="id">Identifiant titulaire à supprimer du système</param>
    /// <returns>Confirmation suppression avec audit trail</returns>
    Task<ApiResponse<bool>> DeleteTitulaireAsync(int id);
    
    /// <summary>
    /// Récupère liste complète pays nationalités titulaire spécifique.
    /// Chargement optimisé nationalités avec codes ISO et libellés.
    /// </summary>
    /// <param name="titulaireId">Identifiant titulaire pour recherche nationalités</param>
    /// <returns>Liste pays nationalités avec métadonnées géographiques</returns>
    Task<ApiResponse<List<PaysDto>>> GetTitulairePaysAsync(int titulaireId);
    
    /// <summary>
    /// Assigne nouvelle nationalité à titulaire avec validation juridique.
    /// Attribution sécurisée nationalité avec contrôle doublons et cohérence.
    /// </summary>
    /// <param name="titulaireId">Identifiant titulaire pour attribution nationalité</param>
    /// <param name="paysId">Identifiant pays nationalité à attribuer</param>
    /// <returns>Confirmation attribution nationalité avec audit</returns>
    Task<ApiResponse<bool>> AssignPaysToTitulaireAsync(int titulaireId, int paysId);
    
    /// <summary>
    /// Retire nationalité titulaire avec validation contraintes légales.
    /// Suppression sécurisée nationalité avec contrôle nationalité principale.
    /// </summary>
    /// <param name="titulaireId">Identifiant titulaire pour retrait nationalité</param>
    /// <param name="paysId">Identifiant pays nationalité à retirer</param>
    /// <returns>Confirmation retrait nationalité avec audit trail</returns>
    Task<ApiResponse<bool>> RemovePaysFromTitulaireAsync(int titulaireId, int paysId);
}
