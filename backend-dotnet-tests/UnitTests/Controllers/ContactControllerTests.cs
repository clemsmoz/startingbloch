using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Controllers;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Tests.UnitTests.Controllers;

public class ContactControllerTests
{
    private readonly Mock<IContactService> _mockContactService;
    private readonly ContactController _controller;

    public ContactControllerTests()
    {
        _mockContactService = new Mock<IContactService>();
        _controller = new ContactController(_mockContactService.Object);
    }

    [Fact]
    public async Task GetContacts_Should_ReturnOkWithContacts()
    {
        // Arrange
        var contacts = new List<ContactDto>
        {
            new ContactDto { Id = 1, Nom = "Contact 1", Emails = new List<string> { "contact1@test.com" } },
            new ContactDto { Id = 2, Nom = "Contact 2", Emails = new List<string> { "contact2@test.com" } }
        };
        _mockContactService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(contacts);

        // Act
        var result = await _controller.GetContacts();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedContacts = okResult.Value.Should().BeAssignableTo<IEnumerable<ContactDto>>().Subject;
        returnedContacts.Should().HaveCount(2);
        _mockContactService.Verify(s => s.GetAllAsync(1, 50, null), Times.Once);
    }

    [Fact]
    public async Task GetContact_WithValidId_Should_ReturnOkWithContact()
    {
        // Arrange
        var contact = new ContactDto 
        { 
            Id = 1, 
            Nom = "Test Contact",
            Emails = new List<string> { "test@contact.com" },
            Phones = new List<string> { "0123456789" },
            Roles = new List<string> { "Manager" }
        };
        _mockContactService.Setup(s => s.GetByIdAsync(1))
            .ReturnsAsync(contact);

        // Act
        var result = await _controller.GetContact(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedContact = okResult.Value.Should().BeAssignableTo<ContactDto>().Subject;
        returnedContact.Id.Should().Be(1);
        returnedContact.Nom.Should().Be("Test Contact");
    }

    [Fact]
    public async Task GetContact_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockContactService.Setup(s => s.GetByIdAsync(999))
            .ReturnsAsync((ContactDto?)null);

        // Act
        var result = await _controller.GetContact(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task CreateContact_WithValidData_Should_ReturnCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateContactDto
        {
            Nom = "Nouveau Contact",
            Prenom = "Prénom",
            Emails = new List<string> { "nouveau@test.com" },
            Phones = new List<string> { "0123456789" },
            Roles = new List<string> { "Contact" }
        };
        var createdContact = new ContactDto
        {
            Id = 1,
            Nom = createDto.Nom,
            Prenom = createDto.Prenom,
            Emails = createDto.Emails,
            Phones = createDto.Phones,
            Roles = createDto.Roles
        };
        _mockContactService.Setup(s => s.CreateAsync(createDto))
            .ReturnsAsync(createdContact);

        // Act
        var result = await _controller.CreateContact(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(_controller.GetContact));
        createdResult.RouteValues!["id"].Should().Be(1);
        var returnedContact = createdResult.Value.Should().BeAssignableTo<ContactDto>().Subject;
        returnedContact.Nom.Should().Be(createDto.Nom);
    }

    [Fact]
    public async Task CreateContact_WithInvalidData_Should_ReturnBadRequest()
    {
        // Arrange
        var createDto = new CreateContactDto
        {
            Nom = "", // Nom vide
            Emails = new List<string> { "test@test.com" }
        };
        _controller.ModelState.AddModelError("Nom", "Le nom est requis");

        // Act
        var result = await _controller.CreateContact(createDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateContact_WithValidData_Should_ReturnOkWithUpdatedContact()
    {
        // Arrange
        var updateDto = new UpdateContactDto
        {
            Nom = "Contact Modifié",
            Prenom = "Prénom Modifié",
            Emails = new List<string> { "modifie@test.com" },
            Phones = new List<string> { "0987654321" },
            Roles = new List<string> { "Admin" }
        };
        var updatedContact = new ContactDto
        {
            Id = 1,
            Nom = updateDto.Nom,
            Prenom = updateDto.Prenom,
            Emails = updateDto.Emails,
            Phones = updateDto.Phones,
            Roles = updateDto.Roles
        };
        _mockContactService.Setup(s => s.UpdateAsync(1, updateDto))
            .ReturnsAsync(updatedContact);

        // Act
        var result = await _controller.UpdateContact(1, updateDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedContact = okResult.Value.Should().BeAssignableTo<ContactDto>().Subject;
        returnedContact.Nom.Should().Be(updateDto.Nom);
    }

    [Fact]
    public async Task UpdateContact_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        var updateDto = new UpdateContactDto { Nom = "Test" };
        _mockContactService.Setup(s => s.UpdateAsync(999, updateDto))
            .ReturnsAsync((ContactDto?)null);

        // Act
        var result = await _controller.UpdateContact(999, updateDto);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteContact_WithValidId_Should_ReturnNoContent()
    {
        // Arrange
        _mockContactService.Setup(s => s.DeleteAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteContact(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteContact_WithInvalidId_Should_ReturnNotFound()
    {
        // Arrange
        _mockContactService.Setup(s => s.DeleteAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteContact(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task AddEmailToContact_WithValidData_Should_ReturnOk()
    {
        // Arrange
        const string newEmail = "newemail@test.com";
        _mockContactService.Setup(s => s.AddEmailAsync(1, newEmail))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AddEmailToContact(1, new { Email = newEmail });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task AddPhoneToContact_WithValidData_Should_ReturnOk()
    {
        // Arrange
        const string newPhone = "0123456789";
        _mockContactService.Setup(s => s.AddPhoneAsync(1, newPhone))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AddPhoneToContact(1, new { Phone = newPhone });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task AddRoleToContact_WithValidData_Should_ReturnOk()
    {
        // Arrange
        const string newRole = "Admin";
        _mockContactService.Setup(s => s.AddRoleAsync(1, newRole))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.AddRoleToContact(1, new { Role = newRole });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task RemoveEmailFromContact_WithValidData_Should_ReturnOk()
    {
        // Arrange
        const string emailToRemove = "remove@test.com";
        _mockContactService.Setup(s => s.RemoveEmailAsync(1, emailToRemove))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.RemoveEmailFromContact(1, new { Email = emailToRemove });

        // Assert
        result.Should().BeOfType<OkResult>();
    }

    [Fact]
    public async Task SearchContacts_Should_ReturnFilteredResults()
    {
        // Arrange
        var searchResults = new List<ContactDto>
        {
            new ContactDto { Id = 1, Nom = "Contact Recherché", Emails = new List<string> { "searched@test.com" } }
        };
        _mockContactService.Setup(s => s.GetAllAsync(It.IsAny<int>(), It.IsAny<int>(), "Recherché"))
            .ReturnsAsync(searchResults);

        // Act
        var result = await _controller.GetContacts(search: "Recherché");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedContacts = okResult.Value.Should().BeAssignableTo<IEnumerable<ContactDto>>().Subject;
        returnedContacts.Should().HaveCount(1);
        _mockContactService.Verify(s => s.GetAllAsync(1, 50, "Recherché"), Times.Once);
    }
}
