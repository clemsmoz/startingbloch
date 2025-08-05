using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Tests.TestData;

public class TestDbContextFactory
{
    public static StartingBlochDbContext CreateInMemoryContext(string databaseName = "TestDb")
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: databaseName + Guid.NewGuid().ToString())
            .Options;

        var context = new StartingBlochDbContext(options);
        return context;
    }

    public static async Task<StartingBlochDbContext> CreateContextWithTestDataAsync()
    {
        var context = CreateInMemoryContext();
        await SeedTestDataAsync(context);
        return context;
    }

    private static async Task SeedTestDataAsync(StartingBlochDbContext context)
    {
        // Seed test users
        var users = new List<User>
        {
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@test.com",
                Password = "hashedpassword",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = 2,
                Username = "user1",
                Email = "user1@test.com",
                Password = "hashedpassword",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        // Seed test clients
        var clients = new List<Client>
        {
            new Client
            {
                Id = 1,
                NomClient = "Client Test 1",
                AdresseClient = "123 Test Street",
                TelephoneClient = "0123456789",
                EmailClient = "client1@test.com",
                CreatedAt = DateTime.UtcNow
            },
            new Client
            {
                Id = 2,
                NomClient = "Client Test 2",
                AdresseClient = "456 Test Avenue",
                TelephoneClient = "0987654321",
                EmailClient = "client2@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        // Seed test cabinets
        var cabinets = new List<Cabinet>
        {
            new Cabinet
            {
                Id = 1,
                NomCabinet = "Cabinet Test 1",
                AdresseCabinet = "789 Cabinet Street",
                TelephoneCabinet = "0111222333",
                EmailCabinet = "cabinet1@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        // Seed test contacts
        var contacts = new List<Contact>
        {
            new Contact
            {
                Id = 1,
                Nom = "Dupont",
                Prenom = "Jean",
                Email = "jean.dupont@test.com",
                Telephone = "0123456789",
                Role = "Responsable",
                IdClient = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                EmailsJson = "[\"jean.dupont@test.com\", \"j.dupont@alt.com\"]",
                PhonesJson = "[\"0123456789\", \"0987654321\"]",
                RolesJson = "[\"Responsable\", \"Contact principal\"]"
            }
        };

        // Seed test brevets
        var brevets = new List<Brevet>
        {
            new Brevet
            {
                Id = 1,
                ReferenceFamille = "FR2024001",
                Titre = "Invention Test 1",
                Commentaire = "Description de test",
                CreatedAt = DateTime.UtcNow
            }
        };

        // Seed test pays
        var pays = new List<Pays>
        {
            new Pays
            {
                Id = 1,
                NomFrFr = "France",
                CodeIso = "FR",
                CreatedAt = DateTime.UtcNow
            },
            new Pays
            {
                Id = 2,
                NomFrFr = "Allemagne",
                CodeIso = "DE",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Users.AddRange(users);
        context.Clients.AddRange(clients);
        context.Cabinets.AddRange(cabinets);
        context.Contacts.AddRange(contacts);
        context.Brevets.AddRange(brevets);
        context.Pays.AddRange(pays);

        await context.SaveChangesAsync();
    }
}
