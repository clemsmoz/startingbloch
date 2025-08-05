using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class InventeurServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly InventeurService _service;

    public InventeurServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new InventeurService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllInventeurs()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<InventeurDto>();
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnInventeur()
    {
        // Arrange
        var existingInventeur = await _context.Inventeurs.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingInventeur.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingInventeur.Id);
        result.Nom.Should().Be(existingInventeur.Nom);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateInventeur()
    {
        // Arrange
        var createDto = new CreateInventeurDto
        {
            Nom = "Nouvel Inventeur",
            Prenom = "Prénom",
            Adresse = "123 Innovation Street",
            Email = "inventeur@test.com"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Nom.Should().Be(createDto.Nom);
        result.Id.Should().BeGreaterThan(0);

        var inventeurInDb = await _context.Inventeurs.FindAsync(result.Id);
        inventeurInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateInventeur()
    {
        // Arrange
        var existingInventeur = await _context.Inventeurs.FirstAsync();
        var updateDto = new UpdateInventeurDto
        {
            Nom = "Nom Modifié",
            Prenom = "Prénom Modifié"
        };

        // Act
        var result = await _service.UpdateAsync(existingInventeur.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteInventeur()
    {
        // Arrange
        var existingInventeur = await _context.Inventeurs.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingInventeur.Id);

        // Assert
        result.Should().BeTrue();

        var inventeurInDb = await _context.Inventeurs.FindAsync(existingInventeur.Id);
        inventeurInDb.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
