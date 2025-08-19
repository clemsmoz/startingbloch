/*
 * ================================================================================================
 * EXTENSION DE CONFIGURATION DES SERVICES - ARCHITECTURE 8 COUCHES SÉCURISÉE
 * ================================================================================================
 * 
 * DESCRIPTION GÉNÉRALE :
 * Ce fichier centralise l'enregistrement de tous les services pour l'architecture de gestion
 * de propriété intellectuelle avec protection 8 couches et conformité réglementaire complète.
 * 
 * ARCHITECTURE DES SERVICES - SPÉCIALISÉE PROPRIÉTÉ INTELLECTUELLE :
 * ==================================================================
 * 
 * 🗄️ COUCHE 1 - BASE DE DONNÉES TRANSACTIONNELLE :
 * - SQLite avec Entity Framework Core pour persistance sécurisée
 * - Gestion transactionnelle des brevets, inventions, droits IP
 * - Relations complexes : Brevets↔Inventeurs↔Clients↔Cabinets
 * - Audit trails pour traçabilité légale (exigence contentieux IP)
 * 
 * 🔐 COUCHE 2 - SÉCURITÉ PRIMAIRE RENFORCÉE :
 * - JWT avec validation stricte multi-critères (issuer, audience, lifetime, signature)
 * - Chiffrement AES secrets industriels et données confidentielles
 * - Rate Limiting anti-DDoS par IP avec compteurs mémoire cache
 * - CORS restrictif domaines autorisés uniquement (protection XSS)
 * 
 * 🏢 COUCHE 3 - SERVICES MÉTIER SPÉCIALISÉS IP :
 * - BrevetService : Lifecycle complet brevets (dépôt→délivrance→maintenance)
 * - ClientService : Portfolio clients avec droits propriété et confidentialité
 * - InventeurService : Gestion inventeurs, droits moraux, rémunérations
 * - ContactService : Relations professionnelles PI avec chiffrement données
 * - CabinetService : Mandataires propriété industrielle et représentation
 * - Services Référentiels : Pays (WIPO), statuts brevets, numérotation internationale
 * 
 * ✅ COUCHE 4 - VALIDATION ANTI-INJECTION :
 * - FluentValidation protection SQL injection et XSS avancées
 * - Validation métier spécifique PI (formats numéros brevets, dates priorité)
 * - Contrôles intégrité données sensibles (secrets industriels, inventions)
 * - Sanitisation entrées utilisateur avec patterns métier IP
 * 
 * 👤 COUCHE 5 - AUTORISATION GRANULAIRE :
 * - Politiques Admin/User pour accès différencié par rôle
 * - Contrôle granulaire opérations sensibles (modification brevets, accès secrets)
 * - Protection données confidentielles clients et inventions stratégiques
 * - Séparation droits consultation/modification selon profils utilisateur
 * 
 * 📊 COUCHE 6 - AUDIT ET CONFORMITÉ LÉGALE :
 * - Logging complet actions utilisateurs avec Serilog multi-sink
 * - Traçabilité obligatoire modifications brevets (conformité légale IP)
 * - Audit trails horodatés pour contentieux et litiges propriété
 * - Journalisation sécurisée avec rotation et archivage long terme
 * 
 * ⚡ COUCHE 7 - CACHE PERFORMANCE OPTIMISÉ :
 * - MemoryCache pour optimisation requêtes fréquentes brevets
 * - Cache intelligent compteurs rate limiting par IP client
 * - Amélioration temps réponse recherches complexes portfolio
 * - Gestion expiration cache selon criticité données
 * 
 * ⚙️ COUCHE 8 - CONFIGURATION SÉCURISÉE CENTRALISÉE :
 * - Liaison sécurisée configuration appsettings avec validation
 * - Paramètres JWT cryptographiquement sécurisés (clés, algorithmes)
 * - Configuration CORS et endpoints autorisés avec whitelist
 * - Variables environnement chiffrées pour secrets production
 * 
 * CONFORMITÉ RÉGLEMENTAIRE ET STANDARDS :
 * ======================================
 * 
 * 🇪🇺 RGPD (Règlement Général Protection Données) :
 * - Chiffrement données personnelles inventeurs et contacts
 * - Droit à l'oubli avec suppression sécurisée
 * - Consentement explicite traitement données sensibles
 * - Audit trails pour démonstration conformité
 * 
 * 🌍 STANDARDS PROPRIÉTÉ INTELLECTUELLE INTERNATIONAUX :
 * - Compatibilité WIPO (World Intellectual Property Organization)
 * - Normes EPO (European Patent Office) pour brevets européens
 * - Intégration USPTO pour brevets américains
 * - Support PCT (Patent Cooperation Treaty) international
 * 
 * 🏭 SÉCURITÉ INDUSTRIELLE ET SECRETS :
 * - Protection renforcée secrets industriels et innovations
 * - Chiffrement bout-en-bout documents confidentiels
 * - Contrôle accès granulaire selon niveau confidentialité
 * - Traçabilité consultations documents sensibles
 * 
 * ⚖️ AUDIT LÉGAL ET CONTENTIEUX :
 * - Traçabilité complète pour support contentieux IP
 * - Horodatage sécurisé toutes actions critiques
 * - Conservation logs selon exigences légales nationales
 * - Intégrité données pour validité juridique
 * 
 * CYCLES DE VIE SERVICES (PATTERNS DI) :
 * =====================================
 * - SCOPED : Services métier (1 instance/requête HTTP, cohérence transactionnelle)
 * - SINGLETON : Configuration, cache, rate limiting (partage global optimisé)
 * - TRANSIENT : Validators (nouvelle instance/injection, isolation validation)
 * 
 * RESPONSABILITÉS FONCTIONNELLES :
 * ===============================
 * - Configuration Entity Framework avec connexions sécurisées
 * - Services métier spécialisés gestion propriété intellectuelle
 * - Services sécurité (JWT, chiffrement, audit, protection)
 * - Middleware protection (Rate limiting anti-DDoS, CORS restrictif)
 * - Validation données et logging sécurisé multi-niveau
 * 
 * PATTERN ARCHITECTURAL :
 * ======================
 * Extension Method pour IServiceCollection → Évite Program.cs surchargé
 * Séparation concerns → Chaque section service = responsabilité unique
 * Configuration centralisée → Point unique enregistrement dépendances
 * Lisibilité maintenabilité → Documentation inline et structure claire
 * 
 * ================================================================================================
 */

