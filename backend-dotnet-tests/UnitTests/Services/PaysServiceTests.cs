using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class PaysServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly PaysService _service;

    public PaysServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new PaysService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllPays()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<PaysDto>();
    }

    [Fact]
    public async Task GetAllAsync_WithPagination_Should_ReturnCorrectPage()
    {
        // Act
        var result = await _service.GetAllAsync(page: 1, pageSize: 2);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchTerm = "France";

        // Act
        var result = await _service.GetAllAsync(search: searchTerm);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(p => 
            p.Nom.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            p.Code.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnPays()
    {
        // Arrange
        var existingPays = await _context.Pays.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingPays.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingPays.Id);
        result.Nom.Should().Be(existingPays.Nom);
        result.Code.Should().Be(existingPays.Code);
    }

    [Fact]
    public async Task GetByCodeAsync_WithValidCode_Should_ReturnPays()
    {
        // Arrange
        var existingPays = await _context.Pays.FirstAsync();

        // Act
        var result = await _service.GetByCodeAsync(existingPays.Code);

        // Assert
        result.Should().NotBeNull();
        result!.Code.Should().Be(existingPays.Code);
        result.Nom.Should().Be(existingPays.Nom);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreatePays()
    {
        // Arrange
        var createDto = new CreatePaysDto
        {
            Nom = "Nouveau Pays Test",
            Code = "NP"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Nom.Should().Be(createDto.Nom);
        result.Code.Should().Be(createDto.Code);
        result.Id.Should().BeGreaterThan(0);

        var paysInDb = await _context.Pays.FindAsync(result.Id);
        paysInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateCode_Should_ThrowException()
    {
        // Arrange
        var existingPays = await _context.Pays.FirstAsync();
        var createDto = new CreatePaysDto
        {
            Nom = "Pays Duplicate",
            Code = existingPays.Code // Code déjà existant
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateAsync(createDto));
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdatePays()
    {
        // Arrange
        var existingPays = await _context.Pays.FirstAsync();
        var updateDto = new UpdatePaysDto
        {
            Nom = "Pays Modifié",
            Code = "PM"
        };

        // Act
        var result = await _service.UpdateAsync(existingPays.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Nom.Should().Be(updateDto.Nom);
        result.Code.Should().Be(updateDto.Code);

        var paysInDb = await _context.Pays.FindAsync(existingPays.Id);
        paysInDb!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeletePays()
    {
        // Arrange
        var existingPays = await _context.Pays.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingPays.Id);

        // Assert
        result.Should().BeTrue();

        var paysInDb = await _context.Pays.FindAsync(existingPays.Id);
        paysInDb.Should().BeNull();
    }

    [Fact]
    public async Task IsCodeAvailableAsync_WithAvailableCode_Should_ReturnTrue()
    {
        // Act
        var result = await _service.IsCodeAvailableAsync("XX");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsCodeAvailableAsync_WithTakenCode_Should_ReturnFalse()
    {
        // Arrange
        var existingPays = await _context.Pays.FirstAsync();

        // Act
        var result = await _service.IsCodeAvailableAsync(existingPays.Code);

        // Assert
        result.Should().BeFalse();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
