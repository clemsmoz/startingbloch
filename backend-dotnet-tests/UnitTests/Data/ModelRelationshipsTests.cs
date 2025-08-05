using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Tests.UnitTests.Data;

public class ModelRelationshipsTests
{
    private readonly DbContextOptions<StartingBlochDbContext> _options;

    public ModelRelationshipsTests()
    {
        _options = new DbContextOptionsBuilder<StartingBlochDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task Client_CanHave_MultipleContacts()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var contact1 = new Contact
        {
            Nom = "Contact 1",
            Prenom = "Prenom 1",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var contact2 = new Contact
        {
            Nom = "Contact 2",
            Prenom = "Prenom 2",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        context.Clients.Add(client);
        context.Contacts.AddRange(contact1, contact2);
        await context.SaveChangesAsync();

        // Act
        var savedClient = await context.Clients
            .Include(c => c.Contacts)
            .FirstAsync(c => c.Id == client.Id);

        // Assert
        savedClient.Contacts.Should().HaveCount(2);
        savedClient.Contacts.Should().Contain(c => c.Nom == "Contact 1");
        savedClient.Contacts.Should().Contain(c => c.Nom == "Contact 2");
    }

    [Fact]
    public async Task Brevet_CanHave_MultipleInventeurs()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var brevet = new Brevet
        {
            Titre = "Brevet Test",
            NumeroDemande = "FR2024123456",
            DateDepot = DateTime.Now,
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var inventeur1 = new Inventeur
        {
            Nom = "Inventeur 1",
            Prenom = "Prenom 1",
            CreatedAt = DateTime.UtcNow
        };

        var inventeur2 = new Inventeur
        {
            Nom = "Inventeur 2",
            Prenom = "Prenom 2",
            CreatedAt = DateTime.UtcNow
        };

        context.Clients.Add(client);
        context.Brevets.Add(brevet);
        context.Inventeurs.AddRange(inventeur1, inventeur2);
        
        // Relation Many-to-Many
        brevet.Inventeurs = new List<Inventeur> { inventeur1, inventeur2 };
        
        await context.SaveChangesAsync();

        // Act
        var savedBrevet = await context.Brevets
            .Include(b => b.Inventeurs)
            .FirstAsync(b => b.Id == brevet.Id);

        // Assert
        savedBrevet.Inventeurs.Should().HaveCount(2);
        savedBrevet.Inventeurs.Should().Contain(i => i.Nom == "Inventeur 1");
        savedBrevet.Inventeurs.Should().Contain(i => i.Nom == "Inventeur 2");
    }

    [Fact]
    public async Task Contact_CanHave_MultipleEmails()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var contact = new Contact
        {
            Nom = "Contact Test",
            Prenom = "Prenom Test",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var email1 = new ContactEmail
        {
            Email = "email1@test.com",
            Contact = contact
        };

        var email2 = new ContactEmail
        {
            Email = "email2@test.com",
            Contact = contact
        };

        context.Clients.Add(client);
        context.Contacts.Add(contact);
        context.ContactEmails.AddRange(email1, email2);
        await context.SaveChangesAsync();

        // Act
        var savedContact = await context.Contacts
            .Include(c => c.Emails)
            .FirstAsync(c => c.Id == contact.Id);

        // Assert
        savedContact.Emails.Should().HaveCount(2);
        savedContact.Emails.Should().Contain(e => e.Email == "email1@test.com");
        savedContact.Emails.Should().Contain(e => e.Email == "email2@test.com");
    }

    [Fact]
    public async Task Contact_CanHave_MultiplePhones()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var contact = new Contact
        {
            Nom = "Contact Test",
            Prenom = "Prenom Test",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var phone1 = new ContactPhone
        {
            Telephone = "0123456789",
            Contact = contact
        };

        var phone2 = new ContactPhone
        {
            Telephone = "0987654321",
            Contact = contact
        };

        context.Clients.Add(client);
        context.Contacts.Add(contact);
        context.ContactPhones.AddRange(phone1, phone2);
        await context.SaveChangesAsync();

        // Act
        var savedContact = await context.Contacts
            .Include(c => c.Telephones)
            .FirstAsync(c => c.Id == contact.Id);

        // Assert
        savedContact.Telephones.Should().HaveCount(2);
        savedContact.Telephones.Should().Contain(t => t.Telephone == "0123456789");
        savedContact.Telephones.Should().Contain(t => t.Telephone == "0987654321");
    }

    [Fact]
    public async Task Client_CanHave_MultipleBrevets()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var brevet1 = new Brevet
        {
            Titre = "Brevet 1",
            NumeroDemande = "FR2024111111",
            DateDepot = DateTime.Now,
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var brevet2 = new Brevet
        {
            Titre = "Brevet 2",
            NumeroDemande = "FR2024222222",
            DateDepot = DateTime.Now,
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        context.Clients.Add(client);
        context.Brevets.AddRange(brevet1, brevet2);
        await context.SaveChangesAsync();

        // Act
        var savedClient = await context.Clients
            .Include(c => c.Brevets)
            .FirstAsync(c => c.Id == client.Id);

        // Assert
        savedClient.Brevets.Should().HaveCount(2);
        savedClient.Brevets.Should().Contain(b => b.Titre == "Brevet 1");
        savedClient.Brevets.Should().Contain(b => b.Titre == "Brevet 2");
    }

    [Fact]
    public async Task Brevet_CanHave_MultipleStatuts()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var brevet = new Brevet
        {
            Titre = "Brevet Test",
            NumeroDemande = "FR2024123456",
            DateDepot = DateTime.Now,
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var statut1 = new Statuts
        {
            Statut = "En cours d'examen",
            DateStatut = DateTime.Now.AddDays(-30),
            Brevet = brevet
        };

        var statut2 = new Statuts
        {
            Statut = "Accordé",
            DateStatut = DateTime.Now,
            Brevet = brevet
        };

        context.Clients.Add(client);
        context.Brevets.Add(brevet);
        context.Statuts.AddRange(statut1, statut2);
        await context.SaveChangesAsync();

        // Act
        var savedBrevet = await context.Brevets
            .Include(b => b.Statuts)
            .FirstAsync(b => b.Id == brevet.Id);

        // Assert
        savedBrevet.Statuts.Should().HaveCount(2);
        savedBrevet.Statuts.Should().Contain(s => s.Statut == "En cours d'examen");
        savedBrevet.Statuts.Should().Contain(s => s.Statut == "Accordé");
    }

    [Fact]
    public async Task CascadeDelete_Should_Work_ForClientAndContacts()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            Nom = "Client Test",
            Email = "client@test.com",
            CreatedAt = DateTime.UtcNow
        };

        var contact = new Contact
        {
            Nom = "Contact Test",
            Prenom = "Prenom Test",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        context.Clients.Add(client);
        context.Contacts.Add(contact);
        await context.SaveChangesAsync();

        var clientId = client.Id;
        var contactId = contact.Id;

        // Act
        context.Clients.Remove(client);
        await context.SaveChangesAsync();

        // Assert
        var deletedClient = await context.Clients.FindAsync(clientId);
        var deletedContact = await context.Contacts.FindAsync(contactId);
        
        deletedClient.Should().BeNull();
        deletedContact.Should().BeNull(); // Should be cascade deleted
    }

    [Fact]
    public async Task Client_CanHave_MultipleUsers()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            NomClient = "Client avec plusieurs utilisateurs",
            CreatedAt = DateTime.UtcNow
        };

        var user1 = new User
        {
            Username = "user1",
            Email = "user1@client.com",
            Password = "hashedpassword1",
            Role = "Employee",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var user2 = new User
        {
            Username = "user2", 
            Email = "user2@client.com",
            Password = "hashedpassword2",
            Role = "Manager",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        var user3 = new User
        {
            Username = "user3",
            Email = "user3@client.com", 
            Password = "hashedpassword3",
            Role = "Employee",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        context.Clients.Add(client);
        context.Users.AddRange(user1, user2, user3);
        await context.SaveChangesAsync();

        // Act
        var savedClient = await context.Clients
            .Include(c => c.Users)
            .FirstAsync(c => c.Id == client.Id);

        // Assert
        savedClient.Users.Should().HaveCount(3);
        savedClient.Users.Should().Contain(u => u.Username == "user1");
        savedClient.Users.Should().Contain(u => u.Username == "user2"); 
        savedClient.Users.Should().Contain(u => u.Username == "user3");
        savedClient.Users.Should().OnlyContain(u => u.ClientId == client.Id);
    }

    [Fact]
    public async Task User_Should_BelongToOneClient()
    {
        // Arrange
        using var context = new StartingBlochDbContext(_options);
        
        var client = new Client
        {
            NomClient = "Client Test",
            CreatedAt = DateTime.UtcNow
        };

        var user = new User
        {
            Username = "testuser",
            Email = "test@client.com",
            Password = "hashedpassword",
            Role = "Employee",
            Client = client,
            CreatedAt = DateTime.UtcNow
        };

        context.Clients.Add(client);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var savedUser = await context.Users
            .Include(u => u.Client)
            .FirstAsync(u => u.Id == user.Id);

        // Assert
        savedUser.Client.Should().NotBeNull();
        savedUser.Client!.NomClient.Should().Be("Client Test");
        savedUser.ClientId.Should().Be(client.Id);
    }

    [Fact]
    public async Task UserWithoutClient_Should_BeAllowed()
    {
        // Arrange - Un admin peut ne pas avoir de client
        using var context = new StartingBlochDbContext(_options);
        
        var adminUser = new User
        {
            Username = "admin",
            Email = "admin@system.com",
            Password = "hashedpassword",
            Role = "Admin",
            ClientId = null, // Pas de client associé
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        // Act
        var savedUser = await context.Users
            .Include(u => u.Client)
            .FirstAsync(u => u.Id == adminUser.Id);

        // Assert
        savedUser.Client.Should().BeNull();
        savedUser.ClientId.Should().BeNull();
        savedUser.Role.Should().Be("Admin");
    }
}
