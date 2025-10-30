using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class ClientServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly ClientService _clientService;

    public ClientServiceTests()
    {
        _context = TestDbContextFactory.CreateInMemoryContext();
        _clientService = new ClientService(_context);
    }

    [Fact]
    public async Task GetClientsAsync_ShouldReturnPaginatedClients()
    {
        // Arrange
        await SeedTestClientsAsync();

        // Act
        var result = await _clientService.GetClientsAsync(page: 1, pageSize: 10);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.TotalItems.Should().BeGreaterThan(0);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetClientByIdAsync_WithValidId_ShouldReturnClient()
    {
        // Arrange
        await SeedTestClientsAsync();
        var expectedClientId = 1;

        // Act
        var result = await _clientService.GetClientByIdAsync(expectedClientId);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(expectedClientId);
        result.Data.Nom.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetClientByIdAsync_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var invalidId = 999;

        // Act
        var result = await _clientService.GetClientByIdAsync(invalidId);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeFalse();
        result.Data.Should().BeNull();
        result.Message.Should().Contain("non trouvé");
    }

    [Fact]
    public async Task CreateClientAsync_WithValidData_ShouldCreateClient()
    {
        // Arrange
        var createClientDto = new CreateClientDto
        {
            Nom = "Nouveau Client Test",
            Adresse = "123 Nouvelle Adresse",
            Telephone = "0123456789",
            Email = "nouveau@test.com"
        };

        // Act
        var result = await _clientService.CreateClientAsync(createClientDto);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Nom.Should().Be(createClientDto.Nom);
        result.Data.Email.Should().Be(createClientDto.Email);
        result.Message.Should().Contain("créé avec succès");
    }

    [Fact]
    public async Task UpdateClientAsync_WithValidData_ShouldUpdateClient()
    {
        // Arrange
        await SeedTestClientsAsync();
        var clientId = 1;
        var updateClientDto = new UpdateClientDto
        {
            Nom = "Client Modifié",
            Adresse = "Adresse Modifiée",
            Telephone = "0987654321",
            Email = "modifie@test.com"
        };

        // Act
        var result = await _clientService.UpdateClientAsync(clientId, updateClientDto);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Nom.Should().Be(updateClientDto.Nom);
        result.Data.Email.Should().Be(updateClientDto.Email);
        result.Message.Should().Contain("mis à jour");
    }

    [Fact]
    public async Task DeleteClientAsync_WithValidId_ShouldDeleteClient()
    {
        // Arrange
        await SeedTestClientsAsync();
        var clientId = 1;

        // Act
        var result = await _clientService.DeleteClientAsync(clientId);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Contain("supprimé");

        // Verify client is actually deleted
        var deletedClient = await _clientService.GetClientByIdAsync(clientId);
        deletedClient.Success.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateClientAsync_WithInvalidNom_ShouldReturnError(string? invalidNom)
    {
        // Arrange
        var createClientDto = new CreateClientDto
        {
            Nom = invalidNom!,
            Adresse = "Adresse valide",
            Telephone = "0123456789",
            Email = "email@test.com"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _clientService.CreateClientAsync(createClientDto));
        
        exception.Message.Should().Contain("nom");
    }

    [Fact]
    public async Task GetClientsAsync_WithSearchTerm_ShouldFilterResults()
    {
        // Arrange
        await SeedTestClientsAsync();
        var searchTerm = "Test 1";

        // Act
        var result = await _clientService.GetClientsAsync(page: 1, pageSize: 10, search: searchTerm);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.Data.Should().OnlyContain(c => c.Nom.Contains(searchTerm));
    }

    private async Task SeedTestClientsAsync()
    {
        var clients = new[]
        {
            new StartingBloch.Backend.Models.Client
            {
                Id = 1,
                Nom = "Client Test 1",
                Adresse = "123 Test Street",
                Telephone = "0123456789",
                Email = "client1@test.com",
                CreatedAt = DateTime.UtcNow
            },
            new StartingBloch.Backend.Models.Client
            {
                Id = 2,
                Nom = "Client Test 2",
                Adresse = "456 Test Avenue",
                Telephone = "0987654321",
                Email = "client2@test.com",
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.Clients.AddRange(clients);
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
