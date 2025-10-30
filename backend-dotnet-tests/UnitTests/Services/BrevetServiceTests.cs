using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class BrevetServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly BrevetService _service;

    public BrevetServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new BrevetService(_context);

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllBrevets()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().HaveCountGreaterThan(0);
        result.Should().AllBeOfType<BrevetDto>();
    }

    [Fact]
    public async Task GetAllAsync_WithPagination_Should_ReturnCorrectPage()
    {
        // Act
        var result = await _service.GetAllAsync(page: 1, pageSize: 1);

        // Assert
        result.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchTerm = "Innovation";

        // Act
        var result = await _service.GetAllAsync(search: searchTerm);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(b => 
            b.Titre.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            b.NumeroDemande.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnBrevet()
    {
        // Arrange
        var existingBrevet = await _context.Brevets.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingBrevet.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingBrevet.Id);
        result.Titre.Should().Be(existingBrevet.Titre);
        result.NumeroDemande.Should().Be(existingBrevet.NumeroDemande);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_Should_ReturnNull()
    {
        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateBrevet()
    {
        // Arrange
        var createDto = new CreateBrevetDto
        {
            Titre = "Nouveau Brevet Test",
            NumeroDemande = "FR999999",
            DateDepot = DateTime.Now,
            ClientId = 1,
            Description = "Description du nouveau brevet"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Titre.Should().Be(createDto.Titre);
        result.NumeroDemande.Should().Be(createDto.NumeroDemande);
        result.Id.Should().BeGreaterThan(0);

        // Verify in database
        var brevetInDb = await _context.Brevets.FindAsync(result.Id);
        brevetInDb.Should().NotBeNull();
        brevetInDb!.Titre.Should().Be(createDto.Titre);
    }

    [Fact]
    public async Task CreateAsync_WithInvalidClientId_Should_ThrowException()
    {
        // Arrange
        var createDto = new CreateBrevetDto
        {
            Titre = "Brevet avec client inexistant",
            NumeroDemande = "FR888888",
            DateDepot = DateTime.Now,
            ClientId = 999 // Client inexistant
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateAsync(createDto));
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateBrevet()
    {
        // Arrange
        var existingBrevet = await _context.Brevets.FirstAsync();
        var updateDto = new UpdateBrevetDto
        {
            Titre = "Titre Modifié",
            NumeroDemande = "FR555555",
            DateDepot = DateTime.Now.AddDays(-5),
            Description = "Description modifiée"
        };

        // Act
        var result = await _service.UpdateAsync(existingBrevet.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Titre.Should().Be(updateDto.Titre);
        result.NumeroDemande.Should().Be(updateDto.NumeroDemande);

        // Verify in database
        var brevetInDb = await _context.Brevets.FindAsync(existingBrevet.Id);
        brevetInDb!.Titre.Should().Be(updateDto.Titre);
        brevetInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_Should_ReturnNull()
    {
        // Arrange
        var updateDto = new UpdateBrevetDto
        {
            Titre = "Titre pour brevet inexistant"
        };

        // Act
        var result = await _service.UpdateAsync(999, updateDto);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteBrevet()
    {
        // Arrange
        var existingBrevet = await _context.Brevets.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingBrevet.Id);

        // Assert
        result.Should().BeTrue();

        // Verify deletion
        var brevetInDb = await _context.Brevets.FindAsync(existingBrevet.Id);
        brevetInDb.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_Should_ReturnFalse()
    {
        // Act
        var result = await _service.DeleteAsync(999);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetByClientIdAsync_Should_ReturnBrevetsByClient()
    {
        // Arrange
        var client = await _context.Clients.FirstAsync();

        // Act
        var result = await _service.GetByClientIdAsync(client.Id);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(b => b.ClientId == client.Id);
    }

    [Fact]
    public async Task AssignInventorAsync_WithValidIds_Should_AssignInventor()
    {
        // Arrange
        var brevet = await _context.Brevets.FirstAsync();
        var inventeur = await _context.Inventeurs.FirstAsync();

        // Act
        var result = await _service.AssignInventorAsync(brevet.Id, inventeur.Id);

        // Assert
        result.Should().BeTrue();

        // Verify assignment
        var brevetInDb = await _context.Brevets
            .Include(b => b.Inventeurs)
            .FirstAsync(b => b.Id == brevet.Id);
        brevetInDb.Inventeurs.Should().Contain(i => i.Id == inventeur.Id);
    }

    [Fact]
    public async Task AssignDeposantAsync_WithValidIds_Should_AssignDeposant()
    {
        // Arrange
        var brevet = await _context.Brevets.FirstAsync();
        var deposant = await _context.Deposants.FirstAsync();

        // Act
        var result = await _service.AssignDeposantAsync(brevet.Id, deposant.Id);

        // Assert
        result.Should().BeTrue();

        // Verify assignment
        var brevetInDb = await _context.Brevets
            .Include(b => b.Deposants)
            .FirstAsync(b => b.Id == brevet.Id);
        brevetInDb.Deposants.Should().Contain(d => d.Id == deposant.Id);
    }

    [Fact]
    public async Task AssignTitulaireAsync_WithValidIds_Should_AssignTitulaire()
    {
        // Arrange
        var brevet = await _context.Brevets.FirstAsync();
        var titulaire = await _context.Titulaires.FirstAsync();

        // Act
        var result = await _service.AssignTitulaireAsync(brevet.Id, titulaire.Id);

        // Assert
        result.Should().BeTrue();

        // Verify assignment
        var brevetInDb = await _context.Brevets
            .Include(b => b.Titulaires)
            .FirstAsync(b => b.Id == brevet.Id);
        brevetInDb.Titulaires.Should().Contain(t => t.Id == titulaire.Id);
    }

    [Fact]
    public async Task RemoveInventorAsync_WithValidIds_Should_RemoveInventor()
    {
        // Arrange
        var brevet = await _context.Brevets.Include(b => b.Inventeurs).FirstAsync();
        var inventeur = brevet.Inventeurs.First();

        // Act
        var result = await _service.RemoveInventorAsync(brevet.Id, inventeur.Id);

        // Assert
        result.Should().BeTrue();

        // Verify removal
        var brevetInDb = await _context.Brevets
            .Include(b => b.Inventeurs)
            .FirstAsync(b => b.Id == brevet.Id);
        brevetInDb.Inventeurs.Should().NotContain(i => i.Id == inventeur.Id);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
