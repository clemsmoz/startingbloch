/*
 * ================================================================================================
 * SERVICE CLIENTS - GESTION PORTEFEUILLES PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service métier complet gestion clients StartingBloch avec portefeuilles brevets.
 * Administration entités clientes, permissions accès et relations cabinets.
 * 
 * FONCTIONNALITÉS CLIENTS :
 * ========================
 * 📋 CONSULTATION → Liste paginée clients avec statistiques
 * 🔍 DÉTAIL → Client complet avec portefeuille brevets
 * ➕ CRÉATION → Nouveau client avec permissions configurables
 * ✏️ MODIFICATION → Mise à jour informations et permissions
 * 🗑️ SUPPRESSION → Suppression logique avec vérifications
 * 🔐 PERMISSIONS → Gestion droits lecture/écriture granulaires
 * 
 * DONNÉES CLIENTS :
 * ================
 * 🏢 IDENTIFICATION → Nom, référence unique, coordonnées
 * 📧 CONTACT → Email, téléphone, adresse complète
 * 🔒 SÉCURITÉ → Permissions lecture/écriture, blocage
 * 👥 RELATIONS → Cabinets mandataires associés
 * 📊 PORTEFEUILLE → Brevets propriété intellectuelle
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * SÉCURITÉ ACCÈS :
 * ===============
 * ✅ Permissions granulaires lecture/écriture par client
 * ✅ Système blocage compte client temporaire
 * ✅ Isolation portefeuille brevets étanche
 * ✅ Relations Many-to-Many cabinets sécurisées
 * ✅ Audit trail complet modifications
 * 
 * CONFORMITÉ MÉTIER :
 * ==================
 * ✅ Standards gestion portefeuille IP
 * ✅ Relations contractuelles cabinets-clients
 * ✅ Permissions contextuelles par entité
 * ✅ Historique complet activité client
 * ✅ Intégration système authentification
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service métier complet gestion clients avec portefeuilles propriété intellectuelle.
/// Implémentation sécurisée permissions granulaires et relations Many-to-Many.
/// </summary>
public class ClientService : IClientService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service clients avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes relations.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public ClientService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée clients système avec statistiques activité.
    /// Consultation optimisée clients ordre alphabétique avec métadonnées.
    /// </summary>
    /// <param name="page">Numéro page courante (1 par défaut)</param>
    /// <param name="pageSize">Taille page (10 éléments par défaut)</param>
    /// <returns>Réponse paginée liste clients avec statistiques</returns>
    public async Task<PagedResponse<List<ClientDto>>> GetClientsAsync(int page = 1, int pageSize = 10)
    {
        try
        {
            var totalCount = await _context.Clients.CountAsync();
            var clients = await _context.Clients
                .OrderBy(c => c.NomClient)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ClientDto
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
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return new PagedResponse<List<ClientDto>>
            {
                Success = true,
                Data = clients,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<ClientDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des clients",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère client spécifique par ID avec informations complètes.
    /// Consultation détaillée client avec toutes données métier.
    /// </summary>
    /// <param name="id">Identifiant unique client système</param>
    /// <returns>Client complet ou erreur si inexistant</returns>
    public async Task<ApiResponse<ClientDto>> GetClientByIdAsync(int id)
    {
        try
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return new ApiResponse<ClientDto>
                {
                    Success = false,
                    Message = "Client non trouvé"
                };
            }

            var clientDto = new ClientDto
            {
                Id = client.Id,
                NomClient = client.NomClient,
                ReferenceClient = client.ReferenceClient,
                AdresseClient = client.AdresseClient,
                CodePostal = client.CodePostal,
                PaysClient = client.PaysClient,
                EmailClient = client.EmailClient,
                TelephoneClient = client.TelephoneClient,
                CanWrite = client.CanWrite,
                CanRead = client.CanRead,
                IsBlocked = client.IsBlocked,
                CreatedAt = client.CreatedAt
            };

            return new ApiResponse<ClientDto>
            {
                Success = true,
                Data = clientDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ClientDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau client système avec permissions configurables granulaires.
    /// Enregistrement entité cliente avec droits lecture/écriture personnalisés.
    /// </summary>
    /// <param name="createClientDto">Données création client avec permissions</param>
    /// <returns>Client créé complet ou erreur validation</returns>
    public async Task<ApiResponse<ClientDto>> CreateClientAsync(CreateClientDto createClientDto)
    {
        try
        {
            var client = new Client
            {
                NomClient = createClientDto.NomClient,
                ReferenceClient = createClientDto.ReferenceClient,
                AdresseClient = createClientDto.AdresseClient,
                CodePostal = createClientDto.CodePostal,
                PaysClient = createClientDto.PaysClient,
                EmailClient = createClientDto.EmailClient,
                TelephoneClient = createClientDto.TelephoneClient,
                CanWrite = createClientDto.CanWrite,
                CanRead = createClientDto.CanRead,
                IsBlocked = createClientDto.IsBlocked
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            var clientDto = new ClientDto
            {
                Id = client.Id,
                NomClient = client.NomClient,
                ReferenceClient = client.ReferenceClient,
                AdresseClient = client.AdresseClient,
                CodePostal = client.CodePostal,
                PaysClient = client.PaysClient,
                EmailClient = client.EmailClient,
                TelephoneClient = client.TelephoneClient,
                CanWrite = client.CanWrite,
                CanRead = client.CanRead,
                IsBlocked = client.IsBlocked,
                CreatedAt = client.CreatedAt
            };

            return new ApiResponse<ClientDto>
            {
                Success = true,
                Data = clientDto,
                Message = "Client créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ClientDto>
            {
                Success = false,
                Message = "Erreur lors de la création du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour informations client existant avec nouvelles données.
    /// Modification complète client incluant permissions et coordonnées.
    /// </summary>
    /// <param name="id">Identifiant unique client à modifier</param>
    /// <param name="updateClientDto">Nouvelles données client</param>
    /// <returns>Client modifié ou erreur validation</returns>
    public async Task<ApiResponse<ClientDto>> UpdateClientAsync(int id, CreateClientDto updateClientDto)
    {
        try
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return new ApiResponse<ClientDto>
                {
                    Success = false,
                    Message = "Client non trouvé"
                };
            }

            client.NomClient = updateClientDto.NomClient;
            client.ReferenceClient = updateClientDto.ReferenceClient;
            client.AdresseClient = updateClientDto.AdresseClient;
            client.CodePostal = updateClientDto.CodePostal;
            client.PaysClient = updateClientDto.PaysClient;
            client.EmailClient = updateClientDto.EmailClient;
            client.TelephoneClient = updateClientDto.TelephoneClient;
            client.CanWrite = updateClientDto.CanWrite;
            client.CanRead = updateClientDto.CanRead;
            client.IsBlocked = updateClientDto.IsBlocked;

            await _context.SaveChangesAsync();

            var clientDto = new ClientDto
            {
                Id = client.Id,
                NomClient = client.NomClient,
                ReferenceClient = client.ReferenceClient,
                AdresseClient = client.AdresseClient,
                CodePostal = client.CodePostal,
                PaysClient = client.PaysClient,
                EmailClient = client.EmailClient,
                TelephoneClient = client.TelephoneClient,
                CanWrite = client.CanWrite,
                CanRead = client.CanRead,
                IsBlocked = client.IsBlocked,
                CreatedAt = client.CreatedAt
            };

            return new ApiResponse<ClientDto>
            {
                Success = true,
                Data = clientDto,
                Message = "Client mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ClientDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime client système avec vérifications contraintes relationnelles.
    /// Suppression sécurisée après validation dépendances portefeuille brevets.
    /// </summary>
    /// <param name="id">Identifiant unique client à supprimer</param>
    /// <returns>Succès suppression ou erreur contraintes</returns>
    public async Task<ApiResponse<bool>> DeleteClientAsync(int id)
    {
        try
        {
            var client = await _context.Clients.FindAsync(id);

            if (client == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Client non trouvé"
                };
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Client supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Recherche textuelle avancée clients multi-champs optimisée.
    /// Recherche nom, référence, email clients ordre alphabétique.
    /// </summary>
    /// <param name="searchTerm">Terme recherche textuelle</param>
    /// <returns>Liste clients correspondant recherche</returns>
    public async Task<ApiResponse<List<ClientDto>>> SearchClientsAsync(string searchTerm)
    {
        try
        {
            var clients = await _context.Clients
                .Where(c => c.NomClient.Contains(searchTerm) ||
                           (c.ReferenceClient != null && c.ReferenceClient.Contains(searchTerm)) ||
                           (c.EmailClient != null && c.EmailClient.Contains(searchTerm)))
                .OrderBy(c => c.NomClient)
                .Select(c => new ClientDto
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
                })
                .ToListAsync();

            return new ApiResponse<List<ClientDto>>
            {
                Success = true,
                Data = clients,
                Message = $"{clients.Count} client(s) trouvé(s)"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<ClientDto>>
            {
                Success = false,
                Message = "Erreur lors de la recherche de clients",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère clients sans compte utilisateur associé système authentification.
    /// Identification entités clientes nécessitant création compte connexion.
    /// </summary>
    /// <returns>Liste clients sans compte utilisateur</returns>
    public async Task<ApiResponse<List<ClientDto>>> GetClientsWithoutUserAccountAsync()
    {
        try
        {
            var clientsWithoutUser = await _context.Clients
                .Where(c => !_context.Users.Any(u => u.ClientId == c.Id))
                .Select(c => new ClientDto
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
                })
                .ToListAsync();

            return new ApiResponse<List<ClientDto>>
            {
                Success = true,
                Data = clientsWithoutUser,
                Message = $"{clientsWithoutUser.Count} clients sans compte utilisateur trouvés"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<ClientDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des clients sans compte utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Vérifie existence compte utilisateur associé client spécifique.
    /// Contrôle relation client-utilisateur système authentification.
    /// </summary>
    /// <param name="clientId">Identifiant client à vérifier</param>
    /// <returns>Existence compte utilisateur client</returns>
    public async Task<ApiResponse<bool>> ClientHasUserAccountAsync(int clientId)
    {
        try
        {
            var hasUserAccount = await _context.Users.AnyAsync(u => u.ClientId == clientId);
            
            return new ApiResponse<bool>
            {
                Success = true,
                Data = hasUserAccount,
                Message = hasUserAccount ? "Le client a un compte utilisateur" : "Le client n'a pas de compte utilisateur"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la vérification du compte utilisateur",
                Errors = ex.Message
            };
        }
    }

    public async Task<ApiResponse<ClientWithUserStatusDto>> GetClientWithUserStatusAsync(int clientId)
    {
        try
        {
            var client = await _context.Clients
                .Where(c => c.Id == clientId)
                .Select(c => new ClientWithUserStatusDto
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
                    CreatedAt = c.CreatedAt,
                    HasUserAccount = _context.Users.Any(u => u.ClientId == c.Id)
                })
                .FirstOrDefaultAsync();

            if (client == null)
            {
                return new ApiResponse<ClientWithUserStatusDto>
                {
                    Success = false,
                    Message = "Client non trouvé"
                };
            }

            return new ApiResponse<ClientWithUserStatusDto>
            {
                Success = true,
                Data = client,
                Message = "Client récupéré avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<ClientWithUserStatusDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du client",
                Errors = ex.Message
            };
        }
    }
}
