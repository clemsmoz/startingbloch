/*
 * ================================================================================================
 * DONNÉES INITIALES - RÉFÉRENTIELS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF :
 * Initialise les données de référence essentielles pour le fonctionnement du système
 * de gestion de propriété intellectuelle avec conformité standards internationaux.
 * 
 * DONNÉES INITIALISÉES :
 * ======================
 * 
 * 🌍 PAYS ET JURIDICTIONS :
 *    - 30 pays principaux avec codes ISO 2/3 lettres
 *    - Organisations spécialisées : EPO (Office Européen Brevets)
 *    - WIPO (Organisation Mondiale Propriété Intellectuelle)
 *    - Couverture géographique optimale pour clients internationaux
 * 
 * 📊 STATUTS BREVETS COMPLETS :
 *    - Statuts de base (via OnModelCreating) : Examen, Délivré, Rejeté, etc.
 *    - Statuts avancés : Publication, Opposition, Recours, Maintenu, Révoqué
 *    - Conformité lifecycle EPO et standards internationaux
 * 
 * 🔧 FONCTIONNALITÉS :
 *    - Vérification existence avant insertion (évite doublons)
 *    - Initialisation conditionnelle (seulement si DB vide)
 *    - Gestion erreurs avec logging console
 *    - Création base données automatique si inexistante
 * 
 * CONFORMITÉ STANDARDS :
 * =====================
 * ✅ ISO 3166 : Codes pays alpha-2 et alpha-3
 * ✅ EPO Guidelines : Statuts brevets européens
 * ✅ WIPO Standards : Procédures internationales
 * ✅ Performance : Insertion par lots optimisée
 * 
 * ARCHITECTURE DÉPLOIEMENT :
 * ==========================
 * - Appelé au démarrage application (Program.cs)
 * - Idempotent : peut être exécuté plusieurs fois
 * - Logging détaillé pour monitoring déploiement
 * - Gestion gracieuse erreurs sans interruption
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Data;

/// <summary>
/// Service d'initialisation des données de référence pour le système propriété intellectuelle.
/// Configure pays, statuts brevets et autres référentiels selon standards internationaux.
/// Exécution idempotente au démarrage application avec gestion erreurs robuste.
/// </summary>
public static class SeedData
{
    /// <summary>
    /// Point d'entrée principal pour initialisation complète des données de référence.
    /// Crée la base si nécessaire et peuple les référentiels essentiels.
    /// </summary>
    /// <param name="context">Contexte base de données pour opérations</param>
    /// <returns>Task pour exécution asynchrone</returns>
    public static async Task InitializeAsync(StartingBlochDbContext context)
    {
        try
        {
            // Création base données si inexistante (dev/test)
            await context.Database.EnsureCreatedAsync();

            // Vérification données existantes (évite re-initialisation)
            if (await context.Users.AnyAsync())
            {
                return; // Données déjà initialisées - arrêt gracieux
            }

            // Initialisation référentiels par ordre dépendances
            await SeedPaysAsync(context);
            await SeedStatutsAsync(context);

            Console.WriteLine("✅ Données initiales créées avec succès");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur lors de l'initialisation des données: {ex.Message}");
        }
    }

    /// <summary>
    /// Initialise le référentiel pays avec codes ISO standards et organisations spécialisées.
    /// Couvre les juridictions principales pour propriété intellectuelle internationale.
    /// </summary>
    /// <param name="context">Contexte base de données</param>
    /// <returns>Task pour insertion asynchrone</returns>
    private static async Task SeedPaysAsync(StartingBlochDbContext context)
    {
        if (await context.Pays.AnyAsync()) return;

        var pays = new List<Pays>
        {
            // Pays européens principaux
            new() { NomFrFr = "France", CodeIso = "FR", CodeIso3 = "FRA" },
            new() { NomFrFr = "Allemagne", CodeIso = "DE", CodeIso3 = "DEU" },
            new() { NomFrFr = "Royaume-Uni", CodeIso = "GB", CodeIso3 = "GBR" },
            new() { NomFrFr = "Espagne", CodeIso = "ES", CodeIso3 = "ESP" },
            new() { NomFrFr = "Italie", CodeIso = "IT", CodeIso3 = "ITA" },
            new() { NomFrFr = "Pays-Bas", CodeIso = "NL", CodeIso3 = "NLD" },
            new() { NomFrFr = "Belgique", CodeIso = "BE", CodeIso3 = "BEL" },
            new() { NomFrFr = "Suisse", CodeIso = "CH", CodeIso3 = "CHE" },
            new() { NomFrFr = "Autriche", CodeIso = "AT", CodeIso3 = "AUT" },
            new() { NomFrFr = "Portugal", CodeIso = "PT", CodeIso3 = "PRT" },
            
            // Pays nordiques
            new() { NomFrFr = "Norvège", CodeIso = "NO", CodeIso3 = "NOR" },
            new() { NomFrFr = "Suède", CodeIso = "SE", CodeIso3 = "SWE" },
            new() { NomFrFr = "Danemark", CodeIso = "DK", CodeIso3 = "DNK" },
            new() { NomFrFr = "Finlande", CodeIso = "FI", CodeIso3 = "FIN" },
            
            // Grandes puissances économiques
            new() { NomFrFr = "États-Unis", CodeIso = "US", CodeIso3 = "USA" },
            new() { NomFrFr = "Canada", CodeIso = "CA", CodeIso3 = "CAN" },
            new() { NomFrFr = "Japon", CodeIso = "JP", CodeIso3 = "JPN" },
            new() { NomFrFr = "Chine", CodeIso = "CN", CodeIso3 = "CHN" },
            new() { NomFrFr = "Corée du Sud", CodeIso = "KR", CodeIso3 = "KOR" },
            new() { NomFrFr = "Australie", CodeIso = "AU", CodeIso3 = "AUS" },
            new() { NomFrFr = "Nouvelle-Zélande", CodeIso = "NZ", CodeIso3 = "NZL" },
            
            // Marchés émergents stratégiques
            new() { NomFrFr = "Brésil", CodeIso = "BR", CodeIso3 = "BRA" },
            new() { NomFrFr = "Mexique", CodeIso = "MX", CodeIso3 = "MEX" },
            new() { NomFrFr = "Inde", CodeIso = "IN", CodeIso3 = "IND" },
            new() { NomFrFr = "Russie", CodeIso = "RU", CodeIso3 = "RUS" },
            new() { NomFrFr = "Israël", CodeIso = "IL", CodeIso3 = "ISR" },
            new() { NomFrFr = "Singapour", CodeIso = "SG", CodeIso3 = "SGP" },
            new() { NomFrFr = "Afrique du Sud", CodeIso = "ZA", CodeIso3 = "ZAF" },
            
            // Organisations spécialisées propriété intellectuelle
            new() { NomFrFr = "Organisation Européenne des Brevets", CodeIso = "EP", CodeIso3 = "EPO" },
            new() { NomFrFr = "Organisation Mondiale de la Propriété Intellectuelle", CodeIso = "WO", CodeIso3 = "WIP" }
        };

        await context.Pays.AddRangeAsync(pays);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Complète les statuts brevets avec procédures avancées EPO et workflows spécialisés.
    /// Étend les statuts de base définis dans OnModelCreating avec statuts post-délivrance.
    /// </summary>
    /// <param name="context">Contexte base de données</param>
    /// <returns>Task pour insertion conditionnelle</returns>
    private static async Task SeedStatutsAsync(StartingBlochDbContext context)
    {
        // Statuts avancés post-délivrance et procédures contentieuses
        var additionalStatuts = new List<Statuts>
        {
            new() { Id = 6, Description = "Publication" },      // Publication demande (18 mois)
            new() { Id = 7, Description = "Opposition" },       // Procédure opposition EPO
            new() { Id = 8, Description = "Recours" },          // Procédure recours
            new() { Id = 9, Description = "Maintenu" },         // Brevet maintenu post-opposition
            new() { Id = 10, Description = "Révoqué" }          // Révocation post-contentieux
        };

        // Insertion conditionnelle (évite doublons si partiellement initialisé)
        foreach (var statut in additionalStatuts)
        {
            if (!await context.Statuts.AnyAsync(s => s.Id == statut.Id))
            {
                await context.Statuts.AddAsync(statut);
            }
        }

        await context.SaveChangesAsync();
    }
}
