using FluentAssertions;
using StartingBloch.Backend.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class PaysControllerIntegrationTests : BaseIntegrationTest
{
    public PaysControllerIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetPays_Should_ReturnOkWithPays()
    {
        // Act
        var response = await Client.GetAsync("/api/pays");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var pays = await response.Content.ReadFromJsonAsync<List<PaysDto>>();
        pays.Should().NotBeNull();
    }

    [Fact]
    public async Task CreatePays_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var createDto = new CreatePaysDto
        {
            Nom = "Pays Integration Test",
            CodeISO = "PIT",
            CodeISO3 = "PIT"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/pays", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var pays = await response.Content.ReadFromJsonAsync<PaysDto>();
        pays.Should().NotBeNull();
        pays!.Nom.Should().Be(createDto.Nom);
        pays.CodeISO.Should().Be(createDto.CodeISO);
    }

    [Fact]
    public async Task GetPaysByCode_Should_ReturnCorrectPays()
    {
        // First create a pays
        var createDto = new CreatePaysDto
        {
            Nom = "Test Country",
            CodeISO = "TC",
            CodeISO3 = "TES"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/pays", createDto);
        var createdPays = await createResponse.Content.ReadFromJsonAsync<PaysDto>();

        // Act
        var response = await Client.GetAsync($"/api/pays/code/{createDto.CodeISO}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var pays = await response.Content.ReadFromJsonAsync<PaysDto>();
        pays!.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task SearchPays_Should_ReturnFilteredResults()
    {
        // First create some pays
        var pays1 = new CreatePaysDto
        {
            Nom = "Allemagne Test",
            CodeISO = "AT",
            CodeISO3 = "ATE"
        };
        
        var pays2 = new CreatePaysDto
        {
            Nom = "Belgique Test",
            CodeISO = "BT",
            CodeISO3 = "BTE"
        };

        await Client.PostAsJsonAsync("/api/pays", pays1);
        await Client.PostAsJsonAsync("/api/pays", pays2);

        // Act
        var response = await Client.GetAsync("/api/pays/search?query=Allemagne");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var results = await response.Content.ReadFromJsonAsync<List<PaysDto>>();
        results.Should().NotBeNull();
        results!.Should().Contain(p => p.Nom.Contains("Allemagne"));
        results.Should().NotContain(p => p.Nom.Contains("Belgique"));
    }
}
