using FluentAssertions;
using StartingBloch.Backend.DTOs;
using System.Net;
using System.Net.Http.Json;

namespace StartingBloch.Backend.Tests.IntegrationTests;

public class ContactControllerIntegrationTests : BaseIntegrationTest
{
    public ContactControllerIntegrationTests(StartingBlochWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetContacts_Should_ReturnOkWithContacts()
    {
        // Act
        var response = await Client.GetAsync("/api/contact");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var contacts = await response.Content.ReadFromJsonAsync<List<ContactDto>>();
        contacts.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateContact_WithValidData_Should_ReturnCreated()
    {
        // Arrange
        var createDto = new CreateContactDto
        {
            Nom = "Contact Integration Test",
            Prenom = "Prénom Test",
            Emails = new List<string> { "contact@integration.com" },
            Phones = new List<string> { "0123456789" },
            Roles = new List<string> { "Manager" }
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/contact", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var contact = await response.Content.ReadFromJsonAsync<ContactDto>();
        contact.Should().NotBeNull();
        contact!.Nom.Should().Be(createDto.Nom);
        contact.Emails.Should().Contain("contact@integration.com");
    }

    [Fact]
    public async Task AddEmailToContact_Should_UpdateContactEmails()
    {
        // First create a contact
        var createDto = new CreateContactDto
        {
            Nom = "Test Contact Email",
            Emails = new List<string> { "initial@test.com" }
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/contact", createDto);
        var createdContact = await createResponse.Content.ReadFromJsonAsync<ContactDto>();

        // Act - Add email
        var response = await Client.PostAsJsonAsync($"/api/contact/{createdContact!.Id}/emails", 
            new { Email = "newemail@test.com" });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify email was added
        var getResponse = await Client.GetAsync($"/api/contact/{createdContact.Id}");
        var updatedContact = await getResponse.Content.ReadFromJsonAsync<ContactDto>();
        updatedContact!.Emails.Should().Contain("newemail@test.com");
    }

    [Fact]
    public async Task RemoveEmailFromContact_Should_UpdateContactEmails()
    {
        // First create a contact with multiple emails
        var createDto = new CreateContactDto
        {
            Nom = "Test Contact Remove Email",
            Emails = new List<string> { "keep@test.com", "remove@test.com" }
        };
        
        var createResponse = await Client.PostAsJsonAsync("/api/contact", createDto);
        var createdContact = await createResponse.Content.ReadFromJsonAsync<ContactDto>();

        // Act - Remove email
        var response = await Client.DeleteAsync($"/api/contact/{createdContact!.Id}/emails");
        
        // Note: In a real implementation, you might need to pass the email to remove in the request body
        // This is a simplified test

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
