using FluentAssertions;
using FluentValidation;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Validators;
using System.ComponentModel.DataAnnotations;

namespace StartingBloch.Backend.Tests.UnitTests.Validators;

public class CreateClientDtoValidatorTests
{
    private readonly CreateClientDtoValidator _validator;

    public CreateClientDtoValidatorTests()
    {
        _validator = new CreateClientDtoValidator();
    }

    [Fact]
    public void Validate_WithValidDto_Should_Pass()
    {
        // Arrange
        var dto = new CreateClientDto
        {
            NomClient = "Client Test",
            EmailClient = "test@client.com",
            AdresseClient = "123 Rue Test",
            TelephoneClient = "0123456789"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithEmptyNom_Should_Fail()
    {
        // Arrange
        var dto = new CreateClientDto
        {
            NomClient = "",
            EmailClient = "test@client.com"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.NomClient));
    }

    [Fact]
    public void Validate_WithInvalidEmail_Should_Fail()
    {
        // Arrange
        var dto = new CreateClientDto
        {
            NomClient = "Client Test",
            EmailClient = "invalid-email"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.EmailClient));
    }

    [Fact]
    public void Validate_WithTooLongNom_Should_Fail()
    {
        // Arrange
        var dto = new CreateClientDto
        {
            Nom = new string('A', 201), // 201 caractères
            Email = "test@client.com"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.Nom));
    }

    [Fact]
    public void Validate_WithNullNom_Should_Fail()
    {
        // Arrange
        var dto = new CreateClientDto
        {
            Nom = null!,
            Email = "test@client.com"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.Nom));
    }
}

public class CreateBrevetDtoValidatorTests
{
    private readonly CreateBrevetDtoValidator _validator;

    public CreateBrevetDtoValidatorTests()
    {
        _validator = new CreateBrevetDtoValidator();
    }

    [Fact]
    public void Validate_WithValidDto_Should_Pass()
    {
        // Arrange
        var dto = new CreateBrevetDto
        {
            Titre = "Brevet Test",
            NumeroDemande = "FR2024123456",
            DateDepot = DateTime.Now,
            ClientId = 1,
            Description = "Description du brevet"
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithEmptyTitre_Should_Fail()
    {
        // Arrange
        var dto = new CreateBrevetDto
        {
            Titre = "",
            NumeroDemande = "FR2024123456",
            DateDepot = DateTime.Now,
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.Titre));
    }

    [Fact]
    public void Validate_WithInvalidNumeroDemande_Should_Fail()
    {
        // Arrange
        var dto = new CreateBrevetDto
        {
            Titre = "Brevet Test",
            NumeroDemande = "INVALID",
            DateDepot = DateTime.Now,
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.NumeroDemande));
    }

    [Fact]
    public void Validate_WithFutureDateDepot_Should_Fail()
    {
        // Arrange
        var dto = new CreateBrevetDto
        {
            Titre = "Brevet Test",
            NumeroDemande = "FR2024123456",
            DateDepot = DateTime.Now.AddDays(1), // Date future
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.DateDepot));
    }

    [Fact]
    public void Validate_WithInvalidClientId_Should_Fail()
    {
        // Arrange
        var dto = new CreateBrevetDto
        {
            Titre = "Brevet Test",
            NumeroDemande = "FR2024123456",
            DateDepot = DateTime.Now,
            ClientId = 0 // ID invalide
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.ClientId));
    }
}

public class CreateContactDtoValidatorTests
{
    private readonly CreateContactDtoValidator _validator;

    public CreateContactDtoValidatorTests()
    {
        _validator = new CreateContactDtoValidator();
    }

