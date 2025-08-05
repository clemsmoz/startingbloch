using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class UserAdminControllerTests
{
    private readonly Mock<IUserAdminService> _mockUserAdminService;
    private readonly UserAdminController _controller;

    public UserAdminControllerTests()
    {
        _mockUserAdminService = new Mock<IUserAdminService>();
        _controller = new UserAdminController(_mockUserAdminService.Object);
    }

    [Fact]
    public async Task GetUsers_Should_ReturnOkWithUsers()
    {
        // Arrange
        var users = new List<UserDto>
        {
            new UserDto { Id = 1, Username = "admin", Email = "admin@test.com", IsActive = true },
            new UserDto { Id = 2, Username = "user", Email = "user@test.com", IsActive = true }
        };
        _mockUserAdminService.Setup(s => s.GetAllUsersAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(users);

        // Act
        var result = await _controller.GetUsers();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUsers = okResult.Value.Should().BeAssignableTo<IEnumerable<UserDto>>().Subject;
        returnedUsers.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetUser_WithValidId_Should_ReturnOkWithUser()
    {
        // Arrange
        var user = new UserDto 
        { 
            Id = 1, 
            Username = "testuser",
            Email = "test@user.com",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _mockUserAdminService.Setup(s => s.GetUserByIdAsync(1))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetUser(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUser = okResult.Value.Should().BeAssignableTo<UserDto>().Subject;
        returnedUser.Id.Should().Be(1);
        returnedUser.Username.Should().Be("testuser");
    }

    [Fact]
    public async Task GetUser_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.GetUserByIdAsync(999))
            .ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.GetUser(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateUser_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateUserDto
        {
            Username = "newuser",
            Email = "new@user.com",
            Password = "SecurePassword123!"
        };
        var createdUser = new UserDto
        {
            Id = 1,
            Username = createDto.Username,
            Email = createDto.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _mockUserAdminService.Setup(s => s.CreateUserAsync(createDto))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _controller.CreateUser(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetUser));
        var returnedUser = createdResult.Value.Should().BeAssignableTo<UserDto>().Subject;
        returnedUser.Username.Should().Be(createDto.Username);
    }

    [Fact]
    public async Task CreateUser_WithInvalidData_Should_ReturnBadRequest()
    {
        // Arrange
        var createDto = new CreateUserDto
        {
            Username = "", // Username vide
            Email = "test@test.com",
            Password = "password"
        };
        _controller.ModelState.AddModelError("Username", "Le nom d'utilisateur est requis");

        // Act
        var result = await _controller.CreateUser(createDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateUser_WithValidData_Should_ReturnOkWithUpdatedUser()
    {
        // Arrange
        var updateDto = new UpdateUserDto
        {
            Username = "updateduser",
            Email = "updated@user.com"
        };
        var updatedUser = new UserDto
        {
            Id = 1,
            Username = updateDto.Username,
            Email = updateDto.Email,
            IsActive = true,
            UpdatedAt = DateTime.UtcNow
        };
        _mockUserAdminService.Setup(s => s.UpdateUserAsync(1, updateDto))
            .ReturnsAsync(updatedUser);

        // Act
        var result = await _controller.UpdateUser(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUser = okResult.Value.Should().BeAssignableTo<UserDto>().Subject;
        returnedUser.Username.Should().Be(updateDto.Username);
    }

    [Fact]
    public async Task UpdateUser_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        var updateDto = new UpdateUserDto { Username = "test" };
        _mockUserAdminService.Setup(s => s.UpdateUserAsync(999, updateDto))
            .ReturnsAsync((UserDto?)null);

        // Act
        var result = await _controller.UpdateUser(999, updateDto);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task ChangePassword_WithValidData_Should_ReturnOk()
    {
        // Arrange
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "oldpassword",
            NewPassword = "NewSecurePassword123!"
        };
        _mockUserAdminService.Setup(s => s.ChangePasswordAsync(1, changePasswordDto))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ChangePassword(1, changePasswordDto);

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task ChangePassword_WithInvalidCurrentPassword_Should_ReturnBadRequest()
    {
        // Arrange
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "wrongpassword",
            NewPassword = "NewSecurePassword123!"
        };
        _mockUserAdminService.Setup(s => s.ChangePasswordAsync(1, changePasswordDto))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.ChangePassword(1, changePasswordDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task DeactivateUser_WithValidId_Should_ReturnOk()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.DeactivateUserAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeactivateUser(1);

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task ActivateUser_WithValidId_Should_ReturnOk()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.ActivateUserAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ActivateUser(1);

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task DeleteUser_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.DeleteUserAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteUser(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteUser_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.DeleteUserAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteUser(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CheckUsernameAvailability_WithAvailableUsername_Should_ReturnTrue()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.IsUsernameAvailableAsync("availableuser"))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.CheckUsernameAvailability("availableuser");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var isAvailable = okResult.Value.Should().BeAssignableTo<bool>().Subject;
        isAvailable.Should().BeTrue();
    }

    [Fact]
    public async Task CheckEmailAvailability_WithAvailableEmail_Should_ReturnTrue()
    {
        // Arrange
        _mockUserAdminService.Setup(s => s.IsEmailAvailableAsync("available@email.com"))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.CheckEmailAvailability("available@email.com");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var isAvailable = okResult.Value.Should().BeAssignableTo<bool>().Subject;
        isAvailable.Should().BeTrue();
    }
}
