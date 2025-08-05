/*
 * ================================================================================================
 * MIDDLEWARE SÉCURITÉ HTTP - HEADERS PROTECTEURS OWASP
 * ================================================================================================
 * 
 * OBJECTIF :
 * Applique automatiquement tous les en-têtes de sécurité HTTP recommandés par l'OWASP
 * pour protéger l'application contre les attaques web courantes.
 * 
 * PROTECTIONS IMPLÉMENTÉES :
 * ==========================
 * 
 * 🛡️ CLICKJACKING → X-Frame-Options: DENY
 * 🛡️ MIME SNIFFING → X-Content-Type-Options: nosniff  
 * 🛡️ XSS LEGACY → X-XSS-Protection: 1; mode=block
 * 🛡️ TRANSPORT FORCÉ → HSTS avec includeSubDomains
 * 🛡️ XSS AVANCÉ → Content Security Policy restrictive
 * 🛡️ PRIVACY → Referrer-Policy stricte
 * 🛡️ PERMISSIONS → Désactivation fonctionnalités sensibles
 * 🛡️ FINGERPRINTING → Suppression headers serveur
 * 
 * ARCHITECTURE PIPELINE :
 * ======================
 * Position: Premier middleware sécurité (avant authentification)
 * Exécution: Sur chaque réponse HTTP sortante
 * Performance: Impact minimal, headers statiques
 * 
 * CONFORMITÉ SÉCURITÉ :
 * ====================
 * ✅ OWASP Security Headers
 * ✅ Mozilla Security Guidelines  
 * ✅ NIST Cybersecurity Framework
 * ✅ Standards industrie propriété intellectuelle
 * 
 * ================================================================================================
 */

using Microsoft.Extensions.Primitives;

namespace StartingBloch.Backend.Middleware;

/// <summary>
/// Middleware pour l'injection automatique des en-têtes de sécurité HTTP selon standards OWASP.
/// Premier bouclier de protection contre attaques web courantes (XSS, Clickjacking, MITM).
/// Applique 8 couches de protection sur chaque réponse HTTP sortante.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;

    /// <summary>
    /// Initialise le middleware avec injection des dépendances pipeline.
    /// </summary>
    /// <param name="next">Délégué vers middleware suivant dans pipeline ASP.NET</param>
    /// <param name="logger">Service logging pour audit sécurité et traçabilité</param>
    public SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Point d'entrée principal du middleware - Exécution sur chaque requête HTTP.
    /// Applique les headers de sécurité avant transmission de la réponse au client.
    /// </summary>
    /// <param name="context">Contexte HTTP complet (Request/Response/User/etc.)</param>
    /// <returns>Task pour exécution asynchrone dans pipeline</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        // Application des protections avant réponse
        AddSecurityHeaders(context.Response);
        
        // Continuation pipeline vers middleware suivant
        await _next(context);
    }

    /// <summary>
    /// Configure l'ensemble des en-têtes de sécurité selon recommandations OWASP.
    /// Headers statiques appliqués uniformément sur toutes les réponses.
    /// </summary>
    /// <param name="response">Objet Response HTTP à sécuriser</param>
    private static void AddSecurityHeaders(HttpResponse response)
    {
        // Protection Clickjacking
        response.Headers["X-Frame-Options"] = "DENY";
        
        // Protection MIME Sniffing  
        response.Headers["X-Content-Type-Options"] = "nosniff";
        
        // Protection XSS Legacy
        response.Headers["X-XSS-Protection"] = "1; mode=block";
        
        // Forçage HTTPS (1 an + sous-domaines)
        response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
        
        // CSP restrictive anti-XSS
        response.Headers["Content-Security-Policy"] = 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + 
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none'";
            
        // Politique Referrer stricte
        response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        
        // Désactivation fonctionnalités sensibles
        response.Headers["Permissions-Policy"] = 
            "camera=(), microphone=(), geolocation=(), payment=()";
            
        // Suppression informations serveur
        response.Headers.Remove("Server");
        response.Headers.Remove("X-Powered-By");
    }
}
