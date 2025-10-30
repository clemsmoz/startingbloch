using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class BrevetControllerTests
{
    private readonly Mock<IBrevetService> _mockBrevetService;
    private readonly BrevetController _controller;

    public BrevetControllerTests()
    {
        _mockBrevetService = new Mock<IBrevetService>();
        _controller = new BrevetController(_mockBrevetService.Object);
    }

    [Fact]
    public async Task GetBrevets_Should_ReturnOkWithBrevets()
    {
        // Arrange
        var brevets = new List<BrevetDto>
        {
            new BrevetDto { Id = 1, Titre = "Brevet 1", NumeroDemande = "FR123456" },
            new BrevetDto { Id = 2, Titre = "Brevet 2", NumeroDemande = "FR789012" }
        };
        _mockBrevetService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(brevets);

        // Act
        var result = await _controller.GetBrevets();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBrevets = okResult.Value.Should().BeAssignableTo<IEnumerable<BrevetDto>>().Subject;
        returnedBrevets.Should().HaveCount(2);
        _mockBrevetService.Verify(s => s.GetAllAsync(1, 50, null), Times.Once);
    }

    [Fact]
    public async Task GetBrevet_WithValidId_Should_ReturnOkWithBrevet()
    {
        // Arrange
        var brevet = new BrevetDto 
        { 
            Id = 1, 
            Titre = "Test Brevet",
            NumeroDemande = "FR123456",
            DateDepot = DateTime.Now.AddDays(-30)
        };
        _mockBrevetService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(brevet);

        // Act
        var result = await _controller.GetBrevet(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBrevet = okResult.Value.Should().BeAssignableTo<BrevetDto>().Subject;
        returnedBrevet.Id.Should().Be(1);
        returnedBrevet.Titre.Should().Be("Test Brevet");
    }

    [Fact]
    public async Task GetBrevet_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockBrevetService.Setup(s => s.GetByIdAsync(999))
            .ReturnsAsync((BrevetDto?)null);

        // Act
        var result = await _controller.GetBrevet(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateBrevet_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateBrevetDto
        {
            Titre = "Nouveau Brevet",
            NumeroDemande = "FR999888",
            DateDepot = DateTime.Now,
            ClientId = 1
        };
        var createdBrevet = new BrevetDto
        {
            Id = 1,
            Titre = createDto.Titre,
            NumeroDemande = createDto.NumeroDemande,
            DateDepot = createDto.DateDepot,
            ClientId = createDto.ClientId
        };
        _mockBrevetService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdBrevet);

        // Act
        var result = await _controller.CreateBrevet(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetBrevet));
        createdResult.RouteValues!["id"].Should().Be(1);
        var returnedBrevet = createdResult.Value.Should().BeAssignableTo<BrevetDto>().Subject;
        returnedBrevet.Titre.Should().Be(createDto.Titre);
    }

    [Fact]
    public async Task UpdateBrevet_WithValidData_Should_ReturnOkWithUpdatedBrevet()
    {
        // Arrange
        var updateDto = new UpdateBrevetDto
        {
            Titre = "Brevet Modifié",
            NumeroDemande = "FR555444",
            DateDepot = DateTime.Now.AddDays(-10)
        };
        var updatedBrevet = new BrevetDto
        {
            Id = 1,
            Titre = updateDto.Titre,
            NumeroDemande = updateDto.NumeroDemande,
            DateDepot = updateDto.DateDepot
        };
        _mockBrevetService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedBrevet);

        // Act
        var result = await _controller.UpdateBrevet(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBrevet = okResult.Value.Should().BeAssignableTo<BrevetDto>().Subject;
        returnedBrevet.Titre.Should().Be(updateDto.Titre);
    }

    [Fact]
    public async Task DeleteBrevet_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockBrevetService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteBrevet(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteBrevet_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockBrevetService.Setup(s => s.DeleteAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteBrevet(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetBrevetsByClient_WithValidClientId_Should_ReturnOkWithBrevets()
    {
        // Arrange
        var brevets = new List<BrevetDto>
        {
            new BrevetDto { Id = 1, Titre = "Brevet Client 1", ClientId = 1 },
            new BrevetDto { Id = 2, Titre = "Brevet Client 2", ClientId = 1 }
        };
        _mockBrevetService.Setup(s => s.GetByClientIdAsync(1))
            .ReturnsAsync(brevets);

        // Act
        var result = await _controller.GetBrevetsByClient(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBrevets = okResult.Value.Should().BeAssignableTo<IEnumerable<BrevetDto>>().Subject;
        returnedBrevets.Should().HaveCount(2);
        returnedBrevets.All(b => b.ClientId == 1).Should().BeTrue();
    }

    [Fact]
    public async Task SearchBrevets_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchResults = new List<BrevetDto>
        {
            new BrevetDto { Id = 1, Titre = "Brevet Recherché", NumeroDemande = "FR123456" }
        };
        _mockBrevetService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), "Recherché"))
            .ReturnsAsync(searchResults);

        // Act
        var result = await _controller.GetBrevets(search: "Recherché");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBrevets = okResult.Value.Should().BeAssignableTo<IEnumerable<BrevetDto>>().Subject;
        returnedBrevets.Should().HaveCount(1);
        _mockBrevetService.Verify(s => s.GetAllAsync(1, 50, "Recherché"), Times.Once);
    }

    [Fact]
    public async Task AssignInventorToBrevet_WithValidData_Should_ReturnOk()
    {
        // Arrange
        _mockBrevetService.Setup(s => s.AssignInventorAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AssignInventorToBrevet(1, new { InventorId = 1 });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task AssignDeposantToBrevet_WithValidData_Should_ReturnOk()
    {
        // Arrange
        _mockBrevetService.Setup(s => s.AssignDeposantAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AssignDeposantToBrevet(1, new { DeposantId = 1 });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task AssignTitulaireToBrevet_WithValidData_Should_ReturnOk()
    {
        // Arrange
        _mockBrevetService.Setup(s => s.AssignTitulaireAsync(1, 1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AssignTitulaireToBrevet(1, new { TitulaireId = 1 });

        // Assert
        result.Should().BeOfType<OkResult>();
    }
}
