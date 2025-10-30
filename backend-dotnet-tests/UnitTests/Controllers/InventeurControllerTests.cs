using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class InventeurControllerTests
{
    private readonly Mock<IInventeurService> _mockInventeurService;
    private readonly InventeurController _controller;

    public InventeurControllerTests()
    {
        _mockInventeurService = new Mock<IInventeurService>();
        _controller = new InventeurController(_mockInventeurService.Object);
    }

    [Fact]
    public async Task GetInventeurs_Should_ReturnOkWithInventeurs()
    {
        // Arrange
        var inventeurs = new List<InventeurDto>
        {
            new InventeurDto { Id = 1, Nom = "Inventeur 1", Email = "inventeur1@test.com" },
            new InventeurDto { Id = 2, Nom = "Inventeur 2", Email = "inventeur2@test.com" }
        };
        _mockInventeurService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(inventeurs);

        // Act
        var result = await _controller.GetInventeurs();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedInventeurs = okResult.Value.Should().BeAssignableTo<IEnumerable<InventeurDto>>().Subject;
        returnedInventeurs.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetInventeur_WithValidId_Should_ReturnOkWithInventeur()
    {
        // Arrange
        var inventeur = new InventeurDto 
        { 
            Id = 1, 
            Nom = "Test Inventeur",
            Prenom = "Prénom",
            Email = "test@inventeur.com"
        };
        _mockInventeurService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(inventeur);

        // Act
        var result = await _controller.GetInventeur(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedInventeur = okResult.Value.Should().BeAssignableTo<InventeurDto>().Subject;
        returnedInventeur.Id.Should().Be(1);
        returnedInventeur.Nom.Should().Be("Test Inventeur");
    }

    [Fact]
    public async Task CreateInventeur_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateInventeurDto
        {
            Nom = "Nouvel Inventeur",
            Prenom = "Prénom",
            Email = "nouveau@inventeur.com"
        };
        var createdInventeur = new InventeurDto
        {
            Id = 1,
            Nom = createDto.Nom,
            Prenom = createDto.Prenom,
            Email = createDto.Email
        };
        _mockInventeurService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdInventeur);

        // Act
        var result = await _controller.CreateInventeur(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetInventeur));
        var returnedInventeur = createdResult.Value.Should().BeAssignableTo<InventeurDto>().Subject;
        returnedInventeur.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task UpdateInventeur_WithValidData_Should_ReturnOkWithUpdatedInventeur()
    {
        // Arrange
        var updateDto = new UpdateInventeurDto
        {
            Nom = "Inventeur Modifié",
            Email = "modifie@inventeur.com"
        };
        var updatedInventeur = new InventeurDto
        {
            Id = 1,
            Nom = updateDto.Nom,
            Email = updateDto.Email
        };
        _mockInventeurService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedInventeur);

        // Act
        var result = await _controller.UpdateInventeur(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedInventeur = okResult.Value.Should().BeAssignableTo<InventeurDto>().Subject;
        returnedInventeur.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteInventeur_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockInventeurService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteInventeur(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }
}
