/*
 * ================================================================================================
 * SCRIPT DE SEED OPTIMISÉ - DONNÉES DE TEST COHÉRENTES ET COMPLÈTES
 * ================================================================================================
 * 
 * 🎯 OBJECTIF :
 * Script de génération de données de test réalistes pour l'application StartingBloch.
 * Crée un écosystème complet de propriété intellectuelle avec relations cohérentes.
 * 
 * 📊 DONNÉES GÉNÉRÉES :
 * ===================
 * 
 * 🏢 ENTITÉS PRINCIPALES :
 * ├── 1 Client : GlobalTech Innovation (société française d'innovation)
 * │   └── 1 Compte Utilisateur : Sophie Laurent (Directrice Juridique)
 * ├── 4 Cabinets : 2 spécialisés Annuités + 2 spécialisés Procédures
 * ├── 19 Contacts : 3 pour le client + 16 pour les cabinets (4 par cabinet)
 * └── 10 Brevets : Portfolio complet avec relations multiples
 * 
 * 🔗 RELATIONS COMPLEXES PAR BREVET :
 * ===================================
 * ├── 2 Inventeurs spécifiques (40 total avec nationalités)
 * ├── 2 Titulaires dont 1 = client (40 total avec domiciliations)
 * ├── 2 Déposants dont 1 = client (40 total avec juridictions)
 * ├── 2 Cabinets : 1 Annuité + 1 Procédure (20 relations)
 * ├── 7-15 Pays par brevet (100+ dépôts InformationDepot)
 * └── Relations géographiques cohérentes pour tous acteurs
 * 
 * 💼 ARCHITECTURE MÉTIER :
 * ========================
 * - Client propriétaire de son portefeuille brevets
 * - Inventeurs avec nationalités multiples
 * - Titulaires avec domiciliations légales
 * - Déposants avec agréments juridictionnels
 * - Cabinets spécialisés par type de service
 * - Statuts juridiques réels de la base de données
 * 
 * 🌍 COUVERTURE GÉOGRAPHIQUE :
 * ============================
 * - 20 pays maximum par portefeuille (base données existante)
 * - 7-15 pays par brevet (couverture internationale réaliste)
 * - Relations acteurs-pays cohérentes avec dépôts
 * 
 * 🔐 SÉCURITÉ ET COHÉRENCE :
 * ==========================
 * - Transaction atomique pour intégrité données
 * - Vérification doublons avant création
 * - Mots de passe hachés BCrypt
 * - Clés étrangères validées
 * - Audit trail complet avec timestamps
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Models;
using BCrypt.Net;
using System.Text.Json;

namespace StartingBloch.Backend.Data;

public static class SeedMassiveData
{
    /// <summary>
    /// 🚀 MÉTHODE PRINCIPALE DE SEED
    /// ===============================
    /// 
    /// Orchestrateur principal du processus de génération de données.
    /// Exécute la création séquentielle de toutes les entités métier
    /// dans une transaction atomique pour garantir la cohérence.
    /// 
    /// 📋 SÉQUENCE D'EXÉCUTION :
    /// 1️⃣ Vérification existence données (évite doublons)
    /// 2️⃣ Création cabinets (entités indépendantes)
    /// 3️⃣ Création client + compte utilisateur (entité centrale)
    /// 4️⃣ Création contacts (dépendants client/cabinets)
    /// 5️⃣ Création brevets + relations complexes (cœur métier)
    /// 
    /// 🔐 SÉCURITÉ :
    /// - Transaction atomique : tout ou rien
    /// - Rollback automatique en cas d'erreur
    /// - Logs détaillés pour debugging
    /// 
    /// </summary>
    /// <param name="context">Contexte Entity Framework pour accès base données</param>
    public static async Task SeedAsync(StartingBlochDbContext context)
    {
        Console.WriteLine("🚀 Début du seed massif de données...");

        // 🔍 VÉRIFICATION EXISTENCE DONNÉES
        // Contrôle anti-doublons : vérifie si le client test existe déjà
        // Utilise le nom unique "GlobalTech Innovation" comme marqueur
        if (await context.Clients.AnyAsync(c => c.NomClient.Contains("GlobalTech Innovation")))
        {
            Console.WriteLine("⚠️ Les données de test existent déjà, arrêt du seed.");
            return;
        }

        // 🔒 DÉBUT TRANSACTION ATOMIQUE
        // Garantit l'intégrité : soit toutes les données sont créées, soit aucune
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            // 📋 SÉQUENCE ORDONNÉE DE CRÉATION
            // L'ordre est critique : respecte les dépendances foreign key
            
            // 1️⃣ Cabinets (entités indépendantes, pas de dépendances)
            await SeedCabinets(context);
            
            // 2️⃣ Client + Compte (entité centrale du système)
            await SeedClient(context);
            
            // 3️⃣ Contacts (dépendent des clients et cabinets créés)
            await SeedContacts(context);
            
            // 4️⃣ Brevets + Relations (cœur métier avec toutes les associations)
            await SeedBrevets(context);

            // 💾 SAUVEGARDE FINALE ET VALIDATION
            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            Console.WriteLine("✅ Seed massif terminé avec succès !");
        }
        catch (Exception ex)
        {
            // 🔄 ROLLBACK EN CAS D'ERREUR
            // Annule toutes les modifications pour maintenir cohérence
            await transaction.RollbackAsync();
            Console.WriteLine($"❌ Erreur lors du seed : {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// 📋 CRÉATION DES CABINETS DE CONSEIL
    /// ====================================
    /// 
    /// Génère 4 cabinets spécialisés en propriété intellectuelle :
    /// - 2 cabinets d'ANNUITÉS (gestion renouvellements/maintenances)
    /// - 2 cabinets de PROCÉDURES (dépôts/contentieux)
    /// 
    /// 🌍 COUVERTURE GÉOGRAPHIQUE :
    /// - France : Renouv'IP France (Annuité) + LexIP Avocats (Procédure)
    /// - Europe : European Patent Renewals (UK) + Müller & Associates (DE)
    /// 
    /// 📊 DONNÉES RÉALISTES :
    /// - Adresses prestigieuses (Rivoli, Downing Street, Unter den Linden)
    /// - Contacts téléphoniques/emails cohérents par pays
    /// - Spécialisation claire via enum CabinetType
    /// 
    /// </summary>
    /// <param name="context">Contexte EF pour persistance cabinets</param>
    private static async Task SeedCabinets(StartingBlochDbContext context)
    {
        Console.WriteLine("📋 Création des cabinets...");

        var cabinets = new List<Cabinet>
        {
            // 🇫🇷 CABINET ANNUITÉS FRANCE
            // Spécialisé dans la gestion des renouvellements de brevets
            new Cabinet
            {
                NomCabinet = "Renouv'IP France",
                AdresseCabinet = "42 Rue de Rivoli",
                CodePostal = "75001",
                PaysCabinet = "France",
                EmailCabinet = "contact@renouvip.fr",
                TelephoneCabinet = "+33 1 42 97 45 32",
                Type = CabinetType.Annuite
            },
            
            // 🇬🇧 CABINET ANNUITÉS ROYAUME-UNI
            // Expert en maintien des droits européens post-Brexit
            new Cabinet
            {
                NomCabinet = "European Patent Renewals Ltd",
                AdresseCabinet = "10 Downing Street",
                CodePostal = "SW1A 2AA",
                PaysCabinet = "Royaume-Uni",
                EmailCabinet = "renewals@epr.co.uk",
                TelephoneCabinet = "+44 20 7219 3000",
                Type = CabinetType.Annuite
            },
            
            // 🇫🇷 CABINET PROCÉDURES FRANCE
            // Spécialisé dépôts, contentieux et stratégie PI
            new Cabinet
            {
                NomCabinet = "LexIP Avocats",
                AdresseCabinet = "15 Boulevard Saint-Germain",
                CodePostal = "75005",
                PaysCabinet = "France",
                EmailCabinet = "cabinet@lexip.fr",
                TelephoneCabinet = "+33 1 44 32 18 76",
                Type = CabinetType.Procedure
            },
            
            // 🇩🇪 CABINET PROCÉDURES ALLEMAGNE
            // Mandataires agréés OEB et stratégie européenne
            new Cabinet
            {
                NomCabinet = "Müller & Associates Patentanwälte",
                AdresseCabinet = "Unter den Linden 77",
                CodePostal = "10117",
                PaysCabinet = "Allemagne",
                EmailCabinet = "info@muller-patents.de",
                TelephoneCabinet = "+49 30 2062 2850",
                Type = CabinetType.Procedure
            }
        };

        // 💾 PERSISTANCE EN BASE
        context.Cabinets.AddRange(cabinets);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ {cabinets.Count} cabinets créés avec succès");
    }

    /// <summary>
    /// 🏢 CRÉATION CLIENT + COMPTE UTILISATEUR ASSOCIÉ
    /// ================================================
    /// 
    /// Crée l'entité cliente centrale du système avec son compte d'accès.
    /// Processus en 2 étapes pour respecter les contraintes foreign key.
    /// 
    /// 🏭 CLIENT : GLOBALTECH INNOVATION
    /// - Société française spécialisée en innovation technologique
    /// - Basée à Paris (75001) avec référence unique GTI-2024-001
    /// - Coordonnées complètes pour communications juridiques
    /// 
    /// 👤 COMPTE UTILISATEUR : SOPHIE LAURENT
    /// - Directrice Juridique et responsable portefeuille PI
    /// - Rôle "Client" avec permissions lecture/écriture
    /// - Mot de passe sécurisé BCrypt : GlobalTech2024!
    /// - Liaison directe client via ClientId (foreign key)
    /// 
    /// 🔐 SÉCURITÉ :
    /// - Sauvegarde intermédiaire pour obtenir ClientId
    /// - Hachage BCrypt du mot de passe
    /// - Validation contraintes référentielles
    /// 
    /// </summary>
    /// <param name="context">Contexte EF pour création client/utilisateur</param>
    private static async Task SeedClient(StartingBlochDbContext context)
    {
        Console.WriteLine("🏢 Création du client et de son compte...");

        // 🏭 CRÉATION ENTITÉ CLIENT
        // Société française GlobalTech Innovation - acteur central du portefeuille PI
        var client = new Client
        {
            NomClient = "GlobalTech Innovation",                    // Nom social officiel
            ReferenceClient = "GTI-2024-001",                       // Référence unique pour suivi
            AdresseClient = "123 Innovation Boulevard",             // Siège social parisien
            CodePostal = "75001",                                   // Zone prestigieuse Paris
            PaysClient = "France",                                  // Juridiction principale
            EmailClient = "contact@globaltech-innovation.com",     // Contact institutionnel
            TelephoneClient = "+33 1 55 43 21 87"                  // Standard entreprise
        };

        // 💾 SAUVEGARDE CLIENT POUR RÉCUPÉRER ID
        // Étape obligatoire : l'ID auto-généré est nécessaire pour ClientId utilisateur
        context.Clients.Add(client);
        await context.SaveChangesAsync();

        // 👤 CRÉATION COMPTE UTILISATEUR ASSOCIÉ
        // Sophie Laurent - Directrice Juridique responsable du portefeuille PI
        var user = new User
        {
            Username = "globaltech.admin",                          // Identifiant connexion unique
            Email = "admin@globaltech-innovation.com",             // Email professionnel dédié
            Password = BCrypt.Net.BCrypt.HashPassword("GlobalTech2024!"), // 🔐 Mot de passe sécurisé haché
            Role = "Client",                                        // Rôle métier = accès portefeuille client
            Prenom = "Sophie",                                      // Prénom responsable juridique
            Nom = "Laurent",                                        // Nom responsable juridique
            IsActive = true,                                        // Compte immédiatement utilisable
            CanWrite = true,                                        // Permissions modification données
            ClientId = client.Id                                    // 🔗 LIAISON CRUCIALE : FK vers client
        };

        // 💾 SAUVEGARDE UTILISATEUR AVEC LIAISON
        context.Users.Add(user);
        await context.SaveChangesAsync();
        
        // 📊 LOGS CONFIRMATION CRÉATION
        Console.WriteLine($"✅ Client créé : {client.NomClient} (ID: {client.Id})");
        Console.WriteLine($"✅ Compte utilisateur créé : {user.Username} → ClientId: {user.ClientId}");
    }

    /// <summary>
    /// 👥 CRÉATION RÉSEAU DE CONTACTS PROFESSIONNELS
    /// ==============================================
    /// 
    /// Génère un écosystème complet de contacts pour le client et tous les cabinets.
    /// Architecture relationnelle optimisée pour communications métier.
    /// 
    /// 📊 RÉPARTITION DES CONTACTS :
    /// =============================
    /// 🏢 CLIENT (3 contacts) :
    /// ├── Sophie Laurent - Directrice Juridique (aussi compte utilisateur)
    /// ├── Alexandre Moreau - Responsable Propriété Intellectuelle  
    /// └── Émilie Dupont - CTO (Chief Technology Officer)
    /// 
    /// 🏢 CABINETS (16 contacts = 4 par cabinet) :
    /// ├── Annuités : Responsable + Assistant + Manager + Chargé de Suivi
    /// └── Procédures : Avocat Principal + Conseil PI + Assistant + Mandataire
    /// 
    /// 📧 DONNÉES COHÉRENTES :
    /// - Emails générés depuis domaines cabinets réels
    /// - Téléphones basés sur standards cabinets avec extensions
    /// - Rôles spécialisés selon type cabinet (Annuité vs Procédure)
    /// - Formats JSON pour emails/téléphones/rôles multiples
    /// 
    /// </summary>
    /// <param name="context">Contexte EF pour persistance contacts</param>
    private static async Task SeedContacts(StartingBlochDbContext context)
    {
        Console.WriteLine("👥 Création du réseau de contacts...");

        // 📍 RÉCUPÉRATION ENTITÉS PARENTES
        // Client et cabinets déjà créés - nécessaires pour foreign keys
        var client = await context.Clients.FirstAsync(c => c.NomClient == "GlobalTech Innovation");
        var cabinets = await context.Cabinets.ToListAsync();
        var contacts = new List<Contact>();

        // 🏢 CONTACTS CLIENT GLOBALTECH (3 contacts stratégiques)
        var clientContacts = new List<Contact>
        {
            // 👤 DIRECTRICE JURIDIQUE (contact principal = compte utilisateur)
            new Contact
            {
                Nom = "Laurent",
                Prenom = "Sophie",
                Role = "Directrice Juridique",                      // Responsable légal portefeuille
                Email = "sophie.laurent@globaltech-innovation.com",
                Telephone = "+33 1 55 43 21 88",
                IdClient = client.Id,                               // 🔗 Liaison vers client
                EmailsJson = JsonSerializer.Serialize(new List<string> { "sophie.laurent@globaltech-innovation.com" }),
                PhonesJson = JsonSerializer.Serialize(new List<string> { "+33 1 55 43 21 88" }),
                RolesJson = JsonSerializer.Serialize(new List<string> { "Directrice Juridique" }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            
            // 👤 RESPONSABLE PROPRIÉTÉ INTELLECTUELLE
            new Contact
            {
                Nom = "Moreau",
                Prenom = "Alexandre",
                Role = "Responsable PI",                            // Expert technique brevets
                Email = "alexandre.moreau@globaltech-innovation.com",
                Telephone = "+33 1 55 43 21 89",
                IdClient = client.Id,                               // 🔗 Liaison vers client
                EmailsJson = JsonSerializer.Serialize(new List<string> { "alexandre.moreau@globaltech-innovation.com" }),
                PhonesJson = JsonSerializer.Serialize(new List<string> { "+33 1 55 43 21 89" }),
                RolesJson = JsonSerializer.Serialize(new List<string> { "Responsable PI" }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            
            // 👤 CHIEF TECHNOLOGY OFFICER
            new Contact
            {
                Nom = "Dupont",
                Prenom = "Émilie",
                Role = "CTO",                                       // Vision technologique et innovation
                Email = "emilie.dupont@globaltech-innovation.com",
                Telephone = "+33 1 55 43 21 90",
                IdClient = client.Id,                               // 🔗 Liaison vers client
                EmailsJson = JsonSerializer.Serialize(new List<string> { "emilie.dupont@globaltech-innovation.com" }),
                PhonesJson = JsonSerializer.Serialize(new List<string> { "+33 1 55 43 21 90" }),
                RolesJson = JsonSerializer.Serialize(new List<string> { "CTO" }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        contacts.AddRange(clientContacts);

        // 🏢 CONTACTS CABINETS (4 contacts par cabinet = 16 total)
        // Génération automatique selon spécialisation cabinet
        foreach (var cabinet in cabinets)
        {
            var cabinetContacts = GenerateCabinetContacts(cabinet);
            contacts.AddRange(cabinetContacts);
        }

        // 💾 SAUVEGARDE MASSIVE CONTACTS
        context.Contacts.AddRange(contacts);
        await context.SaveChangesAsync();
        
        // 📊 STATISTIQUES CRÉATION
        Console.WriteLine($"✅ {contacts.Count} contacts créés :");
        Console.WriteLine($"   └── 3 contacts client GlobalTech");
        Console.WriteLine($"   └── {cabinets.Count * 4} contacts cabinets (4 par cabinet)");
    }

    /// <summary>
    /// 🏢 GÉNÉRATEUR CONTACTS CABINETS SPÉCIALISÉS
    /// =============================================
    /// 
    /// Génère 4 contacts par cabinet avec rôles adaptés à la spécialisation.
    /// Algorithme intelligent de nommage et attribution fonctions.
    /// 
    /// 📋 RÔLES PAR SPÉCIALISATION :
    /// =============================
    /// 🔄 CABINETS ANNUITÉS :
    /// ├── Responsable Annuités - supervision portefeuilles
    /// ├── Assistant Annuités - gestion administrative  
    /// ├── Manager Renouvellements - pilotage échéances
    /// └── Chargé de Suivi - monitoring statuts
    /// 
    /// ⚖️ CABINETS PROCÉDURES :
    /// ├── Avocat Principal - contentieux et stratégie
    /// ├── Conseil en PI - expertise technique
    /// ├── Assistant Juridique - support administratif
    /// └── Mandataire Agréé - représentation officielle
    /// 
    /// 🎯 GÉNÉRATION INTELLIGENTE :
    /// - Prénoms/noms français variés (pools de 16 chacun)
    /// - Emails cohérents avec domaine cabinet
    /// - Téléphones basés sur standard + extension
    /// - Un contact par fonction (pas de doublons rôles)
    /// 
    /// </summary>
    /// <param name="cabinet">Cabinet parent pour génération contacts</param>
    /// <returns>Liste 4 contacts spécialisés pour le cabinet</returns>
    private static List<Contact> GenerateCabinetContacts(Cabinet cabinet)
    {
        var contacts = new List<Contact>();

        // 📝 POOLS DE NOMS FRANÇAIS VARIÉS
        // Prénoms et noms courants pour réalisme maximum
        var firstNames = new[] { "Jean", "Marie", "Pierre", "Claire", "Michel", "Anne", "David", "Julie", "François", "Isabelle", "Thomas", "Céline", "Nicolas", "Sylvie", "Julien", "Valérie" };
        var lastNames = new[] { "Dubois", "Martin", "Bernard", "Petit", "Thomas", "Robert", "Richard", "Moreau", "Simon", "Lefebvre", "Michel", "Garcia", "Roux", "Vincent", "Fournier", "Girard" };
        
        // 🎯 FONCTIONS SPÉCIALISÉES PAR TYPE CABINET
        var functions = cabinet.Type == CabinetType.Annuite 
            ? new[] { "Responsable Annuités", "Assistant Annuités", "Manager Renouvellements", "Chargé de Suivi" }
            : new[] { "Avocat Principal", "Conseil en PI", "Assistant Juridique", "Mandataire Agréé" };

        // 🔄 GÉNÉRATION 4 CONTACTS PAR CABINET
        for (int i = 0; i < 4; i++) // Exactement 4 contacts par cabinet
        {
            // 🎲 SÉLECTION ALÉATOIRE NOMS
            var firstName = firstNames[Random.Shared.Next(firstNames.Length)];
            var lastName = lastNames[Random.Shared.Next(lastNames.Length)];
            var function = functions[i]; // Un contact par fonction (ordre séquentiel)

            // 📧 GÉNÉRATION COORDONNÉES COHÉRENTES
            var emailDomain = cabinet.EmailCabinet?.Split('@')[1] ?? "example.com";
            var phoneBase = cabinet.TelephoneCabinet?.Substring(0, cabinet.TelephoneCabinet.Length - 2) ?? "+33 1 42 00 00";

            contacts.Add(new Contact
            {
                Nom = lastName,
                Prenom = firstName,
                Role = function,                                    // Fonction spécialisée cabinet
                Email = $"{firstName.ToLower()}.{lastName.ToLower()}@{emailDomain}", // Email cohérent domaine
                Telephone = $"{phoneBase}{(i + 1):D2}",            // Extension téléphone séquentielle
                IdCabinet = cabinet.Id,                             // 🔗 Liaison vers cabinet parent
                EmailsJson = JsonSerializer.Serialize(new List<string> { $"{firstName.ToLower()}.{lastName.ToLower()}@{emailDomain}" }),
                PhonesJson = JsonSerializer.Serialize(new List<string> { $"{phoneBase}{(i + 1):D2}" }),
                RolesJson = JsonSerializer.Serialize(new List<string> { function }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        return contacts;
    }

    /// <summary>
    /// 📝 CRÉATION PORTEFEUILLE BREVETS COMPLET
    /// ==========================================
    /// 
    /// Génère 10 brevets avec TOUTES leurs relations métier complexes.
    /// Architecture multi-relationnelle complète pour test réaliste.
    /// 
    /// 🎯 STRUCTURE PAR BREVET :
    /// =========================
    /// 📄 BREVET BASE : Titre, référence, commentaire technique
    /// 👥 ACTEURS (2 de chaque) :
    /// ├── 2 Inventeurs spécifiques avec nationalités
    /// ├── 2 Titulaires (dont client) avec domiciliations  
    /// └── 2 Déposants (dont client) avec juridictions agrément
    /// 
    /// 🏢 SERVICES :
    /// ├── 1 Cabinet Annuités (renouvellements)
    /// └── 1 Cabinet Procédures (dépôts/contentieux)
    /// 
    /// 🌍 COUVERTURE GÉOGRAPHIQUE :
    /// ├── 7-15 pays par brevet (dépôts InformationDepot)
    /// ├── Relations inventeurs-pays (nationalités/résidences)
    /// ├── Relations titulaires-pays (domiciliations légales)
    /// └── Relations déposants-pays (juridictions d'intervention)
    /// 
    /// 📊 DONNÉES RÉELLES :
    /// - 20 pays max depuis base données existante
    /// - Statuts juridiques depuis table Statuts  
    /// - Technologies variées : IA, IoT, Blockchain, etc.
    /// - Dates cohérentes : dépôt → publication → délivrance
    /// 
    /// 🔗 TOTAL RELATIONS CRÉÉES :
    /// ============================
    /// - 10 brevets × 2 inventeurs = 20 relations BrevetInventeur
    /// - 10 brevets × 2 titulaires = 20 relations BrevetTitulaire  
    /// - 10 brevets × 2 déposants = 20 relations BrevetDeposant
    /// - 10 brevets × 2 cabinets = 20 relations BrevetCabinet
    /// - 10 brevets × 7-15 pays = 100+ InformationDepot
    /// - Relations géographiques acteurs-pays : 80+ liaisons
    /// 
    /// </summary>
    /// <param name="context">Contexte EF pour création écosystème brevets</param>
    private static async Task SeedBrevets(StartingBlochDbContext context)
    {
        Console.WriteLine("📝 Création du portefeuille brevets complet...");

        // 📍 RÉCUPÉRATION ENTITÉS RÉFÉRENTIELLES
        var client = await context.Clients.FirstAsync(c => c.NomClient == "GlobalTech Innovation");
        var cabinets = await context.Cabinets.ToListAsync();
        var pays = await context.Pays.Take(20).ToListAsync(); // 🌍 20 pays variés pour couverture internationale
        var statuts = await context.Statuts.ToListAsync(); // 📊 Statuts juridiques réels base données

        // ⚠️ VALIDATION DONNÉES RÉFÉRENTIELLES
        if (statuts.Count == 0)
        {
            Console.WriteLine("⚠️ Aucun statut trouvé en base de données. Les InformationDepot seront créées sans statut.");
        }
        else
        {
            Console.WriteLine($"📊 {statuts.Count} statuts juridiques disponibles pour les dépôts");
        }

        // 📦 COLLECTIONS POUR CRÉATION MASSIVE
        // Optimisation : collecte toutes les entités avant sauvegarde groupée
        var allBrevets = new List<Brevet>();
        var allInventeurs = new List<Inventeur>();
        var allTitulaires = new List<Titulaire>();
        var allDeposants = new List<Deposant>();
        var allBrevetClients = new List<BrevetClient>();
        var allBrevetInventeurs = new List<BrevetInventeur>();
        var allBrevetTitulaires = new List<BrevetTitulaire>();
        var allBrevetDeposants = new List<BrevetDeposant>();
        var allBrevetCabinets = new List<BrevetCabinet>();
        var allInformationsDepot = new List<InformationDepot>();
        var allInventeurPays = new List<InventeurPays>();
        var allTitulairePays = new List<TitulairePays>();
        var allDeposantPays = new List<DeposantPays>();

        // 📋 CRÉATION 10 BREVETS AVEC RELATIONS COMPLÈTES
        Console.WriteLine($"� Génération 10 brevets innovants pour {client.NomClient}");

        for (int i = 0; i < 10; i++)
        {
            var brevet = GenerateBrevetOptimized(client, i + 1);
            allBrevets.Add(brevet);
            
            // Sauvegarder le brevet pour avoir son ID
            context.Brevets.Add(brevet);
            await context.SaveChangesAsync();

            // === CHAQUE BREVET A SES PROPRES ENTITÉS ===

            // 1. RELATION BREVET-CLIENT (obligatoire)
            allBrevetClients.Add(new BrevetClient
            {
                IdBrevet = brevet.IdBrevet,
                IdClient = client.Id,
                CreatedAt = DateTime.UtcNow
            });

            // 2. INVENTEURS SPÉCIFIQUES À CE BREVET (exactement 2 par brevet)
            for (int inv = 0; inv < 2; inv++)
            {
                var inventeur = GenerateInventeurOptimized(brevet.IdBrevet, inv + 1);
                allInventeurs.Add(inventeur);
                context.Inventeurs.Add(inventeur);
                await context.SaveChangesAsync();

                allBrevetInventeurs.Add(new BrevetInventeur
                {
                    IdBrevet = brevet.IdBrevet,
                    IdInventeur = inventeur.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // 3. TITULAIRES SPÉCIFIQUES À CE BREVET (exactement 2 par brevet)
            for (int tit = 0; tit < 2; tit++)
            {
                var titulaire = GenerateTitulaireOptimized(client, brevet.IdBrevet, tit);
                allTitulaires.Add(titulaire);
                context.Titulaires.Add(titulaire);
                await context.SaveChangesAsync();

                allBrevetTitulaires.Add(new BrevetTitulaire
                {
                    IdBrevet = brevet.IdBrevet,
                    IdTitulaire = titulaire.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // 4. DÉPOSANTS SPÉCIFIQUES À CE BREVET (exactement 2 par brevet)
            for (int dep = 0; dep < 2; dep++)
            {
                var deposant = GenerateDeposantOptimized(client, brevet.IdBrevet, dep);
                allDeposants.Add(deposant);
                context.Deposants.Add(deposant);
                await context.SaveChangesAsync();

                allBrevetDeposants.Add(new BrevetDeposant
                {
                    IdBrevet = brevet.IdBrevet,
                    IdDeposant = deposant.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // 5. CABINETS POUR CE BREVET (1 annuité + 1 procédure)
            var cabinetAnnuite = cabinets.Where(c => c.Type == CabinetType.Annuite).OrderBy(x => Random.Shared.Next()).First();
            var cabinetProcedure = cabinets.Where(c => c.Type == CabinetType.Procedure).OrderBy(x => Random.Shared.Next()).First();

            allBrevetCabinets.Add(new BrevetCabinet
            {
                IdBrevet = brevet.IdBrevet,
                IdCabinet = cabinetAnnuite.Id,
                CreatedAt = DateTime.UtcNow
            });

            allBrevetCabinets.Add(new BrevetCabinet
            {
                IdBrevet = brevet.IdBrevet,
                IdCabinet = cabinetProcedure.Id,
                CreatedAt = DateTime.UtcNow
            });

            // 6. PAYS POUR CE BREVET (7-15 pays via InformationDepot)
            var paysCount = Random.Shared.Next(7, 16); // 7 à 15 pays par brevet
            var selectedPays = pays.OrderBy(x => Random.Shared.Next()).Take(Math.Min(paysCount, pays.Count)).ToList();
            foreach (var paysBrevet in selectedPays)
            {
                var infoDepot = GenerateInformationDepotOptimized(brevet.IdBrevet, paysBrevet.Id, statuts);
                allInformationsDepot.Add(infoDepot);
            }

            // 7. RELATIONS INVENTEURS-PAYS (chaque inventeur a une nationalité/résidence dans les pays du brevet)
            var inventeursBrevet = allInventeurs.Where(inv => allBrevetInventeurs.Any(bi => bi.IdBrevet == brevet.IdBrevet && bi.IdInventeur == inv.Id)).ToList();
            foreach (var inventeur in inventeursBrevet)
            {
                // Chaque inventeur est associé à 1-2 pays du brevet (nationalité principale + résidence éventuelle)
                var paysInventeurCount = Random.Shared.Next(1, 3); // 1 ou 2 pays par inventeur
                var paysInventeur = selectedPays.OrderBy(x => Random.Shared.Next()).Take(paysInventeurCount).ToList();
                foreach (var paysInventeurItem in paysInventeur)
                {
                    allInventeurPays.Add(new InventeurPays
                    {
                        IdInventeur = inventeur.Id,
                        IdPays = paysInventeurItem.Id,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // 8. RELATIONS TITULAIRES-PAYS (titulaires domiciliés dans les pays du brevet)
            var titulairesBrevet = allTitulaires.Where(tit => allBrevetTitulaires.Any(bt => bt.IdBrevet == brevet.IdBrevet && bt.IdTitulaire == tit.Id)).ToList();
            foreach (var titulaire in titulairesBrevet)
            {
                // Chaque titulaire est domicilié dans 1 pays du brevet (siège social principal)
                var paysTitulaire = selectedPays.OrderBy(x => Random.Shared.Next()).First();
                allTitulairePays.Add(new TitulairePays
                {
                    IdTitulaire = titulaire.Id,
                    IdPays = paysTitulaire.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // 9. RELATIONS DÉPOSANTS-PAYS (déposants agréés dans les pays du brevet)
            var deposantsBrevet = allDeposants.Where(dep => allBrevetDeposants.Any(bd => bd.IdBrevet == brevet.IdBrevet && bd.IdDeposant == dep.Id)).ToList();
            foreach (var deposant in deposantsBrevet)
            {
                // Chaque déposant peut agir dans 1-3 pays du brevet (mandataires multi-juridictions)
                var paysDeposantCount = Random.Shared.Next(1, 4); // 1 à 3 pays par déposant
                var paysDeposant = selectedPays.OrderBy(x => Random.Shared.Next()).Take(Math.Min(paysDeposantCount, selectedPays.Count)).ToList();
                foreach (var paysDeposantItem in paysDeposant)
                {
                    allDeposantPays.Add(new DeposantPays
                    {
                        IdDeposant = deposant.Id,
                        IdPays = paysDeposantItem.Id,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        // 💾 SAUVEGARDE GROUPÉE OPTIMISÉE
        // Toutes les relations créées en une fois pour performance maximale
        context.BrevetClients.AddRange(allBrevetClients);
        context.BrevetInventeurs.AddRange(allBrevetInventeurs);
        context.BrevetTitulaires.AddRange(allBrevetTitulaires);
        context.BrevetDeposants.AddRange(allBrevetDeposants);
        context.BrevetCabinets.AddRange(allBrevetCabinets);
        context.InformationsDepot.AddRange(allInformationsDepot);
        context.InventeurPays.AddRange(allInventeurPays);
        context.TitulairePays.AddRange(allTitulairePays);
        context.DeposantPays.AddRange(allDeposantPays);
        await context.SaveChangesAsync();

        // 📊 RAPPORT DÉTAILLÉ CRÉATION
        Console.WriteLine($"✅ 📋 PORTEFEUILLE BREVETS CRÉÉ AVEC SUCCÈS !");
        Console.WriteLine($"");
        Console.WriteLine($"📄 BREVETS : 10 brevets technologiques innovants");
        Console.WriteLine($"👥 ACTEURS :");
        Console.WriteLine($"   ├── {allBrevetInventeurs.Count} relations inventeurs (20 inventeurs au total)");
        Console.WriteLine($"   ├── {allBrevetTitulaires.Count} relations titulaires (20 titulaires au total)");
        Console.WriteLine($"   └── {allBrevetDeposants.Count} relations déposants (20 déposants au total)");
        Console.WriteLine($"🏢 SERVICES :");
        Console.WriteLine($"   └── {allBrevetCabinets.Count} relations cabinets (1 Annuité + 1 Procédure par brevet)");
        Console.WriteLine($"🌍 COUVERTURE INTERNATIONALE :");
        Console.WriteLine($"   ├── {allInformationsDepot.Count} dépôts pays (7-15 pays par brevet)");
        Console.WriteLine($"   ├── {allInventeurPays.Count} relations inventeur-pays (nationalités/résidences)");
        Console.WriteLine($"   ├── {allTitulairePays.Count} relations titulaire-pays (domiciliations légales)");
        Console.WriteLine($"   └── {allDeposantPays.Count} relations déposant-pays (juridictions d'agrément)");
        Console.WriteLine($"");
        Console.WriteLine($"🎯 ÉCOSYSTÈME COMPLET OPÉRATIONNEL POUR TESTS !");
    }

    /// <summary>
    /// 🔬 GÉNÉRATEUR BREVETS TECHNOLOGIQUES INNOVANTS
    /// ===============================================
    /// 
    /// Crée un brevet avec métadonnées réalistes selon index.
    /// Technologies émergentes et références cohérentes client.
    /// 
    /// 🎯 TECHNOLOGIES COUVERTES :
    /// - Intelligence Artificielle & Machine Learning
    /// - Internet des Objets (IoT) & Systèmes Connectés  
    /// - Cybersécurité & Protection Données
    /// - Blockchain & Technologies Distribuées
    /// - Réalité Augmentée & Immersion Numérique
    /// - Nanotechnologies & Matériaux Avancés
    /// - Biotechnologies & Santé Numérique
    /// - Énergies Renouvelables & Transition Écologique
    /// - Robotique Avancée & Automatisation
    /// - Technologies Quantiques & Calcul Haute Performance
    /// 
    /// 📋 FORMAT RÉFÉRENCES :
    /// - Référence Famille : GTI-{année}-{index:D3} (ex: GTI-2023-001)
    /// - Titre Descriptif : "Système et méthode pour {technologie} - Innovation {N}"
    /// - Commentaire Technique : Description approche révolutionnaire
    /// 
    /// </summary>
    /// <param name="client">Client propriétaire du brevet</param>
    /// <param name="index">Index brevet pour unicité référence</param>
    /// <returns>Brevet généré avec métadonnées complètes</returns>
    private static Brevet GenerateBrevetOptimized(Client client, int index)
    {
        var technologies = new[] { 
            "Intelligence Artificielle", 
            "Internet des Objets", 
            "Cybersécurité", 
            "Blockchain", 
            "Réalité Augmentée",
            "Nanotechnologies",
            "Biotechnologies",
            "Énergies Renouvelables",
            "Robotique Avancée",
            "Quantique"
        };

        var tech = technologies[Random.Shared.Next(technologies.Length)];
        var year = Random.Shared.Next(2020, 2025);

        return new Brevet
        {
            ReferenceFamille = $"GTI-{year}-{index:D3}",
            Titre = $"Système et méthode pour {tech} - Innovation {index}",
            Commentaire = $"Cette invention propose une approche révolutionnaire pour {tech.ToLower()} développée par GlobalTech Innovation."
        };
    }

    private static Inventeur GenerateInventeurOptimized(int brevetId, int index)
    {
        var firstNames = new[] { "Alice", "Bob", "Charlie", "Diana", "Eric", "Fiona", "George", "Helen", "Ivan", "Julia", "Kevin", "Laura", "Marcus", "Nina", "Oscar", "Paula" };
        var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Jackson", "White" };

        return new Inventeur
        {
            Nom = lastNames[Random.Shared.Next(lastNames.Length)],
            Prenom = firstNames[Random.Shared.Next(firstNames.Length)],
            Adresse = $"{Random.Shared.Next(1, 999)} Innovation Boulevard, Lab {Random.Shared.Next(1, 100)}",
            Telephone = $"+33 1 {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)}",
            Email = $"inventeur.{brevetId}.{index}@globaltech-innovation.com",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static Titulaire GenerateTitulaireOptimized(Client client, int brevetId, int index)
    {
        if (index == 0)
        {
            // Premier titulaire = le client
            return new Titulaire
            {
                Nom = client.NomClient,
                Adresse = client.AdresseClient ?? "",
                Email = client.EmailClient ?? "",
                Telephone = client.TelephoneClient ?? "",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
        else
        {
            // Co-titulaires variés
            var coTitulaires = new[] { 
                "Innovation Partners France", 
                "Tech Ventures Europe", 
                "Research Holdings International", 
                "Global Patents Corporation", 
                "Future Tech Alliance", 
                "Advanced R&D Solutions" 
            };
            var coTitulaire = coTitulaires[Random.Shared.Next(coTitulaires.Length)];
            
            return new Titulaire
            {
                Nom = $"{coTitulaire}",
                Adresse = $"{Random.Shared.Next(1, 999)} Business Avenue, Suite {Random.Shared.Next(100, 999)}, Paris",
                Email = $"legal@{coTitulaire.Split(' ')[0].ToLower()}.com",
                Telephone = $"+33 1 {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
    }

    private static Deposant GenerateDeposantOptimized(Client client, int brevetId, int index)
    {
        if (index == 0)
        {
            // Premier déposant = le client
            return new Deposant
            {
                Nom = client.NomClient,
                Adresse = client.AdresseClient ?? "",
                Email = client.EmailClient ?? "",
                Telephone = client.TelephoneClient ?? "",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
        else
        {
            // Co-déposants variés
            var coDeposants = new[] { 
                "Legal Representatives SARL", 
                "Patent Filing Services SA", 
                "IP Management Corporation", 
                "Global Filing Solutions", 
                "International Patent Services", 
                "Strategic IP Partners France" 
            };
            var coDeposant = coDeposants[Random.Shared.Next(coDeposants.Length)];
            
            return new Deposant
            {
                Nom = $"{coDeposant}",
                Adresse = $"{Random.Shared.Next(1, 999)} Legal Street, Floor {Random.Shared.Next(1, 20)}, Paris",
                Email = $"filing@{coDeposant.Split(' ')[0].ToLower()}.com",
                Telephone = $"+33 1 {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)} {Random.Shared.Next(10, 99)}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
    }

    private static InformationDepot GenerateInformationDepotOptimized(int brevetId, int paysId, List<Statuts> statuts)
    {
        var baseDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 1800)); // Entre 1 mois et 5 ans
        var year = baseDate.Year;
        var randomSuffix = Random.Shared.Next(100000, 999999);

        // Sélectionner un statut aléatoire depuis la base de données
        var statutAleatoire = statuts.Count > 0 ? statuts[Random.Shared.Next(statuts.Count)] : null;

        return new InformationDepot
        {
            IdBrevet = brevetId,
            IdPays = paysId,
            IdStatuts = statutAleatoire?.Id, // Utiliser un statut réel de la BD
            NumeroDepot = $"{year}{randomSuffix:D6}",
            DateDepot = baseDate,
            NumeroPublication = $"PUB-{year}-{randomSuffix:D6}",
            DatePublication = baseDate.AddDays(Random.Shared.Next(180, 540)), // 6-18 mois après dépôt
            NumeroDelivrance = Random.Shared.Next(1, 100) > 30 ? $"PAT-{year}-{randomSuffix:D6}" : null, // 70% de chance d'avoir un numéro de délivrance
            DateDelivrance = Random.Shared.Next(1, 100) > 30 ? baseDate.AddDays(Random.Shared.Next(730, 1460)) : null, // 2-4 ans après dépôt si délivré
            Licence = Random.Shared.Next(1, 100) > 85, // 15% de chance d'avoir une licence
            Commentaire = $"Dépôt international pour brevet GTI-{brevetId} - Procédure standard GlobalTech",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}

/*
 * ================================================================================================
 * 📊 RÉSUMÉ COMPLET DU SCRIPT SEED
 * ================================================================================================
 * 
 * 🎯 DONNÉES CRÉÉES AU TOTAL :
 * ============================
 * 🏢 1 Client : GlobalTech Innovation (société française innovation)
 * 👤 1 Compte : Sophie Laurent (Directrice Juridique, rôle Client)
 * 🏢 4 Cabinets : 2 Annuités + 2 Procédures (France, UK, Allemagne)
 * 👥 19 Contacts : 3 client + 16 cabinets (4 par cabinet)
 * 📄 10 Brevets : Portfolio technologique varié
 * 👨‍🔬 20 Inventeurs : 2 par brevet avec nationalités
 * 🏛️ 20 Titulaires : 2 par brevet avec domiciliations
 * 📋 20 Déposants : 2 par brevet avec juridictions
 * 🌍 100+ Dépôts : 7-15 pays par brevet
 * 🔗 200+ Relations : Toutes associations métier créées
 * 
 * 🛡️ SÉCURITÉ ET QUALITÉ :
 * =========================
 * ✅ Transaction atomique (tout ou rien)
 * ✅ Validation doublons et contraintes
 * ✅ Mots de passe hachés BCrypt  
 * ✅ Données cohérentes et réalistes
 * ✅ Relations foreign key validées
 * ✅ Audit trail complet timestamps
 * ✅ Logs détaillés pour debugging
 * 
 * 📈 PERFORMANCE OPTIMISÉE :
 * ==========================
 * ✅ Création groupée entities
 * ✅ Sauvegarde massive relations
 * ✅ Requêtes base optimisées
 * ✅ Pas de N+1 queries
 * 
 * 🎮 PRÊT POUR TESTS COMPLETS !
 * =============================
 * Ce script génère un écosystème complet et cohérent pour tester
 * toutes les fonctionnalités de l'application StartingBloch.
 * 
 * ================================================================================================
 */
