using FluentAssertions;
using StartingBloch.Backend.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class ClientUsersIntegrationTests : BaseIntegrationTest
{
    public ClientUsersIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateUser_WithClientId_Should_LinkToClient()
    {
        // First create a client
        var clientDto = new CreateClientDto
        {
            Nom = "Client pour utilisateurs",
            Email = "client@users.com",
            Adresse = "123 Rue Users"
        };
        
        var clientResponse = await Client.PostAsJsonAsync("/api/client", clientDto);
        var createdClient = await clientResponse.Content.ReadFromJsonAsync<ClientDto>();

        // Create user linked to client
        var userDto = new CreateUserDto
        {
            Username = "clientuser1",
            Email = "user1@client.com",
            Password = "SecurePassword123!",
            Role = "Employee",
            ClientId = createdClient!.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/useradmin", userDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var user = await response.Content.ReadFromJsonAsync<UserDto>();
        user.Should().NotBeNull();
        user!.ClientId.Should().Be(createdClient.Id);
        user.Role.Should().Be("Employee");
    }

    [Fact]
    public async Task GetUsersByClient_Should_ReturnOnlyClientUsers()
    {
        // Create two clients
        var client1 = await CreateTestClient("Client 1", "client1@test.com");
        var client2 = await CreateTestClient("Client 2", "client2@test.com");

        // Create users for client 1
        await CreateTestUser("user1_client1", "user1@client1.com", client1.Id);
        await CreateTestUser("user2_client1", "user2@client1.com", client1.Id);
        
        // Create user for client 2
        await CreateTestUser("user1_client2", "user1@client2.com", client2.Id);
        
        // Create admin user (no client)
        await CreateTestUser("admin", "admin@system.com", null, "Admin");

        // Act - Get users for client 1
        var response = await Client.GetAsync($"/api/client/{client1.Id}/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var users = await response.Content.ReadFromJsonAsync<List<UserDto>>();
        users.Should().NotBeNull();
        users!.Should().HaveCount(2);
        users.Should().OnlyContain(u => u.ClientId == client1.Id);
        users.Should().Contain(u => u.Username == "user1_client1");
        users.Should().Contain(u => u.Username == "user2_client1");
    }

    [Fact]
    public async Task UpdateUser_ChangeClient_Should_MoveUserToNewClient()
    {
        // Create two clients
        var client1 = await CreateTestClient("Original Client", "original@test.com");
        var client2 = await CreateTestClient("New Client", "new@test.com");

        // Create user for client 1
        var userResponse = await CreateTestUser("moveuser", "move@test.com", client1.Id);
        var user = await userResponse.Content.ReadFromJsonAsync<UserDto>();

        // Update user to belong to client 2
        var updateDto = new UpdateUserDto
        {
            Username = "moveuser",
            Email = "move@test.com",
            ClientId = client2.Id
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/useradmin/{user!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updatedUser = await response.Content.ReadFromJsonAsync<UserDto>();
        updatedUser!.ClientId.Should().Be(client2.Id);

        // Verify user moved from client 1 to client 2
        var client1Users = await Client.GetAsync($"/api/client/{client1.Id}/users");
        var client1UsersList = await client1Users.Content.ReadFromJsonAsync<List<UserDto>>();
        client1UsersList!.Should().NotContain(u => u.Id == user.Id);

        var client2Users = await Client.GetAsync($"/api/client/{client2.Id}/users");
        var client2UsersList = await client2Users.Content.ReadFromJsonAsync<List<UserDto>>();
        client2UsersList!.Should().Contain(u => u.Id == user.Id);
    }

    [Fact]
    public async Task CreateAdminUser_WithoutClient_Should_Succeed()
    {
        // Arrange
        var adminDto = new CreateUserDto
        {
            Username = "systemadmin",
            Email = "admin@system.com",
            Password = "AdminPassword123!",
            Role = "Admin",
            ClientId = null // Admin sans client
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/useradmin", adminDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var admin = await response.Content.ReadFromJsonAsync<UserDto>();
        admin.Should().NotBeNull();
        admin!.ClientId.Should().BeNull();
        admin.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task DeleteClient_Should_HandleUsersCorrectly()
    {
        // Create client with users
        var client = await CreateTestClient("Client à supprimer", "delete@test.com");
        var user1 = await CreateTestUser("user1", "user1@delete.com", client.Id);
        var user2 = await CreateTestUser("user2", "user2@delete.com", client.Id);

        // Get user IDs
        var user1Data = await user1.Content.ReadFromJsonAsync<UserDto>();
        var user2Data = await user2.Content.ReadFromJsonAsync<UserDto>();

        // Act - Delete client
        var deleteResponse = await Client.DeleteAsync($"/api/client/{client.Id}");

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify users are either deleted or ClientId is set to null
        var getUser1 = await Client.GetAsync($"/api/useradmin/{user1Data!.Id}");
        var getUser2 = await Client.GetAsync($"/api/useradmin/{user2Data!.Id}");
        
        // Users should either be deleted (404) or have ClientId = null
        if (getUser1.StatusCode == HttpStatusCode.OK)
        {
            var userData = await getUser1.Content.ReadFromJsonAsync<UserDto>();
            userData!.ClientId.Should().BeNull();
        }
        else
        {
            getUser1.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }

    [Fact]
    public async Task GetClientWithUsers_Should_IncludeUserDetails()
    {
        // Create client with multiple users
        var client = await CreateTestClient("Client avec détails", "details@test.com");
        
        await CreateTestUser("manager1", "manager@client.com", client.Id, "Manager");
        await CreateTestUser("employee1", "emp1@client.com", client.Id, "Employee");
        await CreateTestUser("employee2", "emp2@client.com", client.Id, "Employee");

        // Act
        var response = await Client.GetAsync($"/api/client/{client.Id}?includeUsers=true");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var clientWithUsers = await response.Content.ReadFromJsonAsync<ClientDetailDto>();
        clientWithUsers.Should().NotBeNull();
        clientWithUsers!.Users.Should().HaveCount(3);
        clientWithUsers.Users.Should().Contain(u => u.Role == "Manager");
        clientWithUsers.Users.Should().Contain(u => u.Role == "Employee");
    }

    private async Task<ClientDto> CreateTestClient(string nom, string email)
    {
        var clientDto = new CreateClientDto { Nom = nom, Email = email };
        var response = await Client.PostAsJsonAsync("/api/client", clientDto);
        return (await response.Content.ReadFromJsonAsync<ClientDto>())!;
    }

    private async Task<HttpResponseMessage> CreateTestUser(string username, string email, int? clientId, string role = "Employee")
    {
        var userDto = new CreateUserDto
        {
            Username = username,
            Email = email,
            Password = "TestPassword123!",
            Role = role,
            ClientId = clientId
        };
        return await Client.PostAsJsonAsync("/api/useradmin", userDto);
    }
}
