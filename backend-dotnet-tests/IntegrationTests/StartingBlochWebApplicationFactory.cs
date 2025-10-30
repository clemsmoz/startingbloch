using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StartingBloch.Backend.Data;
using System.Text;
using System.Text.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class StartingBlochWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the real database context
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<StartingBlochDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Add in-memory database for testing
            services.AddDbContext<StartingBlochDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb" + Guid.NewGuid().ToString());
            });

            // Build the service provider
            var sp = services.BuildServiceProvider();

            // Create a scope to obtain a reference to the database context
            using var scope = sp.CreateScope();
            var scopedServices = scope.ServiceProvider;
            var db = scopedServices.GetRequiredService<StartingBlochDbContext>();

            // Ensure the database is created
            db.Database.EnsureCreated();

            // Seed test data
            SeedTestData(db);
        });

        builder.UseEnvironment("Testing");
    }

    private static void SeedTestData(StartingBlochDbContext context)
    {
        try
        {
            // Add test users
            context.Users.AddRange(
                new StartingBloch.Backend.Models.User
                {
                    Id = 1,
                    Username = "testadmin",
                    Email = "admin@test.com",
                    Password = "hashedpassword",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new StartingBloch.Backend.Models.User
                {
                    Id = 2,
                    Username = "testuser",
                    Email = "user@test.com",
                    Password = "hashedpassword",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            );

            // Add test clients
            context.Clients.AddRange(
                new StartingBloch.Backend.Models.Client
                {
                    Id = 1,
                    NomClient = "Client Integration Test 1",
                    AdresseClient = "123 Integration St",
                    TelephoneClient = "0123456789",
                    EmailClient = "client1@integration.com",
                    CreatedAt = DateTime.UtcNow
                },
                new StartingBloch.Backend.Models.Client
                {
                    Id = 2,
                    NomClient = "Client Integration Test 2",
                    AdresseClient = "456 Integration Ave",
                    TelephoneClient = "0987654321",
                    EmailClient = "client2@integration.com",
                    CreatedAt = DateTime.UtcNow
                }
            );

            context.SaveChanges();
        }
        catch (Exception ex)
        {
            // Log or handle seeding errors
            Console.WriteLine($"Error seeding test data: {ex.Message}");
        }
    }
}

public class BaseIntegrationTest : IClassFixture<StartingBlochWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly StartingBlochWebApplicationFactory Factory;

    protected BaseIntegrationTest(StartingBlochWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected static StringContent CreateJsonContent(object obj)
    {
        var json = JsonSerializer.Serialize(obj, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        return new StringContent(json, Encoding.UTF8, "application/json");
    }

    protected static async Task<T?> DeserializeResponse<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}
