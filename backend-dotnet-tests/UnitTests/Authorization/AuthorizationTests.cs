using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Routing;
using Moq;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using System.Reflection;
using System.Security.Claims;

namespace StartingBloch.Backend.Tests.UnitTests.Authorization;

public class AuthorizationTests
{
    [Fact]
    public void ClientController_Should_RequireAuthorization()
    {
        // Arrange
        var controllerType = typeof(ClientController);

        // Act
        var hasAuthorizeAttribute = controllerType.GetCustomAttributes(typeof(AuthorizeAttribute), true).Any();

        // Assert
        hasAuthorizeAttribute.Should().BeTrue("ClientController should require authorization");
    }

    [Fact]
    public void UserAdminController_Should_RequireAdminRole()
    {
        // Arrange
        var controllerType = typeof(UserAdminController);

        // Act
        var authorizeAttribute = controllerType.GetCustomAttribute<AuthorizeAttribute>();

        // Assert
        authorizeAttribute.Should().NotBeNull();
        authorizeAttribute!.Roles.Should().Contain("Admin");
    }

    [Fact]
    public void AuthController_Login_Should_AllowAnonymous()
    {
        // Arrange
        var controllerType = typeof(AuthController);
        var loginMethod = controllerType.GetMethod("Login");

        // Act
        var hasAllowAnonymous = loginMethod?.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Any() ?? false;

        // Assert
        hasAllowAnonymous.Should().BeTrue("Login method should allow anonymous access");
    }

    [Fact]
    public void AuthController_Register_Should_AllowAnonymous()
    {
        // Arrange
        var controllerType = typeof(AuthController);
        var registerMethod = controllerType.GetMethod("Register");

        // Act
        var hasAllowAnonymous = registerMethod?.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Any() ?? false;

        // Assert
        hasAllowAnonymous.Should().BeTrue("Register method should allow anonymous access");
    }

    [Theory]
    [InlineData(typeof(ClientController), "Admin,Employee")]
    [InlineData(typeof(BrevetController), "Admin,Employee")]
    [InlineData(typeof(ContactController), "Admin,Employee")]
    public void Controllers_Should_HaveCorrectRoleRequirements(Type controllerType, string expectedRoles)
    {
        // Act
        var authorizeAttribute = controllerType.GetCustomAttribute<AuthorizeAttribute>();

        // Assert
        authorizeAttribute.Should().NotBeNull();
        
        var roles = expectedRoles.Split(',');
        foreach (var role in roles)
        {
            authorizeAttribute!.Roles.Should().Contain(role.Trim());
        }
    }

    [Fact]
    public async Task Controller_WithClientRole_Should_OnlyAccessOwnData()
    {
        // Arrange
        var mockService = new Mock<IClientService>();
        var controller = new ClientController(mockService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Client"),
            new Claim("ClientId", "123")
        }, "test"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var clientDto = new ClientDto { Id = 123, Nom = "Test Client" };
        mockService.Setup(s => s.GetByIdAsync(123)).ReturnsAsync(clientDto);

        // Act
        var result = await controller.GetById(123);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        mockService.Verify(s => s.GetByIdAsync(123), Times.Once);
    }

    [Fact]
    public async Task Controller_WithClientRole_Should_DenyAccessToOtherClientsData()
    {
        // Arrange
        var mockService = new Mock<IClientService>();
        var controller = new ClientController(mockService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Client"),
            new Claim("ClientId", "123")
        }, "test"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        // Act
        var result = await controller.GetById(999); // Trying to access different client

        // Assert
        result.Should().BeOfType<ForbidResult>();
        mockService.Verify(s => s.GetByIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task Controller_WithAdminRole_Should_AccessAllData()
    {
        // Arrange
        var mockService = new Mock<IClientService>();
        var controller = new ClientController(mockService.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Admin")
        }, "test"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var clientDto = new ClientDto { Id = 999, Nom = "Any Client" };
        mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync(clientDto);

        // Act
        var result = await controller.GetById(999);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        mockService.Verify(s => s.GetByIdAsync(999), Times.Once);
    }

    [Fact]
    public void GetUserRole_Should_ExtractCorrectRole()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Role, "Employee"),
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "test"));

        // Act
        var role = user.FindFirst(ClaimTypes.Role)?.Value;

        // Assert
        role.Should().Be("Employee");
    }

    [Fact]
    public void GetClientId_Should_ExtractCorrectClientId()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim("ClientId", "456"),
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "test"));

        // Act
        var clientIdClaim = user.FindFirst("ClientId")?.Value;
        var clientId = int.Parse(clientIdClaim ?? "0");

        // Assert
        clientId.Should().Be(456);
    }
}
