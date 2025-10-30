using FluentAssertions;
using StartingBloch.Backend.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class UserAdminControllerIntegrationTests : BaseIntegrationTest
{
    public UserAdminControllerIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetUsers_Should_ReturnOkWithUsers()
    {
        // Act
        var response = await Client.GetAsync("/api/useradmin");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var users = await response.Content.ReadFromJsonAsync<List<UserDto>>();
        users.Should().NotBeNull();
        users.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task CreateUser_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var createDto = new CreateUserDto
        {
            Username = "integrationuser",
            Email = "integration@user.com",
            Password = "SecurePassword123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/useradmin", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        user.Should().NotBeNull();
        user!.Username.Should().Be(createDto.Username);
        user.Email.Should().Be(createDto.Email);
        user.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateUser_WithValidData_Should_UpdateSuccessfully()
    {
        // First create a user
        var createDto = new CreateUserDto
        {
            Username = "usertoupdate",
            Email = "update@user.com",
            Password = "Password123!"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/useradmin", createDto);
        var createdUser = await createResponse.Content.ReadFromJsonAsync<UserDto>();

        // Arrange update
        var updateDto = new UpdateUserDto
        {
            Username = "updatedusername",
            Email = "updated@user.com"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/useradmin/{createdUser!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updatedUser = await response.Content.ReadFromJsonAsync<UserDto>();
        updatedUser!.Username.Should().Be(updateDto.Username);
        updatedUser.Email.Should().Be(updateDto.Email);
    }

    [Fact]
    public async Task DeactivateUser_Should_DeactivateSuccessfully()
    {
        // First create a user
        var createDto = new CreateUserDto
        {
            Username = "usertodeactivate",
            Email = "deactivate@user.com",
            Password = "Password123!"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/useradmin", createDto);
        var createdUser = await createResponse.Content.ReadFromJsonAsync<UserDto>();

        // Act
        var response = await Client.PostAsync($"/api/useradmin/{createdUser!.Id}/deactivate", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ActivateUser_Should_ActivateSuccessfully()
    {
        // First create and deactivate a user
        var createDto = new CreateUserDto
        {
            Username = "usertoactivate",
            Email = "activate@user.com",
            Password = "Password123!"
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/useradmin", createDto);
        var createdUser = await createResponse.Content.ReadFromJsonAsync<UserDto>();
        
        await Client.PostAsync($"/api/useradmin/{createdUser!.Id}/deactivate", null);

        // Act
        var response = await Client.PostAsync($"/api/useradmin/{createdUser.Id}/activate", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CheckUsernameAvailability_WithAvailableUsername_Should_ReturnTrue()
    {
        // Act
        var response = await Client.GetAsync("/api/useradmin/check-username/newavailableuser");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var isAvailable = await response.Content.ReadFromJsonAsync<bool>();
        isAvailable.Should().BeTrue();
    }

    [Fact]
    public async Task CheckEmailAvailability_WithAvailableEmail_Should_ReturnTrue()
    {
        // Act
        var response = await Client.GetAsync("/api/useradmin/check-email/available@newemail.com");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var isAvailable = await response.Content.ReadFromJsonAsync<bool>();
        isAvailable.Should().BeTrue();
    }

    [Fact]
    public async Task CreateUser_WithClientId_Should_CreateUserWithClientAssociation()
    {
        // First create a client
        var clientDto = new CreateClientDto
        {
            NomClient = "Client Test Integration",
            EmailClient = "clienttest@integration.com",
            AdresseClient = "123 Rue Test",
            TelephoneClient = "0123456789"
        };
        var clientResponse = await Client.PostAsJsonAsync("/api/client", clientDto);
        var createdClient = await clientResponse.Content.ReadFromJsonAsync<ClientDto>();

        // Arrange
        var createUserDto = new CreateUserDto
        {
            Username = "userWithClient",
            Email = "userwithclient@test.com",
            Password = "SecurePassword123!",
            ClientId = createdClient!.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/useradmin", createUserDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        user.Should().NotBeNull();
        user!.Username.Should().Be(createUserDto.Username);
        user.Email.Should().Be(createUserDto.Email);
        user.ClientId.Should().Be(createdClient.Id);
        user.Client.Should().NotBeNull();
        user.Client!.Id.Should().Be(createdClient.Id);
    }

    [Fact]
    public async Task UpdateUser_WithClientId_Should_UpdateUserClientAssociation()
    {
        // First create a client
        var clientDto = new CreateClientDto
        {
            NomClient = "Client Test Update",
            EmailClient = "clientupdate@integration.com",
            AdresseClient = "456 Rue Update",
            TelephoneClient = "0987654321"
        };
        var clientResponse = await Client.PostAsJsonAsync("/api/client", clientDto);
        var createdClient = await clientResponse.Content.ReadFromJsonAsync<ClientDto>();

        // Create a user without client
        var createUserDto = new CreateUserDto
        {
            Username = "userForClientUpdate",
            Email = "userforclientupdate@test.com",
            Password = "SecurePassword123!"
        };
        var userResponse = await Client.PostAsJsonAsync("/api/useradmin", createUserDto);
        var createdUser = await userResponse.Content.ReadFromJsonAsync<UserDto>();

        // Arrange
        var updateDto = new UpdateUserDto
        {
            ClientId = createdClient!.Id
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/useradmin/{createdUser!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updatedUser = await response.Content.ReadFromJsonAsync<UserDto>();
        updatedUser.Should().NotBeNull();
        updatedUser!.ClientId.Should().Be(createdClient.Id);
        updatedUser.Client.Should().NotBeNull();
        updatedUser.Client!.Id.Should().Be(createdClient.Id);
    }

    [Fact]
    public async Task UpdateUser_WithNullClientId_Should_RemoveClientAssociation()
    {
        // First create a client
        var clientDto = new CreateClientDto
        {
            NomClient = "Client Test Remove",
            EmailClient = "clientremove@integration.com",
            AdresseClient = "789 Rue Remove",
            TelephoneClient = "0111111111"
        };
        var clientResponse = await Client.PostAsJsonAsync("/api/client", clientDto);
        var createdClient = await clientResponse.Content.ReadFromJsonAsync<ClientDto>();

        // Create a user with client
        var createUserDto = new CreateUserDto
        {
            Username = "userForClientRemoval",
            Email = "userforclientremoval@test.com",
            Password = "SecurePassword123!",
            ClientId = createdClient!.Id
        };
        var userResponse = await Client.PostAsJsonAsync("/api/useradmin", createUserDto);
        var createdUser = await userResponse.Content.ReadFromJsonAsync<UserDto>();

        // Arrange
        var updateDto = new UpdateUserDto
        {
            ClientId = null
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/useradmin/{createdUser!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updatedUser = await response.Content.ReadFromJsonAsync<UserDto>();
        updatedUser.Should().NotBeNull();
        updatedUser!.ClientId.Should().BeNull();
        updatedUser.Client.Should().BeNull();
    }
}
