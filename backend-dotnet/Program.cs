/* Point d'entrée API */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Extensions;
using StartingBloch.Backend.Middleware;
using StartingBloch.Backend.Configuration;
using System.Text.Json.Serialization;
using AspNetCoreRateLimit;
using Serilog;
using DotNetEnv;
using Microsoft.EntityFrameworkCore.Storage;

// ================================================================================================
// CONFIGURATION DE L'APPLICATION
// ================================================================================================

// Charger .env AVANT de construire la configuration pour permettre la surcouche env
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// *** CHARGEMENT DES VARIABLES D'ENVIRONNEMENT ***
// Déjà chargé plus haut via Env.Load()

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

// *** ÉTAPE 6: CONTRÔLES D'ACCÈS ET LIMITATION ***
// 3. Rate Limiting - Protection anti-DDoS (AVANT CORS et Authentication)
app.UseIpRateLimiting();

// 4. CORS - Politique de partage inter-domaines (APRÈS Rate Limiting)
app.UseCors("AllowReactApp");

// *** ÉTAPE 7: AUTHENTIFICATION ET AUTORISATION ***
// 5. Authentification JWT (validation des tokens)
app.UseAuthentication();

// 6. Autorisation (vérification des permissions)
app.UseAuthorization();

// 7. Logging des requêtes (APRÈS authentification pour capturer l'utilisateur)
app.UseMiddleware<RequestLoggingMiddleware>();

// Mappage des contrôleurs
app.MapControllers();

// Endpoint de santé (provider basé sur la chaîne de connexion)
app.MapGet("/api/health", (IConfiguration cfg) =>
{
    var raw = cfg.GetConnectionString("DefaultConnection") ?? string.Empty;
    var lower = raw.Trim().ToLowerInvariant();
    var isPg = lower.StartsWith("postgresql://") || lower.StartsWith("postgres://") || (lower.Contains("host=") && lower.Contains("database="));
    return Results.Json(new {
        status = "healthy",
        timestamp = DateTime.UtcNow,
        version = "1.0.0",
        database = isPg ? "PostgreSQL" : "SQLite",
        framework = ".NET 8"
    });
}).AllowAnonymous();

// Endpoint de santé DB détaillé (provider réel EF, connectivité et migrations)
app.MapGet("/api/health/db", async (StartingBlochDbContext db) =>
{
    var provider = db.Database.ProviderName ?? "unknown";
    bool canConnect;
    try { canConnect = await db.Database.CanConnectAsync(); }
    catch { canConnect = false; }

    string[] applied = Array.Empty<string>();
    string[] pending = Array.Empty<string>();
    try
    {
        applied = (await db.Database.GetAppliedMigrationsAsync()).ToArray();
        pending = (await db.Database.GetPendingMigrationsAsync()).ToArray();
    }
    catch
    {
        // Si la table __EFMigrationsHistory n'existe pas ou schéma non géré par EF
    }

    return Results.Json(new
    {
        provider,
        canConnect,
        appliedMigrations = applied,
        pendingMigrations = pending
    });
}).AllowAnonymous();

