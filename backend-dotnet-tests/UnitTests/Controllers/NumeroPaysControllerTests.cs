using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class NumeroPaysControllerTests
{
    private readonly Mock<INumeroPaysService> _mockNumeroPaysService;
    private readonly NumeroPaysController _controller;

    public NumeroPaysControllerTests()
    {
        _mockNumeroPaysService = new Mock<INumeroPaysService>();
        _controller = new NumeroPaysController(_mockNumeroPaysService.Object);
    }

    [Fact]
    public async Task GetNumeroPays_Should_ReturnOkWithNumeroPays()
    {
        // Arrange
        var numeroPays = new List<NumeroPaysDto>
        {
            new NumeroPaysDto { Id = 1, BrevetId = 1, PaysId = 1, NumeroDepot = "FR123456" },
            new NumeroPaysDto { Id = 2, BrevetId = 1, PaysId = 2, NumeroDepot = "DE789012" }
        };
        _mockNumeroPaysService.Setup(s => s.GetAllAsync())
            .ReturnsAsync(numeroPays);

        // Act
        var result = await _controller.GetNumeroPays();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedNumeroPays = okResult.Value.Should().BeAssignableTo<IEnumerable<NumeroPaysDto>>().Subject;
        returnedNumeroPays.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetNumeroPays_WithValidId_Should_ReturnOkWithNumeroPays()
    {
        // Arrange
        var numeroPays = new NumeroPaysDto 
        { 
            Id = 1, 
            BrevetId = 1,
            PaysId = 1,
            NumeroDepot = "FR123456",
            NumeroPublication = "FR987654"
        };
        _mockNumeroPaysService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(numeroPays);

        // Act
        var result = await _controller.GetNumeroPays(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedNumeroPays = okResult.Value.Should().BeAssignableTo<NumeroPaysDto>().Subject;
        returnedNumeroPays.Id.Should().Be(1);
        returnedNumeroPays.NumeroDepot.Should().Be("FR123456");
    }

    [Fact]
    public async Task GetNumeroPays_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockNumeroPaysService.Setup(s => s.GetByIdAsync(999))
            .ReturnsAsync((NumeroPaysDto?)null);

        // Act
        var result = await _controller.GetNumeroPays(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetNumeroPaysbyBrevet_WithValidBrevetId_Should_ReturnOkWithNumeroPays()
    {
        // Arrange
        var numeroPays = new List<NumeroPaysDto>
        {
            new NumeroPaysDto { Id = 1, BrevetId = 1, PaysId = 1, NumeroDepot = "FR123456" },
            new NumeroPaysDto { Id = 2, BrevetId = 1, PaysId = 2, NumeroDepot = "DE789012" }
        };
        _mockNumeroPaysService.Setup(s => s.GetByBrevetIdAsync(1))
            .ReturnsAsync(numeroPays);

        // Act
        var result = await _controller.GetNumeroPaysbyBrevet(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedNumeroPays = okResult.Value.Should().BeAssignableTo<IEnumerable<NumeroPaysDto>>().Subject;
        returnedNumeroPays.Should().HaveCount(2);
        returnedNumeroPays.Should().OnlyContain(np => np.BrevetId == 1);
    }

    [Fact]
    public async Task CreateNumeroPays_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateNumeroPaysDto
        {
            BrevetId = 1,
            PaysId = 1,
            NumeroDepot = "FR999888",
            NumeroPublication = "FR777666"
        };
        var createdNumeroPays = new NumeroPaysDto
        {
            Id = 1,
            BrevetId = createDto.BrevetId,
            PaysId = createDto.PaysId,
            NumeroDepot = createDto.NumeroDepot,
            NumeroPublication = createDto.NumeroPublication
        };
        _mockNumeroPaysService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdNumeroPays);

        // Act
        var result = await _controller.CreateNumeroPays(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetNumeroPays));
        var returnedNumeroPays = createdResult.Value.Should().BeAssignableTo<NumeroPaysDto>().Subject;
        returnedNumeroPays.NumeroDepot.Should().Be(createDto.NumeroDepot);
    }

    [Fact]
    public async Task UpdateNumeroPays_WithValidData_Should_ReturnOkWithUpdatedNumeroPays()
    {
        // Arrange
        var updateDto = new UpdateNumeroPaysDto
        {
            NumeroDepot = "FR555444",
            NumeroPublication = "FR333222"
        };
        var updatedNumeroPays = new NumeroPaysDto
        {
            Id = 1,
            NumeroDepot = updateDto.NumeroDepot,
            NumeroPublication = updateDto.NumeroPublication
        };
        _mockNumeroPaysService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedNumeroPays);

        // Act
        var result = await _controller.UpdateNumeroPays(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedNumeroPays = okResult.Value.Should().BeAssignableTo<NumeroPaysDto>().Subject;
        returnedNumeroPays.NumeroDepot.Should().Be(updateDto.NumeroDepot);
    }

    [Fact]
    public async Task DeleteNumeroPays_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockNumeroPaysService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteNumeroPays(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task AssignPays_WithValidData_Should_ReturnOk()
    {
        // Arrange
        _mockNumeroPaysService.Setup(s => s.AssignPaysAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AssignPays(1, new { PaysId = 1 });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task RemovePays_WithValidData_Should_ReturnOk()
    {
        // Arrange
        _mockNumeroPaysService.Setup(s => s.RemovePaysAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.RemovePays(1, new { PaysId = 1 });

        // Assert
        result.Should().BeOfType<OkResult>();
    }
}
