/*
 * ================================================================================================
 * MIDDLEWARE LOGGING REQUÊTES - AUDIT TRAIL CONFORMITÉ RGPD
 * ================================================================================================
 * 
 * OBJECTIF :
 * Assure la traçabilité complète des actions utilisateurs sur l'API de gestion
 * de propriété intellectuelle pour conformité réglementaire et audit sécurité.
 * 
 * FONCTIONNALITÉS AUDIT :
 * =======================
 * 
 * 📊 LOGGING SÉLECTIF :
 *    ✅ POST/PUT/DELETE : Toutes modifications données
 *    ✅ API endpoints : Consultation données sensibles
 *    ❌ Health checks : Endpoints techniques
 *    ❌ Swagger : Documentation
 * 
 * 🔍 DONNÉES TRACÉES :
 *    - Action complète (méthode + endpoint)
 *    - Durée exécution (performance monitoring)
 *    - Code statut HTTP (succès/échec)
 *    - Adresse IP origine (géolocalisation audit)
 *    - User-Agent (identification client)
 *    - Horodatage précis UTC
 * 
 * 🚨 GESTION ERREURS :
 *    - Capture exceptions complètes
 *    - Logging erreurs avec stack trace
 *    - Continuation pipeline même si logging échoue
 *    - Fallback console si DB indisponible
 * 
 * CONFORMITÉ RÉGLEMENTAIRE :
 * ==========================
 * ✅ RGPD Article 30 : Registre activités traitement
 * ✅ ISO 27001 : Logging événements sécurité
 * ✅ Propriété Intellectuelle : Traçabilité accès brevets
 * ✅ Audit légal : Preuves pour contentieux
 * 
 * ARCHITECTURE PERFORMANCE :
 * ==========================
 * - Logging asynchrone (non-bloquant)
 * - Filtrage intelligent (évite surcharge)
 * - Mesure performance (Stopwatch précis)
 * - Résilience (isolation erreurs logging)
 * 
 * ================================================================================================
 */

using StartingBloch.Backend.Data;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Middleware;

/// <summary>
/// Middleware de logging automatique des requêtes HTTP pour audit et conformité RGPD.
/// Trace toutes les actions critiques sur l'API de propriété intellectuelle avec
/// mesure de performance et gestion d'erreurs résiliente.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    /// <summary>
    /// Initialise le middleware de logging avec injection dépendances.
    /// </summary>
    /// <param name="next">Délégué vers middleware suivant dans pipeline</param>
    /// <param name="logger">Service logging structuré Serilog</param>
    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Point d'entrée principal - Trace et mesure chaque requête HTTP.
    /// Capture timing, erreurs et métadonnées pour audit complet.
    /// </summary>
    /// <param name="context">Contexte HTTP complet de la requête</param>
    /// <param name="dbContext">Contexte base données pour persistence logs</param>
    /// <returns>Task pour exécution asynchrone</returns>
    public async Task InvokeAsync(HttpContext context, StartingBlochDbContext dbContext)
    {
        var startTime = DateTime.UtcNow;
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            // Exécution middleware suivant avec mesure timing
            await _next(context);
        }
        catch (Exception ex)
        {
            // Logging erreur structuré avec contexte complet
            _logger.LogError(ex, "Erreur lors du traitement de la requête {Method} {Path}", 
                context.Request.Method, context.Request.Path);

            // Persistence erreur en base pour audit
            await LogRequestAsync(dbContext, context, startTime, stopwatch.ElapsedMilliseconds, "error", ex.Message);
            
            // Re-lancement exception (ne pas interrompre pipeline)
            throw;
        }

        // Logging sélectif requêtes importantes uniquement
        if (ShouldLogRequest(context))
        {
            await LogRequestAsync(dbContext, context, startTime, stopwatch.ElapsedMilliseconds);
        }

        stopwatch.Stop();
    }

    /// <summary>
    /// Détermine si une requête doit être tracée selon criticité métier.
    /// Filtre intelligent pour éviter pollution logs avec trafic technique.
    /// </summary>
    /// <param name="context">Contexte HTTP pour analyse endpoint</param>
    /// <returns>True si requête doit être loggée</returns>
    private static bool ShouldLogRequest(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";
        var method = context.Request.Method.ToUpper();

        // Exclusion endpoints techniques (health, documentation)
        if (path.Contains("/health") || path.Contains("/swagger"))
            return false;

        // Logging obligatoire : modifications données (audit RGPD)
        if (method is "POST" or "PUT" or "DELETE")
            return true;

        // Logging API métier : consultation données propriété intellectuelle
        if (path.StartsWith("/api/"))
            return true;

        return false;
    }

    /// <summary>
    /// Persiste les détails de la requête en base pour audit trail complet.
    /// Capture métadonnées essentielles avec gestion d'erreurs résiliente.
    /// </summary>
    /// <param name="dbContext">Contexte base données</param>
    /// <param name="context">Contexte HTTP source</param>
    /// <param name="startTime">Horodatage début requête</param>
    /// <param name="durationMs">Durée exécution en millisecondes</param>
    /// <param name="level">Niveau log (info/error/warning)</param>
    /// <param name="errorMessage">Message d'erreur si applicable</param>
    /// <returns>Task pour persistence asynchrone</returns>
    private static async Task LogRequestAsync(
        StartingBlochDbContext dbContext, 
        HttpContext context, 
        DateTime startTime, 
        long durationMs, 
        string level = "info", 
        string? errorMessage = null)
    {
        try
        {
            // Construction log avec métadonnées complètes
            var log = new Log
            {
                Action = $"{context.Request.Method} {context.Request.Path}",
                Details = errorMessage ?? $"Durée: {durationMs}ms, Status: {context.Response.StatusCode}",
                IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                UserAgent = context.Request.Headers.UserAgent.ToString(),
                Level = level,
                CreatedAt = startTime
            };

            // Persistence asynchrone avec commit transaction
            dbContext.Logs.Add(log);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Fallback résilient : pas d'interruption application si logging échoue
            Console.WriteLine($"Erreur lors du logging: {ex.Message}");
        }
    }
}
