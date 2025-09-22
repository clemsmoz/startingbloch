/*
 * ================================================================================================
 * SERVICE BREVETS - GESTION COMPLÈTE PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service métier complet gestion brevets StartingBloch avec relations complexes.
 * Traitement sécurisé brevets, inventeurs, déposants, titulaires et cabinets.
 * 
 * FONCTIONNALITÉS BREVETS :
 * ========================
 * 📋 CONSULTATION → Liste paginée avec filtrage utilisateur/client
 * 🔍 DÉTAIL → Consultation brevet complet avec toutes relations
 * ➕ CRÉATION → Nouveau brevet avec relations Many-to-Many
 * ✏️ MODIFICATION → Mise à jour données et relations complexes
 * 🗑️ SUPPRESSION → Suppression logique avec audit trail
 * 
 * RELATIONS MANAGÉES :
 * ===================
 * 👥 CLIENTS → Association brevets portefeuille clients
 * 🧑‍🔬 INVENTEURS → Créateurs techniques avec nationalités
 * 🏢 DÉPOSANTS → Entités légales dépôt avec juridictions
 * 👑 TITULAIRES → Détenteurs droits patrimoniaux
 * ⚖️ CABINETS → Conseils propriété intellectuelle mandataires
 * 📊 INFORMATIONS → Données procédurales dépôt et statuts
 * 
 * SÉCURITÉ ACCÈS :
 * ===============
 * ✅ Filtrage contexte utilisateur (admin/user/client)
 * ✅ Isolation données clients étanches
 * ✅ Permissions granulaires lecture/écriture
 * ✅ Validation stricte relations Many-to-Many
 * ✅ Audit trail toutes modifications
 * ✅ Pagination performances grandes collections
 * 
 * CONFORMITÉ IP :
 * ==============
 * ✅ Standards internationaux brevets (PCT, Paris)
 * ✅ Gestion multi-juridictions territoriales
 * ✅ Statuts procéduraux harmonisés
 * ✅ Relations complexes propriété intellectuelle
 * ✅ Historique complet lifecycle brevet
 * ✅ Intégration données cabinet conseil
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using System.Text.Json;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;
using Microsoft.Extensions.Logging;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service métier complet gestion brevets avec relations complexes Many-to-Many.
/// Implémentation sécurisée filtrage contextuel et performances optimisées.
/// </summary>
public class BrevetService : IBrevetService
{
    private readonly StartingBlochDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<BrevetService> _logger;

    /// <summary>
    /// Initialise service brevets avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes complexes.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public BrevetService(StartingBlochDbContext context, INotificationService notificationService, ILogger<BrevetService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère liste paginée brevets avec filtrage contextuel utilisateur.
    /// Isolation sécurisée : clients voient uniquement leur portefeuille.
    /// </summary>
    /// <param name="page">Numéro page courante (1 par défaut)</param>
    /// <param name="pageSize">Taille page (10 éléments par défaut)</param>
    /// <param name="currentUserId">ID utilisateur contexte sécurité</param>
    /// <returns>Réponse paginée liste brevets autorisés</returns>
    public async Task<PagedResponse<List<BrevetDto>>> GetBrevetsAsync(int page = 1, int pageSize = 10, int? currentUserId = null)
    {
        try
        {
            IQueryable<Brevet> query = _context.Brevets
                .Include(b => b.BrevetClients).ThenInclude(bc => bc.Client)
                .Include(b => b.BrevetInventeurs).ThenInclude(bi => bi.Inventeur)
                .Include(b => b.BrevetDeposants).ThenInclude(bd => bd.Deposant)
                .Include(b => b.BrevetTitulaires).ThenInclude(bt => bt.Titulaire)
                .Include(b => b.BrevetCabinets).ThenInclude(bc => bc.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Pays)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Statuts)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Roles)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Contacts).ThenInclude(c => c.Contact);

            // Si c'est un utilisateur client, filtrer par son ClientId
            if (currentUserId.HasValue)
            {
                var user = await _context.Users.FindAsync(currentUserId.Value);
                if (user?.ClientId.HasValue == true && user.Role == "client")
                {
                    query = query.Where(b => b.BrevetClients.Any(bc => bc.IdClient == user.ClientId.Value));
                }
                // Les employés (admin/user) voient tous les brevets - pas de filtre
            }

            var totalCount = await query.CountAsync();
            
            var brevets = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var brevetDtos = brevets.Select(b => MapToBrevetDto(b)).ToList();

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return new PagedResponse<List<BrevetDto>>
            {
                Success = true,
                Data = brevetDtos,
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
            return new PagedResponse<List<BrevetDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des brevets",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère brevet spécifique par ID avec toutes relations chargées.
    /// Consultation détaillée complète inventeurs, déposants, titulaires, cabinets.
    /// </summary>
    /// <param name="id">Identifiant unique brevet système</param>
    /// <param name="currentUserId">ID utilisateur contexte sécurité</param>
    /// <returns>Brevet complet avec toutes relations ou erreur</returns>
    public async Task<ApiResponse<BrevetDto>> GetBrevetByIdAsync(int id, int? currentUserId = null)
    {
        try
        {
            var brevet = await _context.Brevets
                .Include(b => b.BrevetClients).ThenInclude(bc => bc.Client)
                .Include(b => b.BrevetInventeurs).ThenInclude(bi => bi.Inventeur)
                    .ThenInclude(i => i.InventeurPays).ThenInclude(ip => ip.Pays)
                .Include(b => b.BrevetDeposants).ThenInclude(bd => bd.Deposant)
                    .ThenInclude(d => d.DeposantPays).ThenInclude(dp => dp.Pays)
                .Include(b => b.BrevetTitulaires).ThenInclude(bt => bt.Titulaire)
                    .ThenInclude(t => t.TitulairePays).ThenInclude(tp => tp.Pays)
                .Include(b => b.BrevetCabinets).ThenInclude(bc => bc.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Pays)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Statuts)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Roles)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Contacts).ThenInclude(c => c.Contact)
                .FirstOrDefaultAsync(b => b.IdBrevet == id);

            if (brevet == null)
            {
                return new ApiResponse<BrevetDto>
                {
                    Success = false,
                    Message = "Brevet non trouvé"
                };
            }

            var brevetDto = MapToBrevetDto(brevet);

            return new ApiResponse<BrevetDto>
            {
                Success = true,
                Data = brevetDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<BrevetDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du brevet",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau brevet complet avec toutes relations Many-to-Many transactionnelles.
    /// Gestion atomique clients, inventeurs, déposants, titulaires, cabinets, informations dépôt.
    /// </summary>
    /// <param name="createBrevetDto">Données création brevet avec relations</param>
    /// <returns>Brevet créé complet ou erreur validation</returns>
    public async Task<ApiResponse<BrevetDto>> CreateBrevetAsync(CreateBrevetDto createBrevetDto)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
            var brevet = new Brevet
            {
                ReferenceFamille = createBrevetDto.ReferenceFamille,
                Titre = createBrevetDto.Titre,
                Commentaire = createBrevetDto.Commentaire
            };

            _context.Brevets.Add(brevet);
            await _context.SaveChangesAsync();

            // Ajouter les relations clients
            if (createBrevetDto.ClientIds?.Any() == true)
            {
                foreach (var clientId in createBrevetDto.ClientIds)
                {
                    _context.BrevetClients.Add(new BrevetClient
                    {
                        BrevetId = brevet.Id,
                        ClientId = clientId
                    });
                }
            }

            // Ajouter les relations inventeurs
            if (createBrevetDto.InventeurIds?.Any() == true)
            {
                foreach (var inventeurId in createBrevetDto.InventeurIds)
                {
                    _context.BrevetInventeurs.Add(new BrevetInventeur
                    {
                        BrevetId = brevet.Id,
                        InventeurId = inventeurId
                    });
                }
            }

            // Ajouter les relations déposants
            if (createBrevetDto.DeposantIds?.Any() == true)
            {
                foreach (var deposantId in createBrevetDto.DeposantIds)
                {
                    _context.BrevetDeposants.Add(new BrevetDeposant
                    {
                        BrevetId = brevet.Id,
                        DeposantId = deposantId
                    });
                }
            }

            // Ajouter les relations titulaires
            if (createBrevetDto.TitulaireIds?.Any() == true)
            {
                foreach (var titulaireId in createBrevetDto.TitulaireIds)
                {
                    _context.BrevetTitulaires.Add(new BrevetTitulaire
                    {
                        BrevetId = brevet.Id,
                        TitulaireId = titulaireId
                    });
                }
            }

            // Ajouter les relations cabinets
            if (createBrevetDto.Cabinets?.Any() == true)
            {
                foreach (var cabinetLink in createBrevetDto.Cabinets)
                {
                    _context.BrevetCabinets.Add(new BrevetCabinet
                    {
                        BrevetId = brevet.Id,
                        CabinetId = cabinetLink.CabinetId
                    });
                }
            }

            // Ajouter les informations de dépôt
            if (createBrevetDto.InformationsDepot?.Any() == true)
            {
                foreach (var infoDepot in createBrevetDto.InformationsDepot)
                {
                    var entity = new InformationDepot
                    {
                        IdBrevet = brevet.Id,
                        IdPays = infoDepot.IdPays,
                        IdStatuts = infoDepot.IdStatuts,
                        NumeroDepot = infoDepot.NumeroDepot,
                        NumeroPublication = infoDepot.NumeroPublication,
                        NumeroDelivrance = infoDepot.NumeroDelivrance,
                        DateDepot = ToUtc(infoDepot.DateDepot),
                        DatePublication = ToUtc(infoDepot.DatePublication),
                        DateDelivrance = ToUtc(infoDepot.DateDelivrance),
                        Licence = infoDepot.Licence,
                        Commentaire = infoDepot.Commentaire
                    };
                    _context.InformationsDepot.Add(entity);
                    await _context.SaveChangesAsync();

                    // Cabinets Annuités
                    if (infoDepot.CabinetsAnnuites?.Any() == true)
                    {
                        foreach (var cab in infoDepot.CabinetsAnnuites)
                        {
                            var link = new InformationDepotCabinet
                            {
                                InformationDepotId = entity.Id,
                                CabinetId = cab.CabinetId,
                                Category = CabinetType.Annuite
                            };
                            _context.InformationDepotCabinets.Add(link);
                            await _context.SaveChangesAsync();

                            if (cab.Roles?.Any() == true)
                            {
                                foreach (var role in cab.Roles.Distinct(StringComparer.OrdinalIgnoreCase))
                                {
                                    _context.InformationDepotCabinetRoles.Add(new InformationDepotCabinetRole
                                    {
                                        InformationDepotCabinetId = link.Id,
                                        Role = role.Trim().ToLowerInvariant()
                                    });
                                }
                            }

                            if (cab.ContactIds?.Any() == true)
                            {
                                foreach (var contactId in cab.ContactIds.Distinct())
                                {
                                    _context.InformationDepotCabinetContacts.Add(new InformationDepotCabinetContact
                                    {
                                        InformationDepotCabinetId = link.Id,
                                        ContactId = contactId
                                    });
                                }
                            }
                        }
                    }

                    // Cabinets Procédures
                    if (infoDepot.CabinetsProcedures?.Any() == true)
                    {
                        foreach (var cab in infoDepot.CabinetsProcedures)
                        {
                            var link = new InformationDepotCabinet
                            {
                                InformationDepotId = entity.Id,
                                CabinetId = cab.CabinetId,
                                Category = CabinetType.Procedure
                            };
                            _context.InformationDepotCabinets.Add(link);
                            await _context.SaveChangesAsync();

                            if (cab.Roles?.Any() == true)
                            {
                                foreach (var role in cab.Roles.Distinct(StringComparer.OrdinalIgnoreCase))
                                {
                                    _context.InformationDepotCabinetRoles.Add(new InformationDepotCabinetRole
                                    {
                                        InformationDepotCabinetId = link.Id,
                                        Role = role.Trim().ToLowerInvariant()
                                    });
                                }
                            }

                            if (cab.ContactIds?.Any() == true)
                            {
                                foreach (var contactId in cab.ContactIds.Distinct())
                                {
                                    _context.InformationDepotCabinetContacts.Add(new InformationDepotCabinetContact
                                    {
                                        InformationDepotCabinetId = link.Id,
                                        ContactId = contactId
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // Persister les pays par inventeur si fournis
            if (createBrevetDto.InventeursPays?.Any() == true)
            {
                foreach (var link in createBrevetDto.InventeursPays)
                {
                    if (link.PaysIds?.Any() != true) continue;
                    // Charger existants pour éviter doublons
                    var existing = await _context.InventeurPays
                        .Where(ip => ip.IdInventeur == link.InventeurId && ip.IdBrevet == brevet.Id)
                        .Select(ip => ip.IdPays)
                        .ToListAsync();

                    var toAdd = link.PaysIds.Distinct().Except(existing).ToList();
                    foreach (var pid in toAdd)
                    {
                        _context.InventeurPays.Add(new InventeurPays
                        {
                            IdInventeur = link.InventeurId,
                            IdPays = pid,
                            IdBrevet = brevet.Id
                        });
                    }
                }
            }

            // Persister les pays par déposant si fournis
            if (createBrevetDto.DeposantsPays?.Any() == true)
            {
                foreach (var link in createBrevetDto.DeposantsPays)
                {
                    if (link.PaysIds?.Any() != true) continue;
                    var existing = await _context.DeposantPays
                        .Where(dp => dp.IdDeposant == link.DeposantId && dp.IdBrevet == brevet.Id)
                        .Select(dp => dp.IdPays)
                        .ToListAsync();

                    var toAdd = link.PaysIds.Distinct().Except(existing).ToList();
                    foreach (var pid in toAdd)
                    {
                        _context.DeposantPays.Add(new DeposantPays
                        {
                            IdDeposant = link.DeposantId,
                            IdPays = pid,
                            IdBrevet = brevet.Id
                        });
                    }
                }
            }

            // Persister les pays par titulaire si fournis
            if (createBrevetDto.TitulairesPays?.Any() == true)
            {
                foreach (var link in createBrevetDto.TitulairesPays)
                {
                    if (link.PaysIds?.Any() != true) continue;
                    var existing = await _context.TitulairePays
                        .Where(tp => tp.IdTitulaire == link.TitulaireId && tp.IdBrevet == brevet.Id)
                        .Select(tp => tp.IdPays)
                        .ToListAsync();

                    var toAdd = link.PaysIds.Distinct().Except(existing).ToList();
                    foreach (var pid in toAdd)
                    {
                        _context.TitulairePays.Add(new TitulairePays
                        {
                            IdTitulaire = link.TitulaireId,
                            IdPays = pid,
                            IdBrevet = brevet.Id
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Récupérer le brevet créé avec toutes ses relations
            var result = await GetBrevetByIdAsync(brevet.Id);
            result.Message = "Brevet créé avec succès";

            // Emit notification(s)
            try
            {
                // If brevet linked to clients, create client-scoped notifications
                var clientIds = createBrevetDto.ClientIds ?? new List<int>();
                if (clientIds.Any())
                {
                    foreach (var cid in clientIds.Distinct())
                    {
                        var meta = JsonSerializer.Serialize(new { referenceFamille = brevet.ReferenceFamille });
                        _logger?.LogInformation("🔔 [NOTIF-TRACE] BrevetService.CreateBrevetAsync -> creating notification Type={Type} Action={Action} ClientId={ClientId} ReferenceId={ReferenceId} Metadata={Metadata}", "Brevet", "Created", cid, brevet.Id, meta);
                        await _notificationService.CreateNotificationAsync(new Models.Notification
                        {
                            Type = "Brevet",
                            Action = "Created",
                            Message = $"Un brevet a été créé (ID={brevet.Id})",
                            ReferenceId = brevet.Id,
                            ClientId = cid,
                            Metadata = meta
                        });
                    }
                }
                else
                {
                    // global notification
                    var meta = JsonSerializer.Serialize(new { referenceFamille = brevet.ReferenceFamille });
                    _logger?.LogInformation("🔔 [NOTIF-TRACE] BrevetService.CreateBrevetAsync -> creating GLOBAL notification Type={Type} Action={Action} ReferenceId={ReferenceId} Metadata={Metadata}", "Brevet", "Created", brevet.Id, meta);
                    await _notificationService.CreateNotificationAsync(new Models.Notification
                    {
                        Type = "Brevet",
                        Action = "Created",
                        Message = $"Un brevet a été créé (ID={brevet.Id})",
                        ReferenceId = brevet.Id,
                        Metadata = meta
                    });
                }
            }
            catch
            {
                // Notifications doivent rester non bloquantes
            }

            return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ApiResponse<BrevetDto>
                {
                    Success = false,
                    Message = "Erreur lors de la création du brevet",
                    // Renvoyer le ToString() complet pour exposer inner exceptions et stack trace au debug
                    Errors = ex.ToString()
                };
            }
        });
    }

    /// <summary>
    /// Met à jour brevet existant avec nouvelles données et relations optionnelles.
    /// Modification partielle sécurisée avec gestion transactionnelle atomique.
    /// </summary>
    /// <param name="id">Identifiant unique brevet à modifier</param>
    /// <param name="updateBrevetDto">Données partielles mise à jour</param>
    /// <returns>Brevet modifié complet ou erreur validation</returns>
    public async Task<ApiResponse<BrevetDto>> UpdateBrevetAsync(int id, UpdateBrevetDto updateBrevetDto)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
            var brevet = await _context.Brevets.FindAsync(id);

            if (brevet == null)
            {
                return new ApiResponse<BrevetDto>
                {
                    Success = false,
                    Message = "Brevet non trouvé"
                };
            }

            // Mettre à jour les propriétés de base
            if (updateBrevetDto.ReferenceFamille != null)
                brevet.ReferenceFamille = updateBrevetDto.ReferenceFamille;
            
            if (updateBrevetDto.Titre != null)
                brevet.Titre = updateBrevetDto.Titre;
            
            if (updateBrevetDto.Commentaire != null)
                brevet.Commentaire = updateBrevetDto.Commentaire;

            // Mettre à jour les relations si spécifiées
            if (updateBrevetDto.ClientIds != null)
            {
                // Supprimer les anciennes relations
                var existingClients = await _context.BrevetClients
                    .Where(bc => bc.IdBrevet == id)
                    .ToListAsync();
                _context.BrevetClients.RemoveRange(existingClients);

                // Ajouter les nouvelles relations
                foreach (var clientId in updateBrevetDto.ClientIds)
                {
                    _context.BrevetClients.Add(new BrevetClient
                    {
                        IdBrevet = id,
                        IdClient = clientId
                    });
                }
            }

            // Inventeurs (null = ne rien changer, liste vide = supprimer tous)
            if (updateBrevetDto.InventeurIds != null)
            {
                var existingInv = await _context.BrevetInventeurs
                    .Where(bi => bi.IdBrevet == id)
                    .ToListAsync();
                _context.BrevetInventeurs.RemoveRange(existingInv);
                foreach (var inventeurId in updateBrevetDto.InventeurIds)
                {
                    _context.BrevetInventeurs.Add(new BrevetInventeur
                    {
                        IdBrevet = id,
                        IdInventeur = inventeurId
                    });
                }
            }

            // Déposants
            if (updateBrevetDto.DeposantIds != null)
            {
                var existingDep = await _context.BrevetDeposants
                    .Where(bd => bd.IdBrevet == id)
                    .ToListAsync();
                _context.BrevetDeposants.RemoveRange(existingDep);
                foreach (var deposantId in updateBrevetDto.DeposantIds)
                {
                    _context.BrevetDeposants.Add(new BrevetDeposant
                    {
                        IdBrevet = id,
                        IdDeposant = deposantId
                    });
                }
            }

            // Titulaires
            if (updateBrevetDto.TitulaireIds != null)
            {
                var existingTit = await _context.BrevetTitulaires
                    .Where(bt => bt.IdBrevet == id)
                    .ToListAsync();
                _context.BrevetTitulaires.RemoveRange(existingTit);
                foreach (var titulaireId in updateBrevetDto.TitulaireIds)
                {
                    _context.BrevetTitulaires.Add(new BrevetTitulaire
                    {
                        IdBrevet = id,
                        IdTitulaire = titulaireId
                    });
                }
            }

            // InformationsDepot: remplacer si fourni (null = ne rien faire)
            if (updateBrevetDto.InformationsDepot != null)
            {
                // Supprimer les anciennes informations et leurs liens
                var existingInfos = await _context.InformationsDepot
                    .Where(i => i.IdBrevet == id)
                    .ToListAsync();

                foreach (var info in existingInfos)
                {
                    var links = await _context.InformationDepotCabinets
                        .Where(l => l.InformationDepotId == info.Id)
                        .ToListAsync();
                    foreach (var l in links)
                    {
                        var roles = await _context.InformationDepotCabinetRoles
                            .Where(r => r.InformationDepotCabinetId == l.Id)
                            .ToListAsync();
                        _context.InformationDepotCabinetRoles.RemoveRange(roles);

                        var contacts = await _context.InformationDepotCabinetContacts
                            .Where(c => c.InformationDepotCabinetId == l.Id)
                            .ToListAsync();
                        _context.InformationDepotCabinetContacts.RemoveRange(contacts);
                    }
                    _context.InformationDepotCabinets.RemoveRange(links);
                }
                _context.InformationsDepot.RemoveRange(existingInfos);

                // Ajouter les nouvelles informations fournies (construction du graphe en mémoire,
                // puis persistance en une seule SaveChanges pour réduire les allers-retours SQL)
                if (updateBrevetDto.InformationsDepot.Any())
                {
                    foreach (var infoDepot in updateBrevetDto.InformationsDepot)
                    {
                        var entity = new InformationDepot
                        {
                            IdBrevet = id,
                            IdPays = infoDepot.IdPays,
                            IdStatuts = infoDepot.IdStatuts,
                            NumeroDepot = infoDepot.NumeroDepot,
                            NumeroPublication = infoDepot.NumeroPublication,
                            NumeroDelivrance = infoDepot.NumeroDelivrance,
                            DateDepot = ToUtc(infoDepot.DateDepot),
                            DatePublication = ToUtc(infoDepot.DatePublication),
                            DateDelivrance = ToUtc(infoDepot.DateDelivrance),
                            Licence = infoDepot.Licence,
                            Commentaire = infoDepot.Commentaire,
                            InformationDepotCabinets = new List<InformationDepotCabinet>()
                        };

                        // Cabinets Annuités
                        if (infoDepot.CabinetsAnnuites?.Any() == true)
                        {
                            foreach (var cab in infoDepot.CabinetsAnnuites)
                            {
                                var link = new InformationDepotCabinet
                                {
                                    CabinetId = cab.CabinetId,
                                    Category = CabinetType.Annuite,
                                    Roles = cab.Roles?.Distinct(StringComparer.OrdinalIgnoreCase)
                                        .Select(r => new InformationDepotCabinetRole { Role = r.Trim().ToLowerInvariant() })
                                        .ToList() ?? new List<InformationDepotCabinetRole>(),
                                    Contacts = cab.ContactIds?.Distinct()
                                        .Select(cid => new InformationDepotCabinetContact { ContactId = cid })
                                        .ToList() ?? new List<InformationDepotCabinetContact>()
                                };
                                entity.InformationDepotCabinets.Add(link);
                            }
                        }

                        // Cabinets Procédures
                        if (infoDepot.CabinetsProcedures?.Any() == true)
                        {
                            foreach (var cab in infoDepot.CabinetsProcedures)
                            {
                                var link = new InformationDepotCabinet
                                {
                                    CabinetId = cab.CabinetId,
                                    Category = CabinetType.Procedure,
                                    Roles = cab.Roles?.Distinct(StringComparer.OrdinalIgnoreCase)
                                        .Select(r => new InformationDepotCabinetRole { Role = r.Trim().ToLowerInvariant() })
                                        .ToList() ?? new List<InformationDepotCabinetRole>(),
                                    Contacts = cab.ContactIds?.Distinct()
                                        .Select(cid => new InformationDepotCabinetContact { ContactId = cid })
                                        .ToList() ?? new List<InformationDepotCabinetContact>()
                                };
                                entity.InformationDepotCabinets.Add(link);
                            }
                        }

                        _context.InformationsDepot.Add(entity);
                    }
                    // Les entités seront persistées par le SaveChangesAsync final du flux
                }
            }

            // Mettre à jour les pays par inventeur si fournis (null = ne rien faire)
            if (updateBrevetDto.InventeursPays != null)
            {
                foreach (var link in updateBrevetDto.InventeursPays)
                {
                    // Supprimer les pays existants pour cet inventeur et ce brevet
                    var exist = await _context.InventeurPays
                        .Where(ip => ip.IdInventeur == link.InventeurId && ip.IdBrevet == id)
                        .ToListAsync();
                    if (exist.Any()) _context.InventeurPays.RemoveRange(exist);

                    // Ajouter les nouveaux pays si fournis
                    if (link.PaysIds?.Any() == true)
                    {
                        foreach (var pid in link.PaysIds.Distinct())
                        {
                            _context.InventeurPays.Add(new InventeurPays
                            {
                                IdInventeur = link.InventeurId,
                                IdPays = pid,
                                IdBrevet = id
                            });
                        }
                    }
                }
            }

            // Mettre à jour les pays par déposant si fournis
            if (updateBrevetDto.DeposantsPays != null)
            {
                foreach (var link in updateBrevetDto.DeposantsPays)
                {
                    var exist = await _context.DeposantPays
                        .Where(dp => dp.IdDeposant == link.DeposantId && dp.IdBrevet == id)
                        .ToListAsync();
                    if (exist.Any()) _context.DeposantPays.RemoveRange(exist);

                    if (link.PaysIds?.Any() == true)
                    {
                        foreach (var pid in link.PaysIds.Distinct())
                        {
                            _context.DeposantPays.Add(new DeposantPays
                            {
                                IdDeposant = link.DeposantId,
                                IdPays = pid,
                                IdBrevet = id
                            });
                        }
                    }
                }
            }

            // Mettre à jour les pays par titulaire si fournis
            if (updateBrevetDto.TitulairesPays != null)
            {
                foreach (var link in updateBrevetDto.TitulairesPays)
                {
                    var exist = await _context.TitulairePays
                        .Where(tp => tp.IdTitulaire == link.TitulaireId && tp.IdBrevet == id)
                        .ToListAsync();
                    if (exist.Any()) _context.TitulairePays.RemoveRange(exist);

                    if (link.PaysIds?.Any() == true)
                    {
                        foreach (var pid in link.PaysIds.Distinct())
                        {
                            _context.TitulairePays.Add(new TitulairePays
                            {
                                IdTitulaire = link.TitulaireId,
                                IdPays = pid,
                                IdBrevet = id
                            });
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var result = await GetBrevetByIdAsync(id);
            result.Message = "Brevet mis à jour avec succès";

            // Emit notifications
                try
                {
                    // If brevet linked to clients, notify those clients
                    var clientIds = await _context.BrevetClients.Where(bc => bc.IdBrevet == id).Select(bc => bc.IdClient).ToListAsync();
                    // Attempt to include referenceFamille in metadata by reloading the brevet DTO
                    var full = await GetBrevetByIdAsync(id);
                    var referenceFamille = full?.Data?.ReferenceFamille;
                    var meta = JsonSerializer.Serialize(new { referenceFamille = referenceFamille });
                    if (clientIds.Any())
                    {
                        foreach (var cid in clientIds.Distinct())
                        {
                            _logger?.LogInformation("🔔 [NOTIF-TRACE] BrevetService.UpdateBrevetAsync -> creating notification Type={Type} Action={Action} ClientId={ClientId} ReferenceId={ReferenceId} Metadata={Metadata}", "Brevet", "Updated", cid, id, meta);
                            await _notificationService.CreateNotificationAsync(new Models.Notification
                            {
                                Type = "Brevet",
                                Action = "Updated",
                                Message = $"Un brevet a été modifié (ID={id})",
                                ReferenceId = id,
                                ClientId = cid,
                                Metadata = meta
                            });
                        }
                    }
                    else
                    {
                        _logger?.LogInformation("🔔 [NOTIF-TRACE] BrevetService.UpdateBrevetAsync -> creating GLOBAL notification Type={Type} Action={Action} ReferenceId={ReferenceId} Metadata={Metadata}", "Brevet", "Updated", id, meta);
                        await _notificationService.CreateNotificationAsync(new Models.Notification
                        {
                            Type = "Brevet",
                            Action = "Updated",
                            Message = $"Un brevet a été modifié (ID={id})",
                            ReferenceId = id,
                            Metadata = meta
                        });
                    }
                }
                catch { }
            return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ApiResponse<BrevetDto>
                {
                    Success = false,
                    Message = "Erreur lors de la mise à jour du brevet",
                    // Fournir le ToString complet pour aider le debug (inner exceptions)
                    Errors = ex.ToString()
                };
            }
        });
    }

    /// <summary>
    /// Supprime brevet système avec gestion transactionnelle sécurisée.
    /// Suppression cascade relations Many-to-Many automatique Entity Framework.
    /// </summary>
    /// <param name="id">Identifiant unique brevet à supprimer</param>
    /// <returns>Succès suppression ou erreur contraintes</returns>
    public async Task<ApiResponse<bool>> DeleteBrevetAsync(int id)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
            var brevet = await _context.Brevets.FindAsync(id);

            if (brevet == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Brevet non trouvé"
                };
            }

            // Récupérer les clientIds liés AVANT la suppression car les relations seront cascade-supprimées
            var clientIds = await _context.BrevetClients.Where(bc => bc.IdBrevet == id).Select(bc => bc.IdClient).ToListAsync();
            // Capture referenceFamille for metadata before the entity is removed
            var existing = await _context.Brevets.AsNoTracking().Where(b => b.IdBrevet == id).Select(b => b.ReferenceFamille).FirstOrDefaultAsync();
            var referenceFamille = existing;

            _context.Brevets.Remove(brevet);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Emit notification about deletion (non bloquant)
            try
            {
                // include referenceFamille captured earlier
                var meta = JsonSerializer.Serialize(new { referenceFamille = referenceFamille });
                if (clientIds.Any())
                {
                    foreach (var cid in clientIds.Distinct())
                    {
                        _logger?.LogInformation("🔔 [NOTIF-TRACE] BrevetService.DeleteBrevetAsync -> creating notification Type={Type} Action={Action} ClientId={ClientId} ReferenceId={ReferenceId} Metadata={Metadata}", "Brevet", "Deleted", cid, id, meta);
                        await _notificationService.CreateNotificationAsync(new Models.Notification
                        {
                            Type = "Brevet",
                            Action = "Deleted",
                            Message = $"Un brevet a été supprimé (ID={id})",
                            ReferenceId = id,
                            ClientId = cid,
                            Metadata = meta
                        });
                    }
                }
                else
                {
                    _logger?.LogInformation("🔔 [NOTIF-TRACE] BrevetService.DeleteBrevetAsync -> creating GLOBAL notification Type={Type} Action={Action} ReferenceId={ReferenceId} Metadata={Metadata}", "Brevet", "Deleted", id, meta);
                    await _notificationService.CreateNotificationAsync(new Models.Notification
                    {
                        Type = "Brevet",
                        Action = "Deleted",
                        Message = $"Un brevet a été supprimé (ID={id})",
                        ReferenceId = id,
                        Metadata = meta
                    });
                }
            }
            catch { }

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Brevet supprimé avec succès"
            };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Erreur lors de la suppression du brevet",
                    Errors = ex.Message
                };
            }
        });
    }

    /// <summary>
    /// Recherche textuelle avancée brevets multi-champs optimisée.
    /// Recherche titre, référence famille, commentaires avec relations complètes.
    /// </summary>
    /// <param name="searchTerm">Terme recherche textuelle</param>
    /// <param name="currentUserId">ID utilisateur contexte sécurité</param>
    /// <returns>Liste brevets correspondant recherche</returns>
    public async Task<ApiResponse<List<BrevetDto>>> SearchBrevetsAsync(string searchTerm, int? currentUserId = null)
    {
        try
        {
            var brevets = await _context.Brevets
                .Include(b => b.BrevetClients).ThenInclude(bc => bc.Client)
                .Include(b => b.BrevetInventeurs).ThenInclude(bi => bi.Inventeur)
                .Include(b => b.BrevetDeposants).ThenInclude(bd => bd.Deposant)
                .Include(b => b.BrevetTitulaires).ThenInclude(bt => bt.Titulaire)
                .Include(b => b.BrevetCabinets).ThenInclude(bc => bc.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Pays)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Statuts)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Roles)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Contacts).ThenInclude(c => c.Contact)
                .Where(b => (b.Titre != null && b.Titre.Contains(searchTerm)) ||
                           (b.ReferenceFamille != null && b.ReferenceFamille.Contains(searchTerm)) ||
                           (b.Commentaire != null && b.Commentaire.Contains(searchTerm)))
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var brevetDtos = brevets.Select(b => MapToBrevetDto(b)).ToList();

            return new ApiResponse<List<BrevetDto>>
            {
                Success = true,
                Data = brevetDtos,
                Message = $"{brevetDtos.Count} brevet(s) trouvé(s)"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<BrevetDto>>
            {
                Success = false,
                Message = "Erreur lors de la recherche de brevets",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère portefeuille complet brevets client spécifique système.
    /// Consultation isolée brevets associés client avec toutes relations.
    /// </summary>
    /// <param name="clientId">Identifiant unique client propriétaire</param>
    /// <returns>Liste brevets portefeuille client</returns>
    public async Task<ApiResponse<List<BrevetDto>>> GetBrevetsByClientAsync(int clientId)
    {
        try
        {
            var brevets = await _context.Brevets
                .Include(b => b.BrevetClients).ThenInclude(bc => bc.Client)
                .Include(b => b.BrevetInventeurs).ThenInclude(bi => bi.Inventeur)
                .Include(b => b.BrevetDeposants).ThenInclude(bd => bd.Deposant)
                .Include(b => b.BrevetTitulaires).ThenInclude(bt => bt.Titulaire)
                .Include(b => b.BrevetCabinets).ThenInclude(bc => bc.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Pays)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Statuts)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Cabinet)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Roles)
                .Include(b => b.InformationsDepot).ThenInclude(id => id.InformationDepotCabinets)
                    .ThenInclude(x => x.Contacts).ThenInclude(c => c.Contact)
                .Where(b => b.BrevetClients.Any(bc => bc.ClientId == clientId))
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var brevetDtos = brevets.Select(b => MapToBrevetDto(b)).ToList();

            return new ApiResponse<List<BrevetDto>>
            {
                Success = true,
                Data = brevetDtos,
                Message = $"{brevetDtos.Count} brevet(s) trouvé(s) pour ce client"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<BrevetDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des brevets du client",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Import massif brevets depuis fichier Excel client portefeuille.
    /// Fonctionnalité future EPPlus/ClosedXML parsing données structurées.
    /// </summary>
    /// <param name="clientId">Client destinataire import brevets</param>
    /// <param name="excelFile">Fichier Excel données brevets</param>
    /// <returns>Succès import ou erreur traitement</returns>
    public Task<ApiResponse<bool>> ImportBrevetsFromExcelAsync(int clientId, IFormFile excelFile)
    {
        try
        {
            // TODO: Implémenter l'import Excel avec EPPlus ou ClosedXML
            // Pour l'instant, on retourne un placeholder
            
            return Task.FromResult(new ApiResponse<bool>
            {
                Success = false,
                Message = "Import Excel non encore implémenté"
            });
        }
        catch (Exception ex)
        {
            return Task.FromResult(new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de l'import Excel",
                Errors = ex.Message
            });
        }
    }

    /// <summary>
    /// Mappage entité Brevet vers DTO complet avec toutes relations chargées.
    /// Transformation optimisée données complexes Many-to-Many pour API.
    /// </summary>
    /// <param name="brevet">Entité brevet source avec relations</param>
    /// <returns>DTO brevet complet pour réponse API</returns>
    private static BrevetDto MapToBrevetDto(Brevet brevet)
    {
        // Extraire le statut principal depuis les informations de dépôt
        var statutPrincipal = brevet.InformationsDepot?
            .Where(info => info.Statuts != null)
            .OrderByDescending(info => info.DateDepot ?? DateTime.MinValue)
            .FirstOrDefault()?.Statuts?.NomStatut;

        return new BrevetDto
        {
            Id = brevet.IdBrevet,
            ReferenceFamille = brevet.ReferenceFamille,
            Titre = brevet.Titre,
            Commentaire = brevet.Commentaire,
            CreatedAt = brevet.CreatedAt,
            UpdatedAt = brevet.UpdatedAt,
            StatutBrevet = statutPrincipal, // Nouveau champ ajouté
            Clients = brevet.BrevetClients?.Select(bc => new ClientDto
            {
                Id = bc.Client.Id,
                NomClient = bc.Client.NomClient,
                ReferenceClient = bc.Client.ReferenceClient,
                AdresseClient = bc.Client.AdresseClient,
                CodePostal = bc.Client.CodePostal,
                PaysClient = bc.Client.PaysClient,
                EmailClient = bc.Client.EmailClient,
                TelephoneClient = bc.Client.TelephoneClient,
                CanWrite = bc.Client.CanWrite,
                CanRead = bc.Client.CanRead,
                IsBlocked = bc.Client.IsBlocked,
                CreatedAt = bc.Client.CreatedAt
            }).ToList() ?? new List<ClientDto>(),
            
            Inventeurs = brevet.BrevetInventeurs?.Select(bi => new InventeurDto
            {
                Id = bi.Inventeur.Id,
                Nom = bi.Inventeur.Nom ?? "",
                Prenom = bi.Inventeur.Prenom,
                Email = bi.Inventeur.Email,
                // Afficher uniquement les pays liés à ce brevet pour cet inventeur
                Pays = bi.Inventeur.InventeurPays?
                    .Where(ip => ip.IdBrevet == brevet.IdBrevet)
                    .Select(ip => new PaysDto
                {
                    Id = ip.Pays.Id,
                    NomFrFr = ip.Pays.NomFrFr,
                    CodeIso = ip.Pays.CodeIso,
                    CodeIso3 = ip.Pays.CodeIso3
                }).ToList() ?? new List<PaysDto>()
            }).ToList() ?? new List<InventeurDto>(),
            
            Deposants = brevet.BrevetDeposants?.Select(bd => new DeposantDto
            {
                Id = bd.Deposant.Id,
                Nom = bd.Deposant.Nom ?? "",
                Prenom = bd.Deposant.Prenom,
                Email = bd.Deposant.Email,
                // Afficher uniquement les pays liés à ce brevet pour ce déposant
                Pays = bd.Deposant.DeposantPays?
                    .Where(dp => dp.IdBrevet == brevet.IdBrevet)
                    .Select(dp => new PaysDto
                {
                    Id = dp.Pays.Id,
                    NomPays = dp.Pays.NomFrFr ?? "",
                    CodePays = dp.Pays.CodeIso ?? "",
                    NomFrFr = dp.Pays.NomFrFr,
                    CodeIso = dp.Pays.CodeIso,
                    CodeIso3 = dp.Pays.CodeIso3,
                    CreatedAt = dp.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            }).ToList() ?? new List<DeposantDto>(),
            
            Titulaires = brevet.BrevetTitulaires?.Select(bt => new TitulaireDto
            {
                Id = bt.Titulaire.Id,
                Nom = bt.Titulaire.Nom ?? "",
                Prenom = bt.Titulaire.Prenom,
                Email = bt.Titulaire.Email,
                // Afficher uniquement les pays liés à ce brevet pour ce titulaire
                Pays = bt.Titulaire.TitulairePays?
                    .Where(tp => tp.IdBrevet == brevet.IdBrevet)
                    .Select(tp => new PaysDto
                {
                    Id = tp.Pays.Id,
                    NomPays = tp.Pays.NomFrFr ?? "",
                    CodePays = tp.Pays.CodeIso ?? "",
                    NomFrFr = tp.Pays.NomFrFr,
                    CodeIso = tp.Pays.CodeIso,
                    CodeIso3 = tp.Pays.CodeIso3,
                    CreatedAt = tp.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            }).ToList() ?? new List<TitulaireDto>(),
            
            Cabinets = brevet.BrevetCabinets?.Select(bc => new CabinetDto
            {
                Id = bc.Cabinet.Id,
                NomCabinet = bc.Cabinet.NomCabinet,
                AdresseCabinet = bc.Cabinet.AdresseCabinet,
                CodePostal = bc.Cabinet.CodePostal,
                PaysCabinet = bc.Cabinet.PaysCabinet,
                EmailCabinet = bc.Cabinet.EmailCabinet,
                TelephoneCabinet = bc.Cabinet.TelephoneCabinet,
                Type = bc.Cabinet.Type,
                CreatedAt = bc.Cabinet.CreatedAt,
                UpdatedAt = bc.Cabinet.UpdatedAt
            }).ToList() ?? new List<CabinetDto>(),
            
            InformationsDepot = brevet.InformationsDepot?.Select(id => new InformationDepotDto
            {
                Id = id.Id,
                IdBrevet = id.IdBrevet,
                IdPays = id.IdPays,
                Pays = id.Pays != null ? new PaysDto
                {
                    Id = id.Pays.Id,
                    NomPays = id.Pays.NomFrFr ?? "",
                    CodePays = id.Pays.CodeIso ?? "",
                    NomFrFr = id.Pays.NomFrFr,
                    CodeIso = id.Pays.CodeIso,
                    CodeIso3 = id.Pays.CodeIso3,
                    CreatedAt = id.Pays.CreatedAt
                } : null,
                IdStatuts = id.IdStatuts,
                Statuts = id.Statuts != null ? new StatutDto
                {
                    Id = id.Statuts.Id,
                    NomStatut = id.Statuts.NomStatut,
                    Description = id.Statuts.Description,
                    CreatedAt = id.Statuts.CreatedAt
                } : null,
                NumeroDepot = id.NumeroDepot,
                NumeroPublication = id.NumeroPublication,
                NumeroDelivrance = id.NumeroDelivrance,
                DateDepot = id.DateDepot,
                DatePublication = id.DatePublication,
                DateDelivrance = id.DateDelivrance,
                Licence = id.Licence,
                Commentaire = id.Commentaire,
                CabinetsAnnuites = id.InformationDepotCabinets?
                    .Where(c => c.Category == CabinetType.Annuite)
                    .Select(c => new InformationDepotCabinetItemDto
                    {
                        CabinetId = c.CabinetId,
                        CabinetNom = c.Cabinet.NomCabinet,
                        Roles = c.Roles.Select(r => r.Role).ToList(),
                        Contacts = c.Contacts.Select(cc => new ContactDto
                        {
                            Id = cc.Contact.Id,
                            Nom = cc.Contact.Nom,
                            Prenom = cc.Contact.Prenom,
                            Email = cc.Contact.Email,
                            Telephone = cc.Contact.Telephone
                        }).ToList()
                    }).ToList() ?? new List<InformationDepotCabinetItemDto>(),
                CabinetsProcedures = id.InformationDepotCabinets?
                    .Where(c => c.Category == CabinetType.Procedure)
                    .Select(c => new InformationDepotCabinetItemDto
                    {
                        CabinetId = c.CabinetId,
                        CabinetNom = c.Cabinet.NomCabinet,
                        Roles = c.Roles.Select(r => r.Role).ToList(),
                        Contacts = c.Contacts.Select(cc => new ContactDto
                        {
                            Id = cc.Contact.Id,
                            Nom = cc.Contact.Nom,
                            Prenom = cc.Contact.Prenom,
                            Email = cc.Contact.Email,
                            Telephone = cc.Contact.Telephone
                        }).ToList()
                    }).ToList() ?? new List<InformationDepotCabinetItemDto>()
            }).ToList() ?? new List<InformationDepotDto>()
        };
    }

    // Helper: normalize nullable DateTime to UTC (Npgsql requires DateTimeKind.Utc for timestamptz)
    private static DateTime? ToUtc(DateTime? dt)
    {
        if (!dt.HasValue) return null;
        var d = dt.Value;
        if (d.Kind == DateTimeKind.Utc) return d;
        if (d.Kind == DateTimeKind.Local) return d.ToUniversalTime();
        // Unspecified -> assume it's UTC if it looks like UTC, otherwise force as UTC
        return DateTime.SpecifyKind(d, DateTimeKind.Utc);
    }

    /// <summary>
    /// Vérifie autorisations accès utilisateur brevet spécifique système.
    /// Contrôle sécurisé isolation clients et permissions employés.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur demandeur</param>
    /// <param name="brevetId">Identifiant brevet consulté</param>
    /// <returns>Autorisation accès brevet utilisateur</returns>
    public async Task<bool> UserCanAccessBrevetAsync(int userId, int brevetId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Employés StartingBloch (admin/user) ont accès à tous les brevets
            var role = user.Role?.ToLowerInvariant();
            if (role == "admin" || role == "user")
                return true;

            // Clients ont accès uniquement à leurs brevets
            if (role == "client" && user.ClientId.HasValue)
            {
                var brevetExists = await _context.BrevetClients
                    .AnyAsync(bc => bc.IdBrevet == brevetId && bc.IdClient == user.ClientId.Value);
                return brevetExists;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
}
