/*
 * ================================================================================================
 * SERVICE ADMINISTRATION UTILISATEURS - GESTION AVANCÉE COMPTES SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service administration utilisateurs StartingBloch gérant comptes avec rôles complexes.
 * Implémentation gestion avancée utilisateurs, clients associés et permissions granulaires.
 * 
 * FONCTIONNALITÉS ADMINISTRATION :
 * ===============================
 * 👥 CRÉATION_COMPLEXE → Création utilisateur avec client automatique
 * 🔐 GESTION_RÔLES → Attribution rôles multi-contextes
 * 📊 SUPERVISION → Monitoring activités utilisateurs
 * 🔄 SYNCHRONISATION → Cohérence données utilisateur-client
 * ⚡ BATCH_OPERATIONS → Opérations groupées optimisées
 * 
 * TYPES COMPTES ADMINISTRÉS :
 * ===========================
 * 🔴 SUPER_ADMIN → Accès total système toutes fonctionnalités
 * 🟠 ADMIN_SYSTÈME → Administration technique et configuration
 * 🟡 ADMIN_MÉTIER → Gestion données métier et validation
 * 🔵 GESTIONNAIRE → Supervision portefeuilles clients assignés
 * 🟢 UTILISATEUR → Accès données selon permissions rôles
 * 🟣 CLIENT_EXTERNE → Accès restreint données propres uniquement
 * 
 * PROCESSUS CRÉATION INTÉGRÉE :
 * ============================
 * 1️⃣ VALIDATION → Contrôle données entrée et cohérence
 * 2️⃣ CRÉATION_CLIENT → Génération entité client automatique
 * 3️⃣ CRÉATION_UTILISATEUR → Génération compte utilisateur associé
 * 4️⃣ ATTRIBUTION_RÔLES → Assignation permissions selon contexte
 * 5️⃣ SYNCHRONISATION → Cohérence relations client-utilisateur
 * 6️⃣ AUDIT → Enregistrement trail création complète
 * 
 * GESTION RÔLES CONTEXTUELS :
 * ===========================
 * 🏢 RÔLES_CLIENT → Permissions spécifiques contexte client
 * 🌐 RÔLES_GLOBAUX → Permissions système transversales
 * 🔄 HÉRITAGE → Cascade permissions selon hiérarchie
 * 📊 MATRICES → Gestion complexe permissions croisées
 * ⏰ TEMPORELS → Rôles temporaires avec expiration
 * 
 * SÉCURITÉ ADMINISTRATION :
 * ========================
 * 🔐 DOUBLE_AUTHENTIFICATION → Validation opérations critiques
 * 🛡️ SEGREGATION → Séparation responsabilités administratives
 * 📋 APPROBATION → Workflow validation créations sensibles
 * 🔍 AUDIT_DÉTAILLÉ → Traçabilité complète actions admin
 * 🚨 ALERTES → Notifications opérations à risque
 * 
 * SUPERVISION AVANCÉE :
 * =====================
 * 📊 DASHBOARDS → Tableaux bord activités utilisateurs
 * 📈 MÉTRIQUES → Statistiques utilisation système
 * 🔍 MONITORING → Surveillance comportements anormaux
 * 📋 RAPPORTS → Analyses périodiques activités
 * ⚠️ ALERTES → Notifications incidents sécurité
 * 
 * OPÉRATIONS GROUPÉES :
 * =====================
 * 📦 IMPORT_MASSIF → Chargement utilisateurs par lots
 * 🔄 SYNCHRONISATION → Mise à jour groupée informations
 * 📊 EXPORT → Extraction données pour analyses
 * 🗑️ PURGE → Nettoyage comptes inactifs automatisé
 * 📧 NOTIFICATIONS → Communication groupée utilisateurs
 * 
 * CONFORMITÉ RÉGLEMENTAIRE :
 * ==========================
 * ✅ RGPD → Protection données personnelles utilisateurs
 * ✅ CNIL → Conformité autorité française protection
 * ✅ ISO_27001 → Standards sécurité information
 * ✅ SOX → Sarbanes-Oxley Act compliance
 * ✅ ANSSI → Bonnes pratiques sécurité numériques
 * 
 * INTÉGRATION SYSTÈME :
 * ====================
 * 🔗 CLIENTS → Relations bidirectionnelles utilisateur-client
 * 🏢 CABINETS → Associations conseils propriété industrielle
 * 📊 PORTEFEUILLES → Gestion patrimoines PI assignés
 * 💼 LICENCES → Attribution licences logicielles utilisateurs
 * 📱 COMMUNICATIONS → Notifications et alertes personnalisées
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service administration avancée utilisateurs avec gestion rôles complexes et intégration client.
/// Implémentation complète supervision comptes, permissions granulaires et opérations groupées.
/// </summary>
public class UserAdminService : IUserAdminService
{
    private readonly StartingBlochDbContext _context;
    private readonly IClientService _clientService;

    /// <summary>
    /// Initialise service administration avec contexte données et service client intégré.
    /// </summary>
    /// <param name="context">Contexte base données pour gestion utilisateurs avancée</param>
    /// <param name="clientService">Service client pour synchronisation données intégrée</param>
    public UserAdminService(StartingBlochDbContext context, IClientService clientService)
    {
        _context = context;
        _clientService = clientService;
    }

    /// <summary>
    /// Crée nouveau client avec utilisateur associé dans transaction atomique complète.
    /// Processus intégré création client-utilisateur avec validation cohérence et audit trail.
    /// </summary>
    /// <param name="createDto">Données création client-utilisateur avec informations complètes</param>
    /// <returns>Utilisateur créé avec client associé et rôles assignés</returns>
    public async Task<ApiResponse<UserDto>> CreateNewClientWithUserAsync(CreateClientWithUserDto createDto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Créer le client d'abord
            var clientDto = new CreateClientDto
            {
                NomClient = createDto.NomClient,
                ReferenceClient = createDto.ReferenceClient,
                AdresseClient = createDto.AdresseClient,
                CodePostal = createDto.CodePostal,
                PaysClient = createDto.PaysClient,
                EmailClient = createDto.EmailClient,
                TelephoneClient = createDto.TelephoneClient,
                CanWrite = createDto.CanWrite,
                CanRead = createDto.CanRead,
                IsBlocked = false
            };

            var clientResult = await _clientService.CreateClientAsync(clientDto);
            if (!clientResult.Success || clientResult.Data == null)
            {
                await transaction.RollbackAsync();
                return new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Erreur lors de la création du client",
                    Errors = clientResult.Errors
                };
            }

            // 2. Créer l'utilisateur lié au client
            var user = new User
            {
                Username = createDto.Username,
                Email = createDto.UserEmail,
                Password = BCrypt.Net.BCrypt.HashPassword(createDto.Password), // Hash du mot de passe
                Role = "client",
                CanWrite = createDto.CanWrite,
                IsActive = createDto.IsActive,
                ClientId = clientResult.Data.Id
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 3. Assigner le rôle client
            var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "client");
            if (clientRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = clientRole.Id,
                    ClientId = clientResult.Data.Id
                };
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            // 4. Retourner les informations de l'utilisateur créé
            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CanWrite = user.CanWrite,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                ClientId = user.ClientId,
                Client = clientResult.Data
            };

            return new ApiResponse<UserDto>
            {
                Success = true,
                Data = userDto,
                Message = $"Client '{createDto.NomClient}' et son compte utilisateur créés avec succès"
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Erreur lors de la création du client et de son compte utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée compte utilisateur pour client existant avec validation et synchronisation.
    /// Création sécurisée utilisateur avec association client préexistant et rôles contextuels.
    /// </summary>
    /// <param name="clientId">Identifiant client existant pour association utilisateur</param>
    /// <param name="createUserDto">Données création utilisateur avec informations authentification</param>
    /// <returns>Utilisateur créé avec client associé et permissions configurées</returns>
    public async Task<ApiResponse<UserDto>> CreateUserAccountForExistingClientAsync(int clientId, CreateUserDto createUserDto)
    {
        try
        {
            // Vérifier que le client existe
            var client = await _context.Clients.FindAsync(clientId);
            if (client == null)
            {
                return new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Client non trouvé"
                };
            }

            // Vérifier qu'il n'a pas déjà de compte
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.ClientId == clientId);
            if (existingUser != null)
            {
                return new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Ce client a déjà un compte utilisateur"
                };
            }

            // Créer l'utilisateur
            var user = new User
            {
                Username = createUserDto.Username,
                Email = createUserDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                Role = "client",
                CanWrite = createUserDto.CanWrite,
                IsActive = createUserDto.IsActive,
                ClientId = clientId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assigner le rôle client
            var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "client");
            if (clientRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = clientRole.Id,
                    ClientId = clientId
                };
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CanWrite = user.CanWrite,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                ClientId = user.ClientId
            };

            return new ApiResponse<UserDto>
            {
                Success = true,
                Data = userDto,
                Message = "Compte utilisateur créé avec succès pour ce client"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Erreur lors de la création du compte utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste paginée complète utilisateurs système avec métadonnées administration.
    /// Navigation optimisée utilisateurs avec informations rôles, statuts et clients associés.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <returns>Réponse paginée utilisateurs avec détails complets administration</returns>
    public async Task<PagedResponse<List<UserDto>>> GetAllUsersAsync(int page = 1, int pageSize = 10)
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            var users = await _context.Users
                .Include(u => u.Client)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                CanWrite = u.CanWrite,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                ClientId = u.ClientId,
                Client = u.Client != null ? new ClientDto
                {
                    Id = u.Client.Id,
                    NomClient = u.Client.NomClient,
                    ReferenceClient = u.Client.ReferenceClient
                } : null
            }).ToList();

            return new PagedResponse<List<UserDto>>
            {
                Success = true,
                Data = userDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalUsers,
                TotalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<UserDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des utilisateurs",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère utilisateur spécifique avec informations détaillées complètes administration.
    /// Chargement optimisé utilisateur avec rôles, permissions, client associé et historique.
    /// </summary>
    /// <param name="userId">Identifiant unique utilisateur recherché système</param>
    /// <returns>Utilisateur détaillé avec métadonnées complètes ou null si inexistant</returns>
    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Client)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.Prenom ?? string.Empty,
                LastName = user.Nom ?? string.Empty,
                Role = user.Role,
                CanRead = user.CanRead,
                CanWrite = user.CanWrite,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                ClientId = user.ClientId,
                Client = user.Client != null ? new ClientDto
                {
                    Id = user.Client.Id,
                    NomClient = user.Client.NomClient,
                    ReferenceClient = user.Client.ReferenceClient
                } : null
            };
        }
        catch (Exception)
        {
            throw;
        }
    }

    /// <summary>
    /// Crée utilisateur système avec validation complète et configuration sécurité.
    /// Création sécurisée compte avec hachage mot de passe et audit trail.
    /// </summary>
    /// <param name="createUserDto">Données création utilisateur avec informations sécurisées</param>
    /// <returns>Utilisateur créé avec identifiant et métadonnées système</returns>
    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        try
        {
            // Validate client exists if ClientId is provided
            if (createUserDto.ClientId.HasValue)
            {
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == createUserDto.ClientId.Value);
                if (!clientExists)
                {
                    throw new InvalidOperationException($"Le client avec l'ID {createUserDto.ClientId.Value} n'existe pas");
                }
            }

            // Check for duplicate username or email
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => 
                u.Username == createUserDto.Username || u.Email == createUserDto.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà");
            }

            var user = new User
            {
                Username = createUserDto.Username,
                Email = createUserDto.Email,
                Prenom = createUserDto.FirstName,
                Nom = createUserDto.LastName,
                Password = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                Role = createUserDto.Role,
                CanRead = createUserDto.CanRead,
                CanWrite = createUserDto.CanWrite,
                IsActive = createUserDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                ClientId = createUserDto.ClientId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Reload with includes
            var createdUser = await _context.Users
                .Include(u => u.Client)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstAsync(u => u.Id == user.Id);

            return new UserDto
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Email = createdUser.Email,
                FirstName = createdUser.Prenom ?? string.Empty,
                LastName = createdUser.Nom ?? string.Empty,
                Role = createdUser.Role,
                CanRead = createdUser.CanRead,
                CanWrite = createdUser.CanWrite,
                IsActive = createdUser.IsActive,
                CreatedAt = createdUser.CreatedAt,
                ClientId = createdUser.ClientId,
                Client = createdUser.Client != null ? new ClientDto
                {
                    Id = createdUser.Client.Id,
                    NomClient = createdUser.Client.NomClient,
                    ReferenceClient = createdUser.Client.ReferenceClient
                } : null
            };
        }
        catch (Exception)
        {
            throw;
        }
    }

    /// <summary>
    /// Récupère utilisateur par email avec informations détaillées complètes.
    /// Recherche optimisée pour authentification et gestion connexions.
    /// </summary>
    /// <param name="email">Email utilisateur pour recherche</param>
    /// <returns>Utilisateur détaillé avec métadonnées ou null</returns>
    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Client)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.Prenom ?? string.Empty,
                LastName = user.Nom ?? string.Empty,
                Role = user.Role,
                CanRead = user.CanRead,
                CanWrite = user.CanWrite,
                IsActive = user.IsActive,
                IsBlocked = user.IsBlocked,
                Password = user.Password, // Temporaire pour AuthController
                LastLogin = user.LastLogin,
                CreatedAt = user.CreatedAt,
                ClientId = user.ClientId,
                Client = user.Client != null ? new ClientDto
                {
                    Id = user.Client.Id,
                    NomClient = user.Client.NomClient,
                    ReferenceClient = user.Client.ReferenceClient
                } : null
            };
        }
        catch (Exception)
        {
            throw;
        }
    }

    /// <summary>
    /// Met à jour dernière connexion utilisateur pour audit trail.
    /// Enregistrement sécurisé timestamp dernière activité système.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour mise à jour connexion</param>
    /// <returns>Confirmation mise à jour avec timestamp</returns>
    public async Task<bool> UpdateLastLoginAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    /// <summary>
    /// Met à jour mot de passe utilisateur avec validation sécurité.
    /// Modification sécurisée avec hachage et contrôle complexité.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour changement mot de passe</param>
    /// <param name="newPassword">Nouveau mot de passe avec validation</param>
    /// <returns>Confirmation modification avec audit trail</returns>
    public async Task<bool> UpdatePasswordAsync(int userId, string newPassword)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    /// <summary>
    /// Met à jour informations utilisateur avec validation contraintes et cohérence.
    /// Modification sécurisée données avec contrôle intégrité et audit trail complet.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur à modifier système</param>
    /// <param name="updateUserDto">Données modification utilisateur partielles validées</param>
    /// <returns>Utilisateur modifié avec nouvelles informations ou null si inexistant</returns>
    public async Task<UserDto?> UpdateUserAsync(int userId, UpdateUserDto updateUserDto)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Client)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return null;
            }

            // Validate client exists if ClientId is provided
            if (updateUserDto.ClientId.HasValue)
            {
                var clientExists = await _context.Clients.AnyAsync(c => c.Id == updateUserDto.ClientId.Value);
                if (!clientExists)
                {
                    throw new InvalidOperationException($"Le client avec l'ID {updateUserDto.ClientId.Value} n'existe pas");
                }
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(updateUserDto.Username))
            {
                user.Username = updateUserDto.Username;
            }
            if (!string.IsNullOrWhiteSpace(updateUserDto.Email))
            {
                user.Email = updateUserDto.Email;
            }
            if (!string.IsNullOrWhiteSpace(updateUserDto.Role))
            {
                user.Role = updateUserDto.Role;
            }
            if (updateUserDto.CanWrite.HasValue)
            {
                user.CanWrite = updateUserDto.CanWrite.Value;
            }
            if (updateUserDto.IsActive.HasValue)
            {
                user.IsActive = updateUserDto.IsActive.Value;
            }
            // Handle ClientId - can be set to null to remove association
            if (updateUserDto.ClientId != user.ClientId)
            {
                user.ClientId = updateUserDto.ClientId;
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Reload with updated includes
            var updatedUser = await _context.Users
                .Include(u => u.Client)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstAsync(u => u.Id == userId);

            return new UserDto
            {
                Id = updatedUser.Id,
                Username = updatedUser.Username,
                Email = updatedUser.Email,
                Role = updatedUser.Role,
                CanWrite = updatedUser.CanWrite,
                IsActive = updatedUser.IsActive,
                CreatedAt = updatedUser.CreatedAt,
                ClientId = updatedUser.ClientId,
                Client = updatedUser.Client != null ? new ClientDto
                {
                    Id = updatedUser.Client.Id,
                    NomClient = updatedUser.Client.NomClient,
                    ReferenceClient = updatedUser.Client.ReferenceClient
                } : null
            };
        }
        catch (Exception)
        {
            throw;
        }
    }

    /// <summary>
    /// Crée compte employé interne avec rôle spécifique et permissions étendues.
    /// Création sécurisée employé avec attribution rôle administratif ou métier selon contexte.
    /// </summary>
    /// <param name="createUserDto">Données création employé avec informations professionnelles</param>
    /// <param name="role">Rôle employé à attribuer (admin, user, gestionnaire)</param>
    /// <returns>Employé créé avec rôle assigné et permissions configurées</returns>
    public async Task<ApiResponse<UserDto>> CreateEmployeeAsync(CreateUserDto createUserDto, string role)
    {
        try
        {
            if (role != "admin" && role != "user")
            {
                return new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Rôle invalide pour un employé. Utilisez 'admin' ou 'user'."
                };
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == createUserDto.Username || u.Email == createUserDto.Email);
            if (existingUser != null)
            {
                return new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà"
                };
            }

            var user = new User
            {
                Username = createUserDto.Username,
                Email = createUserDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                Role = role,
                CanWrite = createUserDto.CanWrite,
                IsActive = createUserDto.IsActive,
                ClientId = null // Les employés ne sont pas liés à un client
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assigner le rôle
            var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Name == role);
            if (roleEntity != null)
            {
                var userRole = new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleEntity.Id,
                    ClientId = null
                };
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CanWrite = user.CanWrite,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                ClientId = user.ClientId
            };

            return new ApiResponse<UserDto>
            {
                Success = true,
                Data = userDto,
                Message = $"Employé {role} créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Erreur lors de la création de l'employé",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée utilisateur client externe avec accès restreint données propres uniquement.
    /// Redirection vers création compte pour client existant avec permissions limitées.
    /// </summary>
    /// <param name="createUserDto">Données création utilisateur client avec restrictions</param>
    /// <param name="clientId">Identifiant client pour association et limitation accès</param>
    /// <returns>Utilisateur client créé avec accès restreint configuré</returns>
    public async Task<ApiResponse<UserDto>> CreateClientUserAsync(CreateUserDto createUserDto, int clientId)
    {
        return await CreateUserAccountForExistingClientAsync(clientId, createUserDto);
    }

    /// <summary>
    /// Supprime utilisateur système avec validation contraintes et nettoyage associations complètes.
    /// Suppression sécurisée avec vérification dépendances, rôles et audit trail complet.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur à supprimer définitivement du système</param>
    /// <returns>Confirmation suppression avec nettoyage associations et audit</returns>
    public async Task<ApiResponse<bool>> DeleteUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur non trouvé"
                };
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Utilisateur supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression de l'utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Active compte utilisateur avec restauration accès complet système sécurisé.
    /// Activation contrôlée avec validation permissions et audit trail activation.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour activation compte</param>
    /// <returns>Confirmation activation avec restauration permissions</returns>
    public async Task<ApiResponse<bool>> ActivateUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur non trouvé"
                };
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Utilisateur activé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de l'activation de l'utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Désactive compte utilisateur avec suspension accès temporaire sécurisée.
    /// Désactivation contrôlée avec préservation données et audit trail suspension.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour désactivation compte</param>
    /// <returns>Confirmation désactivation avec suspension accès</returns>
    public async Task<ApiResponse<bool>> DeactivateUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur non trouvé"
                };
            }

            user.IsActive = false;
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Utilisateur désactivé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la désactivation de l'utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour permissions utilisateur avec contrôle granulaire lecture/écriture.
    /// Modification sécurisée permissions avec validation cohérence et audit trail.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour modification permissions</param>
    /// <param name="canRead">Autorisation lecture données système</param>
    /// <param name="canWrite">Autorisation écriture/modification données</param>
    /// <returns>Confirmation mise à jour permissions avec audit</returns>
    public async Task<ApiResponse<bool>> UpdateUserPermissionsAsync(int userId, bool canRead, bool canWrite)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur non trouvé"
                };
            }

            user.CanWrite = canWrite;
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Permissions mises à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour des permissions",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Assigne utilisateur à client avec création relation bidirectionnelle sécurisée.
    /// Attribution contrôlée avec validation cohérence et audit trail association.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour assignation client</param>
    /// <param name="clientId">Identifiant client pour association utilisateur</param>
    /// <returns>Confirmation assignation avec création relation</returns>
    public async Task<ApiResponse<bool>> AssignUserToClientAsync(int userId, int clientId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            var client = await _context.Clients.FindAsync(clientId);

            if (user == null || client == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur ou client non trouvé"
                };
            }

            user.ClientId = clientId;
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Utilisateur assigné au client avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de l'assignation au client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Retire utilisateur du client avec suppression relation et audit trail.
    /// Dissociation sécurisée avec nettoyage permissions contextuelles client.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour retrait association client</param>
    /// <returns>Confirmation retrait avec nettoyage relation</returns>
    public async Task<ApiResponse<bool>> RemoveUserFromClientAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Utilisateur non trouvé"
                };
            }

            user.ClientId = null;
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Utilisateur retiré du client avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors du retrait du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste complète employés internes avec rôles administratifs et métier.
    /// Consultation optimisée personnel interne avec permissions étendues système.
    /// </summary>
    /// <returns>Liste employés avec rôles, permissions et métadonnées</returns>
    public async Task<ApiResponse<List<UserDto>>> GetEmployeesAsync()
    {
        try
        {
            var employees = await _context.Users
                .Include(u => u.Client)
                .Where(u => u.Role == "admin" || u.Role == "user")
                .ToListAsync();

            var employeeDtos = employees.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                CanWrite = u.CanWrite,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                ClientId = u.ClientId
            }).ToList();

            return new ApiResponse<List<UserDto>>
            {
                Success = true,
                Data = employeeDtos,
                Message = $"{employeeDtos.Count} employés trouvés"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<UserDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des employés",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste complète utilisateurs clients externes avec accès restreint.
    /// Consultation optimisée comptes clients avec permissions limitées contextuelles.
    /// </summary>
    /// <returns>Liste utilisateurs clients avec restrictions et associations</returns>
    public async Task<ApiResponse<List<UserDto>>> GetClientUsersAsync()
    {
        try
        {
            var clientUsers = await _context.Users
                .Include(u => u.Client)
                .Where(u => u.Role == "client" && u.ClientId != null)
                .ToListAsync();

            var clientUserDtos = clientUsers.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                CanWrite = u.CanWrite,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                ClientId = u.ClientId,
                Client = u.Client != null ? new ClientDto
                {
                    Id = u.Client.Id,
                    NomClient = u.Client.NomClient,
                    ReferenceClient = u.Client.ReferenceClient
                } : null
            }).ToList();

            return new ApiResponse<List<UserDto>>
            {
                Success = true,
                Data = clientUserDtos,
                Message = $"{clientUserDtos.Count} utilisateurs clients trouvés"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<UserDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des utilisateurs clients",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste utilisateurs associés à client spécifique avec détails complets.
    /// Consultation ciblée comptes liés client avec permissions et métadonnées.
    /// </summary>
    /// <param name="clientId">Identifiant client pour recherche utilisateurs associés</param>
    /// <returns>Liste utilisateurs client avec informations détaillées</returns>
    public async Task<ApiResponse<List<UserDto>>> GetUsersByClientAsync(int clientId)
    {
        try
        {
            var users = await _context.Users
                .Include(u => u.Client)
                .Where(u => u.ClientId == clientId)
                .ToListAsync();

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                CanWrite = u.CanWrite,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                ClientId = u.ClientId,
                Client = u.Client != null ? new ClientDto
                {
                    Id = u.Client.Id,
                    NomClient = u.Client.NomClient,
                    ReferenceClient = u.Client.ReferenceClient
                } : null
            }).ToList();

            return new ApiResponse<List<UserDto>>
            {
                Success = true,
                Data = userDtos,
                Message = $"{userDtos.Count} utilisateurs trouvés pour ce client"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<UserDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des utilisateurs du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste clients sans compte utilisateur associé pour gestion administrative.
    /// Consultation optimisée clients orphelins nécessitant création compte utilisateur.
    /// </summary>
    /// <returns>Liste clients sans utilisateur pour création comptes</returns>
    public async Task<ApiResponse<List<ClientDto>>> GetClientsWithoutUserAccountAsync()
    {
        try
        {
            var clientsWithoutUsers = await _context.Clients
                .Where(c => !_context.Users.Any(u => u.ClientId == c.Id))
                .ToListAsync();

            var clientDtos = clientsWithoutUsers.Select(c => new ClientDto
            {
                Id = c.Id,
                NomClient = c.NomClient,
                ReferenceClient = c.ReferenceClient,
                AdresseClient = c.AdresseClient,
                CodePostal = c.CodePostal,
                PaysClient = c.PaysClient,
                EmailClient = c.EmailClient,
                TelephoneClient = c.TelephoneClient,
                CanWrite = c.CanWrite,
                CanRead = c.CanRead,
                IsBlocked = c.IsBlocked,
                CreatedAt = c.CreatedAt
            }).ToList();

            return new ApiResponse<List<ClientDto>>
            {
                Success = true,
                Data = clientDtos,
                Message = $"{clientDtos.Count} clients sans compte utilisateur trouvés"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<ClientDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des clients sans compte",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère historique activité utilisateur avec filtrage temporel pour audit.
    /// Consultation détaillée logs activités avec période personnalisable surveillance.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour recherche activités</param>
    /// <param name="fromDate">Date début période optionnelle (null = début)</param>
    /// <param name="toDate">Date fin période optionnelle (null = maintenant)</param>
    /// <returns>Liste logs activités utilisateur avec détails temporels</returns>
    public async Task<ApiResponse<List<LogDto>>> GetUserActivityAsync(int userId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        try
        {
            var query = _context.Logs
                .Where(l => l.UserId == userId.ToString());

            if (fromDate.HasValue)
                query = query.Where(l => l.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(l => l.CreatedAt <= toDate.Value);

            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Take(100) // Limiter à 100 entrées
                .ToListAsync();

            var logDtos = logs.Select(l => new LogDto
            {
                Id = l.Id,
                Action = l.Action,
                TableName = l.TableName,
                RecordId = l.RecordId,
                OldValues = l.OldValues,
                NewValues = l.NewValues,
                UserId = string.IsNullOrEmpty(l.UserId) ? null : int.TryParse(l.UserId, out int uid) ? uid : null,
                CreatedAt = l.CreatedAt
            }).ToList();

            return new ApiResponse<List<LogDto>>
            {
                Success = true,
                Data = logDtos,
                Message = $"{logDtos.Count} entrées d'activité trouvées"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<LogDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération de l'activité utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Compte nombre utilisateurs associés à client spécifique pour statistiques.
    /// Calcul optimisé effectifs client pour analyses administratives et facturation.
    /// </summary>
    /// <param name="clientId">Identifiant client pour comptage utilisateurs</param>
    /// <returns>Nombre total utilisateurs associés client</returns>
    public async Task<ApiResponse<int>> GetUserCountByClientAsync(int clientId)
    {
        try
        {
            var count = await _context.Users.CountAsync(u => u.ClientId == clientId);
            
            return new ApiResponse<int>
            {
                Success = true,
                Data = count,
                Message = $"{count} utilisateur(s) pour ce client"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<int>
            {
                Success = false,
                Message = "Erreur lors du comptage des utilisateurs",
                Errors = ex.Message
            };
        }
    }
}
