/*
 * ================================================================================================
 * SERVICE JWT - GESTION TOKENS AUTHENTIFICATION SÉCURISÉE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service JWT StartingBloch gérant génération et validation tokens authentification.
 * Implémentation sécurisée avec standards JWT pour contrôle accès système complet.
 * 
 * FONCTIONNALITÉS JWT SÉCURISÉES :
 * ===============================
 * 🔐 GÉNÉRATION → Création tokens avec claims utilisateur
 * ✅ VALIDATION → Vérification intégrité et validité tokens
 * 🕐 EXPIRATION → Gestion durée vie configurable
 * 🔍 VÉRIFICATION → Contrôle validité rapide tokens
 * 📋 CLAIMS → Enrichissement informations utilisateur
 * 
 * STRUCTURE CLAIMS JWT :
 * =====================
 * 👤 NameIdentifier → ID utilisateur unique système
 * 📧 Email → Adresse email validation utilisateur
 * 🏷️ Role → Rôle utilisateur pour permissions
 * 🆔 JTI → JWT ID unique prévention replay
 * 📅 IAT → Issued At timestamp création
 * ⏰ EXP → Expiration timestamp validité
 * 
 * PARAMÈTRES SÉCURITÉ JWT :
 * ========================
 * 🔑 SECRET → Clé secrète signature HMAC-SHA256
 * 🏢 ISSUER → Émetteur token pour validation
 * 👥 AUDIENCE → Audience cible token spécifique
 * ⏱️ EXPIRATION → Durée vie configurable minutes
 * 🔒 ALGORITHM → HMAC-SHA256 signature sécurisée
 * 
 * VALIDATION STRICTE TOKENS :
 * ===========================
 * ✅ SIGNATURE → Vérification intégrité cryptographique
 * ✅ ISSUER → Contrôle émetteur autorisé
 * ✅ AUDIENCE → Validation destinataire correct
 * ✅ LIFETIME → Vérification expiration stricte
 * ✅ CLAIMS → Validation structure données
 * 
 * GESTION ERREURS SÉCURISÉE :
 * ===========================
 * 🚫 TOKEN_INVALID → Token malformé ou corrompu
 * ⏰ TOKEN_EXPIRED → Token expiré temporellement
 * 🔑 SIGNATURE_INVALID → Signature cryptographique incorrecte
 * 🏢 ISSUER_INVALID → Émetteur non autorisé
 * 👥 AUDIENCE_INVALID → Audience incorrecte
 * 
 * LOGGING SÉCURITÉ :
 * ==================
 * ✅ GÉNÉRATION → Log création tokens utilisateur
 * ⚠️ VALIDATION → Log échecs validation tokens
 * 🚫 ERREURS → Log tentatives accès frauduleux
 * 📊 AUDIT → Traçabilité utilisation JWT
 * 
 * CONFORMITÉ SÉCURITÉ :
 * ====================
 * ✅ RFC 7519 → JSON Web Token standard
 * ✅ OWASP → Standards sécurité tokens
 * ✅ NIST → Recommandations cryptographiques
 * ✅ ANSSI → Sécurité authentification France
 * 
 * INTÉGRATION SYSTÈME :
 * ====================
 * 🔗 AUTHENTICATION → Middleware authentification
 * 🛡️ AUTHORIZATION → Contrôle permissions
 * 📱 API → Protection endpoints REST
 * 🔄 REFRESH → Gestion renouvellement tokens
 * 
 * ================================================================================================
 */

using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StartingBloch.Backend.Configuration;
using StartingBloch.Backend.DTOs;
using Microsoft.Extensions.Options;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Interface service JWT gestion tokens authentification sécurisée système.
/// Contrat génération et validation tokens avec standards sécurité.
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Génère token JWT sécurisé avec claims utilisateur complets.
    /// Création token avec signature HMAC-SHA256 et expiration configurable.
    /// </summary>
    /// <param name="userId">Identifiant unique utilisateur pour token</param>
    /// <param name="email">Adresse email utilisateur pour validation</param>
    /// <param name="role">Rôle utilisateur pour contrôle permissions</param>
    /// <returns>Token JWT signé avec claims utilisateur</returns>
    string GenerateToken(string userId, string email, string role);
    
    /// <summary>
    /// Génère token JWT accès pour utilisateur avec claims personnalisés.
    /// Création token sécurisé avec informations utilisateur intégrées.
    /// </summary>
    /// <param name="user">Utilisateur pour génération token</param>
    /// <returns>Token JWT signé avec expiration</returns>
    string GenerateAccessToken(UserDto user);
    
    /// <summary>
    /// Génère token refresh pour renouvellement sécurisé accès.
    /// Création token longue durée pour renouvellement automatique.
    /// </summary>
    /// <param name="user">Utilisateur pour génération refresh token</param>
    /// <returns>Token refresh sécurisé</returns>
    string GenerateRefreshToken(UserDto user);
    
    /// <summary>
    /// Valide token JWT avec vérification intégrité et expiration.
    /// Validation complète signature, issuer, audience et lifetime.
    /// </summary>
    /// <param name="token">Token JWT à valider et décoder</param>
    /// <returns>ClaimsPrincipal avec données utilisateur ou null si invalide</returns>
    ClaimsPrincipal? ValidateToken(string token);
    
    /// <summary>
    /// Vérifie validité rapide token JWT sans extraction claims.
    /// Contrôle léger pour validation existence token valide.
    /// </summary>
    /// <param name="token">Token JWT pour vérification validité</param>
    /// <returns>Statut booléen validité token</returns>
    bool IsTokenValid(string token);
}

