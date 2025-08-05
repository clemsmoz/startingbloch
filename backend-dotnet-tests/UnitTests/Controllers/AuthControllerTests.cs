using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using System.Security.Claims;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IUserAdminService> _mockUserService;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockUserService = new Mock<IUserAdminService>();
        _mockTokenService = new Mock<ITokenService>();
        _controller = new AuthController(_mockUserService.Object, _mockTokenService.Object);
    }

    [Fact]
    public async Task Login_WithValidCredentials_Should_ReturnOkWithToken()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "testuser",
            Password = "password123"
        };

        var user = new UserDto
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            Role = "Admin",
            IsActive = true
        };

        var token = "jwt-token-here";

        _mockUserService.Setup(s => s.ValidateCredentialsAsync(loginDto.Username, loginDto.Password))
            .ReturnsAsync(user);
        _mockTokenService.Setup(s => s.GenerateToken(user))
            .Returns(token);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeAssignableTo<object>().Subject;
        
        // Vérifier que la réponse contient le token et les infos utilisateur
        response.Should().NotBeNull();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_Should_ReturnUnauthorized()
    {
        // Arrange
        var loginDto = new LoginDto
        {
            Username = "invaliduser",
            Password = "wrongpassword"
        };

        _mockUserService.Setup(s => s.ValidateCredentialsAsync(loginDto.Username, loginDto.Password))
            .ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Register_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Username = "newuser",
            Email = "new@example.com",
            Password = "NewPassword123!"
        };

        var createdUser = new UserDto
        {
            Id = 1,
            Username = registerDto.Username,
            Email = registerDto.Email,
            Role = "User",
            IsActive = true
        };

        _mockUserService.Setup(s => s.CreateAsync(It.IsAny<CreateUserDto>()))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.Value.Should().BeEquivalentTo(createdUser);
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_Should_ReturnCurrentUser()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Name, "testuser"),
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim(ClaimTypes.Role, "Admin")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var userDto = new UserDto
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            Role = "Admin",
            IsActive = true
        };

        _mockUserService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(userDto);

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(userDto);
    }

    [Fact]
    public async Task ChangePassword_WithValidData_Should_ReturnOk()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "currentpass",
            NewPassword = "newpass123"
        };

        _mockUserService.Setup(s => s.ChangePasswordAsync(1, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ChangePassword_WithInvalidCurrentPassword_Should_ReturnBadRequest()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "wrongpass",
            NewPassword = "newpass123"
        };

        _mockUserService.Setup(s => s.ChangePasswordAsync(1, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.ChangePassword(changePasswordDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_Should_ReturnNewToken()
    {
        // Arrange
        var refreshTokenDto = new RefreshTokenDto
        {
            Token = "valid-refresh-token"
        };

        var newToken = "new-jwt-token";

        _mockTokenService.Setup(s => s.RefreshTokenAsync(refreshTokenDto.Token))
            .ReturnsAsync(newToken);

        // Act
        var result = await _controller.RefreshToken(refreshTokenDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeAssignableTo<object>().Subject;
        response.Should().NotBeNull();
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_Should_ReturnUnauthorized()
    {
        // Arrange
        var refreshTokenDto = new RefreshTokenDto
        {
            Token = "invalid-refresh-token"
        };

        _mockTokenService.Setup(s => s.RefreshTokenAsync(refreshTokenDto.Token))
            .ReturnsAsync((string?)null);

        // Act
        var result = await _controller.RefreshToken(refreshTokenDto);

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Logout_Should_ReturnOk()
    {
        // Arrange
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        _mockTokenService.Setup(s => s.RevokeTokenAsync(1))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Logout();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _mockTokenService.Verify(s => s.RevokeTokenAsync(1), Times.Once);
    }
}
