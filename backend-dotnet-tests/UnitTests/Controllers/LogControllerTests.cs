using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class LogControllerTests
{
    private readonly Mock<ILogService> _mockLogService;
    private readonly LogController _controller;

    public LogControllerTests()
    {
        _mockLogService = new Mock<ILogService>();
        _controller = new LogController(_mockLogService.Object);
    }

    [Fact]
    public async Task GetLogs_Should_ReturnOkWithLogs()
    {
        // Arrange
        var logs = new List<LogDto>
        {
            new LogDto { Id = 1, User = "User1", Action = "Création client", Date = DateTime.UtcNow },
            new LogDto { Id = 2, User = "User2", Action = "Modification brevet", Date = DateTime.UtcNow }
        };
        _mockLogService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(logs);

        // Act
        var result = await _controller.GetLogs();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedLogs = okResult.Value.Should().BeAssignableTo<IEnumerable<LogDto>>().Subject;
        returnedLogs.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetLog_WithValidId_Should_ReturnOkWithLog()
    {
        // Arrange
        var log = new LogDto 
        { 
            Id = 1, 
            User = "Test User",
            UserEmail = "test@user.com",
            Action = "Test Action",
            Details = "Test Details",
            Date = DateTime.UtcNow
        };
        _mockLogService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(log);

        // Act
        var result = await _controller.GetLog(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedLog = okResult.Value.Should().BeAssignableTo<LogDto>().Subject;
        returnedLog.Id.Should().Be(1);
        returnedLog.Action.Should().Be("Test Action");
    }

    [Fact]
    public async Task GetLog_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockLogService.Setup(s => s.GetByIdAsync(999))
            .ReturnsAsync((LogDto?)null);

        // Act
        var result = await _controller.GetLog(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateLog_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateLogDto
        {
            User = "Test User",
            UserEmail = "test@user.com",
            Action = "Test Action",
            Details = "Test Details"
        };
        var createdLog = new LogDto
        {
            Id = 1,
            User = createDto.User,
            UserEmail = createDto.UserEmail,
            Action = createDto.Action,
            Details = createDto.Details,
            Date = DateTime.UtcNow
        };
        _mockLogService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdLog);

        // Act
        var result = await _controller.CreateLog(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetLog));
        var returnedLog = createdResult.Value.Should().BeAssignableTo<LogDto>().Subject;
        returnedLog.Action.Should().Be(createDto.Action);
    }

    [Fact]
    public async Task GetLogsByUser_WithValidUserEmail_Should_ReturnOkWithLogs()
    {
        // Arrange
        var userLogs = new List<LogDto>
        {
            new LogDto { Id = 1, User = "Test User", UserEmail = "test@user.com", Action = "Action 1" },
            new LogDto { Id = 2, User = "Test User", UserEmail = "test@user.com", Action = "Action 2" }
        };
        _mockLogService.Setup(s => s.GetByUserEmailAsync("test@user.com"))
            .ReturnsAsync(userLogs);

        // Act
        var result = await _controller.GetLogsByUser("test@user.com");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedLogs = okResult.Value.Should().BeAssignableTo<IEnumerable<LogDto>>().Subject;
        returnedLogs.Should().HaveCount(2);
        returnedLogs.Should().OnlyContain(l => l.UserEmail == "test@user.com");
    }

    [Fact]
    public async Task GetLogsByAction_WithValidAction_Should_ReturnOkWithLogs()
    {
        // Arrange
        var actionLogs = new List<LogDto>
        {
            new LogDto { Id = 1, User = "User1", Action = "Création client" },
            new LogDto { Id = 2, User = "User2", Action = "Création client" }
        };
        _mockLogService.Setup(s => s.GetByActionAsync("Création client"))
            .ReturnsAsync(actionLogs);

        // Act
        var result = await _controller.GetLogsByAction("Création client");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedLogs = okResult.Value.Should().BeAssignableTo<IEnumerable<LogDto>>().Subject;
        returnedLogs.Should().HaveCount(2);
        returnedLogs.Should().OnlyContain(l => l.Action == "Création client");
    }

    [Fact]
    public async Task GetLogsByDateRange_WithValidRange_Should_ReturnOkWithLogs()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow;
        var rangeLogs = new List<LogDto>
        {
            new LogDto { Id = 1, User = "User1", Action = "Action 1", Date = DateTime.UtcNow.AddDays(-3) },
            new LogDto { Id = 2, User = "User2", Action = "Action 2", Date = DateTime.UtcNow.AddDays(-1) }
        };
        _mockLogService.Setup(s => s.GetByDateRangeAsync(startDate, endDate))
            .ReturnsAsync(rangeLogs);

        // Act
        var result = await _controller.GetLogsByDateRange(startDate, endDate);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedLogs = okResult.Value.Should().BeAssignableTo<IEnumerable<LogDto>>().Subject;
        returnedLogs.Should().HaveCount(2);
    }

    [Fact]
    public async Task DeleteOldLogs_WithValidDays_Should_ReturnOkWithDeletedCount()
    {
        // Arrange
        var deletedCount = 15;
        _mockLogService.Setup(s => s.DeleteOldLogsAsync(30))
            .ReturnsAsync(deletedCount);

        // Act
        var result = await _controller.DeleteOldLogs(30);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedCount = okResult.Value.Should().BeAssignableTo<int>().Subject;
        returnedCount.Should().Be(15);
    }

    [Fact]
    public async Task GetLogStatistics_Should_ReturnOkWithStatistics()
    {
        // Arrange
        var statistics = new LogStatisticsDto
        {
            TotalLogs = 100,
            ActionsCount = new Dictionary<string, int> { { "Création client", 25 }, { "Modification brevet", 30 } },
            UsersCount = new Dictionary<string, int> { { "admin@test.com", 50 }, { "user@test.com", 50 } }
        };
        _mockLogService.Setup(s => s.GetLogStatisticsAsync())
            .ReturnsAsync(statistics);

        // Act
        var result = await _controller.GetLogStatistics();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStatistics = okResult.Value.Should().BeAssignableTo<LogStatisticsDto>().Subject;
        returnedStatistics.TotalLogs.Should().Be(100);
        returnedStatistics.ActionsCount.Should().HaveCount(2);
        returnedStatistics.UsersCount.Should().HaveCount(2);
    }
}