using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Configuration;
using StartingBloch.Backend.Middleware;
using StartingBloch.Backend.Validators;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AspNetCoreRateLimit;
using FluentValidation;
using Serilog;

namespace StartingBloch.Backend.Extensions;

/// <summary>
/// Extension pour centraliser la configuration de tous les services de l'application
/// selon l'architecture 8 couches de sécurité pour la gestion de propriété intellectuelle.
/// 
/// Cette classe statique organise l'injection de dépendances en sections logiques :
/// - Base de données avec Entity Framework Core et SQLite
/// - Services métier spécialisés en propriété intellectuelle
/// - Services de sécurité (JWT, chiffrement, audit, protection)
/// - Middleware de protection (Rate limiting, CORS)
/// - Validation FluentValidation et logging Serilog
/// 
/// Conformité : RGPD, standards WIPO/EPO, sécurité industrielle, audit légal
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Configure l'injection de dépendances pour l'architecture 8 couches de sécurité.
    /// Enregistre tous les services selon leur cycle de vie optimal et configure
    /// la sécurité, validation et logging pour la gestion de propriété intellectuelle.
    /// </summary>
    /// <param name="services">Collection de services à configurer</param>
    /// <param name="configuration">Configuration application depuis appsettings</param>
    /// <returns>Collection configurée pour l'injection de dépendances</returns>
    /// <exception cref="InvalidOperationException">JWT Secret manquant</exception>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // ============================================================================================
        // BASE DE DONNÉES ET CONFIGURATION
        // ============================================================================================
        
        services.AddDbContext<StartingBlochDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<SecuritySettings>(configuration.GetSection("Security"));

        // ============================================================================================
        // SWAGGER/OPENAPI DOCUMENTATION
        // ============================================================================================
        
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        // ============================================================================================
        // SERVICES MÉTIER PROPRIÉTÉ INTELLECTUELLE (Scoped)
        // ============================================================================================
        
        // Services principaux
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IBrevetService, BrevetService>();
        services.AddScoped<IUserAdminService, UserAdminService>();
        services.AddScoped<ICabinetService, CabinetService>();
        services.AddScoped<IContactService, ContactService>();
        
        // Services référentiels
        services.AddScoped<IPaysService, PaysService>();
        services.AddScoped<IStatutsService, StatutsService>();
        services.AddScoped<ILogService, LogService>();
        
        // Services brevets
        services.AddScoped<IDeposantService, DeposantService>();
        services.AddScoped<IInventeurService, InventeurService>();
        services.AddScoped<ITitulaireService, TitulaireService>();
        services.AddScoped<INumeroPaysService, NumeroPaysService>();
        
        // ============================================================================================
        // SERVICES SÉCURITÉ (Scoped)
        // ============================================================================================
        
    // Accès au contexte HTTP (pour récupérer l'utilisateur courant dans le DbContext)
    services.AddHttpContextAccessor();

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPasswordValidationService, PasswordValidationService>();
        services.AddScoped<IEncryptionService, EncryptionService>();
        services.AddScoped<IAuditService, AuditService>();
        // ============================================================================================
        // AUTHENTIFICATION JWT SÉCURISÉE
        // ============================================================================================
        
        var jwtSecret = configuration["Jwt:Secret"];
        if (string.IsNullOrEmpty(jwtSecret))
            throw new InvalidOperationException("JWT Secret is not configured");

        var key = Encoding.ASCII.GetBytes(jwtSecret);
        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(x =>
        {
            x.RequireHttpsMetadata = false; // Permettre HTTP en développement
            x.SaveToken = true;
            x.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                    logger.LogWarning("❌ JWT Authentication failed: {Error}", context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                    logger.LogInformation("✅ JWT Token validated for user: {User}", context.Principal?.Identity?.Name);
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                    var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                    logger.LogInformation("🔐 JWT Token received - Length: {Length}", token?.Length ?? 0);
                    return Task.CompletedTask;
                }
            };
            x.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        // ============================================================================================
        // PROTECTION ANTI-DDOS (Singleton)
        // ============================================================================================
        
        services.AddMemoryCache();
        services.Configure<IpRateLimitOptions>(configuration.GetSection("RateLimiting"));
        services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
        services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
        services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

        // ============================================================================================
        // CORS SÉCURISÉ
        // ============================================================================================
        
        services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp", builder =>
            {
                var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                    ?? new[] { "http://localhost:3000" };
                builder
                    .WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .SetPreflightMaxAge(TimeSpan.FromMinutes(5));
            });
        });

        // ============================================================================================
        // AUTORISATION ET VALIDATION
        // ============================================================================================
        
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
            
            // Politique pour admin OU propriétaire de ressource
            options.AddPolicy("AdminOrOwner", policy => policy.Requirements.Add(new AdminOrOwnerRequirement()));
            
            // Politique pour droits d'écriture granulaires
            options.AddPolicy("WritePermission", policy => policy.Requirements.Add(new WritePermissionRequirement()));
        });

        // Enregistrement des gestionnaires d'autorisation personnalisés
        services.AddScoped<IAuthorizationHandler, AdminOrOwnerHandler>();
        services.AddScoped<IAuthorizationHandler, WritePermissionHandler>();

        services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

        return services;
    }
}
