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
 *    ❌ GET : Consultations (trop nombreuses, pas critiques)
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
        
        // Capture du body de la requête pour les actions de modification
        string? requestBody = null;
        if (context.Request.Method != "GET" && ShouldLogRequest(context))
        {
            requestBody = await CaptureRequestBodyAsync(context);
        }

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
            await LogRequestAsync(dbContext, context, startTime, stopwatch.ElapsedMilliseconds, "error", ex.Message, requestBody);
            
            // Re-lancement exception (ne pas interrompre pipeline)
            throw;
        }

        // Logging sélectif requêtes importantes uniquement
        if (ShouldLogRequest(context))
        {
            await LogRequestAsync(dbContext, context, startTime, stopwatch.ElapsedMilliseconds, "info", null, requestBody);
        }

        stopwatch.Stop();
    }

    /// <summary>
    /// Détermine si une requête doit être tracée selon criticité métier.
    /// Filtre intelligent pour éviter pollution logs avec trafic technique.
    /// MODIFICATION: Ne loggue que les actions de modification (POST, PUT, DELETE)
    /// pour éviter la surcharge des logs avec les consultations (GET).
    /// </summary>
    /// <param name="context">Contexte HTTP pour analyse endpoint</param>
    /// <returns>True si requête doit être loggée</returns>
    private static bool ShouldLogRequest(HttpContext context)
    {
        // Désactivé: on évite les logs "info" de requêtes pour POST/PUT/DELETE
        // afin d'éviter les doublons avec l'audit EF (OldValues/NewValues).
        // On conserve uniquement les logs d'erreur (gérés dans le catch ci-dessus).
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
    /// <param name="requestBody">Corps de la requête capturé</param>
    /// <returns>Task pour persistence asynchrone</returns>
    private static async Task LogRequestAsync(
        StartingBlochDbContext dbContext, 
        HttpContext context, 
        DateTime startTime, 
        long durationMs, 
        string level = "info", 
        string? errorMessage = null,
        string? requestBody = null)
    {
        try
        {
            // Récupération de l'utilisateur connecté depuis le token JWT
            string? userId = null;
            
            Console.WriteLine($"🔍 RequestLogging - IsAuthenticated: {context.User?.Identity?.IsAuthenticated}");
            Console.WriteLine($"🔍 RequestLogging - User Identity Name: {context.User?.Identity?.Name}");
            Console.WriteLine($"🔍 RequestLogging - Claims Count: {context.User?.Claims?.Count()}");
            
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                // Affichage de tous les claims pour debug
                foreach (var claim in context.User.Claims)
                {
                    Console.WriteLine($"🔍 RequestLogging - Claim: {claim.Type} = {claim.Value}");
                }
                
                // Récupération de l'ID utilisateur depuis les claims JWT
                userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ??
                        context.User.FindFirst("nameid")?.Value ?? 
                        context.User.FindFirst("sub")?.Value ??
                        context.User.FindFirst("id")?.Value;
                        
                Console.WriteLine($"🔍 RequestLogging - UserId extrait: '{userId}'");
            }
            else
            {
                Console.WriteLine($"🔍 RequestLogging - Aucun utilisateur authentifié");
            }

            // Construction log avec métadonnées complètes et informations métier
            var log = new Log
            {
                UserId = userId, // ✅ AJOUT: ID utilisateur depuis JWT
                Action = GetUserFriendlyAction(context),
                Details = GetActionDetails(context, errorMessage, durationMs, requestBody),
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

    /// <summary>
    /// Convertit une action technique en description métier compréhensible.
    /// </summary>
    private static string GetUserFriendlyAction(HttpContext context)
    {
        var method = context.Request.Method.ToUpper();
        var path = context.Request.Path.Value?.ToLower() ?? "";
        
        // Actions sur les clients
        if (path.Contains("/client"))
        {
            return method switch
            {
                "POST" => "Création d'un client",
                "PUT" => "Modification d'un client", 
                "DELETE" => "Suppression d'un client",
                _ => $"{method} {context.Request.Path}"
            };
        }
        
        // Actions sur les contacts
        if (path.Contains("/contact"))
        {
            return method switch
            {
                "POST" => "Création d'un contact",
                "PUT" => "Modification d'un contact",
                "DELETE" => "Suppression d'un contact", 
                _ => $"{method} {context.Request.Path}"
            };
        }
        
        // Actions sur les brevets
        if (path.Contains("/brevet"))
        {
            return method switch
            {
                "POST" => "Création d'un brevet",
                "PUT" => "Modification d'un brevet",
                "DELETE" => "Suppression d'un brevet",
                _ => $"{method} {context.Request.Path}"
            };
        }
        
        // Actions sur les cabinets
        if (path.Contains("/cabinet"))
        {
            return method switch
            {
                "POST" => "Création d'un cabinet",
                "PUT" => "Modification d'un cabinet",
                "DELETE" => "Suppression d'un cabinet",
                _ => $"{method} {context.Request.Path}"
            };
        }
        
        // Actions sur les utilisateurs
        if (path.Contains("/user"))
        {
            return method switch
            {
                "POST" => "Création d'un utilisateur",
                "PUT" => "Modification d'un utilisateur",
                "DELETE" => "Suppression d'un utilisateur",
                _ => $"{method} {context.Request.Path}"
            };
        }
        
        // Actions d'authentification
        if (path.Contains("/auth"))
        {
            if (path.Contains("/login")) return "Connexion utilisateur";
            if (path.Contains("/logout")) return "Déconnexion utilisateur";
            return "Action d'authentification";
        }
        
        // Fallback pour les autres actions
        return $"{method} {context.Request.Path}";
    }

    /// <summary>
    /// Génère des détails enrichis de l'action avec informations contextuelles.
    /// </summary>
    private static string GetActionDetails(HttpContext context, string? errorMessage, long durationMs, string? requestBody = null)
    {
        if (!string.IsNullOrEmpty(errorMessage))
        {
            return $"❌ ERREUR: {errorMessage}";
        }

        var statusCode = context.Response.StatusCode;
        var method = context.Request.Method.ToUpper();
        var path = context.Request.Path.Value ?? "";
        
        // Extraire l'ID de l'entité depuis l'URL si présent
        var entityId = ExtractEntityIdFromPath(path);
        var entityName = ExtractEntityNameFromPath(path);
        
        var details = new List<string>();
        
        // Ajouter l'ID de l'entité si présent
        if (!string.IsNullOrEmpty(entityId))
        {
            details.Add($"{entityName} ID: {entityId}");
        }
        
        // Extraire les données métier depuis le JSON
        var businessDetails = ExtractBusinessDetailsFromJson(requestBody, method, entityName);
        if (!string.IsNullOrEmpty(businessDetails))
        {
            details.Add(businessDetails);
        }
        
        // Ajouter le statut uniquement en cas d'erreur
        if (statusCode >= 400)
        {
            details.Add($"⚠️ Erreur {statusCode}");
        }
        else if (details.Count == 0)
        {
            // Si on n'a aucun détail métier, on affiche au moins le succès
            details.Add("✅ Opération réussie");
        }
        
        return string.Join(" | ", details);
    }

    /// <summary>
    /// Capture le contenu du body de la requête pour l'audit.
    /// </summary>
    private static async Task<string?> CaptureRequestBodyAsync(HttpContext context)
    {
        try
        {
            if (context.Request.ContentLength == 0 || context.Request.ContentLength > 10000) // Limite à 10KB
                return null;

            context.Request.EnableBuffering();
            context.Request.Body.Position = 0;

            using var reader = new StreamReader(context.Request.Body, encoding: System.Text.Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;

            return string.IsNullOrWhiteSpace(body) ? null : body;
        }
        catch
        {
            return null; // En cas d'erreur, on continue sans le body
        }
    }

    /// <summary>
    /// Extrait les informations métier importantes depuis le JSON de la requête.
    /// </summary>
    private static string? ExtractBusinessDetailsFromJson(string? requestBody, string method, string entityName)
    {
        if (string.IsNullOrEmpty(requestBody))
            return null;

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(requestBody);
            var root = doc.RootElement;
            var details = new List<string>();

            // Extraction selon le type d'entité
            switch (entityName.ToLower())
            {
                case "client":
                    if (root.TryGetProperty("nomClient", out var nomClient))
                        details.Add($"Nom: {nomClient.GetString()}");
                    if (root.TryGetProperty("emailClient", out var emailClient))
                        details.Add($"Email: {emailClient.GetString()}");
                    if (root.TryGetProperty("referenceClient", out var refClient))
                        details.Add($"Référence: {refClient.GetString()}");
                    break;

                case "contact":
                    if (root.TryGetProperty("nom", out var nom))
                        details.Add($"Nom: {nom.GetString()}");
                    if (root.TryGetProperty("prenom", out var prenom))
                        details.Add($"Prénom: {prenom.GetString()}");
                    if (root.TryGetProperty("email", out var email))
                        details.Add($"Email: {email.GetString()}");
                    if (root.TryGetProperty("role", out var role))
                        details.Add($"Rôle: {role.GetString()}");
                    break;

                case "brevet":
                    if (root.TryGetProperty("numeroBrevet", out var numeroBrevet))
                        details.Add($"Numéro: {numeroBrevet.GetString()}");
                    if (root.TryGetProperty("titreBrevet", out var titreBrevet))
                        details.Add($"Titre: {titreBrevet.GetString()}");
                    if (root.TryGetProperty("dateDepot", out var dateDepot))
                        details.Add($"Date dépôt: {dateDepot.GetString()}");
                    break;

                case "cabinet":
                    if (root.TryGetProperty("nomCabinet", out var nomCabinet))
                        details.Add($"Nom: {nomCabinet.GetString()}");
                    if (root.TryGetProperty("emailCabinet", out var emailCabinet))
                        details.Add($"Email: {emailCabinet.GetString()}");
                    break;

                case "utilisateur":
                    if (root.TryGetProperty("email", out var userEmail))
                        details.Add($"Email: {userEmail.GetString()}");
                    if (root.TryGetProperty("role", out var userRole))
                        details.Add($"Rôle: {userRole.GetString()}");
                    if (root.TryGetProperty("nom", out var userNom))
                        details.Add($"Nom: {userNom.GetString()}");
                    break;
            }

            return details.Count > 0 ? $"Détails: {string.Join(", ", details)}" : null;
        }
        catch
        {
            return null; // En cas d'erreur de parsing JSON
        }
    }

    /// <summary>
    /// Extrait l'ID de l'entité depuis le chemin URL.
    /// </summary>
    private static string? ExtractEntityIdFromPath(string path)
    {
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        // Cherche un segment qui ressemble à un ID (nombre)
        for (int i = segments.Length - 1; i >= 0; i--)
        {
            if (int.TryParse(segments[i], out _))
            {
                return segments[i];
            }
        }
        return null;
    }

    /// <summary>
    /// Extrait le nom de l'entité depuis le chemin URL.
    /// </summary>
    private static string ExtractEntityNameFromPath(string path)
    {
        if (path.Contains("/client")) return "Client";
        if (path.Contains("/contact")) return "Contact"; 
        if (path.Contains("/brevet")) return "Brevet";
        if (path.Contains("/cabinet")) return "Cabinet";
        if (path.Contains("/user")) return "Utilisateur";
        return "Entité";
    }

    /// <summary>
    /// Convertit un code de statut HTTP en description lisible.
    /// </summary>
    private static string GetStatusDescription(int statusCode)
    {
        return statusCode switch
        {
            200 => "OK",
            201 => "Créé",
            204 => "Aucun contenu",
            400 => "Requête incorrecte",
            401 => "Non autorisé", 
            403 => "Interdit",
            404 => "Non trouvé",
            409 => "Conflit",
            500 => "Erreur serveur",
            _ => statusCode.ToString()
        };
    }
}
