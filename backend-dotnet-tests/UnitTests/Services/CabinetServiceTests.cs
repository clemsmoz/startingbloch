using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class CabinetServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly CabinetService _service;

    public CabinetServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new CabinetService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllCabinets()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<CabinetDto>();
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
        var searchTerm = "Juridique";

        // Act
        var result = await _service.GetAllAsync(search: searchTerm);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(c => 
            c.Nom.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnCabinet()
    {
        // Arrange
        var existingCabinet = await _context.Cabinets.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingCabinet.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingCabinet.Id);
        result.Nom.Should().Be(existingCabinet.Nom);
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
    public async Task CreateAsync_WithValidData_Should_CreateCabinet()
    {
        // Arrange
        var createDto = new CreateCabinetDto
        {
            Nom = "Nouveau Cabinet Test",
            Adresse = "123 Legal Street",
            Telephone = "0123456789",
            Email = "cabinet@test.com"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Nom.Should().Be(createDto.Nom);
        result.Id.Should().BeGreaterThan(0);

        var cabinetInDb = await _context.Cabinets.FindAsync(result.Id);
        cabinetInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateCabinet()
    {
        // Arrange
        var existingCabinet = await _context.Cabinets.FirstAsync();
        var updateDto = new UpdateCabinetDto
        {
            Nom = "Cabinet Modifié",
            Adresse = "456 Updated Street",
            Email = "updated@cabinet.com"
        };

        // Act
        var result = await _service.UpdateAsync(existingCabinet.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_Should_ReturnNull()
    {
        // Arrange
        var updateDto = new UpdateCabinetDto { Nom = "Cabinet Inexistant" };

        // Act
        var result = await _service.UpdateAsync(999, updateDto);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteCabinet()
    {
        // Arrange
        var existingCabinet = await _context.Cabinets.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingCabinet.Id);

        // Assert
        result.Should().BeTrue();

        var cabinetInDb = await _context.Cabinets.FindAsync(existingCabinet.Id);
        cabinetInDb.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_Should_ReturnFalse()
    {
        // Act
        var result = await _service.DeleteAsync(999);

        // Assert
        result.Should().BeFalse();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