// Migration + seeding runtime (sécurisé)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<StartingBlochDbContext>();
    var providerName = context.Database.ProviderName ?? string.Empty;
    var isNpgsql = providerName.IndexOf("Npgsql", StringComparison.OrdinalIgnoreCase) >= 0;
    var autoMigEnv = Environment.GetEnvironmentVariable("EF_AUTO_MIGRATE");
    var autoMigrate = !isNpgsql // Toujours migrer en SQLite (dev local)
                      || (autoMigEnv != null && autoMigEnv.Equals("true", StringComparison.OrdinalIgnoreCase));

    if (autoMigrate)
    {
        try
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            // Ne pas bloquer le démarrage si la base est déjà provisionnée (ex: Postgres importée hors EF)
            app.Logger.LogWarning(ex, "EF migration skipped due to error. Database might be pre-provisioned.");
        }
    }

    // Baseline migrations: marque les migrations EF comme appliquées sans modifier le schéma (PostgreSQL uniquement)
    var doBaseline = isNpgsql && (Environment.GetEnvironmentVariable("EF_BASELINE_MIGRATIONS")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true);
    if (doBaseline)
    {
        try
        {
            var pending = (await context.Database.GetPendingMigrationsAsync()).ToArray();
            if (pending.Length > 0)
            {
                // S'assure que la table d'historique existe
                const string ensureSql = """
                CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
                    "MigrationId" character varying(150) NOT NULL,
                    "ProductVersion" character varying(32) NOT NULL,
                    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
                );
                """;
                await context.Database.ExecuteSqlRawAsync(ensureSql);

                foreach (var id in pending)
                {
                    await context.Database.ExecuteSqlRawAsync(
                        "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1}) ON CONFLICT (\"MigrationId\") DO NOTHING;",
                        id, "8.0.0");
                }
                app.Logger.LogInformation("EF baseline completed: {Count} migrations marked as applied.", pending.Length);
            }
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "EF baseline failed.");
        }
    }

    var doSeed = !isNpgsql || (Environment.GetEnvironmentVariable("EF_RUNTIME_SEED")?.Equals("true", StringComparison.OrdinalIgnoreCase) == true);
    if (doSeed)
    {
        await SeedData.InitializeAsync(context);
    }

        // Réparations de schéma spécifiques PostgreSQL (si base importée sans identités auto)
        if (isNpgsql)
        {
                try
                {
                        // Ajoute IDENTITY si absent pour public.logs(id) et public.brevets(id_brevet)
                                    const string fixIdentitySql = @"DO $$
BEGIN
    -- logs.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='logs' AND column_name='id' AND is_identity='YES'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='logs' AND column_name='id' AND column_default IS NULL
        ) THEN
            EXECUTE 'ALTER TABLE public.logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
        END IF;
    END IF;

    -- brevets.id_brevet
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='brevets' AND column_name='id_brevet' AND is_identity='YES'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='brevets' AND column_name='id_brevet' AND column_default IS NULL
        ) THEN
            EXECUTE 'ALTER TABLE public.brevets ALTER COLUMN id_brevet ADD GENERATED BY DEFAULT AS IDENTITY';
        END IF;
    END IF;

                -- brevetclients.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='brevetclients' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='brevetclients' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.brevetclients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                -- brevetdeposants.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='brevetdeposants' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='brevetdeposants' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.brevetdeposants ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                -- brevetinventeurs.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='brevetinventeurs' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='brevetinventeurs' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.brevetinventeurs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                -- brevettitulaires.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='brevettitulaires' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='brevettitulaires' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.brevettitulaires ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                -- informationsdepot.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='informationsdepot' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='informationsdepot' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.informationsdepot ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                    -- deposantpays.id
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='deposantpays' AND column_name='id' AND is_identity='YES'
                    ) THEN
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='deposantpays' AND column_name='id' AND column_default IS NULL
                        ) THEN
                            EXECUTE 'ALTER TABLE public.deposantpays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                        END IF;
                    END IF;

                    -- inventeurpays.id
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='inventeurpays' AND column_name='id' AND is_identity='YES'
                    ) THEN
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='inventeurpays' AND column_name='id' AND column_default IS NULL
                        ) THEN
                            EXECUTE 'ALTER TABLE public.inventeurpays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                        END IF;
                    END IF;

                    -- titulairepays.id
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='titulairepays' AND column_name='id' AND is_identity='YES'
                    ) THEN
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_schema='public' AND table_name='titulairepays' AND column_name='id' AND column_default IS NULL
                        ) THEN
                            EXECUTE 'ALTER TABLE public.titulairepays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                        END IF;
                    END IF;

                -- clients.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='clients' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='clients' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.clients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                -- cabinets.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='cabinets' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='cabinets' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.cabinets ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;

                -- contacts.id
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='contacts' AND column_name='id' AND is_identity='YES'
                ) THEN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='contacts' AND column_name='id' AND column_default IS NULL
                    ) THEN
                        EXECUTE 'ALTER TABLE public.contacts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY';
                    END IF;
                END IF;
END
$$;";

                        await context.Database.ExecuteSqlRawAsync(fixIdentitySql);

                        // Réinitialise/avance les séquences à MAX+1 si disponibles
                        const string reseedSql = @"
            SELECT setval(pg_get_serial_sequence('public.logs','id'), COALESCE((SELECT MAX(id) FROM public.logs), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.logs','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.brevets','id_brevet'), COALESCE((SELECT MAX(id_brevet) FROM public.brevets), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.brevets','id_brevet') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.brevetclients','id'), COALESCE((SELECT MAX(id) FROM public.brevetclients), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.brevetclients','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.brevetdeposants','id'), COALESCE((SELECT MAX(id) FROM public.brevetdeposants), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.brevetdeposants','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.brevetinventeurs','id'), COALESCE((SELECT MAX(id) FROM public.brevetinventeurs), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.brevetinventeurs','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.brevettitulaires','id'), COALESCE((SELECT MAX(id) FROM public.brevettitulaires), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.brevettitulaires','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.informationsdepot','id'), COALESCE((SELECT MAX(id) FROM public.informationsdepot), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.informationsdepot','id') IS NOT NULL;";
                        
                        await context.Database.ExecuteSqlRawAsync(reseedSql);

                        // Reseed pour clients/cabinets/contacts
                        const string reseedMoreSql = @"
            SELECT setval(pg_get_serial_sequence('public.clients','id'), COALESCE((SELECT MAX(id) FROM public.clients), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.clients','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.cabinets','id'), COALESCE((SELECT MAX(id) FROM public.cabinets), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.cabinets','id') IS NOT NULL;

            SELECT setval(pg_get_serial_sequence('public.contacts','id'), COALESCE((SELECT MAX(id) FROM public.contacts), 0) + 1, false)
            WHERE pg_get_serial_sequence('public.contacts','id') IS NOT NULL;";

                        await context.Database.ExecuteSqlRawAsync(reseedMoreSql);

                        app.Logger.LogInformation("PostgreSQL identity fixups applied.");
                }
                catch (Exception ex)
                {
                        app.Logger.LogWarning(ex, "PostgreSQL identity fixups skipped/failed. Tables may already be configured.");
                }
        }
}

await app.RunAsync();

public partial class Program { }
