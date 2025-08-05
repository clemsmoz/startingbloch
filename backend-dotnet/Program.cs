/*
 * ================================================================================================
 * STAR// *** ÉTAPE 8: ROUTAGE ET ENDPOINTS ***
// Mappage des contrôleurs - Activation des routes API
app.MapControllers();

// *** ENDPOINT DE SANTÉ SYSTÈME ***
// Point de contrôle pour monitoring et load balancers
// Accessible sans authentification pour les checks automatiques
app.MapGet("/api/health", () => new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    version = "1.0.0",
    database = "SQLite",
    framework = ".NET 8"
}).AllowAnonymous();

// ================================================================================================
// INITIALISATION DE LA BASE DE DONNÉES
// ================================================================================================

// *** MIGRATION ET CRÉATION DE LA BASE AUTOMATIQUE ***
// Assure que la base de données SQLite existe et est à jour au démarrage
// Utilisation d'un scope pour éviter les fuites mémoire
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<StartingBlochDbContext>();
    await context.Database.EnsureCreatedAsync();
}

// ================================================================================================
// DÉMARRAGE DE L'APPLICATION
// ================================================================================================

// Lancement du serveur web avec tous les middlewares configurés
app.Run();I - POINT D'ENTRÉE PRINCIPAL
 * ================================================================================================
 * 
 * Description: Configuration et démarrage de l'API REST pour la gestion des brevets d'entreprise.
 * 
 * Fonctionnalités principales:
 * - Gestion des brevets et de leur cycle de vie
 * - Système d'authentification JWT sécurisé
 * - Interface multi-clients avec isolation des données
 * - Audit trail complet pour conformité RGPD
 * - Protection contre les attaques (Rate limiting, XSS, CSRF, etc.)
 * 
 * Architecture:
 * - .NET 8 avec Entity Framework Core
 * - Base de données SQLite pour développement
 * - Logging avancé avec Serilog
 * - Validation avec FluentValidation
 * - Sécurité multi-couches (8 niveaux de protection)
 * 
 * Auteur: StartingBloch Team
 * Dernière mise à jour: 2025-07-28
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Extensions;
using StartingBloch.Backend.Middleware;
using StartingBloch.Backend.Configuration;
using System.Text.Json.Serialization;
using AspNetCoreRateLimit;
using Serilog;
using DotNetEnv;

// ================================================================================================
// CONFIGURATION DE L'APPLICATION
// ================================================================================================

var builder = WebApplication.CreateBuilder(args);

// *** CHARGEMENT DES VARIABLES D'ENVIRONNEMENT ***
// Chargement du fichier .env pour les variables de configuration
Env.Load();

// *** CONFIGURATION PERSONNALISÉE AVEC VARIABLES D'ENVIRONNEMENT ***
// Remplacement des placeholders ${VAR} dans appsettings.json
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["Jwt:Secret"] = Environment.GetEnvironmentVariable("JWT_SECRET"),
    ["Jwt:Issuer"] = Environment.GetEnvironmentVariable("JWT_ISSUER"),
    ["Jwt:Audience"] = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
    ["Jwt:ExpireMinutes"] = Environment.GetEnvironmentVariable("JWT_EXPIRE_MINUTES"),
    ["Security:EnableRateLimiting"] = Environment.GetEnvironmentVariable("ENABLE_RATE_LIMITING"),
    ["Security:MaxRequestsPerMinute"] = Environment.GetEnvironmentVariable("MAX_REQUESTS_PER_MINUTE"),
    ["Security:EnableHttpsRedirect"] = Environment.GetEnvironmentVariable("ENABLE_HTTPS_REDIRECT")
});

// *** ÉTAPE 1: CONFIGURATION SERILOG (LOGGING SÉCURISÉ) ***
// Configuration du système de logging avancé avant tout autre service
// Permet de capturer tous les événements de sécurité et erreurs dès le démarrage
SerilogConfiguration.ConfigureSerilog(builder);
builder.Host.UseSerilog();

// *** ÉTAPE 2: CONFIGURATION DES SERVICES CORE ***
// Configuration des contrôleurs avec options JSON optimisées
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Évite les références circulaires dans la sérialisation JSON
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Conserve les noms de propriétés originaux (pas de camelCase automatique)
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// *** ÉTAPE 3: CONFIGURATION DES SERVICES MÉTIER ***
// Ajout de tous les services business, sécurité, base de données via extension
// Voir ServiceCollectionExtensions.cs pour le détail de la configuration
builder.Services.AddApplicationServices(builder.Configuration);

// ================================================================================================
// PIPELINE DE TRAITEMENT DES REQUÊTES (MIDDLEWARE)
// ================================================================================================

var app = builder.Build();

// *** ÉTAPE 4: CONFIGURATION ENVIRONNEMENT DE DÉVELOPPEMENT ***
// Pipeline des middlewares - ORDRE CRITIQUE pour la sécurité
if (app.Environment.IsDevelopment())
{
    // Documentation API Swagger uniquement en développement
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "StartingBloch API v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    // *** PRODUCTION: REDIRECTION HTTPS OBLIGATOIRE ***
    // Force toutes les connexions en HTTPS pour sécuriser les échanges
    app.UseHttpsRedirection();
}

// *** ÉTAPE 5: MIDDLEWARES DE SÉCURITÉ (ORDRE CRITIQUE!) ***
// 1. Headers de sécurité (XSS, CSRF, Clickjacking protection)
app.UseMiddleware<SecurityHeadersMiddleware>();

// 2. Monitoring de sécurité (détection d'intrusion en temps réel)
app.UseMiddleware<SecurityMonitoringMiddleware>();

// 3. Logging des requêtes (audit trail pour conformité)
app.UseMiddleware<RequestLoggingMiddleware>();

// *** ÉTAPE 6: CONTRÔLES D'ACCÈS ET LIMITATION ***
// 4. Rate Limiting - Protection anti-DDoS (AVANT CORS et Authentication)
app.UseIpRateLimiting();

// 5. CORS - Politique de partage inter-domaines (APRÈS Rate Limiting)
app.UseCors("AllowReactApp");

// *** ÉTAPE 7: AUTHENTIFICATION ET AUTORISATION ***
// 6. Authentification JWT (validation des tokens)
app.UseAuthentication();

// 7. Autorisation (vérification des permissions)
app.UseAuthorization();

// Mappage des contrôleurs
app.MapControllers();

// Endpoint de santé sécurisé
app.MapGet("/api/health", () => new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    version = "1.0.0",
    database = "SQLite",
    framework = ".NET 8"
}).AllowAnonymous();

// Initialisation de la base de données
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<StartingBlochDbContext>();
    await context.Database.EnsureCreatedAsync();
    
    // Seed des données de test massives uniquement si argument --seed-massive
    if (args.Contains("--seed-massive"))
    {
        Console.WriteLine("🌱 Initialisation des données de test...");
        await SeedMassiveData.SeedAsync(context);
        Console.WriteLine("✅ Seed des données de test terminé !");
        return; // Arrêter l'application après le seed
    }
}

await app.RunAsync();

// Classe Program publique pour tests d'intégration
public partial class Program { }
