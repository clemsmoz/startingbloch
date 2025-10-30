using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class DeposantServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly DeposantService _service;

    public DeposantServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new DeposantService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllDeposants()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<DeposantDto>();
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnDeposant()
    {
        // Arrange
        var existingDeposant = await _context.Deposants.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingDeposant.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingDeposant.Id);
        result.Nom.Should().Be(existingDeposant.Nom);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateDeposant()
    {
        // Arrange
        var createDto = new CreateDeposantDto
        {
            Nom = "Nouveau Déposant",
            Prenom = "Prénom",
            Adresse = "123 Test Street",
            Email = "deposant@test.com"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Nom.Should().Be(createDto.Nom);
        result.Id.Should().BeGreaterThan(0);

        var deposantInDb = await _context.Deposants.FindAsync(result.Id);
        deposantInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateDeposant()
    {
        // Arrange
        var existingDeposant = await _context.Deposants.FirstAsync();
        var updateDto = new UpdateDeposantDto
        {
            Nom = "Nom Modifié",
            Prenom = "Prénom Modifié"
        };

        // Act
        var result = await _service.UpdateAsync(existingDeposant.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteDeposant()
    {
        // Arrange
        var existingDeposant = await _context.Deposants.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingDeposant.Id);

        // Assert
        result.Should().BeTrue();

        var deposantInDb = await _context.Deposants.FindAsync(existingDeposant.Id);
        deposantInDb.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
