using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Models;
using System.Text.Json;

namespace StartingBloch.Backend.Data;

public static class SeedDebug
{
    public static async Task SeedAsync(StartingBlochDbContext context)
    {
        Console.WriteLine("🔍 Debug seed - Test étape par étape...");

        try
        {
            // Test 1: Créer un cabinet simple
            Console.WriteLine("Test 1: Création d'un cabinet...");
            var cabinet = new Cabinet
            {
                NomCabinet = "Test Cabinet Debug",
                Type = CabinetType.Annuite,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Cabinets.Add(cabinet);
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Cabinet créé avec succès");

            // Test 2: Créer un client simple
            Console.WriteLine("Test 2: Création d'un client...");
            var client = new Client
            {
                NomClient = "Test Client Debug",
                ReferenceClient = "DEBUG-001",
                CanRead = true,
                CanWrite = false,
                IsBlocked = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Clients.Add(client);
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Client créé avec succès");

            // Test 3: Créer un contact simple
            Console.WriteLine("Test 3: Création d'un contact...");
            var contact = new Contact
            {
                Nom = "Dupont",
                Prenom = "Jean",
                Role = "Test",
                IdClient = client.Id,
                EmailsJson = JsonSerializer.Serialize(new List<string> { "test@debug.com" }),
                PhonesJson = JsonSerializer.Serialize(new List<string> { "0123456789" }),
                RolesJson = JsonSerializer.Serialize(new List<string> { "Test" }),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Contacts.Add(contact);
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Contact créé avec succès");

            // Test 4: Créer un brevet simple
            Console.WriteLine("Test 4: Création d'un brevet...");
            var brevet = new Brevet
            {
                Titre = "Test Brevet Debug",
                ReferenceFamille = "DEBUG-BR-001",
                Commentaire = "Brevet de test pour debug",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Brevets.Add(brevet);
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Brevet créé avec succès");

            Console.WriteLine("🎉 Tous les tests réussis ! Le problème ne vient pas des modèles de base.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur lors du test debug : {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }
}
