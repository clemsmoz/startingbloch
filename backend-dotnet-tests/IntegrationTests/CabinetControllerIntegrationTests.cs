using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;
using StartingBloch.Backend.Services;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class CabinetControllerIntegrationTests : BaseIntegrationTest
{
    public CabinetControllerIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetCabinets_Should_ReturnOkWithCabinets()
    {
        // Act
        var response = await Client.GetAsync("/api/cabinet");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var cabinets = await response.Content.ReadFromJsonAsync<List<CabinetDto>>();
        cabinets.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateCabinet_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var createDto = new CreateCabinetDto
        {
            Nom = "Cabinet Integration Test",
            Email = "integration@cabinet.com",
            Adresse = "123 Rue Integration",
            Telephone = "0123456789"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/cabinet", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var cabinet = await response.Content.ReadFromJsonAsync<CabinetDto>();
        cabinet.Should().NotBeNull();
        cabinet!.Nom.Should().Be(createDto.Nom);
        cabinet.Email.Should().Be(createDto.Email);
    }

    [Fact]
    public async Task GetCabinetById_WithExistingId_Should_ReturnOk()
    {
        // First create a cabinet
        var createDto = new CreateCabinetDto
        {
            Nom = "Cabinet pour test ID",
            Email = "testid@cabinet.com",
            Adresse = "456 Rue Test ID"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/cabinet", createDto);
        var createdCabinet = await createResponse.Content.ReadFromJsonAsync<CabinetDto>();

        // Act
        var response = await Client.GetAsync($"/api/cabinet/{createdCabinet!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var cabinet = await response.Content.ReadFromJsonAsync<CabinetDto>();
        cabinet!.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task GetCabinetById_WithNonExistentId_Should_ReturnNotFound()
    {
        // Act
        var response = await Client.GetAsync("/api/cabinet/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateCabinet_WithValidData_Should_UpdateSuccessfully()
    {
        // First create a cabinet
        var createDto = new CreateCabinetDto
        {
            Nom = "Cabinet pour modification",
            Email = "update@cabinet.com",
            Adresse = "789 Rue Update"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/cabinet", createDto);
        var createdCabinet = await createResponse.Content.ReadFromJsonAsync<CabinetDto>();

        // Arrange update
        var updateDto = new UpdateCabinetDto
        {
            Nom = "Cabinet Modifié Integration",
            Email = "modified@cabinet.com",
            Adresse = "999 Rue Modifiée"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/cabinet/{createdCabinet!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updatedCabinet = await response.Content.ReadFromJsonAsync<CabinetDto>();
        updatedCabinet!.Nom.Should().Be(updateDto.Nom);
        updatedCabinet.Email.Should().Be(updateDto.Email);
    }

    [Fact]
    public async Task DeleteCabinet_WithExistingId_Should_DeleteSuccessfully()
    {
        // First create a cabinet
        var createDto = new CreateCabinetDto
        {
            Nom = "Cabinet pour suppression",
            Email = "delete@cabinet.com",
            Adresse = "111 Rue Delete"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/cabinet", createDto);
        var createdCabinet = await createResponse.Content.ReadFromJsonAsync<CabinetDto>();

        // Act
        var response = await Client.DeleteAsync($"/api/cabinet/{createdCabinet!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify cabinet is deleted
        var getResponse = await Client.GetAsync($"/api/cabinet/{createdCabinet.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task SearchCabinets_Should_ReturnFilteredResults()
    {
        // First create some cabinets
        var cabinet1 = new CreateCabinetDto
        {
            Nom = "Cabinet Recherche Alpha",
            Email = "alpha@search.com",
            Adresse = "123 Alpha Street"
        };
        
        var cabinet2 = new CreateCabinetDto
        {
            Nom = "Cabinet Recherche Beta",
            Email = "beta@search.com",
            Adresse = "456 Beta Avenue"
        };

        await Client.PostAsJsonAsync("/api/cabinet", cabinet1);
        await Client.PostAsJsonAsync("/api/cabinet", cabinet2);

        // Act
        var response = await Client.GetAsync("/api/cabinet/search?query=Alpha");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var results = await response.Content.ReadFromJsonAsync<List<CabinetDto>>();
        results.Should().NotBeNull();
        results!.Should().Contain(c => c.Nom.Contains("Alpha"));
        results.Should().NotContain(c => c.Nom.Contains("Beta"));
    }

    [Fact]
    public async Task CreateCabinet_WithInvalidData_Should_ReturnBadRequest()
    {
        // Arrange
        var invalidDto = new CreateCabinetDto
        {
            Nom = "", // Nom vide - invalide
            Email = "invalid-email", // Email invalide
            Adresse = "Test Address"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/cabinet", invalidDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetCabinetsWithPagination_Should_ReturnCorrectPage()
    {
        // First create multiple cabinets
        for (int i = 1; i <= 5; i++)
        {
            var createDto = new CreateCabinetDto
            {
                Nom = $"Cabinet Pagination {i}",
                Email = $"pagination{i}@cabinet.com",
                Adresse = $"{i} Rue Pagination"
            };
            await Client.PostAsJsonAsync("/api/cabinet", createDto);
        }

        // Act
        var response = await Client.GetAsync("/api/cabinet?page=1&pageSize=2");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var cabinets = await response.Content.ReadFromJsonAsync<List<CabinetDto>>();
        cabinets.Should().NotBeNull();
        cabinets!.Should().HaveCountLessOrEqualTo(2);
    }
}
