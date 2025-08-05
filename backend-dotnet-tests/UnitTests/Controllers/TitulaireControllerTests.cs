using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class TitulaireControllerTests
{
    private readonly Mock<ITitulaireService> _mockTitulaireService;
    private readonly TitulaireController _controller;

    public TitulaireControllerTests()
    {
        _mockTitulaireService = new Mock<ITitulaireService>();
        _controller = new TitulaireController(_mockTitulaireService.Object);
    }

    [Fact]
    public async Task GetTitulaires_Should_ReturnOkWithTitulaires()
    {
        // Arrange
        var titulaires = new List<TitulaireDto>
        {
            new TitulaireDto { Id = 1, Nom = "Titulaire 1", Email = "titulaire1@test.com" },
            new TitulaireDto { Id = 2, Nom = "Titulaire 2", Email = "titulaire2@test.com" }
        };
        _mockTitulaireService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(titulaires);

        // Act
        var result = await _controller.GetTitulaires();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedTitulaires = okResult.Value.Should().BeAssignableTo<IEnumerable<TitulaireDto>>().Subject;
        returnedTitulaires.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetTitulaire_WithValidId_Should_ReturnOkWithTitulaire()
    {
        // Arrange
        var titulaire = new TitulaireDto 
        { 
            Id = 1, 
            Nom = "Test Titulaire",
            Prenom = "Prénom",
            Email = "test@titulaire.com"
        };
        _mockTitulaireService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(titulaire);

        // Act
        var result = await _controller.GetTitulaire(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedTitulaire = okResult.Value.Should().BeAssignableTo<TitulaireDto>().Subject;
        returnedTitulaire.Id.Should().Be(1);
        returnedTitulaire.Nom.Should().Be("Test Titulaire");
    }

    [Fact]
    public async Task CreateTitulaire_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateTitulaireDto
        {
            Nom = "Nouveau Titulaire",
            Prenom = "Prénom",
            Email = "nouveau@titulaire.com"
        };
        var createdTitulaire = new TitulaireDto
        {
            Id = 1,
            Nom = createDto.Nom,
            Prenom = createDto.Prenom,
            Email = createDto.Email
        };
        _mockTitulaireService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdTitulaire);

        // Act
        var result = await _controller.CreateTitulaire(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetTitulaire));
        var returnedTitulaire = createdResult.Value.Should().BeAssignableTo<TitulaireDto>().Subject;
        returnedTitulaire.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task UpdateTitulaire_WithValidData_Should_ReturnOkWithUpdatedTitulaire()
    {
        // Arrange
        var updateDto = new UpdateTitulaireDto
        {
            Nom = "Titulaire Modifié",
            Email = "modifie@titulaire.com"
        };
        var updatedTitulaire = new TitulaireDto
        {
            Id = 1,
            Nom = updateDto.Nom,
            Email = updateDto.Email
        };
        _mockTitulaireService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedTitulaire);

        // Act
        var result = await _controller.UpdateTitulaire(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedTitulaire = okResult.Value.Should().BeAssignableTo<TitulaireDto>().Subject;
        returnedTitulaire.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteTitulaire_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockTitulaireService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteTitulaire(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }
}
