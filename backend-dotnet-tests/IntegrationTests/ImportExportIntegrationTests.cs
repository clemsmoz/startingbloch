using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;
using StartingBloch.Backend.Services;
using System.Net;
using System.Net.Http.Json;
using System.Text;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class ImportExportIntegrationTests : BaseIntegrationTest
{
    public ImportExportIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task ImportClients_FromCSV_Should_CreateClients()
    {
        // Arrange
        var csvContent = @"Nom,Email,Adresse,Telephone
Client Import 1,import1@test.com,123 Rue Import,0123456789
Client Import 2,import2@test.com,456 Rue Import,0987654321
Client Import 3,import3@test.com,789 Rue Import,0147258369";

        var csvBytes = Encoding.UTF8.GetBytes(csvContent);
        var csvFile = new ByteArrayContent(csvBytes);
        csvFile.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");

        var formData = new MultipartFormDataContent();
        formData.Add(csvFile, "file", "clients.csv");

        // Act
        var response = await Client.PostAsync("/api/client/import", formData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var importResult = await response.Content.ReadFromJsonAsync<ImportResultDto>();
        importResult.Should().NotBeNull();
        importResult!.SuccessCount.Should().Be(3);
        importResult.ErrorCount.Should().Be(0);

        // Verify clients were created
        var getResponse = await Client.GetAsync("/api/client");
        var clients = await getResponse.Content.ReadFromJsonAsync<List<ClientDto>>();
        clients!.Should().Contain(c => c.Nom == "Client Import 1");
        clients.Should().Contain(c => c.Nom == "Client Import 2");
        clients.Should().Contain(c => c.Nom == "Client Import 3");
    }

    [Fact]
    public async Task ImportClients_FromExcel_Should_CreateClients()
    {
        // Arrange - Create a simple Excel file content (simplified for test)
        var excelData = CreateSimpleExcelBytes();
        var excelFile = new ByteArrayContent(excelData);
        excelFile.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        var formData = new MultipartFormDataContent();
        formData.Add(excelFile, "file", "clients.xlsx");

        // Act
        var response = await Client.PostAsync("/api/client/import", formData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var importResult = await response.Content.ReadFromJsonAsync<ImportResultDto>();
        importResult.Should().NotBeNull();
        importResult!.SuccessCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ImportClients_WithInvalidData_Should_ReturnErrors()
    {
        // Arrange
        var csvContent = @"Nom,Email,Adresse,Telephone
,invalid-email,123 Rue,0123456789
Valid Client,valid@test.com,456 Rue,invalid-phone
,another-invalid-email,,";

        var csvBytes = Encoding.UTF8.GetBytes(csvContent);
        var csvFile = new ByteArrayContent(csvBytes);
        csvFile.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");

        var formData = new MultipartFormDataContent();
        formData.Add(csvFile, "file", "clients.csv");

        // Act
        var response = await Client.PostAsync("/api/client/import", formData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var importResult = await response.Content.ReadFromJsonAsync<ImportResultDto>();
        importResult.Should().NotBeNull();
        importResult!.SuccessCount.Should().Be(1); // Only valid client
        importResult.ErrorCount.Should().Be(2); // Two invalid rows
        importResult.Errors.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ExportClients_ToCSV_Should_ReturnCorrectFormat()
    {
        // Arrange - Create some clients first
        var client1 = new CreateClientDto { Nom = "Export Client 1", Email = "export1@test.com" };
        var client2 = new CreateClientDto { Nom = "Export Client 2", Email = "export2@test.com" };
        
        await Client.PostAsJsonAsync("/api/client", client1);
        await Client.PostAsJsonAsync("/api/client", client2);

        // Act
        var response = await Client.GetAsync("/api/client/export?format=csv");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("text/csv");
        
        var csvContent = await response.Content.ReadAsStringAsync();
        csvContent.Should().Contain("Export Client 1");
        csvContent.Should().Contain("Export Client 2");
        csvContent.Should().Contain("Nom,Email"); // Header row
    }

    [Fact]
    public async Task ExportClients_ToExcel_Should_ReturnCorrectFormat()
    {
        // Arrange - Create some clients first
        var client1 = new CreateClientDto { Nom = "Export Excel 1", Email = "excel1@test.com" };
        var client2 = new CreateClientDto { Nom = "Export Excel 2", Email = "excel2@test.com" };
        
        await Client.PostAsJsonAsync("/api/client", client1);
        await Client.PostAsJsonAsync("/api/client", client2);

        // Act
        var response = await Client.GetAsync("/api/client/export?format=excel");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        
        var excelBytes = await response.Content.ReadAsByteArrayAsync();
        excelBytes.Should().NotBeEmpty();
        excelBytes.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task ImportBrevets_WithRelatedData_Should_LinkCorrectly()
    {
        // Arrange - First create a client
        var clientDto = new CreateClientDto { Nom = "Client for Brevet Import", Email = "brevetclient@test.com" };
        var clientResponse = await Client.PostAsJsonAsync("/api/client", clientDto);
        var createdClient = await clientResponse.Content.ReadFromJsonAsync<ClientDto>();

        var csvContent = $@"Titre,NumeroDemande,DateDepot,ClientId,Description
Brevet Import 1,FR2024777777,2024-01-01,{createdClient!.Id},Description 1
Brevet Import 2,FR2024888888,2024-02-01,{createdClient.Id},Description 2";

        var csvBytes = Encoding.UTF8.GetBytes(csvContent);
        var csvFile = new ByteArrayContent(csvBytes);
        csvFile.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");

        var formData = new MultipartFormDataContent();
        formData.Add(csvFile, "file", "brevets.csv");

        // Act
        var response = await Client.PostAsync("/api/brevet/import", formData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var importResult = await response.Content.ReadFromJsonAsync<ImportResultDto>();
        importResult!.SuccessCount.Should().Be(2);
        
        // Verify brevets were linked to client
        var brevetsResponse = await Client.GetAsync($"/api/brevet/client/{createdClient.Id}");
        var brevets = await brevetsResponse.Content.ReadFromJsonAsync<List<BrevetDto>>();
        brevets!.Should().HaveCount(2);
        brevets.Should().OnlyContain(b => b.ClientId == createdClient.Id);
    }

    [Fact]
    public async Task ExportBrevets_WithFilters_Should_RespectFilters()
    {
        // Arrange - Create brevets with different dates
        var client = await CreateTestClient();
        
        var brevet1 = new CreateBrevetDto
        {
            Titre = "Recent Brevet",
            NumeroDemande = "FR2024999999",
            DateDepot = DateTime.Now.AddDays(-10),
            ClientId = client.Id
        };
        
        var brevet2 = new CreateBrevetDto
        {
            Titre = "Old Brevet",
            NumeroDemande = "FR2020000000",
            DateDepot = DateTime.Now.AddYears(-2),
            ClientId = client.Id
        };

        await Client.PostAsJsonAsync("/api/brevet", brevet1);
        await Client.PostAsJsonAsync("/api/brevet", brevet2);

        // Act - Export with date filter
        var dateFrom = DateTime.Now.AddDays(-30).ToString("yyyy-MM-dd");
        var response = await Client.GetAsync($"/api/brevet/export?format=csv&dateFrom={dateFrom}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var csvContent = await response.Content.ReadAsStringAsync();
        csvContent.Should().Contain("Recent Brevet");
        csvContent.Should().NotContain("Old Brevet");
    }

    [Fact]
    public async Task ImportLargeFile_Should_ProcessInBatches()
    {
        // Arrange - Create large CSV content
        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine("Nom,Email,Adresse,Telephone");
        
        for (int i = 1; i <= 1000; i++)
        {
            csvBuilder.AppendLine($"Bulk Client {i},bulk{i}@test.com,{i} Bulk Street,012345678{i % 10}");
        }

        var csvBytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
        var csvFile = new ByteArrayContent(csvBytes);
        csvFile.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");

        var formData = new MultipartFormDataContent();
        formData.Add(csvFile, "file", "large_clients.csv");

        // Act
        var response = await Client.PostAsync("/api/client/import", formData);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var importResult = await response.Content.ReadFromJsonAsync<ImportResultDto>();
        importResult!.SuccessCount.Should().Be(1000);
        importResult.ErrorCount.Should().Be(0);
    }

    private async Task<ClientDto> CreateTestClient()
    {
        var clientDto = new CreateClientDto { Nom = "Test Client", Email = "test@client.com" };
        var response = await Client.PostAsJsonAsync("/api/client", clientDto);
        return (await response.Content.ReadFromJsonAsync<ClientDto>())!;
    }

    private static byte[] CreateSimpleExcelBytes()
    {
        // Simplified Excel file creation for testing
        // In a real implementation, you would use a library like EPPlus or ClosedXML
        return Encoding.UTF8.GetBytes("Simple Excel simulation");
    }
}
