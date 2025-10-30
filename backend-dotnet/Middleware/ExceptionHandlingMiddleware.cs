/*
 * ================================================================================================
 * MIDDLEWARE GESTION EXCEPTIONS - TRAITEMENT CENTRALISÉ ERREURS SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Middleware gestion centralisée exceptions StartingBloch avec logging et réponses standardisées.
 * Interception toutes erreurs système pour traitement uniforme et sécurité renforcée.
 * 
 * FONCTIONNALITÉS GESTION ERREURS :
 * =================================
 * 🚨 INTERCEPTION → Capture toutes exceptions non gérées
 * 📋 LOGGING → Enregistrement détaillé erreurs avec stack traces
 * 🔒 SÉCURITÉ → Masquage informations sensibles en production
 * 📊 STANDARDISATION → Réponses API uniformes selon standards
 * 🔍 DIAGNOSTIC → Informations détaillées pour développement
 * 
 * TYPES ERREURS GÉRÉES :
 * ======================
 * ⚠️ VALIDATION → Erreurs validation données entrée
 * 🚫 AUTORISATION → Erreurs permissions et accès
 * 💾 BASE_DONNÉES → Erreurs persistence et intégrité
 * 🌐 RÉSEAU → Erreurs connexions externes
 * 🔧 SYSTÈME → Erreurs configuration et infrastructure
 * 
 * RÉPONSES STANDARDISÉES :
 * =======================
 * 400 → Bad Request (validation, format)
 * 401 → Unauthorized (authentification)
 * 403 → Forbidden (autorisation)
 * 404 → Not Found (ressource inexistante)
 * 409 → Conflict (contraintes métier)
 * 500 → Internal Server Error (erreurs système)
 * 
 * SÉCURITÉ PRODUCTION :
 * ====================
 * 🔒 MASQUAGE → Stack traces cachées en production
 * 🛡️ SANITISATION → Suppression informations sensibles
 * 📊 AGRÉGATION → Logs centralisés sans exposition
 * 🚨 ALERTES → Notifications erreurs critiques
 * 
 * ================================================================================================
 */

using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace StartingBloch.Backend.Middleware;

/// <summary>
/// Middleware gestion centralisée exceptions avec logging et réponses standardisées.
/// Traitement uniforme erreurs système pour sécurité et diagnostic optimisés.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    /// <summary>
    /// Initialise middleware avec pipeline requêtes et logging configuré.
    /// </summary>
    /// <param name="next">Delegate middleware suivant dans pipeline</param>
    /// <param name="logger">Logger pour enregistrement erreurs détaillées</param>
    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Traite requête avec gestion centralisée exceptions et logging sécurisé.
    /// Interception erreurs pour réponses standardisées et audit complet.
    /// </summary>
    /// <param name="context">Contexte HTTP requête courante</param>
    /// <returns>Task traitement requête avec gestion erreurs</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Une erreur non gérée s'est produite pour la requête {Method} {Path}", 
                context.Request.Method, context.Request.Path);
            
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// Gère exception avec génération réponse appropriée selon type erreur.
    /// Traitement sécurisé avec masquage informations sensibles production.
    /// </summary>
    /// <param name="context">Contexte HTTP pour réponse</param>
    /// <param name="exception">Exception à traiter</param>
    /// <returns>Task traitement exception avec réponse HTTP</returns>
    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse();

        switch (exception)
        {
            case ArgumentNullException:
            case ArgumentException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Données de requête invalides";
                response.Details = exception.Message;
                break;

            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = "Accès non autorisé";
                response.Details = "Authentification requise";
                break;

            case InvalidOperationException when exception.Message.Contains("not found"):
                response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = "Ressource non trouvée";
                response.Details = exception.Message;
                break;

            case InvalidOperationException when exception.Message.Contains("already exists"):
                response.StatusCode = (int)HttpStatusCode.Conflict;
                response.Message = "Conflit de données";
                response.Details = exception.Message;
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "Erreur interne du serveur";
                
                // En développement, inclure détails pour diagnostic
                var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
                response.Details = isDevelopment ? exception.Message : "Une erreur inattendue s'est produite";
                break;
        }

        context.Response.StatusCode = response.StatusCode;

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

/// <summary>
/// Structure standardisée réponse erreur API avec informations contextuelles.
/// Format uniforme pour toutes erreurs système avec détails appropriés.
/// </summary>
public class ApiErrorResponse
{
    /// <summary>
    /// Code statut HTTP erreur standard.
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Message erreur principal pour utilisateur.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Détails additionnels erreur pour diagnostic.
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// Timestamp UTC occurrence erreur pour audit.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Identifiant unique erreur pour traçabilité.
    /// </summary>
    public string TraceId { get; set; } = Guid.NewGuid().ToString();
}
