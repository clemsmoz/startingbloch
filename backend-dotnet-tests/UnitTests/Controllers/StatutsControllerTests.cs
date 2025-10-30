using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class StatutsControllerTests
{
    private readonly Mock<IStatutsService> _mockStatutsService;
    private readonly StatutsController _controller;

    public StatutsControllerTests()
    {
        _mockStatutsService = new Mock<IStatutsService>();
        _controller = new StatutsController(_mockStatutsService.Object);
    }

    [Fact]
    public async Task GetStatuts_Should_ReturnOkWithStatuts()
    {
        // Arrange
        var statuts = new List<StatutsDto>
        {
            new StatutsDto { Id = 1, Nom = "En cours d'examen" },
            new StatutsDto { Id = 2, Nom = "Accordé" }
        };
        _mockStatutsService.Setup(s => s.GetAllAsync())
            .ReturnsAsync(statuts);

        // Act
        var result = await _controller.GetStatuts();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStatuts = okResult.Value.Should().BeAssignableTo<IEnumerable<StatutsDto>>().Subject;
        returnedStatuts.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetStatuts_WithValidId_Should_ReturnOkWithStatuts()
    {
        // Arrange
        var statuts = new StatutsDto 
        { 
            Id = 1, 
            Nom = "En cours d'examen"
        };
        _mockStatutsService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(statuts);

        // Act
        var result = await _controller.GetStatuts(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStatuts = okResult.Value.Should().BeAssignableTo<StatutsDto>().Subject;
        returnedStatuts.Id.Should().Be(1);
        returnedStatuts.Nom.Should().Be("En cours d'examen");
    }

    [Fact]
    public async Task GetStatutsByNom_WithValidNom_Should_ReturnOkWithStatuts()
    {
        // Arrange
        var statuts = new StatutsDto 
        { 
            Id = 1, 
            Nom = "Accordé"
        };
        _mockStatutsService.Setup(s => s.GetByNomAsync("Accordé"))
            .ReturnsAsync(statuts);

        // Act
        var result = await _controller.GetStatutsByNom("Accordé");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStatuts = okResult.Value.Should().BeAssignableTo<StatutsDto>().Subject;
        returnedStatuts.Nom.Should().Be("Accordé");
    }

    [Fact]
    public async Task CreateStatuts_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateStatutsDto
        {
            Nom = "Nouveau Statut"
        };
        var createdStatuts = new StatutsDto
        {
            Id = 1,
            Nom = createDto.Nom
        };
        _mockStatutsService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdStatuts);

        // Act
        var result = await _controller.CreateStatuts(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetStatuts));
        var returnedStatuts = createdResult.Value.Should().BeAssignableTo<StatutsDto>().Subject;
        returnedStatuts.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task UpdateStatuts_WithValidData_Should_ReturnOkWithUpdatedStatuts()
    {
        // Arrange
        var updateDto = new UpdateStatutsDto
        {
            Nom = "Statut Modifié"
        };
        var updatedStatuts = new StatutsDto
        {
            Id = 1,
            Nom = updateDto.Nom
        };
        _mockStatutsService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedStatuts);

        // Act
        var result = await _controller.UpdateStatuts(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedStatuts = okResult.Value.Should().BeAssignableTo<StatutsDto>().Subject;
        returnedStatuts.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteStatuts_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockStatutsService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteStatuts(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task CheckNomAvailability_WithAvailableNom_Should_ReturnTrue()
    {
        // Arrange
        _mockStatutsService.Setup(s => s.IsNomAvailableAsync("Statut Libre"))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.CheckNomAvailability("Statut Libre");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var isAvailable = okResult.Value.Should().BeAssignableTo<bool>().Subject;
        isAvailable.Should().BeTrue();
    }
}
