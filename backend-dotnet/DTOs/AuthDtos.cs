/*
 * ================================================================================================
 * DTOS AUTHENTIFICATION - TRANSFERT DONNÉES SÉCURISÉ LOGIN
 * ================================================================================================
 */

namespace StartingBloch.Backend.DTOs;

/// <summary>
/// DTO credentials utilisateur pour authentification sécurisée.
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Nom utilisateur ou email pour identification.
    /// </summary>
    public string Username { get; set; } = string.Empty;
    
    /// <summary>
    /// Mot de passe utilisateur pour authentification.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// DTO réponse authentification avec tokens et informations utilisateur.
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Token JWT d'accès pour authentification API.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;
    
    /// <summary>
    /// Token refresh pour renouvellement accès.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
    
    /// <summary>
    /// Informations utilisateur authentifié.
    /// </summary>
    public UserDto User { get; set; } = null!;
    
    /// <summary>
    /// Date expiration token d'accès.
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// DTO token refresh pour renouvellement sécurisé.
/// </summary>
public class RefreshTokenDto
{
    /// <summary>
    /// Token refresh pour génération nouveau token accès.
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
