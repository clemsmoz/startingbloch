using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class TitulaireServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly TitulaireService _service;

    public TitulaireServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new TitulaireService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllTitulaires()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<TitulaireDto>();
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnTitulaire()
    {
        // Arrange
        var existingTitulaire = await _context.Titulaires.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingTitulaire.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingTitulaire.Id);
        result.Nom.Should().Be(existingTitulaire.Nom);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateTitulaire()
    {
        // Arrange
        var createDto = new CreateTitulaireDto
        {
            Nom = "Nouveau Titulaire",
            Prenom = "Prénom",
            Adresse = "123 Rights Street",
            Email = "titulaire@test.com"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Nom.Should().Be(createDto.Nom);
        result.Id.Should().BeGreaterThan(0);

        var titulaireInDb = await _context.Titulaires.FindAsync(result.Id);
        titulaireInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateTitulaire()
    {
        // Arrange
        var existingTitulaire = await _context.Titulaires.FirstAsync();
        var updateDto = new UpdateTitulaireDto
        {
            Nom = "Nom Modifié",
            Prenom = "Prénom Modifié"
        };

        // Act
        var result = await _service.UpdateAsync(existingTitulaire.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteTitulaire()
    {
        // Arrange
        var existingTitulaire = await _context.Titulaires.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingTitulaire.Id);

        // Assert
        result.Should().BeTrue();

        var titulaireInDb = await _context.Titulaires.FindAsync(existingTitulaire.Id);
        titulaireInDb.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
