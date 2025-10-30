using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Tests.TestData;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Tests.UnitTests.Services;

public class ContactServiceTests : IDisposable
{
    private readonly StartingBlochDbContext _context;
    private readonly ContactService _contactService;

    public ContactServiceTests()
    {
        _context = TestDbContextFactory.CreateInMemoryContext();
        _contactService = new ContactService(_context);
    }

    [Fact]
    public async Task GetContactsAsync_ShouldReturnPaginatedContacts()
    {
        // Arrange
        await SeedTestContactsAsync();

        // Act
        var result = await _contactService.GetContactsAsync(page: 1, pageSize: 10);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.TotalItems.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetContactByIdAsync_WithValidId_ShouldReturnContact()
    {
        // Arrange
        await SeedTestContactsAsync();
        var expectedContactId = 1;

        // Act
        var result = await _contactService.GetContactByIdAsync(expectedContactId);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(expectedContactId);
        result.Data.Nom.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateContactAsync_WithValidData_ShouldCreateContact()
    {
        // Arrange
        var createContactDto = new CreateContactDto
        {
            Nom = "Nouveau Contact",
            Prenom = "Test",
            Email = "nouveau@test.com",
            Telephone = "0123456789",
            Role = "Responsable",
            Emails = new List<string> { "email1@test.com", "email2@test.com" },
            Phones = new List<string> { "0123456789", "0987654321" },
            Roles = new List<string> { "Responsable", "Contact Principal" }
        };

        // Act
        var result = await _contactService.CreateContactAsync(createContactDto);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Nom.Should().Be(createContactDto.Nom);
        result.Data.Emails.Should().HaveCount(2);
        result.Data.Phones.Should().HaveCount(2);
        result.Data.Roles.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateContactAsync_WithEmptyCollections_ShouldCreateContactWithEmptyLists()
    {
        // Arrange
        var createContactDto = new CreateContactDto
        {
            Nom = "Contact Sans Collections",
            Prenom = "Test",
            Email = "test@test.com"
            // Pas de collections définies
        };

        // Act
        var result = await _contactService.CreateContactAsync(createContactDto);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Emails.Should().BeEmpty();
        result.Data.Phones.Should().BeEmpty();
        result.Data.Roles.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateContactAsync_ShouldUpdateCollections()
    {
        // Arrange
        await SeedTestContactsAsync();
        var contactId = 1;
        var updateContactDto = new UpdateContactDto
        {
            Nom = "Contact Modifié",
            Prenom = "Prenom Modifié",
            Email = "modifie@test.com",
            Emails = new List<string> { "new1@test.com", "new2@test.com", "new3@test.com" },
            Phones = new List<string> { "0111111111" },
            Roles = new List<string> { "Nouveau Role" }
        };

        // Act
        var result = await _contactService.UpdateContactAsync(contactId, updateContactDto);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Emails.Should().HaveCount(3);
        result.Data.Phones.Should().HaveCount(1);
        result.Data.Roles.Should().HaveCount(1);
        result.Data.Emails.Should().Contain("new1@test.com");
    }

    [Fact]
    public async Task GetContactsAsync_WithSearchTerm_ShouldFilterByMultipleFields()
    {
        // Arrange
        await SeedTestContactsAsync();
        var searchTerm = "Dupont";

        // Act
        var result = await _contactService.GetContactsAsync(page: 1, pageSize: 10, search: searchTerm);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
        result.Data.Should().OnlyContain(c => 
            c.Nom?.Contains(searchTerm) == true ||
            c.Prenom?.Contains(searchTerm) == true ||
            c.Email?.Contains(searchTerm) == true ||
            c.Role?.Contains(searchTerm) == true);
    }

    [Fact]
    public async Task CreateContactAsync_WithClientAndCabinet_ShouldSetRelations()
    {
        // Arrange
        await SeedTestClientsAndCabinetsAsync();
        var createContactDto = new CreateContactDto
        {
            Nom = "Contact avec Relations",
            IdClient = 1,
            IdCabinet = 1
        };

        // Act
        var result = await _contactService.CreateContactAsync(createContactDto);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.IdClient.Should().Be(1);
        result.Data.IdCabinet.Should().Be(1);
        result.Data.ClientNom.Should().NotBeNullOrEmpty();
        result.Data.CabinetNom.Should().NotBeNullOrEmpty();
    }

    private async Task SeedTestContactsAsync()
    {
        var contacts = new[]
        {
            new Contact
            {
                Id = 1,
                Nom = "Dupont",
                Prenom = "Jean",
                Email = "jean.dupont@test.com",
                Telephone = "0123456789",
                Role = "Responsable",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                EmailsJson = "[\"jean.dupont@test.com\", \"j.dupont@alt.com\"]",
                PhonesJson = "[\"0123456789\", \"0987654321\"]",
                RolesJson = "[\"Responsable\", \"Contact principal\"]"
            },
            new Contact
            {
                Id = 2,
                Nom = "Martin",
                Prenom = "Marie",
                Email = "marie.martin@test.com",
                Telephone = "0987654321",
                Role = "Assistant",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                EmailsJson = "[]",
                PhonesJson = "[]",
                RolesJson = "[]"
            }
        };

        _context.Contacts.AddRange(contacts);
        await _context.SaveChangesAsync();
    }

    private async Task SeedTestClientsAndCabinetsAsync()
    {
        var client = new StartingBloch.Backend.Models.Client
        {
            Id = 1,
            Nom = "Client Test",
            Adresse = "123 Test Street",
            Telephone = "0123456789",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var cabinet = new Cabinet
        {
            Id = 1,
            Nom = "Cabinet Test",
            Adresse = "456 Cabinet Street",
            Telephone = "0987654321",
            Email = "cabinet@test.com",
            CreatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        _context.Cabinets.Add(cabinet);
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
