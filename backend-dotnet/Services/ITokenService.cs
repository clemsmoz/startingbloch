/*
 * ================================================================================================
 * INTERFACE SERVICE TOKEN - CONTRAT GESTION TOKENS JWT
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Interface contrat service tokens StartingBloch définissant gestion JWT sécurisés.
 * Spécification méthodes génération, validation et révocation tokens authentification.
 * 
 * FONCTIONNALITÉS CONTRACTUELLES :
 * ================================
 * 🔐 GÉNÉRATION → Création tokens JWT avec claims utilisateur
 * ✅ VALIDATION → Vérification validité et intégrité tokens
 * ❌ RÉVOCATION → Invalidation tokens compromis/expirés
 * 🔄 REFRESH → Renouvellement tokens avant expiration
 * 📊 INTROSPECTION → Analyse contenu et métadonnées tokens
 * 
 * CONFORMITÉ SÉCURITÉ :
 * ====================
 * ✅ JWT RFC 7519 → Standard tokens JSON Web
 * ✅ OWASP → Sécurité tokens selon recommandations
 * ✅ OIDC → OpenID Connect compliance
 * ✅ OAuth 2.0 → Authorization framework standard
 * 
 * ================================================================================================
 */

using StartingBloch.Backend.DTOs;
using System.Security.Claims;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service gestion tokens JWT avec sécurité renforcée.
/// Contrat génération, validation et révocation tokens authentification.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Génère token JWT d'accès pour utilisateur authentifié.
    /// Création sécurisée token avec claims utilisateur et métadonnées.
    /// </summary>
    /// <param name="user">Utilisateur pour génération token avec claims</param>
    /// <returns>Token JWT signé avec durée de vie configurée</returns>
    string GenerateAccessToken(UserDto user);
    
    /// <summary>
    /// Génère token de rafraîchissement pour renouvellement sécurisé.
    /// Création token longue durée pour renouvellement accès.
    /// </summary>
    /// <returns>Token refresh pour renouvellement sécurisé</returns>
    string GenerateRefreshToken();
    
    /// <summary>
    /// Valide token JWT et extrait claims utilisateur.
    /// Vérification signature, expiration et intégrité token.
    /// </summary>
    /// <param name="token">Token JWT à valider et analyser</param>
    /// <returns>Claims principal si valide, null sinon</returns>
    ClaimsPrincipal? ValidateToken(string token);
    
    /// <summary>
    /// Révoque token JWT pour invalidation immédiate.
    /// Ajout token à liste noire pour sécurité.
    /// </summary>
    /// <param name="token">Token JWT à révoquer définitivement</param>
    /// <returns>Tâche asynchrone révocation token</returns>
    Task RevokeTokenAsync(string token);
    
    /// <summary>
    /// Vérifie si token JWT est révoqué ou blacklisté.
    /// Contrôle liste noire tokens invalidés.
    /// </summary>
    /// <param name="token">Token JWT à vérifier statut</param>
    /// <returns>Statut booléen révocation token</returns>
    Task<bool> IsTokenRevokedAsync(string token);
}
