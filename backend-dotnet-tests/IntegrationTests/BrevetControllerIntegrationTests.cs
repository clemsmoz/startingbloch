using FluentAssertions;
using StartingBloch.Backend.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class BrevetControllerIntegrationTests : BaseIntegrationTest
{
    public BrevetControllerIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetBrevets_Should_ReturnOkWithBrevets()
    {
        // Act
        var response = await Client.GetAsync("/api/brevet");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var brevets = await response.Content.ReadFromJsonAsync<List<BrevetDto>>();
        brevets.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateBrevet_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var createDto = new CreateBrevetDto
        {
            Titre = "Brevet Integration Test",
            NumeroDemande = "FR999888777",
            DateDepot = DateTime.Now,
            ClientId = 1,
            Description = "Description du brevet d'intégration"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/brevet", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var brevet = await response.Content.ReadFromJsonAsync<BrevetDto>();
        brevet.Should().NotBeNull();
        brevet!.Titre.Should().Be(createDto.Titre);
        brevet.NumeroDemande.Should().Be(createDto.NumeroDemande);
    }

    [Fact]
    public async Task GetBrevetsByClient_Should_ReturnBrevetsForClient()
    {
        // Act
        var response = await Client.GetAsync("/api/brevet/client/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var brevets = await response.Content.ReadFromJsonAsync<List<BrevetDto>>();
        brevets.Should().NotBeNull();
        brevets!.Should().OnlyContain(b => b.ClientId == 1);
    }

    [Fact]
    public async Task AssignInventorToBrevet_Should_AssignSuccessfully()
    {
        // First create a brevet
        var createDto = new CreateBrevetDto
        {
            Titre = "Brevet pour test inventeur",
            NumeroDemande = "FR111222333",
            DateDepot = DateTime.Now,
            ClientId = 1
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/brevet", createDto);
        var createdBrevet = await createResponse.Content.ReadFromJsonAsync<BrevetDto>();

        // Act - Assign inventor
        var response = await Client.PostAsJsonAsync($"/api/brevet/{createdBrevet!.Id}/inventeurs", 
            new { InventorId = 1 });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdateBrevet_WithValidData_Should_UpdateSuccessfully()
    {
        // First create a brevet
        var createDto = new CreateBrevetDto
        {
            Titre = "Brevet pour modification",
            NumeroDemande = "FR444555666",
            DateDepot = DateTime.Now,
            ClientId = 1
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/brevet", createDto);
        var createdBrevet = await createResponse.Content.ReadFromJsonAsync<BrevetDto>();

        // Arrange update
        var updateDto = new UpdateBrevetDto
        {
            Titre = "Brevet Modifié Integration",
            Description = "Description modifiée"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/brevet/{createdBrevet!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updatedBrevet = await response.Content.ReadFromJsonAsync<BrevetDto>();
        updatedBrevet!.Titre.Should().Be(updateDto.Titre);
    }
}
