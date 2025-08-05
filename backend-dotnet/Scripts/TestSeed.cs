/*
 * ================================================================================================
 * SCRIPT DE TEST POUR LE SEED MASSIF
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;

namespace StartingBloch.Backend.Scripts;

public class TestSeed
{
    public static async Task RunAsync()
    {
        Console.WriteLine("🧪 Test du script de seed massif...");
        
        var optionsBuilder = new DbContextOptionsBuilder<StartingBlochDbContext>();
        optionsBuilder.UseSqlite("Data Source=test-seed.db");
        
        using var context = new StartingBlochDbContext(optionsBuilder.Options);
        
        // Créer la base de test
        await context.Database.EnsureCreatedAsync();
        
        // Exécuter le seed
        await SeedMassiveData.SeedAsync(context);
        
        // Vérifier les résultats
        var clientsCount = await context.Clients.CountAsync();
        var cabinetsCount = await context.Cabinets.CountAsync();
        var brevetsCount = await context.Brevets.CountAsync();
        var contactsCount = await context.Contacts.CountAsync();
        
        Console.WriteLine($"✅ Seed terminé :");
        Console.WriteLine($"   - Clients : {clientsCount}");
        Console.WriteLine($"   - Cabinets : {cabinetsCount}");
        Console.WriteLine($"   - Brevets : {brevetsCount}");
        Console.WriteLine($"   - Contacts : {contactsCount}");
        
        // Nettoyer
        await context.Database.EnsureDeletedAsync();
        
        Console.WriteLine("🧹 Base de test nettoyée");
    }
}
