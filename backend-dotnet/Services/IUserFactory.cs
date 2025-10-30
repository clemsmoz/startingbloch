using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Factory pour création d'utilisateurs sans dépendance circulaire.
/// Permet au ClientService de créer des utilisateurs sans référencer UserAdminService.
/// </summary>
public interface IUserFactory
{
    /// <summary>
    /// Vérifie si un utilisateur existe déjà avec l'email donné.
    /// </summary>
    /// <param name="email">Email à vérifier</param>
    /// <returns>True si l'utilisateur existe</returns>
    Task<bool> UserExistsAsync(string email);

    /// <summary>
    /// Crée un nouvel utilisateur avec les données fournies.
    /// </summary>
    /// <param name="createUserDto">Données de création utilisateur</param>
    /// <returns>Utilisateur créé</returns>
    Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
}
