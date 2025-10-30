using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class CabinetControllerTests
{
    private readonly Mock<ICabinetService> _mockCabinetService;
    private readonly CabinetController _controller;

    public CabinetControllerTests()
    {
        _mockCabinetService = new Mock<ICabinetService>();
        _controller = new CabinetController(_mockCabinetService.Object);
    }

    [Fact]
    public async Task GetCabinets_Should_ReturnOkWithCabinets()
    {
        // Arrange
        var cabinets = new List<CabinetDto>
        {
            new CabinetDto { Id = 1, Nom = "Cabinet 1", Email = "cabinet1@test.com" },
            new CabinetDto { Id = 2, Nom = "Cabinet 2", Email = "cabinet2@test.com" }
        };
        _mockCabinetService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(cabinets);

        // Act
        var result = await _controller.GetCabinets();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedCabinets = okResult.Value.Should().BeAssignableTo<IEnumerable<CabinetDto>>().Subject;
        returnedCabinets.Should().HaveCount(2);
        _mockCabinetService.Verify(s => s.GetAllAsync(1, 50, null), Times.Once);
    }

    [Fact]
    public async Task GetCabinet_WithValidId_Should_ReturnOkWithCabinet()
    {
        // Arrange
        var cabinet = new CabinetDto 
        { 
            Id = 1, 
            Nom = "Test Cabinet",
            Adresse = "123 Law Street",
            Email = "test@cabinet.com",
            Telephone = "0123456789"
        };
        _mockCabinetService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(cabinet);

        // Act
        var result = await _controller.GetCabinet(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedCabinet = okResult.Value.Should().BeAssignableTo<CabinetDto>().Subject;
        returnedCabinet.Id.Should().Be(1);
        returnedCabinet.Nom.Should().Be("Test Cabinet");
    }

    [Fact]
    public async Task GetCabinet_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockCabinetService.Setup(s => s.GetByIdAsync(999))
            .ReturnsAsync((CabinetDto?)null);

        // Act
        var result = await _controller.GetCabinet(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateCabinet_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateCabinetDto
        {
            Nom = "Nouveau Cabinet",
            Adresse = "456 Legal Ave",
            Email = "nouveau@cabinet.com",
            Telephone = "0987654321"
        };
        var createdCabinet = new CabinetDto
        {
            Id = 1,
            Nom = createDto.Nom,
            Adresse = createDto.Adresse,
            Email = createDto.Email,
            Telephone = createDto.Telephone
        };
        _mockCabinetService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdCabinet);

        // Act
        var result = await _controller.CreateCabinet(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetCabinet));
        createdResult.RouteValues!["id"].Should().Be(1);
        var returnedCabinet = createdResult.Value.Should().BeAssignableTo<CabinetDto>().Subject;
        returnedCabinet.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task CreateCabinet_WithInvalidData_Should_ReturnBadRequest()
    {
        // Arrange
        var createDto = new CreateCabinetDto
        {
            Nom = "", // Nom vide
            Email = "test@test.com"
        };
        _controller.ModelState.AddModelError("Nom", "Le nom est requis");

        // Act
        var result = await _controller.CreateCabinet(createDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateCabinet_WithValidData_Should_ReturnOkWithUpdatedCabinet()
    {
        // Arrange
        var updateDto = new UpdateCabinetDto
        {
            Nom = "Cabinet Modifié",
            Adresse = "789 Updated Street",
            Email = "modifie@cabinet.com"
        };
        var updatedCabinet = new CabinetDto
        {
            Id = 1,
            Nom = updateDto.Nom,
            Adresse = updateDto.Adresse,
            Email = updateDto.Email
        };
        _mockCabinetService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedCabinet);

        // Act
        var result = await _controller.UpdateCabinet(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedCabinet = okResult.Value.Should().BeAssignableTo<CabinetDto>().Subject;
        returnedCabinet.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task UpdateCabinet_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        var updateDto = new UpdateCabinetDto { Nom = "Test" };
        _mockCabinetService.Setup(s => s.UpdateAsync(999, updateDto))
            .ReturnsAsync((CabinetDto?)null);

        // Act
        var result = await _controller.UpdateCabinet(999, updateDto);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteCabinet_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockCabinetService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteCabinet(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteCabinet_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockCabinetService.Setup(s => s.DeleteAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteCabinet(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task SearchCabinets_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchResults = new List<CabinetDto>
        {
            new CabinetDto { Id = 1, Nom = "Cabinet Recherché", Email = "searched@cabinet.com" }
        };
        _mockCabinetService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), "Recherché"))
            .ReturnsAsync(searchResults);

        // Act
        var result = await _controller.GetCabinets(search: "Recherché");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedCabinets = okResult.Value.Should().BeAssignableTo<IEnumerable<CabinetDto>>().Subject;
        returnedCabinets.Should().HaveCount(1);
        _mockCabinetService.Verify(s => s.GetAllAsync(1, 50, "Recherché"), Times.Once);
    }
}
