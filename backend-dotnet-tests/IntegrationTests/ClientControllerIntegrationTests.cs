using FluentAssertions;
using StartingBloch.Backend.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class ClientControllerIntegrationTests : BaseIntegrationTest
{
    public ClientControllerIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetClients_Should_ReturnOkWithClients()
    {
        // Act
        var response = await Client.GetAsync("/api/client");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        clients.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task GetClient_WithValidId_Should_ReturnClient()
    {
        // Act
        var response = await Client.GetAsync("/api/client/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var client = await response.Content.ReadFromJsonAsync<ClientDto>();
        client.Should().NotBeNull();
        client!.Id.Should().Be(1);
        client.Nom.Should().Be("Client Integration Test 1");
    }

    [Fact]
    public async Task GetClient_WithInvalidId_Should_ReturnNotFound()
    {
        // Act
        var response = await Client.GetAsync("/api/client/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateClient_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var createDto = new CreateClientDto
        {
            Nom = "Nouveau Client Integration",
            Adresse = "789 New Street",
            Telephone = "0147258369",
            Email = "nouveau@integration.com"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/client", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var client = await response.Content.ReadFromJsonAsync<ClientDto>();
        client.Should().NotBeNull();
        client!.Nom.Should().Be(createDto.Nom);
        client.Email.Should().Be(createDto.Email);
        client.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateClient_WithInvalidData_Should_ReturnBadRequest()
    {
        // Arrange
        var createDto = new CreateClientDto
        {
            Nom = "", // Nom vide
            Adresse = "Test Address",
            Telephone = "0123456789",
            Email = "test@test.com"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/client", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateClient_WithValidData_Should_ReturnOk()
    {
        // Arrange
        var updateDto = new UpdateClientDto
        {
            Nom = "Client Modifié Integration",
            Adresse = "999 Updated Street",
            Telephone = "0999888777",
            Email = "updated@integration.com"
        };

        // Act
        var response = await Client.PutAsJsonAsync("/api/client/1", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var client = await response.Content.ReadFromJsonAsync<ClientDto>();
        client.Should().NotBeNull();
        client!.Nom.Should().Be(updateDto.Nom);
        client.Email.Should().Be(updateDto.Email);
    }

    [Fact]
    public async Task UpdateClient_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        var updateDto = new UpdateClientDto
        {
            Nom = "Client Inexistant",
            Adresse = "Test Address",
            Telephone = "0123456789",
            Email = "test@test.com"
        };

        // Act
        var response = await Client.PutAsJsonAsync("/api/client/999", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteClient_WithValidId_Should_ReturnNoContent()
    {
        // Act
        var response = await Client.DeleteAsync("/api/client/2");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify client is deleted
        var getResponse = await Client.GetAsync("/api/client/2");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteClient_WithInvalidId_Should_ReturnNotFound()
    {
        // Act
        var response = await Client.DeleteAsync("/api/client/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SearchClients_Should_ReturnFilteredResults()
    {
        // Act
        var response = await Client.GetAsync("/api/client?search=Integration");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        clients.Should().HaveCountGreaterThan(0);
        clients!.All(c => c.Nom.Contains("Integration")).Should().BeTrue();
    }

    [Fact]
    public async Task GetClients_WithPagination_Should_ReturnCorrectPage()
    {
        // Act
        var response = await Client.GetAsync("/api/client?page=1&pageSize=1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var clients = await response.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients.Should().NotBeNull();
        clients.Should().HaveCount(1);
    }
}
