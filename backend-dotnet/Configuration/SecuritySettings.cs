/**
 * ============================================================================
 * STARTING BLOCH - CONFIGURATION SÉCURITÉ SYSTÈME
 * ============================================================================
 * 
 * Configuration centralisée des paramètres de sécurité pour l'écosystème de propriété
 * intellectuelle. Définit les standards de sécurité, authentification JWT, et politiques
 * de protection des données selon les exigences réglementaires les plus strictes.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Configuration JWT sécurisée pour authentification et autorisation
 * • Paramètres de sécurité avancés (rate limiting, HTTPS, validation)
 * • Politiques de mots de passe conformes aux standards sécurité
 * • Configuration centralisée pour audit et conformité réglementaire
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Standards JWT avec chiffrement fort et expiration contrôlée
 * • Rate limiting configurable pour prévention attaques DoS
 * • Enforcement HTTPS obligatoire pour protection transit
 * • Politiques mots de passe conformes OWASP et réglementations
 * 
 * ARCHITECTURE SÉCURISÉE:
 * • Configuration externalisée pour sécurité par conception
 * • Paramètres ajustables selon environnement (dev/staging/prod)
 * • Validation centralisée des exigences sécuritaires
 * • Support audit et monitoring sécurité temps réel
 * 
 * IMPACT BUSINESS:
 * Configuration critique pour sécurité globale du système de propriété intellectuelle.
 * Essentielle pour conformité réglementaire, audit sécurité et protection données clients.
 * 
 * @version 1.0.0
 * @since 2024
 * @author Starting Bloch Development Team
 */

namespace StartingBloch.Backend.Configuration;

/**
 * Configuration des paramètres JWT pour authentification sécurisée
 * 
 * Responsabilités principales:
 * - Définition des paramètres de signature et validation JWT
 * - Configuration issuer/audience pour validation stricte tokens
 * - Gestion expiration tokens selon politiques sécurité
 * - Support rotation clés et renouvellement sécurisé
 */
public class JwtSettings
{
    /// <summary>
    /// Clé secrète pour signature JWT - DOIT être complexe et rotée régulièrement
    /// Utilisée pour signature et validation tokens d'authentification
    /// Critque: Stockage sécurisé en variables d'environnement obligatoire
    /// </summary>
    public string Secret { get; set; } = string.Empty;
    
    /// <summary>
    /// Émetteur du token JWT pour validation stricte origine
    /// Identifie de manière unique l'autorité émettrice des tokens
    /// Sécurité: Validation côté client pour prévention token forgés
    /// </summary>
    public string Issuer { get; set; } = string.Empty;
    
    /// <summary>
    /// Audience cible du token JWT pour validation destinataire
    /// Spécifie les services autorisés à accepter ces tokens
    /// Sécurité: Restriction usage tokens selon principe moindre privilège
    /// </summary>
    public string Audience { get; set; } = string.Empty;
    
    /// <summary>
    /// Durée de validité en minutes des tokens JWT
    /// Balance entre sécurité (courte durée) et UX (éviter reconnexions fréquentes)
    /// Défaut: 60 minutes - Ajustable selon politique sécurité organisationnelle
    /// </summary>
    public int ExpireMinutes { get; set; } = 60;
}

/**
 * Configuration des paramètres de sécurité système globaux
 * 
 * Responsabilités principales:
 * - Définition politiques de sécurité transport et accès
 * - Configuration rate limiting pour protection DoS/DDoS
 * - Standards mots de passe selon meilleures pratiques OWASP
 * - Enforcement HTTPS et protections transport
 */
public class SecuritySettings
{
    /// <summary>
    /// Active/désactive le rate limiting pour protection attaques volumétriques
    /// Essentiel pour prévention déni de service et surcharge système
    /// Recommandé: Toujours activé en production pour protection optimale
    /// </summary>
    public bool EnableRateLimiting { get; set; } = true;
    
    /// <summary>
    /// Nombre maximum de requêtes autorisées par minute par utilisateur/IP
    /// Balance entre protection sécurité et performance utilisateur normal
    /// Défaut: 100 req/min - Ajustable selon patterns usage légitimes
    /// </summary>
    public int MaxRequestsPerMinute { get; set; } = 100;
    
    /// <summary>
    /// Force redirection automatique HTTP vers HTTPS
    /// Sécurité: Garantit chiffrement toutes communications sensibles
    /// Obligatoire: Production doit toujours utiliser HTTPS exclusivement
    /// </summary>
    public bool EnableHttpsRedirect { get; set; } = true;
    
    /// <summary>
    /// Exige HTTPS pour toutes les connexions (strict transport security)
    /// Sécurité maximale: Rejette toute tentative connexion non chiffrée
    /// Critical: Indispensable pour protection données propriété intellectuelle
    /// </summary>
    public bool RequireHttps { get; set; } = true;
    
    /// <summary>
    /// Longueur minimale requise pour mots de passe utilisateur
    /// Conformité OWASP: Minimum 8 caractères recommandé
    /// Sécurité: Plus long = plus résistant attaques brute force
    /// </summary>
    public int PasswordMinLength { get; set; } = 8;
    
    /// <summary>
    /// Exige au moins un chiffre dans les mots de passe
    /// Sécurité: Augmente complexité et résistance attaques dictionnaire
    /// Standard: Conformité exigences sécurité entreprise classiques
    /// </summary>
    public bool PasswordRequireDigit { get; set; } = true;
    
    /// <summary>
    /// Exige au moins une lettre majuscule dans les mots de passe
    /// Sécurité: Augmente espace recherche pour attaques brute force
    /// Conformité: Standard industrie pour comptes professionnels
    /// </summary>
    public bool PasswordRequireUppercase { get; set; } = true;
    
    /// <summary>
    /// Exige au moins une lettre minuscule dans les mots de passe
    /// Sécurité: Complète diversité caractères pour robustesse maximale
    /// Obligatoire: Avec majuscules pour diversité alphabétique complète
    /// </summary>
    public bool PasswordRequireLowercase { get; set; } = true;
    
    /// <summary>
    /// Exige au moins un caractère spécial dans les mots de passe
    /// Sécurité: Maximise complexité contre attaques sophistiquées
    /// Exemples: !@#$%^&*()_+-=[]{}|;:,.<>? pour robustesse optimale
    /// </summary>
    public bool PasswordRequireNonAlphanumeric { get; set; } = true;
}
