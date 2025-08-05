using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;
using StartingBloch.Backend.Tests.TestData;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class UserAdminServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly UserAdminService _service;

    public UserAdminServiceTests()
    {
        var options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new StartingBlochDbContext(options);
        _service = new UserAdminService(_context);

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        var testData = TestDbContextFactory.CreateTestData(_context);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllUsersAsync_Should_ReturnAllUsers()
    {
        // Act
        var result = await _service.GetAllUsersAsync();

        // Assert
        result.Should().NotBeEmpty();
        result.Should().HaveCountGreaterThan(0);
        result.Should().AllBeOfType<UserDto>();
    }

    [Fact]
    public async Task GetAllUsersAsync_WithPagination_Should_ReturnCorrectPage()
    {
        // Act
        var result = await _service.GetAllUsersAsync(page: 1, pageSize: 1);

        // Assert
        result.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAllUsersAsync_WithSearch_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchTerm = "admin";

        // Act
        var result = await _service.GetAllUsersAsync(search: searchTerm);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().OnlyContain(u => 
            u.Username.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            u.Email.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetUserByIdAsync_WithValidId_Should_ReturnUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.GetUserByIdAsync(existingUser.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingUser.Id);
        result.Username.Should().Be(existingUser.Username);
        result.Email.Should().Be(existingUser.Email);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithInvalidId_Should_ReturnNull()
    {
        // Act
        var result = await _service.GetUserByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateUserAsync_WithValidData_Should_CreateUser()
    {
        // Arrange
        var createDto = new CreateUserDto
        {
            Username = "nouveauuser",
            Email = "nouveau@test.com",
            Password = "MotDePasse123!"
        };

        // Act
        var result = await _service.CreateUserAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Username.Should().Be(createDto.Username);
        result.Email.Should().Be(createDto.Email);
        result.Id.Should().BeGreaterThan(0);
        result.IsActive.Should().BeTrue();

        // Verify in database
        var userInDb = await _context.Users.FindAsync(result.Id);
        userInDb.Should().NotBeNull();
        userInDb!.Username.Should().Be(createDto.Username);
        userInDb.PasswordHash.Should().NotBe(createDto.Password); // Should be hashed
    }

    [Fact]
    public async Task CreateUserAsync_WithClientId_Should_CreateUserWithClientAssociation()
    {
        // Arrange
        var client = await _context.Clients.FirstAsync();
        var createDto = new CreateUserDto
        {
            Username = "nouveauuserclient",
            Email = "nouveauclient@test.com",
            Password = "MotDePasse123!",
            ClientId = client.Id
        };

        // Act
        var result = await _service.CreateUserAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Username.Should().Be(createDto.Username);
        result.Email.Should().Be(createDto.Email);
        result.ClientId.Should().Be(client.Id);
        result.Id.Should().BeGreaterThan(0);
        result.IsActive.Should().BeTrue();

        // Verify in database
        var userInDb = await _context.Users.Include(u => u.Client).FirstOrDefaultAsync(u => u.Id == result.Id);
        userInDb.Should().NotBeNull();
        userInDb!.Username.Should().Be(createDto.Username);
        userInDb.ClientId.Should().Be(client.Id);
        userInDb.Client.Should().NotBeNull();
        userInDb.Client!.Id.Should().Be(client.Id);
    }

    [Fact]
    public async Task CreateUserAsync_WithNullClientId_Should_CreateUserWithoutClient()
    {
        // Arrange
        var createDto = new CreateUserDto
        {
            Username = "nouveauusersansclient",
            Email = "sansclient@test.com",
            Password = "MotDePasse123!",
            ClientId = null
        };

        // Act
        var result = await _service.CreateUserAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Username.Should().Be(createDto.Username);
        result.Email.Should().Be(createDto.Email);
        result.ClientId.Should().BeNull();
        result.Id.Should().BeGreaterThan(0);
        result.IsActive.Should().BeTrue();

        // Verify in database
        var userInDb = await _context.Users.Include(u => u.Client).FirstOrDefaultAsync(u => u.Id == result.Id);
        userInDb.Should().NotBeNull();
        userInDb!.Username.Should().Be(createDto.Username);
        userInDb.ClientId.Should().BeNull();
        userInDb.Client.Should().BeNull();
    }

    [Fact]
    public async Task CreateUserAsync_WithDuplicateUsername_Should_ThrowException()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        var createDto = new CreateUserDto
        {
            Username = existingUser.Username, // Username déjà existant
            Email = "autre@test.com",
            Password = "MotDePasse123!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateUserAsync(createDto));
    }

    [Fact]
    public async Task CreateUserAsync_WithDuplicateEmail_Should_ThrowException()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        var createDto = new CreateUserDto
        {
            Username = "nouveauusername",
            Email = existingUser.Email, // Email déjà existant
            Password = "MotDePasse123!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateUserAsync(createDto));
    }

    [Fact]
    public async Task CreateUserAsync_WithInvalidClientId_Should_ThrowException()
    {
        // Arrange
        var createDto = new CreateUserDto
        {
            Username = "nouveauuserinvalidclient",
            Email = "invalidclient@test.com",
            Password = "MotDePasse123!",
            ClientId = 99999 // ClientId inexistant
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateUserAsync(createDto));
    }

    [Fact]
    public async Task UpdateUserAsync_WithValidData_Should_UpdateUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        var updateDto = new UpdateUserDto
        {
            Username = "usernamemodifie",
            Email = "emailmodifie@test.com"
        };

        // Act
        var result = await _service.UpdateUserAsync(existingUser.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.Username.Should().Be(updateDto.Username);
        result.Email.Should().Be(updateDto.Email);

        // Verify in database
        var userInDb = await _context.Users.FindAsync(existingUser.Id);
        userInDb!.Username.Should().Be(updateDto.Username);
        userInDb.Email.Should().Be(updateDto.Email);
        userInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task UpdateUserAsync_WithClientId_Should_UpdateUserClientAssociation()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        var client = await _context.Clients.FirstAsync();
        var updateDto = new UpdateUserDto
        {
            ClientId = client.Id
        };

        // Act
        var result = await _service.UpdateUserAsync(existingUser.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.ClientId.Should().Be(client.Id);

        // Verify in database
        var userInDb = await _context.Users.Include(u => u.Client).FirstOrDefaultAsync(u => u.Id == existingUser.Id);
        userInDb!.ClientId.Should().Be(client.Id);
        userInDb.Client.Should().NotBeNull();
        userInDb.Client!.Id.Should().Be(client.Id);
        userInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task UpdateUserAsync_WithNullClientId_Should_RemoveClientAssociation()
    {
        // Arrange
        var existingUser = await _context.Users.Include(u => u.Client).FirstAsync(u => u.ClientId != null);
        var updateDto = new UpdateUserDto
        {
            ClientId = null
        };

        // Act
        var result = await _service.UpdateUserAsync(existingUser.Id, updateDto);

        // Assert
        result.Should().NotBeNull();
        result!.ClientId.Should().BeNull();

        // Verify in database
        var userInDb = await _context.Users.Include(u => u.Client).FirstOrDefaultAsync(u => u.Id == existingUser.Id);
        userInDb!.ClientId.Should().BeNull();
        userInDb.Client.Should().BeNull();
        userInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task UpdateUserAsync_WithInvalidId_Should_ReturnNull()
    {
        // Arrange
        var updateDto = new UpdateUserDto
        {
            Username = "userpourinexistant"
        };

        // Act
        var result = await _service.UpdateUserAsync(999, updateDto);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ChangePasswordAsync_WithValidData_Should_ChangePassword()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "testpassword", // Suppose que c'est le mot de passe actuel
            NewPassword = "NouveauMotDePasse123!"
        };

        // Act
        var result = await _service.ChangePasswordAsync(existingUser.Id, changePasswordDto);

        // Assert
        result.Should().BeTrue();

        // Verify password changed in database
        var userInDb = await _context.Users.FindAsync(existingUser.Id);
        userInDb!.PasswordHash.Should().NotBe(existingUser.PasswordHash);
        userInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task ChangePasswordAsync_WithInvalidCurrentPassword_Should_ReturnFalse()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        var changePasswordDto = new ChangePasswordDto
        {
            CurrentPassword = "mauvaismdp", // Mauvais mot de passe
            NewPassword = "NouveauMotDePasse123!"
        };

        // Act
        var result = await _service.ChangePasswordAsync(existingUser.Id, changePasswordDto);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeactivateUserAsync_WithValidId_Should_DeactivateUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.DeactivateUserAsync(existingUser.Id);

        // Assert
        result.Should().BeTrue();

        // Verify user is deactivated
        var userInDb = await _context.Users.FindAsync(existingUser.Id);
        userInDb!.IsActive.Should().BeFalse();
        userInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task ActivateUserAsync_WithValidId_Should_ActivateUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();
        existingUser.IsActive = false;
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.ActivateUserAsync(existingUser.Id);

        // Assert
        result.Should().BeTrue();

        // Verify user is activated
        var userInDb = await _context.Users.FindAsync(existingUser.Id);
        userInDb!.IsActive.Should().BeTrue();
        userInDb.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task DeleteUserAsync_WithValidId_Should_DeleteUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.DeleteUserAsync(existingUser.Id);

        // Assert
        result.Should().BeTrue();

        // Verify deletion
        var userInDb = await _context.Users.FindAsync(existingUser.Id);
        userInDb.Should().BeNull();
    }

    [Fact]
    public async Task DeleteUserAsync_WithInvalidId_Should_ReturnFalse()
    {
        // Act
        var result = await _service.DeleteUserAsync(999);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetUserByUsernameAsync_WithValidUsername_Should_ReturnUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.GetUserByUsernameAsync(existingUser.Username);

        // Assert
        result.Should().NotBeNull();
        result!.Username.Should().Be(existingUser.Username);
        result.Id.Should().Be(existingUser.Id);
    }

    [Fact]
    public async Task GetUserByEmailAsync_WithValidEmail_Should_ReturnUser()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.GetUserByEmailAsync(existingUser.Email);

        // Assert
        result.Should().NotBeNull();
        result!.Email.Should().Be(existingUser.Email);
        result.Id.Should().Be(existingUser.Id);
    }

    [Fact]
    public async Task IsUsernameAvailableAsync_WithAvailableUsername_Should_ReturnTrue()
    {
        // Act
        var result = await _service.IsUsernameAvailableAsync("usernamelibre");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsUsernameAvailableAsync_WithTakenUsername_Should_ReturnFalse()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.IsUsernameAvailableAsync(existingUser.Username);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsEmailAvailableAsync_WithAvailableEmail_Should_ReturnTrue()
    {
        // Act
        var result = await _service.IsEmailAvailableAsync("emaillibre@test.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsEmailAvailableAsync_WithTakenEmail_Should_ReturnFalse()
    {
        // Arrange
        var existingUser = await _context.Users.FirstAsync();

        // Act
        var result = await _service.IsEmailAvailableAsync(existingUser.Email);

        // Assert
        result.Should().BeFalse();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
