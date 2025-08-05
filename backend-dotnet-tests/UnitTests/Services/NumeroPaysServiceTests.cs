using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class NumeroPaysServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly NumeroPaysService _service;

    public NumeroPaysServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new NumeroPaysService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllNumeroPays()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<NumeroPaysDto>();
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnNumeroPays()
    {
        // Arrange
        var existingNumeroPays = await _context.NumeroPays.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingNumeroPays.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingNumeroPays.Id);
    }

    [Fact]
    public async Task GetByBrevetIdAsync_Should_ReturnNumeroPaysForBrevet()
    {
        // Arrange
        var brevet = await _context.Brevets.FirstAsync();

        // Act
        var result = await _service.GetByBrevetIdAsync(brevet.Id);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(np => np.BrevetId == brevet.Id);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateNumeroPays()
    {
        // Arrange
        var brevet = await _context.Brevets.FirstAsync();
        var pays = await _context.Pays.FirstAsync();
        var createDto = new CreateNumeroPaysDto
        {
            BrevetId = brevet.Id,
            PaysId = pays.Id,
            NumeroDepot = "TEST123456",
            NumeroPublication = "PUB789012"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.BrevetId.Should().Be(createDto.BrevetId);
        result.PaysId.Should().Be(createDto.PaysId);
        result.NumeroDepot.Should().Be(createDto.NumeroDepot);
        result.Id.Should().BeGreaterThan(0);

        var numeroPaysInDb = await _context.NumeroPays.FindAsync(result.Id);
        numeroPaysInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_Should_UpdateNumeroPays()
    {
        // Arrange
        var existingNumeroPays = await _context.NumeroPays.FirstAsync();
        var updateDto = new UpdateNumeroPaysDto
        {
            NumeroDepot = "UPDATED123",
            NumeroPublication = "UPDATEDPUB456"
        };

        // Act
        var result = await _service.UpdateAsync(existingNumeroPays.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.NumeroDepot.Should().Be(updateDto.NumeroDepot);
        result.NumeroPublication.Should().Be(updateDto.NumeroPublication);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_Should_DeleteNumeroPays()
    {
        // Arrange
        var existingNumeroPays = await _context.NumeroPays.FirstAsync();

        // Act
        var result = await _service.DeleteAsync(existingNumeroPays.Id);

        // Assert
        result.Should().BeTrue();

        var numeroPaysInDb = await _context.NumeroPays.FindAsync(existingNumeroPays.Id);
        numeroPaysInDb.Should().BeNull();
    }

    [Fact]
    public async Task AssignPaysAsync_WithValidIds_Should_AssignPays()
    {
        // Arrange
        var brevet = await _context.Brevets.FirstAsync();
        var pays = await _context.Pays.FirstAsync();

        // Act
        var result = await _service.AssignPaysAsync(brevet.Id, pays.Id);

        // Assert
        result.Should().BeTrue();

        var numeroPaysInDb = await _context.NumeroPays
            .FirstOrDefaultAsync(np => np.BrevetId == brevet.Id && np.PaysId == pays.Id);
        numeroPaysInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task RemovePaysAsync_WithValidIds_Should_RemovePays()
    {
        // Arrange
        var existingNumeroPays = await _context.NumeroPays.FirstAsync();

        // Act
        var result = await _service.RemovePaysAsync(existingNumeroPays.BrevetId, existingNumeroPays.PaysId);

        // Assert
        result.Should().BeTrue();

        var numeroPaysInDb = await _context.NumeroPays
            .FirstOrDefaultAsync(np => np.BrevetId == existingNumeroPays.BrevetId && np.PaysId == existingNumeroPays.PaysId);
        numeroPaysInDb.Should().BeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
