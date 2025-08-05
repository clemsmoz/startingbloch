using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class StatutsServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly StatutsService _service;

    public StatutsServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new StatutsService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllStatuts()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<StatutsDto>();
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnStatuts()
    {
        // Arrange
        var existingStatuts = await _context.Statuts.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingStatuts.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingStatuts.Id);
        result.Nom.Should().Be(existingStatuts.Nom);
    }

    [Fact]
    public async Task GetByNomAsync_WithValidNom_Should_ReturnStatuts()
    {
        // Arrange
        var existingStatuts = await _context.Statuts.FirstAsync();

        // Act
        var result = await _service.GetByNomAsync(existingStatuts.Nom);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(existingStatuts.Nom);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateStatuts()
    {
        // Arrange
        var createDto = new CreateStatutsDto
        {
            Nom = "Nouveau Statut Test"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Nom.Should().Be(createDto.Nom);
        result.Id.Should().BeGreaterThan(0);

        var statutsInDb = await _context.Statuts.FindAsync(result.Id);
        statutsInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateNom_Should_ThrowException()
    {
        // Arrange
        var existingStatuts = await _context.Statuts.FirstAsync();
        var createDto = new CreateStatutsDto
        {
            Nom = existingStatuts.Nom // Nom déjà existant
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateAsync(createDto));
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateStatuts()
    {
        // Arrange
        var existingStatuts = await _context.Statuts.FirstAsync();
        var updateDto = new UpdateStatutsDto
        {
            Nom = "Statut Modifié"
        };

        // Act
        var result = await _service.UpdateAsync(existingStatuts.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(updateDto.Nom);

        var statutsInDb = await _context.Statuts.FindAsync(existingStatuts.Id);
        statutsInDb!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteStatuts()
    {
        // Arrange
        var existingStatuts = await _context.Statuts.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingStatuts.Id);

        // Assert
        result.Should().BeTrue();

        var statutsInDb = await _context.Statuts.FindAsync(existingStatuts.Id);
        statutsInDb.Should().BeNull();
    }

    [Fact]
    public async Task IsNomAvailableAsync_WithAvailableNom_Should_ReturnTrue()
    {
        // Act
        var result = await _service.IsNomAvailableAsync("Statut Libre");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsNomAvailableAsync_WithTakenNom_Should_ReturnFalse()
    {
        // Arrange
        var existingStatuts = await _context.Statuts.FirstAsync();

        // Act
        var result = await _service.IsNomAvailableAsync(existingStatuts.Nom);

        // Assert
        result.Should().BeFalse();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
