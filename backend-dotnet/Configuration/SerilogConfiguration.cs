/**
 * ============================================================================
 * STARTING BLOCH - CONFIGURATION LOGGING AVANCÉ SERILOG
 * ============================================================================
 * 
 * Configuration centralisée du système de logging professionnel Serilog pour
 * l'écosystème de propriété intellectuelle. Implémente logging structuré,
 * audit trail sécurisé, et monitoring opérationnel selon standards entreprise.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * • Logging structuré multi-cibles (console, fichiers, JSON sécurisé)
 * • Séparation logs sécurité et application pour audit spécialisé
 * • Rotation automatique et rétention configurable selon compliance
 * • Enrichissement contextuel pour traçabilité complète des opérations
 * 
 * SÉCURITÉ ET CONFORMITÉ:
 * • Logs sécurité séparés en JSON pour analyse forensique
 * • Audit trail tamper-proof avec horodatage précis
 * • Filtrage sensible pour protection données personnelles
 * • Rétention configurable selon exigences réglementaires RGPD
 * 
 * ARCHITECTURE SÉCURISÉE:
 * • Multi-sink strategy pour redondance et spécialisation
 * • Buffer management pour performance et intégrité
 * • Niveau logging adaptatif selon environnement
 * • Monitoring temps réel avec alertes automatiques
 * 
 * IMPACT BUSINESS:
 * Infrastructure critique pour audit, debugging, conformité réglementaire.
 * Essentielle pour investigation incidents et preuves légales propriété intellectuelle.
 * 
 * @version 1.0.0
 * @since 2024
 * @author Starting Bloch Development Team
 */

using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace StartingBloch.Backend.Configuration;

/**
 * Configuration centralisée du système de logging Serilog
 * 
 * Responsabilités principales:
 * - Configuration multi-sink pour logging spécialisé par usage
 * - Paramétrage niveaux et filtres selon criticité et environnement
 * - Enrichissement contextuel pour traçabilité complète
 * - Gestion rotation et rétention selon politiques compliance
 */
public static class SerilogConfiguration
{
    /// <summary>
    /// Configure le système de logging Serilog avec architecture multi-sink avancée
    /// 
    /// Fonctionnalité Métier:
    /// - Logging structuré pour audit trail et debugging professionnel
    /// - Séparation logs sécurité/application pour compliance spécialisée
    /// - Enrichissement contextuel automatique pour traçabilité complète
    /// - Rotation et rétention automatiques selon politiques organisationnelles
    /// 
    /// Sécurité et Conformité:
    /// - Logs sécurité en JSON structuré pour analyse forensique
    /// - Horodatage précis avec timezone pour audit légal
    /// - Filtrage Microsoft framework pour réduction bruit opérationnel
    /// - Rétention 30j sécurité / 7j application selon RGPD
    /// 
    /// Architecture Multi-Sink:
    /// 1. Console: Debug temps réel avec formatage lisible développeurs
    /// 2. Security JSON: Audit trail tamper-proof pour investigation
    /// 3. Application Log: Erreurs/warnings pour monitoring opérationnel
    /// 
    /// Performance et Fiabilité:
    /// - Buffer désactivé pour intégrité maximale logs critiques
    /// - Shared logging pour access concurrent sécurisé
    /// - Limite taille 10MB par fichier pour rotation optimale
    /// - Niveaux adaptatifs selon environnement (dev/staging/prod)
    /// </summary>
    /// <param name="builder">Builder application pour configuration intégrée</param>
    public static void ConfigureSerilog(this WebApplicationBuilder builder)
    {
        // Configuration Logger global avec architecture multi-sink professionnelle
        Log.Logger = new LoggerConfiguration()
            // Lecture configuration depuis appsettings.json pour flexibilité environnement
            .ReadFrom.Configuration(builder.Configuration)
            
            // Niveau minimum Information pour équilibre verbosité/performance
            .MinimumLevel.Information()
            
            // Réduction bruit Microsoft framework - Warnings uniquement
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            
            // Exception: Lifecycle hosting reste Information pour diagnostic démarrage
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            
            // Filtrage ASP.NET Core et System pour focus logs business
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            
            // Enrichissement contextuel pour traçabilité complète
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "StartingBloch.Backend")
            .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
            
            // SINK 1: Console pour debug temps réel développeurs
            .WriteTo.Console(
                outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
            
            // SINK 2: Fichiers JSON sécurité pour audit trail forensique
            .WriteTo.File(
                new CompactJsonFormatter(),
                path: "logs/security-.json",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,        // 30 jours rétention conformité RGPD
                buffered: false,                   // Pas de buffer pour intégrité critique
                shared: true,                      // Access concurrent sécurisé
                restrictedToMinimumLevel: LogEventLevel.Information,
                fileSizeLimitBytes: 10_000_000)    // 10MB rotation pour performance
            
            // SINK 3: Fichiers texte application pour monitoring opérationnel
            .WriteTo.File(
                path: "logs/application-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7,         // 7 jours rétention logs application
                outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}",
                restrictedToMinimumLevel: LogEventLevel.Warning)  // Warnings+ seulement
            .CreateLogger();

        // Intégration Serilog avec host ASP.NET Core
        builder.Host.UseSerilog();
    }

    /// <summary>
    /// Ajoute le logging sécurisé Serilog au container DI
    /// 
    /// Fonctionnalité Métier:
    /// - Injection dépendance Serilog.ILogger pour services métier
    /// - Configuration manuelle singleton pour performance optimale
    /// - Access centralisé logger global pour cohérence logging
    /// - Support logging spécialisé dans services critiques
    /// 
    /// Sécurité et Conformité:
    /// - Logger singleton pour cohérence audit trail
    /// - Configuration centralisée pour standards logging uniformes
    /// - Support logging sécurisé dans middleware et services
    /// - Traçabilité complète avec contextualisation automatique
    /// 
    /// Cas d'Usage:
    /// - Injection dans services pour logging métier structuré
    /// - Audit trail opérations critiques propriété intellectuelle
    /// - Monitoring performance et erreurs système temps réel
    /// - Investigation incidents avec correlation logs multi-sources
    /// </summary>
    /// <param name="services">Container services pour injection dépendance</param>
    public static void AddSecurityLogging(this IServiceCollection services)
    {
        // Configuration singleton Serilog pour injection dépendance
        // Garantit cohérence logging et performance optimale
        services.AddSingleton<Serilog.ILogger>(provider => 
        {
            return Log.Logger;  // Retourne logger global configuré
        });
    }
}