    [Fact]
    public void Validate_WithValidDto_Should_Pass()
    {
        // Arrange
        var dto = new CreateContactDto
        {
            Nom = "Dupont",
            Prenom = "Jean",
            Emails = new List<string> { "jean.dupont@example.com" },
            Telephones = new List<string> { "0123456789" },
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithEmptyNom_Should_Fail()
    {
        // Arrange
        var dto = new CreateContactDto
        {
            Nom = "",
            Prenom = "Jean",
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.Nom));
    }

    [Fact]
    public void Validate_WithInvalidEmail_Should_Fail()
    {
        // Arrange
        var dto = new CreateContactDto
        {
            Nom = "Dupont",
            Prenom = "Jean",
            Emails = new List<string> { "invalid-email" },
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName.Contains("Emails"));
    }

    [Fact]
    public void Validate_WithEmptyEmails_Should_Pass()
    {
        // Arrange
        var dto = new CreateContactDto
        {
            Nom = "Dupont",
            Prenom = "Jean",
            ClientId = 1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithInvalidClientId_Should_Fail()
    {
        // Arrange
        var dto = new CreateContactDto
        {
            Nom = "Dupont",
            Prenom = "Jean",
            ClientId = -1
        };

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(dto.ClientId));
    }
}

public class CreateUserDtoValidatorTests
{
    [Fact]
    public void Validate_CreateUserDto_WithValidData_Should_Pass()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "testuser",
            Email = "test@user.com",
            Password = "MotDePasse123!",
            Role = "user",
            CanWrite = false,
            IsActive = true,
            ClientId = 1
        };

        // Act
        var context = new ValidationContext<CreateUserDto>(dto);
        var result = ValidateModel(dto);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void Validate_CreateUserDto_WithEmptyUsername_Should_Fail()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "",
            Email = "test@user.com",
            Password = "MotDePasse123!"
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().Contain(v => v.MemberNames.Contains(nameof(dto.Username)));
    }

    [Fact]
    public void Validate_CreateUserDto_WithInvalidEmail_Should_Fail()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "testuser",
            Email = "emailinvalide",
            Password = "MotDePasse123!"
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().Contain(v => v.MemberNames.Contains(nameof(dto.Email)));
    }

    [Fact]
    public void Validate_CreateUserDto_WithShortPassword_Should_Fail()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "testuser",
            Email = "test@user.com",
            Password = "123" // Trop court
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().Contain(v => v.MemberNames.Contains(nameof(dto.Password)));
    }

    [Fact]
    public void Validate_CreateUserDto_WithNullClientId_Should_Pass()
    {
        // Arrange
        var dto = new CreateUserDto
        {
            Username = "testuser",
            Email = "test@user.com",
            Password = "MotDePasse123!",
            ClientId = null
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().BeEmpty();
    }

    private List<ValidationResult> ValidateModel(object model)
    {
        var validationResults = new List<ValidationResult>();
        var ctx = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, ctx, validationResults, true);
        return validationResults;
    }
}

public class UpdateUserDtoValidatorTests
{
    [Fact]
    public void Validate_UpdateUserDto_WithValidData_Should_Pass()
    {
        // Arrange
        var dto = new UpdateUserDto
        {
            Username = "updateduser",
            Email = "updated@user.com",
            Role = "admin",
            CanWrite = true,
            IsActive = true,
            ClientId = 2
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void Validate_UpdateUserDto_WithInvalidEmail_Should_Fail()
    {
        // Arrange
        var dto = new UpdateUserDto
        {
            Email = "emailinvalide"
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().NotBeEmpty();
        result.Should().Contain(v => v.MemberNames.Contains(nameof(dto.Email)));
    }

    [Fact]
    public void Validate_UpdateUserDto_WithNullClientId_Should_Pass()
    {
        // Arrange
        var dto = new UpdateUserDto
        {
            Username = "updateduser",
            ClientId = null
        };

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void Validate_UpdateUserDto_WithEmptyValues_Should_Pass()
    {
        // Arrange
        var dto = new UpdateUserDto(); // Tous les champs sont optionnels

        // Act
        var result = ValidateModel(dto);

        // Assert
        result.Should().BeEmpty();
    }

    private List<ValidationResult> ValidateModel(object model)
    {
        var validationResults = new List<ValidationResult>();
        var ctx = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, ctx, validationResults, true);
        return validationResults;
    }
}
