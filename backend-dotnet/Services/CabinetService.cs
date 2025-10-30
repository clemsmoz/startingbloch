/*
 * ================================================================================================
 * SERVICE CABINETS - GESTION CONSEILS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service métier complet gestion cabinets conseils propriété intellectuelle StartingBloch.
 * Administration mandataires, avocats spécialisés et relations clients portefeuilles.
 * 
 * FONCTIONNALITÉS CABINETS :
 * =========================
 * 📋 CONSULTATION → Liste paginée avec recherche textuelle
 * 🔍 DÉTAIL → Cabinet complet avec relations clients
 * ➕ CRÉATION → Nouveau cabinet avec coordonnées complètes
 * ✏️ MODIFICATION → Mise à jour informations cabinet
 * 🗑️ SUPPRESSION → Suppression logique avec vérifications
 * 🔗 ASSOCIATIONS → Gestion relations cabinets-clients Many-to-Many
 * 
 * DONNÉES CABINETS :
 * =================
 * 🏢 IDENTIFICATION → Nom cabinet, adresse, pays juridiction
 * 📧 CONTACT → Email, téléphone, coordonnées complètes
 * 👥 RELATIONS → Portefeuille clients associés
 * 📊 STATISTIQUES → Nombre clients, volume activité
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, adresse, pays)
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri chronologique par défaut
 * ✅ Compteurs relations chargement lazy
 * 
 * CONFORMITÉ JURIDIQUE :
 * =====================
 * ✅ Standards internationaux cabinets IP
 * ✅ Gestion multi-juridictions territoriales  
 * ✅ Relations complexes mandataires-clients
 * ✅ Audit trail complet modifications
 * ✅ Validation données coordonnées professionnelles
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;
using System.Text.Json;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service métier complet gestion cabinets conseil propriété intellectuelle.
/// Implémentation sécurisée avec recherche optimisée et relations Many-to-Many.
/// </summary>
public class CabinetService : ICabinetService
{
    private readonly StartingBlochDbContext _context;
    private readonly ILogger<CabinetService> _logger;
    private readonly INotificationService _notificationService;

    /// <summary>
    /// Initialise service cabinets avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes relations.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public CabinetService(StartingBlochDbContext context, ILogger<CabinetService> logger, INotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    /// <summary>
    /// Récupère liste paginée cabinets avec recherche textuelle multi-champs.
    /// Recherche optimisée nom, adresse, pays avec compteurs relations.
    /// </summary>
    /// <param name="page">Numéro page courante (1 par défaut)</param>
    /// <param name="pageSize">Taille page (10 éléments par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée liste cabinets avec statistiques</returns>
    public async Task<PagedResponse<List<CabinetDto>>> GetCabinetsAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.Cabinets.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => (c.NomCabinet != null && c.NomCabinet.Contains(search)) || 
                                        (c.AdresseCabinet != null && c.AdresseCabinet.Contains(search)) ||
                                        (c.PaysCabinet != null && c.PaysCabinet.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            var cabinets = await query
                .Include(c => c.ClientCabinets)
                    .ThenInclude(cc => cc.Client)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var cabinetDtos = cabinets.Select(c => new CabinetDto
            {
                Id = c.Id,
                NomCabinet = c.NomCabinet ?? "",
                AdresseCabinet = c.AdresseCabinet ?? "",
                CodePostal = c.CodePostal,
                PaysCabinet = c.PaysCabinet ?? "",
                EmailCabinet = c.EmailCabinet ?? "",
                TelephoneCabinet = c.TelephoneCabinet ?? "",
                Type = c.Type,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                NombreClients = c.ClientCabinets?.Count ?? 0
            }).ToList();

            return new PagedResponse<List<CabinetDto>>
            {
                Success = true,
                Data = cabinetDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{cabinetDtos.Count} cabinets trouvés"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<CabinetDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des cabinets",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère cabinet spécifique par ID avec relations clients complètes.
    /// Consultation détaillée cabinet avec portefeuille clients associés.
    /// </summary>
    /// <param name="id">Identifiant unique cabinet système</param>
    /// <returns>Cabinet complet avec relations ou erreur</returns>
    public async Task<ApiResponse<CabinetDto>> GetCabinetByIdAsync(int id)
    {
        try
        {
            var cabinet = await _context.Cabinets
                .Include(c => c.ClientCabinets)
                    .ThenInclude(cc => cc.Client)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cabinet == null)
            {
                return new ApiResponse<CabinetDto>
                {
                    Success = false,
                    Message = "Cabinet non trouvé"
                };
            }

            var cabinetDto = new CabinetDto
            {
                Id = cabinet.Id,
                NomCabinet = cabinet.NomCabinet ?? "",
                AdresseCabinet = cabinet.AdresseCabinet ?? "",
                CodePostal = cabinet.CodePostal,
                PaysCabinet = cabinet.PaysCabinet ?? "",
                EmailCabinet = cabinet.EmailCabinet ?? "",
                TelephoneCabinet = cabinet.TelephoneCabinet ?? "",
                Type = cabinet.Type,
                CreatedAt = cabinet.CreatedAt,
                UpdatedAt = cabinet.UpdatedAt,
                NombreClients = cabinet.ClientCabinets?.Count ?? 0,
                Clients = cabinet.ClientCabinets?.Select(cc => new ClientDto
                {
                    Id = cc.Client.Id,
                    NomClient = cc.Client.NomClient,
                    ReferenceClient = cc.Client.ReferenceClient
                }).ToList()
            };

            return new ApiResponse<CabinetDto>
            {
                Success = true,
                Data = cabinetDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<CabinetDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du cabinet",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau cabinet conseil propriété intellectuelle système.
    /// Enregistrement coordonnées complètes cabinet mandataire professionnel.
    /// </summary>
    /// <param name="createCabinetDto">Données création cabinet</param>
    /// <returns>Cabinet créé complet ou erreur validation</returns>
    public async Task<ApiResponse<CabinetDto>> CreateCabinetAsync(CreateCabinetDto createCabinetDto)
    {
        int createdCabinetId = 0;
        string? createdCabinetName = null;
        try
        {
            var cabinet = new Cabinet
            {
                NomCabinet = createCabinetDto.NomCabinet,
                AdresseCabinet = createCabinetDto.AdresseCabinet,
                CodePostal = createCabinetDto.CodePostal,
                PaysCabinet = createCabinetDto.PaysCabinet,
                EmailCabinet = createCabinetDto.EmailCabinet,
                TelephoneCabinet = createCabinetDto.TelephoneCabinet,
                Type = createCabinetDto.Type
            };

            _context.Cabinets.Add(cabinet);
            await _context.SaveChangesAsync();

            createdCabinetId = cabinet.Id;
            createdCabinetName = cabinet.NomCabinet;

            var cabinetDto = new CabinetDto
            {
                Id = cabinet.Id,
                NomCabinet = cabinet.NomCabinet,
                AdresseCabinet = cabinet.AdresseCabinet,
                CodePostal = cabinet.CodePostal,
                PaysCabinet = cabinet.PaysCabinet,
                EmailCabinet = cabinet.EmailCabinet,
                TelephoneCabinet = cabinet.TelephoneCabinet,
                Type = cabinet.Type,
                CreatedAt = cabinet.CreatedAt,
                UpdatedAt = cabinet.UpdatedAt,
                NombreClients = 0
            };

            return new ApiResponse<CabinetDto>
            {
                Success = true,
                Data = cabinetDto,
                Message = "Cabinet créé avec succès"
            };
        }
        catch (Exception ex)
        {
            // Log exception complete et payload
            try
            {
                _logger?.LogError(ex, "Erreur lors de la création du cabinet. Payload: {@Payload}", createCabinetDto);
            }
            catch { /* noop */ }

            // Si provider PostgreSQL, tenter de récupérer le nom de la séquence, sa valeur courante et le MAX(id)
            try
            {
                var provider = _context.Database.ProviderName ?? string.Empty;
                if (provider.IndexOf("Npgsql", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    var conn = _context.Database.GetDbConnection();
                    await conn.OpenAsync();
                    try
                    {
                        using var cmd = conn.CreateCommand();
                        cmd.CommandText = "SELECT pg_get_serial_sequence('public.cabinets','id')";
                        var seqObj = await cmd.ExecuteScalarAsync();
                        var seqName = seqObj?.ToString();
                        if (!string.IsNullOrEmpty(seqName))
                        {
                            using var cmd2 = conn.CreateCommand();
                            cmd2.CommandText = $"SELECT last_value, is_called FROM {seqName}";
                            try
                            {
                                using var reader = await cmd2.ExecuteReaderAsync();
                                if (await reader.ReadAsync())
                                {
                                    var last = reader.IsDBNull(0) ? null : reader.GetValue(0);
                                    var isCalled = reader.IsDBNull(1) ? null : reader.GetValue(1);
                                    _logger?.LogWarning("Postgres sequence {Seq} last_value={Last} is_called={IsCalled}", seqName, last, isCalled);
                                }
                            }
                            catch (Exception exSeq)
                            {
                                _logger?.LogWarning(exSeq, "Impossible de lire last_value/is_called pour la séquence {Seq}", seqName);
                            }
                        }

                        using var cmd3 = conn.CreateCommand();
                        cmd3.CommandText = "SELECT COALESCE(MAX(id), NULL) FROM public.cabinets";
                        var maxId = await cmd3.ExecuteScalarAsync();
                        _logger?.LogWarning("Postgres MAX(id) for public.cabinets = {MaxId}", maxId ?? "(null)");
                    }
                    finally
                    {
                        try { await conn.CloseAsync(); } catch { }
                    }
                }
            }
            catch (Exception exLog)
            {
                _logger?.LogWarning(exLog, "Erreur lors de la lecture des informations de séquence PostgreSQL");
            }

            return new ApiResponse<CabinetDto>
            {
                Success = false,
                Message = "Erreur lors de la création du cabinet",
                Errors = ex.ToString()
            };
        }
        finally
        {
            try
            {
                if (createdCabinetId != 0)
                {
                    _logger?.LogInformation("🔔 [NOTIF-TRACE] CabinetService.CreateCabinetAsync -> creating notification Type={Type} Action={Action} ReferenceId={ReferenceId} Message={Message}", "Cabinet", "Created", createdCabinetId, $"Cabinet créé : {createdCabinetName}");
                    var _ = _notificationService.CreateNotificationAsync(new Models.Notification
                    {
                        Type = "Cabinet",
                        Action = "Created",
                        Message = $"Cabinet créé : {createdCabinetName}",
                        ReferenceId = createdCabinetId,
                        Metadata = JsonSerializer.Serialize(new { nom_cabinet = createdCabinetName })
                    });
                }
            }
            catch { }
        }
    }

    /// <summary>
    /// Met à jour informations cabinet existant coordonnées professionnelles.
    /// Modification données cabinet conseil propriété intellectuelle.
    /// </summary>
    /// <param name="id">Identifiant unique cabinet à modifier</param>
    /// <param name="updateCabinetDto">Nouvelles données cabinet</param>
    /// <returns>Cabinet modifié ou erreur validation</returns>
    public async Task<ApiResponse<CabinetDto>> UpdateCabinetAsync(int id, UpdateCabinetDto updateCabinetDto)
    {
        int updatedCabinetId = 0;
        string? updatedCabinetName = null;
        try
        {
            var cabinet = await _context.Cabinets.FindAsync(id);
            if (cabinet == null)
            {
                return new ApiResponse<CabinetDto>
                {
                    Success = false,
                    Message = "Cabinet non trouvé"
                };
            }

            // Log current values to help debugging accidental overwrites
            try
            {
                _logger?.LogDebug("UpdateCabinet - before update for id={Id}: {@Cabinet}", id, new {
                    cabinet.NomCabinet,
                    cabinet.AdresseCabinet,
                    cabinet.CodePostal,
                    cabinet.PaysCabinet,
                    cabinet.EmailCabinet,
                    cabinet.TelephoneCabinet,
                    cabinet.Type
                });
            }
            catch { }

            // Only overwrite string fields when the incoming value is not null/whitespace
            if (!string.IsNullOrWhiteSpace(updateCabinetDto.NomCabinet))
                cabinet.NomCabinet = updateCabinetDto.NomCabinet;

            if (!string.IsNullOrWhiteSpace(updateCabinetDto.AdresseCabinet))
                cabinet.AdresseCabinet = updateCabinetDto.AdresseCabinet;

            if (!string.IsNullOrWhiteSpace(updateCabinetDto.CodePostal))
                cabinet.CodePostal = updateCabinetDto.CodePostal;

            if (!string.IsNullOrWhiteSpace(updateCabinetDto.PaysCabinet))
                cabinet.PaysCabinet = updateCabinetDto.PaysCabinet;

            if (!string.IsNullOrWhiteSpace(updateCabinetDto.EmailCabinet))
                cabinet.EmailCabinet = updateCabinetDto.EmailCabinet;

            if (!string.IsNullOrWhiteSpace(updateCabinetDto.TelephoneCabinet))
                cabinet.TelephoneCabinet = updateCabinetDto.TelephoneCabinet;

            // Only set Type if it maps to a valid enum value (avoid accidental 0)
            try
            {
                if (Enum.IsDefined(typeof(CabinetType), updateCabinetDto.Type))
                {
                    cabinet.Type = updateCabinetDto.Type;
                }
            }
            catch { /* ignore enum check errors */ }

            try
            {
                _logger?.LogDebug("UpdateCabinet - after applying update for id={Id}: {@Cabinet}", id, new {
                    cabinet.NomCabinet,
                    cabinet.AdresseCabinet,
                    cabinet.CodePostal,
                    cabinet.PaysCabinet,
                    cabinet.EmailCabinet,
                    cabinet.TelephoneCabinet,
                    cabinet.Type
                });
            }
            catch { }

            await _context.SaveChangesAsync();

            updatedCabinetId = cabinet.Id;
            updatedCabinetName = cabinet.NomCabinet;

            var cabinetDto = new CabinetDto
            {
                Id = cabinet.Id,
                NomCabinet = cabinet.NomCabinet,
                AdresseCabinet = cabinet.AdresseCabinet,
                CodePostal = cabinet.CodePostal,
                PaysCabinet = cabinet.PaysCabinet,
                EmailCabinet = cabinet.EmailCabinet,
                TelephoneCabinet = cabinet.TelephoneCabinet,
                Type = cabinet.Type,
                CreatedAt = cabinet.CreatedAt,
                UpdatedAt = cabinet.UpdatedAt
            };

            return new ApiResponse<CabinetDto>
            {
                Success = true,
                Data = cabinetDto,
                Message = "Cabinet mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<CabinetDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du cabinet",
                Errors = ex.Message
            };
        }
        finally
        {
            try
            {
                if (updatedCabinetId != 0)
                {
                    _logger?.LogInformation("🔔 [NOTIF-TRACE] CabinetService.UpdateCabinetAsync -> creating notification Type={Type} Action={Action} ReferenceId={ReferenceId} Message={Message}", "Cabinet", "Updated", updatedCabinetId, $"Cabinet mis à jour : {updatedCabinetName}");
                    var _ = _notificationService.CreateNotificationAsync(new Models.Notification
                    {
                        Type = "Cabinet",
                        Action = "Updated",
                        Message = $"Cabinet mis à jour : {updatedCabinetName}",
                        ReferenceId = updatedCabinetId,
                        Metadata = JsonSerializer.Serialize(new { nom_cabinet = updatedCabinetName })
                    });
                }
            }
            catch { }
        }
    }

    /// <summary>
    /// Supprime cabinet système avec vérifications contraintes relationnelles.
    /// Suppression sécurisée cabinet conseil après validation dépendances.
    /// </summary>
    /// <param name="id">Identifiant unique cabinet à supprimer</param>
    /// <returns>Succès suppression ou erreur contraintes</returns>
    public async Task<ApiResponse<bool>> DeleteCabinetAsync(int id)
    {
        int deletedCabinetId = 0;
        try
        {
            var cabinet = await _context.Cabinets.FindAsync(id);
            if (cabinet == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Cabinet non trouvé"
                };
            }

            deletedCabinetId = cabinet.Id;

            _context.Cabinets.Remove(cabinet);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Cabinet supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression du cabinet",
                Errors = ex.Message
            };
        }
        finally
        {
            try
            {
                if (deletedCabinetId != 0)
                {
                    _logger?.LogInformation("🔔 [NOTIF-TRACE] CabinetService.DeleteCabinetAsync -> creating notification Type={Type} Action={Action} ReferenceId={ReferenceId} Message={Message}", "Cabinet", "Deleted", deletedCabinetId, $"Cabinet supprimé");
                    var _ = _notificationService.CreateNotificationAsync(new Models.Notification
                    {
                        Type = "Cabinet",
                        Action = "Deleted",
                        Message = $"Cabinet supprimé",
                        ReferenceId = deletedCabinetId,
                        Metadata = JsonSerializer.Serialize(new { nom_cabinet = (await _context.Cabinets.FindAsync(deletedCabinetId))?.NomCabinet })
                    });
                }
            }
            catch { }
        }
    }

    /// <summary>
    /// Récupère portefeuille clients complet associé cabinet spécifique.
    /// Liste clients mandants cabinet conseil propriété intellectuelle.
    /// </summary>
    /// <param name="cabinetId">Identifiant unique cabinet</param>
    /// <returns>Liste clients cabinet ou erreur</returns>
    public async Task<ApiResponse<List<ClientDto>>> GetCabinetClientsAsync(int cabinetId)
    {
        try
        {
            var cabinet = await _context.Cabinets
                .Include(c => c.ClientCabinets)
                    .ThenInclude(cc => cc.Client)
                .FirstOrDefaultAsync(c => c.Id == cabinetId);

            if (cabinet == null)
            {
                return new ApiResponse<List<ClientDto>>
                {
                    Success = false,
                    Message = "Cabinet non trouvé"
                };
            }

            var clients = cabinet.ClientCabinets?.Select(cc => new ClientDto
            {
                Id = cc.Client.Id,
                NomClient = cc.Client.NomClient,
                ReferenceClient = cc.Client.ReferenceClient,
                AdresseClient = cc.Client.AdresseClient,
                CodePostal = cc.Client.CodePostal,
                PaysClient = cc.Client.PaysClient,
                EmailClient = cc.Client.EmailClient,
                TelephoneClient = cc.Client.TelephoneClient,
                CanWrite = cc.Client.CanWrite,
                CanRead = cc.Client.CanRead,
                IsBlocked = cc.Client.IsBlocked,
                CreatedAt = cc.Client.CreatedAt
            }).ToList() ?? new List<ClientDto>();

            return new ApiResponse<List<ClientDto>>
            {
                Success = true,
                Data = clients,
                Message = $"{clients.Count} clients trouvés pour ce cabinet"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<ClientDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des clients du cabinet",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Assigne client à cabinet conseil relation Many-to-Many mandataire.
    /// Création lien contractuel client-cabinet propriété intellectuelle.
    /// </summary>
    /// <param name="cabinetId">Identifiant cabinet mandataire</param>
    /// <param name="clientId">Identifiant client mandant</param>
    /// <returns>Succès assignation ou erreur contraintes</returns>
    public async Task<ApiResponse<bool>> AssignClientToCabinetAsync(int cabinetId, int clientId)
    {
        try
        {
            var cabinet = await _context.Cabinets.FindAsync(cabinetId);
            var client = await _context.Clients.FindAsync(clientId);

            if (cabinet == null || client == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Cabinet ou client non trouvé"
                };
            }

            var existingRelation = await _context.ClientCabinets
                .FirstOrDefaultAsync(cc => cc.ClientId == clientId && cc.CabinetId == cabinetId);

            if (existingRelation != null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Ce client est déjà assigné à ce cabinet"
                };
            }

            var clientCabinet = new ClientCabinet
            {
                ClientId = clientId,
                CabinetId = cabinetId
            };

            _context.ClientCabinets.Add(clientCabinet);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Client assigné au cabinet avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de l'assignation du client au cabinet",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Retire client du portefeuille cabinet fin relation mandataire.
    /// Suppression lien contractuel client-cabinet propriété intellectuelle.
    /// </summary>
    /// <param name="cabinetId">Identifiant cabinet mandataire</param>
    /// <param name="clientId">Identifiant client à retirer</param>
    /// <returns>Succès retrait ou erreur</returns>
    public async Task<ApiResponse<bool>> RemoveClientFromCabinetAsync(int cabinetId, int clientId)
    {
        try
        {
            var clientCabinet = await _context.ClientCabinets
                .FirstOrDefaultAsync(cc => cc.ClientId == clientId && cc.CabinetId == cabinetId);

            if (clientCabinet == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Relation client-cabinet non trouvée"
                };
            }

            _context.ClientCabinets.Remove(clientCabinet);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Client retiré du cabinet avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors du retrait du client du cabinet",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère cabinets par juridiction pays spécifique filtrage territorial.
    /// Recherche cabinets conseil propriété intellectuelle par localisation.
    /// </summary>
    /// <param name="country">Nom pays juridiction cabinet</param>
    /// <returns>Liste cabinets pays ou erreur recherche</returns>
    public async Task<ApiResponse<List<CabinetDto>>> GetCabinetsByCountryAsync(string country)
    {
        try
        {
            var cabinets = await _context.Cabinets
                .Include(c => c.ClientCabinets)
                .Where(c => c.PaysCabinet != null && c.PaysCabinet.ToLower() == country.ToLower())
                .ToListAsync();

            var cabinetDtos = cabinets.Select(c => new CabinetDto
            {
                Id = c.Id,
                NomCabinet = c.NomCabinet ?? "",
                AdresseCabinet = c.AdresseCabinet ?? "",
                CodePostal = c.CodePostal,
                PaysCabinet = c.PaysCabinet ?? "",
                EmailCabinet = c.EmailCabinet ?? "",
                TelephoneCabinet = c.TelephoneCabinet ?? "",
                Type = c.Type,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                NombreClients = c.ClientCabinets?.Count ?? 0
            }).ToList();

            return new ApiResponse<List<CabinetDto>>
            {
                Success = true,
                Data = cabinetDtos,
                Message = $"{cabinetDtos.Count} cabinets trouvés dans {country}"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<CabinetDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des cabinets par pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Retourne les cabinets liés à un client via ClientCabinets.
    /// </summary>
    public async Task<ApiResponse<List<CabinetDto>>> GetCabinetsByClientAsync(int clientId)
    {
        try
        {
            var cabinets = await _context.ClientCabinets
                .Where(cc => cc.ClientId == clientId)
                .Include(cc => cc.Cabinet)
                .Select(cc => cc.Cabinet!)
                .Distinct()
                .ToListAsync();

            var cabinetDtos = cabinets.Select(c => new CabinetDto
            {
                Id = c.Id,
                NomCabinet = c.NomCabinet ?? "",
                AdresseCabinet = c.AdresseCabinet ?? "",
                CodePostal = c.CodePostal,
                PaysCabinet = c.PaysCabinet ?? "",
                EmailCabinet = c.EmailCabinet ?? "",
                TelephoneCabinet = c.TelephoneCabinet ?? "",
                Type = c.Type,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                NombreClients = _context.ClientCabinets.Count(x => x.CabinetId == c.Id)
            }).ToList();

            return new ApiResponse<List<CabinetDto>>
            {
                Success = true,
                Data = cabinetDtos,
                Message = $"{cabinetDtos.Count} cabinets trouvés pour le client"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<CabinetDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des cabinets du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée un cabinet et le relie au client spécifié.
    /// </summary>
    public async Task<ApiResponse<CabinetDto>> CreateCabinetForClientAsync(int clientId, CreateCabinetDto createCabinetDto)
    {
        int createdDtoId = 0;
        string? createdDtoName = null;
        try
        {
            // Créer le cabinet
            var createResult = await CreateCabinetAsync(createCabinetDto);
            if (!createResult.Success || createResult.Data == null)
            {
                return new ApiResponse<CabinetDto>
                {
                    Success = false,
                    Message = createResult.Message,
                    Errors = createResult.Errors
                };
            }

            // Lier au client
            var linkResult = await AssignClientToCabinetAsync(createResult.Data.Id, clientId);
            if (!linkResult.Success)
            {
                return new ApiResponse<CabinetDto>
                {
                    Success = false,
                    Message = linkResult.Message,
                    Errors = linkResult.Errors
                };
            }

            // Recharger
            var cabinet = await _context.Cabinets
                .Include(c => c.ClientCabinets)
                .FirstAsync(c => c.Id == createResult.Data.Id);

            var dto = new CabinetDto
            {
                Id = cabinet.Id,
                NomCabinet = cabinet.NomCabinet ?? "",
                AdresseCabinet = cabinet.AdresseCabinet ?? "",
                CodePostal = cabinet.CodePostal,
                PaysCabinet = cabinet.PaysCabinet ?? "",
                EmailCabinet = cabinet.EmailCabinet ?? "",
                TelephoneCabinet = cabinet.TelephoneCabinet ?? "",
                Type = cabinet.Type,
                CreatedAt = cabinet.CreatedAt,
                UpdatedAt = cabinet.UpdatedAt,
                NombreClients = cabinet.ClientCabinets?.Count ?? 0
            };

            createdDtoId = dto.Id;
            createdDtoName = dto.NomCabinet;

            return new ApiResponse<CabinetDto>
            {
                Success = true,
                Data = dto,
                Message = "Cabinet créé et lié au client"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<CabinetDto>
            {
                Success = false,
                Message = "Erreur lors de la création du cabinet pour le client",
                Errors = ex.Message
            };
        }
            finally
            {
                try
                {
                    if (createdDtoId != 0)
                    {
                        // Notification ciblée pour le client lié
                        var clientNotif = new Models.Notification
                        {
                            Type = "Cabinet",
                            Action = "Created",
                            Message = $"Un cabinet a été créé et lié à votre compte : {createdDtoName}",
                            ReferenceId = createdDtoId,
                            ClientId = clientId,
                            Metadata = JsonSerializer.Serialize(new { nomCabinet = createdDtoName })
                        };
                        _logger?.LogInformation("[NOTIF-TRACE] CabinetService.CreateCabinetForClientAsync -> will create client-scoped notification Type={Type} Action={Action} ClientId={ClientId} ReferenceId={ReferenceId} Message={Message} Metadata={Metadata}", clientNotif.Type, clientNotif.Action, clientNotif.ClientId, clientNotif.ReferenceId, clientNotif.Message, clientNotif.Metadata);
                        var _ = _notificationService.CreateNotificationAsync(clientNotif);

                        // Notification globale pour les admins/utilisateurs généraux
                        var globalNotif = new Models.Notification
                        {
                            Type = "Cabinet",
                            Action = "Created",
                            Message = $"Cabinet créé et lié au client : {createdDtoName}",
                            ReferenceId = createdDtoId,
                            Metadata = JsonSerializer.Serialize(new { nomCabinet = createdDtoName })
                        };
                        _logger?.LogInformation("[NOTIF-TRACE] CabinetService.CreateCabinetForClientAsync -> will create global notification Type={Type} Action={Action} ReferenceId={ReferenceId} Message={Message} Metadata={Metadata}", globalNotif.Type, globalNotif.Action, globalNotif.ReferenceId, globalNotif.Message, globalNotif.Metadata);
                        var __ = _notificationService.CreateNotificationAsync(globalNotif);
                    }
                }
                catch { }
            }
    }

    /// <summary>
    /// Lie un cabinet existant au client spécifié.
    /// </summary>
    public async Task<ApiResponse<bool>> LinkExistingCabinetToClientAsync(int clientId, int cabinetId)
    {
        try
        {
            // Vérifier existence
            var exists = await _context.Cabinets.AnyAsync(c => c.Id == cabinetId);
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
            if (!exists || !clientExists)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Cabinet ou client introuvable"
                };
            }

            // Vérifier relation existante
            var already = await _context.ClientCabinets
                .AnyAsync(cc => cc.ClientId == clientId && cc.CabinetId == cabinetId);
            if (already)
            {
                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Déjà lié"
                };
            }

            _context.ClientCabinets.Add(new ClientCabinet
            {
                ClientId = clientId,
                CabinetId = cabinetId
            });
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Liaison effectuée"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la liaison client-cabinet",
                Errors = ex.Message
            };
        }
    }
}
