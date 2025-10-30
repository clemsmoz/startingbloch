using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class ClientControllerTests
{
    private readonly Mock<IClientService> _mockClientService;
    private readonly ClientController _controller;

    public ClientControllerTests()
    {
        _mockClientService = new Mock<IClientService>();
        _controller = new ClientController(_mockClientService.Object, Mock.Of<ILogger<ClientController>>());
    }

    [Fact]
    public async Task GetClients_ShouldReturnOkResult_WhenServiceReturnsSuccess()
    {
        // Arrange
        var expectedResponse = new PagedResponse<List<ClientDto>>
        {
            Success = true,
            Data = new List<ClientDto>
            {
                new ClientDto { Id = 1, Nom = "Client 1" },
                new ClientDto { Id = 2, Nom = "Client 2" }
            },
            TotalItems = 2,
            Page = 1,
            PageSize = 10
        };

        _mockClientService
            .Setup(s => s.GetClientsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetClients();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<PagedResponse<List<ClientDto>>>().Subject;
        response.Success.Should().BeTrue();
        response.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetClients_ShouldReturnBadRequest_WhenServiceReturnsFailure()
    {
        // Arrange
        var expectedResponse = new PagedResponse<List<ClientDto>>
        {
            Success = false,
            Message = "Erreur de service"
        };

        _mockClientService
            .Setup(s => s.GetClientsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetClients();

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetClientById_ShouldReturnOkResult_WhenClientExists()
    {
        // Arrange
        var clientId = 1;
        var expectedResponse = new ApiResponse<ClientDto>
        {
            Success = true,
            Data = new ClientDto { Id = clientId, Nom = "Client Test" }
        };

        _mockClientService
            .Setup(s => s.GetClientByIdAsync(clientId))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetClientById(clientId);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<ClientDto>>().Subject;
        response.Success.Should().BeTrue();
        response.Data!.Id.Should().Be(clientId);
    }

    [Fact]
    public async Task GetClientById_ShouldReturnNotFound_WhenClientDoesNotExist()
    {
        // Arrange
        var clientId = 999;
        var expectedResponse = new ApiResponse<ClientDto>
        {
            Success = false,
            Message = "Client non trouvé"
        };

        _mockClientService
            .Setup(s => s.GetClientByIdAsync(clientId))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetClientById(clientId);

        // Assert
        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task CreateClient_ShouldReturnCreatedResult_WhenDataIsValid()
    {
        // Arrange
        var createDto = new CreateClientDto
        {
            Nom = "Nouveau Client",
            Adresse = "123 Test St",
            Email = "test@client.com"
        };

        var expectedResponse = new ApiResponse<ClientDto>
        {
            Success = true,
            Data = new ClientDto { Id = 1, Nom = createDto.Nom },
            Message = "Client créé avec succès"
        };

        _mockClientService
            .Setup(s => s.CreateClientAsync(createDto))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.CreateClient(createDto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetClientById));
        
        var response = createdResult.Value.Should().BeOfType<ApiResponse<ClientDto>>().Subject;
        response.Success.Should().BeTrue();
        response.Data!.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task CreateClient_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        // Arrange
        var createDto = new CreateClientDto(); // Données invalides
        _controller.ModelState.AddModelError("Nom", "Le nom est requis");

        // Act
        var result = await _controller.CreateClient(createDto);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateClient_ShouldReturnOkResult_WhenUpdateIsSuccessful()
    {
        // Arrange
        var clientId = 1;
        var updateDto = new UpdateClientDto
        {
            Nom = "Client Modifié",
            Email = "modifie@client.com"
        };

        var expectedResponse = new ApiResponse<ClientDto>
        {
            Success = true,
            Data = new ClientDto { Id = clientId, Nom = updateDto.Nom },
            Message = "Client mis à jour avec succès"
        };

        _mockClientService
            .Setup(s => s.UpdateClientAsync(clientId, updateDto))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.UpdateClient(clientId, updateDto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<ClientDto>>().Subject;
        response.Success.Should().BeTrue();
        response.Data!.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task DeleteClient_ShouldReturnOkResult_WhenDeletionIsSuccessful()
    {
        // Arrange
        var clientId = 1;
        var expectedResponse = new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Client supprimé avec succès"
        };

        _mockClientService
            .Setup(s => s.DeleteClientAsync(clientId))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.DeleteClient(clientId);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<bool>>().Subject;
        response.Success.Should().BeTrue();
        response.Data.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetClientById_ShouldReturnBadRequest_WhenIdIsInvalid(int invalidId)
    {
        // Act
        var result = await _controller.GetClientById(invalidId);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetClients_ShouldCallServiceWithCorrectParameters()
    {
        // Arrange
        var page = 2;
        var pageSize = 5;
        var search = "test";

        _mockClientService
            .Setup(s => s.GetClientsAsync(page, pageSize, search))
            .ReturnsAsync(new PagedResponse<List<ClientDto>> { Success = true, Data = new List<ClientDto>() });

        // Act
        await _controller.GetClients(page, pageSize, search);

        // Assert
        _mockClientService.Verify(
            s => s.GetClientsAsync(page, pageSize, search),
            Times.Once);
    }
}
