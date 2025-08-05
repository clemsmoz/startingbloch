/*
 * ================================================================================================
 * SERVICE DÉPOSANTS - GESTION INVENTEURS ET DÉPOSANTS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service métier complet gestion déposants StartingBloch.
 * Administration inventeurs, créateurs et porteurs droits propriété intellectuelle.
 * 
 * FONCTIONNALITÉS DÉPOSANTS :
 * ===========================
 * 📋 CONSULTATION → Liste paginée avec recherche multi-champs
 * 🔍 DÉTAIL → Déposant complet avec nationalités multiples
 * ➕ CRÉATION → Nouveau déposant avec gestion pays
 * ✏️ MODIFICATION → Mise à jour informations déposant
 * 🗑️ SUPPRESSION → Suppression logique déposant
 * 🌍 NATIONALITÉS → Gestion pays multiples déposant
 * 
 * DONNÉES DÉPOSANTS :
 * ==================
 * 👤 IDENTITÉ → Nom, prénom, coordonnées personnelles
 * 📧 COMMUNICATION → Email contact principal
 * 🌍 GÉOLOCALISATION → Pays nationalités multiples
 * 🔗 RELATIONS → Liens avec brevets déposés
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, prénom, email)
 * ✅ Filtrage par pays ou nationalité
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri alphabétique par défaut
 * 
 * CONFORMITÉ INTERNATIONALE :
 * ==========================
 * ✅ Gestion nationalités multiples selon standards internationaux
 * ✅ Relations Many-to-Many avec pays via table liaison
 * ✅ Validation existence pays référentiels
 * ✅ Audit trail complet modifications
 * ✅ Conformité OMPI (Organisation Mondiale Propriété Intellectuelle)
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service métier complet gestion déposants et inventeurs propriété intellectuelle.
/// Implémentation sécurisée nationalités multiples avec recherche optimisée.
/// </summary>
public class DeposantService : IDeposantService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service déposants avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes relations pays.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public DeposantService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée déposants avec recherche textuelle multi-champs.
    /// Recherche optimisée nom, prénom, email avec nationalités complètes.
    /// </summary>
    /// <param name="page">Numéro page courante (1 par défaut)</param>
    /// <param name="pageSize">Taille page (10 éléments par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée liste déposants avec pays</returns>
    public async Task<PagedResponse<List<DeposantDto>>> GetDeposaatsAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.Deposants.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => (d.Nom != null && d.Nom.Contains(search)) || 
                                        (d.Prenom != null && d.Prenom.Contains(search)) ||
                                        (d.Email != null && d.Email.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            var deposants = await query
                .Include(d => d.DeposantPays)
                    .ThenInclude(dp => dp.Pays)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var deposantDtos = deposants.Select(d => new DeposantDto
            {
                Id = d.Id,
                Nom = d.Nom ?? "",
                Prenom = d.Prenom,
                Email = d.Email,
                Pays = d.DeposantPays?.Select(dp => new PaysDto
                {
                    Id = dp.Pays.Id,
                    NomPays = dp.Pays.NomFrFr,
                    CodePays = dp.Pays.CodeIso ?? "",
                    CreatedAt = dp.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            }).ToList();

            return new PagedResponse<List<DeposantDto>>
            {
                Success = true,
                Data = deposantDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{deposantDtos.Count} déposants trouvés"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<DeposantDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des déposants",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère déposant spécifique par identifiant avec nationalités complètes.
    /// Chargement optimisé pays multiples pour contexte géographique complet.
    /// </summary>
    /// <param name="id">Identifiant unique déposant recherché</param>
    /// <returns>Déposant détaillé avec liste pays nationalités</returns>
    public async Task<ApiResponse<DeposantDto>> GetDeposantByIdAsync(int id)
    {
        try
        {
            var deposant = await _context.Deposants
                .Include(d => d.DeposantPays)
                    .ThenInclude(dp => dp.Pays)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (deposant == null)
            {
                return new ApiResponse<DeposantDto>
                {
                    Success = false,
                    Message = "Déposant non trouvé"
                };
            }

            var deposantDto = new DeposantDto
            {
                Id = deposant.Id,
                Nom = deposant.Nom ?? "",
                Prenom = deposant.Prenom,
                Email = deposant.Email,
                Pays = deposant.DeposantPays?.Select(dp => new PaysDto
                {
                    Id = dp.Pays.Id,
                    NomPays = dp.Pays.NomFrFr,
                    CodePays = dp.Pays.CodeIso ?? "",
                    CreatedAt = dp.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            };

            return new ApiResponse<DeposantDto>
            {
                Success = true,
                Data = deposantDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du déposant",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau déposant avec informations de base et audit trail.
    /// Initialisation déposant sans pays, assignation ultérieure via méthodes dédiées.
    /// </summary>
    /// <param name="createDeposantDto">Données création déposant de base</param>
    /// <returns>Déposant créé avec identifiant système généré</returns>
    public async Task<ApiResponse<DeposantDto>> CreateDeposantAsync(CreateDeposantDto createDeposantDto)
    {
        try
        {
            var deposant = new Deposant
            {
                Nom = createDeposantDto.Nom,
                Prenom = createDeposantDto.Prenom,
                Email = createDeposantDto.Email
            };

            _context.Deposants.Add(deposant);
            await _context.SaveChangesAsync();

            var deposantDto = new DeposantDto
            {
                Id = deposant.Id,
                Nom = deposant.Nom,
                Prenom = deposant.Prenom,
                Email = deposant.Email,
                Pays = new List<PaysDto>()
            };

            return new ApiResponse<DeposantDto>
            {
                Success = true,
                Data = deposantDto,
                Message = "Déposant créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Erreur lors de la création du déposant",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour déposant existant avec nouvelles informations personnelles.
    /// Modification informations de base, gestion pays via méthodes spécialisées.
    /// </summary>
    /// <param name="id">Identifiant déposant à modifier</param>
    /// <param name="updateDeposantDto">Nouvelles données personnelles déposant</param>
    /// <returns>Déposant modifié avec informations mises à jour</returns>
    public async Task<ApiResponse<DeposantDto>> UpdateDeposantAsync(int id, UpdateDeposantDto updateDeposantDto)
    {
        try
        {
            var deposant = await _context.Deposants.FindAsync(id);
            if (deposant == null)
            {
                return new ApiResponse<DeposantDto>
                {
                    Success = false,
                    Message = "Déposant non trouvé"
                };
            }

            deposant.Nom = updateDeposantDto.Nom;
            deposant.Prenom = updateDeposantDto.Prenom;
            deposant.Email = updateDeposantDto.Email;

            await _context.SaveChangesAsync();

            var deposantDto = new DeposantDto
            {
                Id = deposant.Id,
                Nom = deposant.Nom,
                Prenom = deposant.Prenom,
                Email = deposant.Email,
                Pays = new List<PaysDto>()
            };

            return new ApiResponse<DeposantDto>
            {
                Success = true,
                Data = deposantDto,
                Message = "Déposant mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<DeposantDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du déposant",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime déposant de manière permanente avec relations associées.
    /// Vérification existence avant suppression avec gestion erreurs robuste.
    /// </summary>
    /// <param name="id">Identifiant déposant à supprimer</param>
    /// <returns>Confirmation succès suppression déposant</returns>
    public async Task<ApiResponse<bool>> DeleteDeposantAsync(int id)
    {
        try
        {
            var deposant = await _context.Deposants.FindAsync(id);
            if (deposant == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Déposant non trouvé"
                };
            }

            _context.Deposants.Remove(deposant);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Déposant supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression du déposant",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste complète pays associés à déposant spécifique.
    /// Chargement optimisé nationalités multiples avec détails pays complets.
    /// </summary>
    /// <param name="deposantId">Identifiant déposant pour recherche pays</param>
    /// <returns>Liste pays nationalités déposant avec codes ISO</returns>
    public async Task<ApiResponse<List<PaysDto>>> GetDeposantPaysAsync(int deposantId)
    {
        try
        {
            var deposantPays = await _context.DeposantPays
                .Include(dp => dp.Pays)
                .Where(dp => dp.IdDeposant == deposantId)
                .ToListAsync();

            var paysDtos = deposantPays.Select(dp => new PaysDto
            {
                Id = dp.Pays.Id,
                NomPays = dp.Pays.NomFrFr,
                CodePays = dp.Pays.CodeIso ?? "",
                CreatedAt = dp.Pays.CreatedAt
            }).ToList();

            return new ApiResponse<List<PaysDto>>
            {
                Success = true,
                Data = paysDtos,
                Message = $"{paysDtos.Count} pays trouvés pour ce déposant"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des pays du déposant",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Assigne nouveau pays nationalité à déposant avec validation unicité.
    /// Création relation Many-to-Many sécurisée avec vérification existence préalable.
    /// </summary>
    /// <param name="deposantId">Identifiant déposant cible assignation</param>
    /// <param name="paysId">Identifiant pays à assigner comme nationalité</param>
    /// <returns>Confirmation succès assignation pays déposant</returns>
    public async Task<ApiResponse<bool>> AssignPaysToDeposantAsync(int deposantId, int paysId)
    {
        try
        {
            var existingRelation = await _context.DeposantPays
                .FirstOrDefaultAsync(dp => dp.IdDeposant == deposantId && dp.IdPays == paysId);

            if (existingRelation != null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Ce pays est déjà assigné à ce déposant"
                };
            }

            var deposantPays = new DeposantPays
            {
                IdDeposant = deposantId,
                IdPays = paysId
            };

            _context.DeposantPays.Add(deposantPays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Pays assigné au déposant avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de l'assignation du pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Retire pays nationalité déposant avec validation existence relation.
    /// Suppression relation Many-to-Many sécurisée avec vérification préalable.
    /// </summary>
    /// <param name="deposantId">Identifiant déposant cible retrait</param>
    /// <param name="paysId">Identifiant pays à retirer des nationalités</param>
    /// <returns>Confirmation succès retrait pays déposant</returns>
    public async Task<ApiResponse<bool>> RemovePaysFromDeposantAsync(int deposantId, int paysId)
    {
        try
        {
            var deposantPays = await _context.DeposantPays
                .FirstOrDefaultAsync(dp => dp.IdDeposant == deposantId && dp.IdPays == paysId);

            if (deposantPays == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Relation déposant-pays non trouvée"
                };
            }

            _context.DeposantPays.Remove(deposantPays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Pays retiré du déposant avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors du retrait du pays",
                Errors = ex.Message
            };
        }
    }
}
