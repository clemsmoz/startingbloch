using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class PaginationAndSearchIntegrationTests : BaseIntegrationTest
{
    public PaginationAndSearchIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetClients_WithPagination_Should_ReturnCorrectPage()
    {
        // Arrange - Create multiple clients
        for (int i = 1; i <= 10; i++)
        {
            var clientDto = new CreateClientDto
            {
                Nom = $"Client Pagination {i}",
                Email = $"pagination{i}@test.com",
                Adresse = $"{i} Rue Test"
            };
            await Client.PostAsJsonAsync("/api/client", clientDto);
        }

        // Act
        var response = await Client.GetAsync("/api/client?page=2&pageSize=3");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Vérifier les headers de pagination
        response.Headers.Should().ContainKey("X-Total-Count");
        response.Headers.Should().ContainKey("X-Page");
        response.Headers.Should().ContainKey("X-Page-Size");
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        clients!.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetBrevets_WithSearch_Should_ReturnFilteredResults()
    {
        // Arrange - Create test brevets
        var brevet1 = new CreateBrevetDto
        {
            Titre = "Innovation Smartphone",
            NumeroDemande = "FR2024111111",
            DateDepot = DateTime.Now,
            ClientId = 1,
            Description = "Nouvelle technologie mobile"
        };

        var brevet2 = new CreateBrevetDto
        {
            Titre = "Procédé Chimique",
            NumeroDemande = "FR2024222222",
            DateDepot = DateTime.Now,
            ClientId = 1,
            Description = "Méthode de synthèse innovante"
        };

        var brevet3 = new CreateBrevetDto
        {
            Titre = "Innovation Automobile",
            NumeroDemande = "FR2024333333",
            DateDepot = DateTime.Now,
            ClientId = 1,
            Description = "Nouveau système de freinage"
        };

        await Client.PostAsJsonAsync("/api/brevet", brevet1);
        await Client.PostAsJsonAsync("/api/brevet", brevet2);
        await Client.PostAsJsonAsync("/api/brevet", brevet3);

        // Act
        var response = await Client.GetAsync("/api/brevet/search?query=Innovation");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var brevets = await response.Content.ReadFromJsonAsync<List<BrevetDto>>();
        brevets.Should().NotBeNull();
        brevets!.Should().HaveCount(2);
        brevets.Should().OnlyContain(b => b.Titre.Contains("Innovation"));
    }

    [Fact]
    public async Task GetContacts_WithAdvancedSearch_Should_ReturnCorrectResults()
    {
        // Arrange - Create test contacts
        var contact1 = new CreateContactDto
        {
            Nom = "Dupont",
            Prenom = "Jean",
            Emails = new List<string> { "jean.dupont@example.com" },
            Telephones = new List<string> { "0123456789" },
            ClientId = 1
        };

        var contact2 = new CreateContactDto
        {
            Nom = "Martin",
            Prenom = "Marie",
            Emails = new List<string> { "marie.martin@example.com" },
            Telephones = new List<string> { "0987654321" },
            ClientId = 1
        };

        var contact3 = new CreateContactDto
        {
            Nom = "Durand",
            Prenom = "Jean",
            Emails = new List<string> { "jean.durand@example.com" },
            Telephones = new List<string> { "0147258369" },
            ClientId = 1
        };

        await Client.PostAsJsonAsync("/api/contact", contact1);
        await Client.PostAsJsonAsync("/api/contact", contact2);
        await Client.PostAsJsonAsync("/api/contact", contact3);

        // Act - Search by first name
        var response = await Client.GetAsync("/api/contact/search?query=Jean");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var contacts = await response.Content.ReadFromJsonAsync<List<ContactDto>>();
        contacts.Should().NotBeNull();
        contacts!.Should().HaveCount(2);
        contacts.Should().OnlyContain(c => c.Prenom.Contains("Jean"));
    }

    [Fact]
    public async Task GetClients_WithSorting_Should_ReturnSortedResults()
    {
        // Arrange - Create clients with different names
        var clientA = new CreateClientDto { Nom = "Alpha Client", Email = "alpha@test.com" };
        var clientZ = new CreateClientDto { Nom = "Zeta Client", Email = "zeta@test.com" };
        var clientB = new CreateClientDto { Nom = "Beta Client", Email = "beta@test.com" };

        await Client.PostAsJsonAsync("/api/client", clientZ);
        await Client.PostAsJsonAsync("/api/client", clientA);
        await Client.PostAsJsonAsync("/api/client", clientB);

        // Act - Sort by name ascending
        var response = await Client.GetAsync("/api/client?sortBy=nom&sortOrder=asc");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        
        // Verify sorting
        for (int i = 0; i < clients!.Count - 1; i++)
        {
            string.Compare(clients[i].Nom, clients[i + 1].Nom, StringComparison.OrdinalIgnoreCase)
                .Should().BeLessOrEqualTo(0);
        }
    }

    [Fact]
    public async Task GetBrevets_WithComplexFilter_Should_ReturnCorrectResults()
    {
        // Arrange - Create brevets with different dates and statuses
        var brevet1 = new CreateBrevetDto
        {
            Titre = "Brevet Récent",
            NumeroDemande = "FR2024444444",
            DateDepot = DateTime.Now.AddDays(-10),
            ClientId = 1
        };

        var brevet2 = new CreateBrevetDto
        {
            Titre = "Brevet Ancien",
            NumeroDemande = "FR2020555555",
            DateDepot = DateTime.Now.AddYears(-2),
            ClientId = 1
        };

        await Client.PostAsJsonAsync("/api/brevet", brevet1);
        await Client.PostAsJsonAsync("/api/brevet", brevet2);

        // Act - Filter by date range
        var dateFrom = DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd");
        var dateTo = DateTime.Now.ToString("yyyy-MM-dd");
        
        var response = await Client.GetAsync($"/api/brevet?dateFrom={dateFrom}&dateTo={dateTo}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var brevets = await response.Content.ReadFromJsonAsync<List<BrevetDto>>();
        brevets.Should().NotBeNull();
        brevets!.Should().Contain(b => b.Titre == "Brevet Récent");
        brevets.Should().NotContain(b => b.Titre == "Brevet Ancien");
    }

    [Fact]
    public async Task BulkOperations_Should_ProcessMultipleItems()
    {
        // Arrange - Create multiple clients to delete
        var clientIds = new List<int>();
        
        for (int i = 1; i <= 5; i++)
        {
            var clientDto = new CreateClientDto
            {
                Nom = $"Client Bulk {i}",
                Email = $"bulk{i}@test.com"
            };
            
            var response = await Client.PostAsJsonAsync("/api/client", clientDto);
            var createdClient = await response.Content.ReadFromJsonAsync<ClientDto>();
            clientIds.Add(createdClient!.Id);
        }

        // Act - Bulk delete
        var bulkDeleteDto = new BulkDeleteDto { Ids = clientIds };
        var deleteResponse = await Client.PostAsJsonAsync("/api/client/bulk-delete", bulkDeleteDto);

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify clients are deleted
        foreach (var id in clientIds)
        {
            var getResponse = await Client.GetAsync($"/api/client/{id}");
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }

    [Fact]
    public async Task SearchWithSpecialCharacters_Should_HandleCorrectly()
    {
        // Arrange
        var clientWithSpecialChars = new CreateClientDto
        {
            Nom = "Société É&Ç Spécial",
            Email = "special@test.com"
        };

        await Client.PostAsJsonAsync("/api/client", clientWithSpecialChars);

        // Act - Search with URL encoded special characters
        var searchQuery = Uri.EscapeDataString("É&Ç");
        var response = await Client.GetAsync($"/api/client/search?query={searchQuery}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        clients!.Should().Contain(c => c.Nom.Contains("É&Ç"));
    }

    [Fact]
    public async Task Pagination_WithLargeDataset_Should_PerformWell()
    {
        // Arrange - Create many items
        var tasks = new List<Task>();
        for (int i = 1; i <= 50; i++)
        {
            var clientDto = new CreateClientDto
            {
                Nom = $"Performance Client {i}",
                Email = $"perf{i}@test.com"
            };
            tasks.Add(Client.PostAsJsonAsync("/api/client", clientDto));
        }
        
        await Task.WhenAll(tasks);

        // Act - Measure performance
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var response = await Client.GetAsync("/api/client?page=1&pageSize=10");
        stopwatch.Stop();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000); // Should respond within 1 second
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        clients!.Should().HaveCount(10);
    }
}
