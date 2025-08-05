using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using StartingBloch.Backend.Services;
using System.Diagnostics;

namespace StartingBloch.Backend.Tests.UnitTests.Performance;

public class PerformanceTests
{
    [Fact]
    public async Task ClientService_GetAll_Should_CompleteWithinTimeLimit()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new ClientService(context);
        
        // Add many clients
        var clients = TestDataSeeder.CreateManyClients(1000);
        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();

        // Act
        var stopwatch = Stopwatch.StartNew();
        var result = await service.GetAllAsync();
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000); // Should complete within 1 second
        result.Should().HaveCount(1000);
    }

    [Fact]
    public async Task BrevetService_SearchWithPagination_Should_BeEfficient()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new BrevetService(context);
        
        // Add many brevets
        var brevets = TestDataSeeder.CreateManyBrevets(2000);
        context.Brevets.AddRange(brevets);
        await context.SaveChangesAsync();

        // Act
        var stopwatch = Stopwatch.StartNew();
        var result = await service.SearchAsync("Test", 1, 50);
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(500); // Should complete within 500ms
        result.Items.Should().HaveCountLessOrEqualTo(50);
    }

    [Fact]
    public async Task DatabaseContext_BulkInsert_Should_BeOptimized()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var clients = TestDataSeeder.CreateManyClients(500);

        // Act
        var stopwatch = Stopwatch.StartNew();
        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(2000); // Should complete within 2 seconds
        context.Clients.Should().HaveCount(500);
    }

    [Fact]
    public async Task Search_WithIndexedFields_Should_BeOptimized()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new ClientService(context);
        
        // Add clients with searchable data
        var clients = TestDataSeeder.CreateManyClientsWithSearch(1000);
        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();

        // Act - Search by indexed field (email)
        var stopwatch = Stopwatch.StartNew();
        var result = await service.SearchAsync("test@example.com");
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100); // Should be very fast with index
        result.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ConcurrentAccess_Should_HandleMultipleRequests()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new ClientService(context);
        
        // Add test data
        var clients = TestDataSeeder.CreateManyClients(100);
        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();

        // Act - Simulate concurrent requests
        var tasks = new List<Task>();
        for (int i = 0; i < 10; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                var result = await service.GetAllAsync();
                result.Should().HaveCount(100);
            }));
        }

        var stopwatch = Stopwatch.StartNew();
        await Task.WhenAll(tasks);
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(3000); // All requests should complete within 3 seconds
    }

    [Fact]
    public async Task MemoryUsage_Should_StayWithinLimits()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new ClientService(context);
        
        var initialMemory = GC.GetTotalMemory(true);

        // Act - Process large dataset
        var clients = TestDataSeeder.CreateManyClients(5000);
        context.Clients.AddRange(clients);
        await context.SaveChangesAsync();

        var result = await service.GetAllAsync();
        
        var finalMemory = GC.GetTotalMemory(true);
        var memoryIncrease = finalMemory - initialMemory;

        // Assert
        memoryIncrease.Should().BeLessThan(50 * 1024 * 1024); // Should not use more than 50MB
        result.Should().HaveCount(5000);
    }

    [Fact]
    public async Task LazyLoading_Should_NotCauseNPlusOneQueries()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new ClientService(context);
        
        // Add clients with related data
        var clientsWithContacts = TestDataSeeder.CreateClientsWithManyContacts(50, 10); // 50 clients, 10 contacts each
        foreach (var client in clientsWithContacts)
        {
            context.Clients.Add(client);
        }
        await context.SaveChangesAsync();

        // Act - Load clients with contacts
        var stopwatch = Stopwatch.StartNew();
        var clients = await service.GetAllWithContactsAsync();
        var totalContacts = clients.Sum(c => c.Contacts?.Count ?? 0);
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000); // Should be efficient with proper includes
        clients.Should().HaveCount(50);
        totalContacts.Should().Be(500); // 50 clients * 10 contacts
    }

    [Fact]
    public void Serialization_Should_BeEfficient()
    {
        // Arrange
        var clients = TestDataSeeder.CreateManyClients(1000);
        var clientDtos = clients.Select(c => new ClientDto
        {
            Id = c.Id,
            Nom = c.Nom,
            Email = c.Email,
            Adresse = c.Adresse,
            Telephone = c.Telephone
        }).ToList();

        // Act
        var stopwatch = Stopwatch.StartNew();
        var json = System.Text.Json.JsonSerializer.Serialize(clientDtos);
        var deserialized = System.Text.Json.JsonSerializer.Deserialize<List<ClientDto>>(json);
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(500); // Serialization should be fast
        deserialized.Should().HaveCount(1000);
        deserialized!.First().Nom.Should().Be(clientDtos.First().Nom);
    }

    [Fact]
    public async Task DatabaseConnection_Should_HandleConnectionPooling()
    {
        // Arrange
        var contexts = new List<StartingBlochDbContext>();
        
        // Act - Create multiple connections rapidly
        var stopwatch = Stopwatch.StartNew();
        for (int i = 0; i < 20; i++)
        {
            var context = TestDbContextFactory.CreateInMemoryContext();
            contexts.Add(context);
            
            // Perform a simple operation
            var client = TestDataSeeder.CreateSingleClient();
            context.Clients.Add(client);
            await context.SaveChangesAsync();
        }
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(2000); // Should handle multiple connections efficiently
        contexts.Should().HaveCount(20);

        // Cleanup
        foreach (var context in contexts)
        {
            context.Dispose();
        }
    }

    [Fact]
    public async Task ComplexQuery_Should_BeOptimized()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryContext();
        var service = new BrevetService(context);
        
        // Create complex data structure
        var complexData = TestDataSeeder.CreateComplexBrevetStructure(100);
        foreach (var item in complexData)
        {
            context.Clients.Add(item.Client);
            context.Brevets.Add(item.Brevet);
            context.Inventeurs.AddRange(item.Inventeurs);
            context.Statuts.AddRange(item.Statuts);
        }
        await context.SaveChangesAsync();

        // Act - Complex query with joins
        var stopwatch = Stopwatch.StartNew();
        var result = await service.GetBrevetsWithFullDetailsAsync();
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1500); // Complex query should still be reasonably fast
        result.Should().HaveCount(100);
        result.All(b => b.Client != null).Should().BeTrue();
        result.All(b => b.Inventeurs != null).Should().BeTrue();
    }
}
