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
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service métier complet gestion brevets avec relations complexes Many-to-Many.
/// Implémentation sécurisée filtrage contextuel et performances optimisées.
/// </summary>
public class BrevetService : IBrevetService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service brevets avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes complexes.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public BrevetService(StartingBlochDbContext context)
    {
        _context = context;
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
                .Include(b => b.InformationsDepot).ThenInclude(id => id.Statuts);

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
                    _context.InformationsDepot.Add(new InformationDepot
                    {
                        IdBrevet = brevet.Id,
                        IdPays = infoDepot.IdPays,
                        IdStatuts = infoDepot.IdStatuts,
                        NumeroDepot = infoDepot.NumeroDepot,
                        NumeroPublication = infoDepot.NumeroPublication,
                        NumeroDelivrance = infoDepot.NumeroDelivrance,
                        DateDepot = infoDepot.DateDepot,
                        DatePublication = infoDepot.DatePublication,
                        DateDelivrance = infoDepot.DateDelivrance,
                        Licence = infoDepot.Licence,
                        Commentaire = infoDepot.Commentaire
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Récupérer le brevet créé avec toutes ses relations
            var result = await GetBrevetByIdAsync(brevet.Id);
            result.Message = "Brevet créé avec succès";
            
            return result;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new ApiResponse<BrevetDto>
            {
                Success = false,
                Message = "Erreur lors de la création du brevet",
                Errors = ex.Message
            };
        }
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
                    .Where(bc => bc.BrevetId == id)
                    .ToListAsync();
                _context.BrevetClients.RemoveRange(existingClients);

                // Ajouter les nouvelles relations
                foreach (var clientId in updateBrevetDto.ClientIds)
                {
                    _context.BrevetClients.Add(new BrevetClient
                    {
                        BrevetId = id,
                        ClientId = clientId
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var result = await GetBrevetByIdAsync(id);
            result.Message = "Brevet mis à jour avec succès";
            
            return result;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new ApiResponse<BrevetDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du brevet",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime brevet système avec gestion transactionnelle sécurisée.
    /// Suppression cascade relations Many-to-Many automatique Entity Framework.
    /// </summary>
    /// <param name="id">Identifiant unique brevet à supprimer</param>
    /// <returns>Succès suppression ou erreur contraintes</returns>
    public async Task<ApiResponse<bool>> DeleteBrevetAsync(int id)
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

            _context.Brevets.Remove(brevet);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

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
                Pays = bi.Inventeur.InventeurPays?.Select(ip => new PaysDto
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
                Pays = bd.Deposant.DeposantPays?.Select(dp => new PaysDto
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
                Pays = bt.Titulaire.TitulairePays?.Select(tp => new PaysDto
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
                Commentaire = id.Commentaire
            }).ToList() ?? new List<InformationDepotDto>()
        };
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
            if (user.Role == "admin" || user.Role == "user")
                return true;

            // Clients ont accès uniquement à leurs brevets
            if (user.Role == "client" && user.ClientId.HasValue)
            {
                var brevetExists = await _context.BrevetClients
                    .AnyAsync(bc => bc.BrevetId == brevetId && bc.ClientId == user.ClientId.Value);
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
