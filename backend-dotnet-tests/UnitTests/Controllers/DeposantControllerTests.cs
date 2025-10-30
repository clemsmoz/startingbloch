using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class DeposantControllerTests
{
    private readonly Mock<IDeposantService> _mockDeposantService;
    private readonly DeposantController _controller;

    public DeposantControllerTests()
    {
        _mockDeposantService = new Mock<IDeposantService>();
        _controller = new DeposantController(_mockDeposantService.Object);
    }

    [Fact]
    public async Task GetDeposants_Should_ReturnOkWithDeposants()
    {
        // Arrange
        var deposants = new List<DeposantDto>
        {
            new DeposantDto { Id = 1, Nom = "Déposant 1", Email = "deposant1@test.com" },
            new DeposantDto { Id = 2, Nom = "Déposant 2", Email = "deposant2@test.com" }
        };
        _mockDeposantService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(deposants);

        // Act
        var result = await _controller.GetDeposants();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedDeposants = okResult.Value.Should().BeAssignableTo<IEnumerable<DeposantDto>>().Subject;
        returnedDeposants.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetDeposant_WithValidId_Should_ReturnOkWithDeposant()
    {
        // Arrange
        var deposant = new DeposantDto 
        { 
            Id = 1, 
            Nom = "Test Déposant",
            Prenom = "Prénom",
            Email = "test@deposant.com"
        };
        _mockDeposantService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(deposant);

        // Act
        var result = await _controller.GetDeposant(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedDeposant = okResult.Value.Should().BeAssignableTo<DeposantDto>().Subject;
        returnedDeposant.Id.Should().Be(1);
        returnedDeposant.Nom.Should().Be("Test Déposant");
    }

    [Fact]
    public async Task CreateDeposant_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateDeposantDto
        {
            Nom = "Nouveau Déposant",
            Prenom = "Prénom",
            Email = "nouveau@deposant.com"
        };
        var createdDeposant = new DeposantDto
        {
            Id = 1,
            Nom = createDto.Nom,
            Prenom = createDto.Prenom,
            Email = createDto.Email
        };
        _mockDeposantService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdDeposant);

        // Act
        var result = await _controller.CreateDeposant(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetDeposant));
        var returnedDeposant = createdResult.Value.Should().BeAssignableTo<DeposantDto>().Subject;
        returnedDeposant.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task UpdateDeposant_WithValidData_Should_ReturnOkWithUpdatedDeposant()
    {
        // Arrange
        var updateDto = new UpdateDeposantDto
        {
            Nom = "Déposant Modifié",
            Email = "modifie@deposant.com"
        };
        var updatedDeposant = new DeposantDto
        {
            Id = 1,
            Nom = updateDto.Nom,
            Email = updateDto.Email
        };
        _mockDeposantService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedDeposant);

        // Act
        var result = await _controller.UpdateDeposant(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedDeposant = okResult.Value.Should().BeAssignableTo<DeposantDto>().Subject;
        returnedDeposant.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteDeposant_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockDeposantService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteDeposant(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }
}
