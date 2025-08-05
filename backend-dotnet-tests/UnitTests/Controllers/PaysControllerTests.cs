using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class PaysControllerTests
{
    private readonly Mock<IPaysService> _mockPaysService;
    private readonly PaysController _controller;

    public PaysControllerTests()
    {
        _mockPaysService = new Mock<IPaysService>();
        _controller = new PaysController(_mockPaysService.Object);
    }

    [Fact]
    public async Task GetPays_Should_ReturnOkWithPays()
    {
        // Arrange
        var pays = new List<PaysDto>
        {
            new PaysDto { Id = 1, Nom = "France", Code = "FR" },
            new PaysDto { Id = 2, Nom = "Allemagne", Code = "DE" }
        };
        _mockPaysService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(pays);

        // Act
        var result = await _controller.GetPays();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedPays = okResult.Value.Should().BeAssignableTo<IEnumerable<PaysDto>>().Subject;
        returnedPays.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetPays_WithValidId_Should_ReturnOkWithPays()
    {
        // Arrange
        var pays = new PaysDto 
        { 
            Id = 1, 
            Nom = "France",
            Code = "FR"
        };
        _mockPaysService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(pays);

        // Act
        var result = await _controller.GetPays(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedPays = okResult.Value.Should().BeAssignableTo<PaysDto>().Subject;
        returnedPays.Id.Should().Be(1);
        returnedPays.Nom.Should().Be("France");
    }

    [Fact]
    public async Task GetPaysByCode_WithValidCode_Should_ReturnOkWithPays()
    {
        // Arrange
        var pays = new PaysDto 
        { 
            Id = 1, 
            Nom = "France",
            Code = "FR"
        };
        _mockPaysService.Setup(s => s.GetByCodeAsync("FR"))
            .ReturnsAsync(pays);

        // Act
        var result = await _controller.GetPaysByCode("FR");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedPays = okResult.Value.Should().BeAssignableTo<PaysDto>().Subject;
        returnedPays.Code.Should().Be("FR");
    }

    [Fact]
    public async Task CreatePays_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreatePaysDto
        {
            Nom = "Nouveau Pays",
            Code = "NP"
        };
        var createdPays = new PaysDto
        {
            Id = 1,
            Nom = createDto.Nom,
            Code = createDto.Code
        };
        _mockPaysService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdPays);

        // Act
        var result = await _controller.CreatePays(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetPays));
        var returnedPays = createdResult.Value.Should().BeAssignableTo<PaysDto>().Subject;
        returnedPays.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task UpdatePays_WithValidData_Should_ReturnOkWithUpdatedPays()
    {
        // Arrange
        var updateDto = new UpdatePaysDto
        {
            Nom = "Pays Modifié",
            Code = "PM"
        };
        var updatedPays = new PaysDto
        {
            Id = 1,
            Nom = updateDto.Nom,
            Code = updateDto.Code
        };
        _mockPaysService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedPays);

        // Act
        var result = await _controller.UpdatePays(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedPays = okResult.Value.Should().BeAssignableTo<PaysDto>().Subject;
        returnedPays.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeletePays_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockPaysService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeletePays(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task CheckCodeAvailability_WithAvailableCode_Should_ReturnTrue()
    {
        // Arrange
        _mockPaysService.Setup(s => s.IsCodeAvailableAsync("XX"))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.CheckCodeAvailability("XX");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var isAvailable = okResult.Value.Should().BeAssignableTo<bool>().Subject;
        isAvailable.Should().BeTrue();
    }
}
