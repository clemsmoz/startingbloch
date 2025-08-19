using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.DTOs;
using BCrypt.Net;

namespace StartingBloch.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserAdminService _userService;
    private readonly IJwtService _jwtService;
    private readonly IPasswordValidationService _passwordValidation;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUserAdminService userService,
        IJwtService jwtService,
        IPasswordValidationService passwordValidation,
        ILogger<AuthController> logger)
    {
        _userService = userService;
        _jwtService = jwtService;
        _passwordValidation = passwordValidation;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                _logger.LogWarning("Login attempt with missing credentials from IP: {IP}", GetClientIP());
                return BadRequest(new { error = "Email et mot de passe requis" });
            }

            var user = await _userService.GetUserByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Login attempt with invalid email: {Email} from IP: {IP}", request.Email, GetClientIP());
                return Unauthorized(new { error = "Email ou mot de passe incorrect" });
            }

            if (user.IsBlocked)
            {
                _logger.LogWarning("Login attempt for blocked user: {Email} from IP: {IP}", request.Email, GetClientIP());
                return Unauthorized(new { error = "Compte bloqué" });
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                _logger.LogWarning("Login attempt with invalid password for user: {Email} from IP: {IP}", request.Email, GetClientIP());
                return Unauthorized(new { error = "Email ou mot de passe incorrect" });
            }

            var token = _jwtService.GenerateTokenWithClaims(user);
            
            // Mise à jour de la dernière connexion
            await _userService.UpdateLastLoginAsync(user.Id);

            _logger.LogInformation("Successful login for user: {Email} from IP: {IP}", request.Email, GetClientIP());

            return Ok(new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    CanRead = user.CanRead,
                    CanWrite = user.CanWrite,
                    LastLogin = DateTime.UtcNow
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return StatusCode(500, new { error = "Erreur interne du serveur" });
        }
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            // Validation du mot de passe
            var passwordValidation = _passwordValidation.ValidatePassword(request.Password);
            if (!passwordValidation.IsValid)
            {
                return BadRequest(new { errors = passwordValidation.Errors });
            }

            // Vérifier si l'email existe déjà
            var existingUser = await _userService.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { error = "Cet email est déjà utilisé" });
            }

            // Hasher le mot de passe
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new CreateUserDto
            {
                Email = request.Email,
                Password = hashedPassword,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = request.Role ?? "User",
                CanRead = request.CanRead ?? true,
                CanWrite = request.CanWrite ?? false
            };

            var createdUser = await _userService.CreateUserAsync(newUser);
            
            _logger.LogInformation("New user registered: {Email} by admin: {AdminEmail}", 
                request.Email, User.FindFirst("email")?.Value);

            return Ok(new UserDto
            {
                Id = createdUser.Id,
                Email = createdUser.Email,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                Role = createdUser.Role,
                CanRead = createdUser.CanRead,
                CanWrite = createdUser.CanWrite
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration for email: {Email}", request.Email);
            return StatusCode(500, new { error = "Erreur lors de la création de l'utilisateur" });
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst("sub")?.Value ?? "0");
            var user = await _userService.GetUserByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound(new { error = "Utilisateur non trouvé" });
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            {
                return BadRequest(new { error = "Mot de passe actuel incorrect" });
            }

            var passwordValidation = _passwordValidation.ValidatePassword(request.NewPassword);
            if (!passwordValidation.IsValid)
            {
                return BadRequest(new { errors = passwordValidation.Errors });
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _userService.UpdatePasswordAsync(userId, hashedPassword);

            _logger.LogInformation("Password changed for user: {UserId}", userId);
            return Ok(new { message = "Mot de passe modifié avec succès" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password change for user: {UserId}", User.FindFirst("sub")?.Value);
            return StatusCode(500, new { error = "Erreur lors du changement de mot de passe" });
        }
    }

    [HttpPost("validate-token")]
    [Authorize]
    public ActionResult ValidateToken()
    {
        return Ok(new { valid = true, user = User.Identity?.Name });
    }

    private string GetClientIP()
    {
        return Request.Headers["X-Forwarded-For"].FirstOrDefault() 
               ?? Request.Headers["X-Real-IP"].FirstOrDefault() 
               ?? HttpContext.Connection.RemoteIpAddress?.ToString() 
               ?? "Unknown";
    }
}

// DTOs pour la sécurité
public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}

public class RegisterRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Role { get; set; }
    public bool? CanRead { get; set; }
    public bool? CanWrite { get; set; }
}

public class ChangePasswordRequestDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
