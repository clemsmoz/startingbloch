using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class LogServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly LogService _service;

    public LogServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new LogService(_context);

        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnAllLogs()
    {
        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().AllBeOfType<LogDto>();
    }

    [Fact]
    public async Task GetAllAsync_WithPagination_Should_ReturnCorrectPage()
    {
        // Act
        var result = await _service.GetAllAsync(page: 1, pageSize: 5);

        // Assert
        result.Should().HaveCountLessOrEqualTo(5);
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchTerm = "Création";

        // Act
        var result = await _service.GetAllAsync(search: searchTerm);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(l => 
            l.Action.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            (l.Details != null && l.Details.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_Should_ReturnLog()
    {
        // Arrange
        var existingLog = await _context.Logs.FirstAsync();

        // Act
        var result = await _service.GetByIdAsync(existingLog.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingLog.Id);
        result.Action.Should().Be(existingLog.Action);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_Should_CreateLog()
    {
        // Arrange
        var createDto = new CreateLogDto
        {
            User = "Test User",
            UserEmail = "test@user.com",
            Action = "Test Action",
            Details = "Test Details"
        };

        // Act
        var result = await _service.CreateAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.User.Should().Be(createDto.User);
        result.UserEmail.Should().Be(createDto.UserEmail);
        result.Action.Should().Be(createDto.Action);
        result.Details.Should().Be(createDto.Details);
        result.Id.Should().BeGreaterThan(0);

        var logInDb = await _context.Logs.FindAsync(result.Id);
        logInDb.Should().NotBeNull();
        logInDb!.Date.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task GetByUserEmailAsync_Should_ReturnLogsForUser()
    {
        // Arrange
        var userEmail = "admin@test.com";

        // Act
        var result = await _service.GetByUserEmailAsync(userEmail);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(l => l.UserEmail == userEmail);
    }

    [Fact]
    public async Task GetByActionAsync_Should_ReturnLogsForAction()
    {
        // Arrange
        var action = "Création client";

        // Act
        var result = await _service.GetByActionAsync(action);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(l => l.Action == action);
    }

    [Fact]
    public async Task GetByDateRangeAsync_Should_ReturnLogsInRange()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow.AddDays(1);

        // Act
        var result = await _service.GetByDateRangeAsync(startDate, endDate);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(l => l.Date >= startDate && l.Date <= endDate);
    }

    [Fact]
    public async Task DeleteOldLogsAsync_Should_DeleteLogsOlderThanDays()
    {
        // Arrange
        var oldLogCount = await _context.Logs.CountAsync();
        var daysToKeep = 30;

        // Act
        var deletedCount = await _service.DeleteOldLogsAsync(daysToKeep);

        // Assert
        deletedCount.Should().BeGreaterOrEqualTo(0);
        
        var remainingLogCount = await _context.Logs.CountAsync();
        var expectedRemainingCount = oldLogCount - deletedCount;
        remainingLogCount.Should().Be(expectedRemainingCount);
    }

    [Fact]
    public async Task GetLogStatisticsAsync_Should_ReturnStatistics()
    {
        // Act
        var result = await _service.GetLogStatisticsAsync();

        // Assert
        result.Should().NotBeNull();
        result.TotalLogs.Should().BeGreaterThan(0);
        result.ActionsCount.Should().NotBeEmpty();
        result.UsersCount.Should().NotBeEmpty();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
