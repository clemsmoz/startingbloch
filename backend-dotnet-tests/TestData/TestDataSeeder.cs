using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Tests.TestData;

public static class TestDataSeeder
{
    public static async Task SeedAsync(StartingBlochDbContext context)
    {
        // Clear existing data
        context.RemoveRange(context.Brevets);
        context.RemoveRange(context.Contacts);
        context.RemoveRange(context.Clients);
        context.RemoveRange(context.Users);
        context.RemoveRange(context.Inventeurs);
        context.RemoveRange(context.Deposants);
        context.RemoveRange(context.Titulaires);
        context.RemoveRange(context.Pays);
        // context.RemoveRange(context.NumeroPays); // Property removed
        context.RemoveRange(context.Cabinets);
        context.RemoveRange(context.Statuts);
        await context.SaveChangesAsync();

        // Seed fresh test data
        await SeedUsersAsync(context);
        await SeedClientsAsync(context);
        await SeedContactsAsync(context);
        await SeedPaysAsync(context);
        await SeedInventeursAsync(context);
        await SeedDeposantsAsync(context);
        await SeedTitulairesAsync(context);
        await SeedCabinetsAsync(context);
        await SeedStatutsAsync(context);
        await SeedBrevetsAsync(context);

        await context.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(StartingBlochDbContext context)
    {
        var users = new[]
        {
            new User
            {
                Username = "testadmin",
                Email = "admin@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("testpassword"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Username = "testuser",
                Email = "user@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("testpassword"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();
    }

    private static async Task SeedClientsAsync(StartingBlochDbContext context)
    {
        var clients = new[]
        {
            new Client
            {
                NomClient = "Client Test 1",
                AdresseClient = "123 Test Street",
                TelephoneClient = "0123456789",
                EmailClient = "client1@test.com",
                CreatedAt = DateTime.UtcNow
            },
            new Client
            {
                NomClient = "Client Innovation",
                AdresseClient = "456 Innovation Ave",
                TelephoneClient = "0987654321",
                EmailClient = "innovation@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();
    }

    private static async Task SeedContactsAsync(StartingBlochDbContext context)
    {
        var contacts = new[]
        {
            new Contact
            {
                Nom = "Contact Test",
                Prenom = "Prénom",
                EmailsJson = "[\"contact@test.com\", \"contact.alt@test.com\"]",
                PhonesJson = "[\"0123456789\", \"0987654321\"]",
                RolesJson = "[\"Manager\", \"Contact Principal\"]",
                CreatedAt = DateTime.UtcNow
            },
            new Contact
            {
                Nom = "Contact Innovation",
                Prenom = "Innovation",
                EmailsJson = "[\"innovation.contact@test.com\"]",
                PhonesJson = "[\"0147258369\"]",
                RolesJson = "[\"Développeur\"]",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Contacts.AddRange(contacts);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPaysAsync(StartingBlochDbContext context)
    {
        var pays = new[]
        {
            new Pays { NomFrFr = "France", CodeIso = "FR" },
            new Pays { NomFrFr = "Allemagne", CodeIso = "DE" },
            new Pays { NomFrFr = "États-Unis", CodeIso = "US" },
            new Pays { NomFrFr = "Japon", CodeIso = "JP" }
        };

        context.Pays.AddRange(pays);
        await context.SaveChangesAsync();
    }

    private static async Task SeedInventeursAsync(StartingBlochDbContext context)
    {
        var inventeurs = new[]
        {
            new Inventeur
            {
                Nom = "Einstein",
                Prenom = "Albert",
                Adresse = "123 Physics Street",
                Email = "einstein@test.com",
                CreatedAt = DateTime.UtcNow
            },
            new Inventeur
            {
                Nom = "Tesla",
                Prenom = "Nikola",
                Adresse = "456 Innovation Ave",
                Email = "tesla@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Inventeurs.AddRange(inventeurs);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDeposantsAsync(StartingBlochDbContext context)
    {
        var deposants = new[]
        {
            new Deposant
            {
                Nom = "Déposant Test 1",
                Prenom = "Prénom",
                Adresse = "123 Filing Street",
                Email = "deposant1@test.com",
                CreatedAt = DateTime.UtcNow
            },
            new Deposant
            {
                Nom = "Déposant Test 2",
                Prenom = "Autre",
                Adresse = "456 Patent Ave",
                Email = "deposant2@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Deposants.AddRange(deposants);
        await context.SaveChangesAsync();
    }

    private static async Task SeedTitulairesAsync(StartingBlochDbContext context)
    {
        var titulaires = new[]
        {
            new Titulaire
            {
                Nom = "Titulaire Test 1",
                Prenom = "Prénom",
                Adresse = "123 Rights Street",
                Email = "titulaire1@test.com",
                CreatedAt = DateTime.UtcNow
            },
            new Titulaire
            {
                Nom = "Titulaire Test 2",
                Prenom = "Autre",
                Adresse = "456 Ownership Ave",
                Email = "titulaire2@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Titulaires.AddRange(titulaires);
        await context.SaveChangesAsync();
    }

    private static async Task SeedCabinetsAsync(StartingBlochDbContext context)
    {
        var cabinets = new[]
        {
            new Cabinet
            {
                NomCabinet = "Cabinet Juridique Test",
                AdresseCabinet = "123 Law Street",
                TelephoneCabinet = "0123456789",
                EmailCabinet = "cabinet@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Cabinets.AddRange(cabinets);
        await context.SaveChangesAsync();
    }

    private static async Task SeedStatutsAsync(StartingBlochDbContext context)
    {
        var statuts = new[]
        {
            new Statuts { Description = "En cours d'examen" },
            new Statuts { Description = "Accordé" },
            new Statuts { Description = "Rejeté" },
            new Statuts { Description = "Abandonné" }
        };

        context.Statuts.AddRange(statuts);
        await context.SaveChangesAsync();
    }

    private static async Task SeedBrevetsAsync(StartingBlochDbContext context)
    {
        var client = await context.Clients.FirstAsync();
        var statut = await context.Statuts.FirstAsync();

        var brevets = new[]
        {
            new Brevet
            {
                ReferenceFamille = "FR123456789",
                Titre = "Invention Innovation Test",
                Commentaire = "Description de l'invention test",
                CreatedAt = DateTime.UtcNow
            },
            new Brevet
            {
                ReferenceFamille = "FR987654321",
                Titre = "Autre Innovation",
                Commentaire = "Autre description",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Brevets.AddRange(brevets);
        await context.SaveChangesAsync();
    }
}