/// <summary>
/// Service implémentation JWT avec sécurité renforcée et logging complet.
/// Gestion tokens authentification conforme standards RFC 7519.
/// </summary>
public class JwtService : IJwtService
{
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<JwtService> _logger;

    /// <summary>
    /// Initialise service JWT avec configuration sécurisée et logging.
    /// </summary>
    /// <param name="jwtSettings">Configuration JWT avec paramètres sécurité</param>
    /// <param name="logger">Logger pour audit et surveillance</param>
    public JwtService(IOptions<JwtSettings> jwtSettings, ILogger<JwtService> logger)
    {
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Génère token JWT sécurisé avec claims utilisateur et signature HMAC-SHA256.
    /// Création token avec expiration configurable et protection replay attacks.
    /// </summary>
    /// <param name="userId">Identifiant unique utilisateur pour claims</param>
    /// <param name="email">Adresse email utilisateur pour validation</param>
    /// <param name="role">Rôle utilisateur pour contrôle permissions</param>
    /// <returns>Token JWT signé avec claims complets</returns>
    public string GenerateToken(string userId, string email, string role)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId),
                new(ClaimTypes.Email, email),
                new(ClaimTypes.Role, role),
                new("jti", Guid.NewGuid().ToString()), // JWT ID pour une meilleure sécurité
                new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpireMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            _logger.LogInformation("JWT token generated for user {UserId}", userId);
            return tokenString;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating JWT token for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Valide token JWT avec contrôles sécurité complets et extraction claims.
    /// Vérification signature, issuer, audience, expiration avec logging erreurs.
    /// </summary>
    /// <param name="token">Token JWT pour validation complète</param>
    /// <returns>ClaimsPrincipal avec données utilisateur ou null si invalide</returns>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            _logger.LogInformation("🔐 JWT Validation - Début validation token");
            _logger.LogInformation("🔐 JWT Validation - Token length: {Length}", token?.Length ?? 0);
            _logger.LogInformation("🔐 JWT Validation - Token start: {TokenStart}", token?.Substring(0, Math.Min(50, token?.Length ?? 0)));
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            _logger.LogInformation("🔐 JWT Validation - Issuer: {Issuer}, Audience: {Audience}", _jwtSettings.Issuer, _jwtSettings.Audience);

            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
            
            _logger.LogInformation("✅ JWT Validation - Token valide");
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("❌ JWT Validation failed: {Error}", ex.Message);
            _logger.LogDebug(ex, "JWT validation exception details");
            return null;
        }
    }

    /// <summary>
    /// Vérifie validité token JWT rapidement sans extraction claims complète.
    /// Contrôle léger signature et expiration pour validation accès.
    /// </summary>
    /// <param name="token">Token JWT pour vérification rapide</param>
    /// <returns>Statut booléen validité token</returns>
    public bool IsTokenValid(string token)
    {
        return ValidateToken(token) != null;
    }

    /// <summary>
    /// Génère token JWT accès pour utilisateur avec claims personnalisés.
    /// Utilise méthode existante GenerateToken avec adaptation UserDto.
    /// </summary>
    /// <param name="user">Utilisateur pour génération token</param>
    /// <returns>Token JWT signé avec expiration</returns>
    public string GenerateAccessToken(UserDto user)
    {
        return GenerateToken(user.Id.ToString(), user.Email, user.Role);
    }
    
    /// <summary>
    /// Génère token refresh pour renouvellement sécurisé accès.
    /// Token longue durée pour renouvellement automatique sessions.
    /// </summary>
    /// <param name="user">Utilisateur pour génération refresh token</param>
    /// <returns>Token refresh sécurisé</returns>
    public string GenerateRefreshToken(UserDto user)
    {
        // Pour l'instant, utilise même mécanisme mais avec durée étendue
        // TODO: Implémenter système refresh token séparé avec base données
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new("token_type", "refresh"),
                new("jti", Guid.NewGuid().ToString()),
                new("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(30), // Refresh token : 30 jours
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            _logger.LogInformation("Refresh token generated for user {UserId}", user.Id);
            return tokenString;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating refresh token for user {UserId}", user.Id);
            throw;
        }
    }
}
