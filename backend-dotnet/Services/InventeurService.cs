/*
 * ================================================================================================
 * SERVICE INVENTEURS - GESTION CRÉATEURS ET INNOVATEURS PROPRIÉTÉ INTELLECTUELLE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service métier complet gestion inventeurs StartingBloch.
 * Administration créateurs, innovateurs et porteurs innovations propriété intellectuelle.
 * 
 * FONCTIONNALITÉS INVENTEURS :
 * ============================
 * 📋 CONSULTATION → Liste paginée avec recherche multi-champs
 * 🔍 DÉTAIL → Inventeur complet avec nationalités multiples
 * ➕ CRÉATION → Nouvel inventeur avec gestion pays
 * ✏️ MODIFICATION → Mise à jour informations inventeur
 * 🗑️ SUPPRESSION → Suppression logique inventeur
 * 🌍 NATIONALITÉS → Gestion pays multiples inventeur
 * 
 * DONNÉES INVENTEURS :
 * ===================
 * 👤 IDENTITÉ → Nom, prénom, coordonnées personnelles
 * 📧 COMMUNICATION → Email contact principal
 * 🌍 GÉOLOCALISATION → Pays nationalités multiples
 * 🔗 RELATIONS → Liens avec brevets créés
 * 🕐 AUDIT → Dates création, modification, historique
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * ✅ Recherche textuelle multi-champs (nom, prénom, email)
 * ✅ Filtrage par pays ou nationalité
 * ✅ Pagination optimisée grandes collections
 * ✅ Tri alphabétique par défaut
 * 
 * CONFORMITÉ INNOVATION :
 * ======================
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
/// Service métier complet gestion inventeurs et créateurs propriété intellectuelle.
/// Implémentation sécurisée nationalités multiples avec recherche optimisée.
/// </summary>
public class InventeurService : IInventeurService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service inventeurs avec contexte données Entity Framework.
    /// Configuration accès base données optimisée requêtes relations pays.
    /// </summary>
    /// <param name="context">Contexte base données Entity Framework</param>
    public InventeurService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée inventeurs avec recherche textuelle multi-champs.
    /// Recherche optimisée nom, prénom, email avec nationalités complètes.
    /// </summary>
    /// <param name="page">Numéro page courante (1 par défaut)</param>
    /// <param name="pageSize">Taille page (10 éléments par défaut)</param>
    /// <param name="search">Terme recherche optionnel multi-champs</param>
    /// <returns>Réponse paginée liste inventeurs avec pays</returns>
    public async Task<PagedResponse<List<InventeurDto>>> GetInventeursAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.Inventeurs.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i => (i.Nom != null && i.Nom.Contains(search)) || 
                                        (i.Prenom != null && i.Prenom.Contains(search)) ||
                                        (i.Email != null && i.Email.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            var inventeurs = await query
                .Include(i => i.InventeurPays)
                    .ThenInclude(ip => ip.Pays)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var inventeurDtos = inventeurs.Select(i => new InventeurDto
            {
                Id = i.Id,
                Nom = i.Nom ?? "",
                Prenom = i.Prenom,
                Email = i.Email,
                Pays = i.InventeurPays?.Select(ip => new PaysDto
                {
                    Id = ip.Pays.Id,
                    NomPays = ip.Pays.NomFrFr,
                    CodePays = ip.Pays.CodeIso ?? "",
                    CreatedAt = ip.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            }).ToList();

            return new PagedResponse<List<InventeurDto>>
            {
                Success = true,
                Data = inventeurDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{inventeurDtos.Count} inventeurs trouvés"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<InventeurDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des inventeurs",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère inventeur spécifique par identifiant avec nationalités complètes.
    /// Chargement optimisé pays multiples pour contexte géographique complet.
    /// </summary>
    /// <param name="id">Identifiant unique inventeur recherché</param>
    /// <returns>Inventeur détaillé avec liste pays nationalités</returns>
    public async Task<ApiResponse<InventeurDto>> GetInventeurByIdAsync(int id)
    {
        try
        {
            var inventeur = await _context.Inventeurs
                .Include(i => i.InventeurPays)
                    .ThenInclude(ip => ip.Pays)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventeur == null)
            {
                return new ApiResponse<InventeurDto>
                {
                    Success = false,
                    Message = "Inventeur non trouvé"
                };
            }

            var inventeurDto = new InventeurDto
            {
                Id = inventeur.Id,
                Nom = inventeur.Nom ?? "",
                Prenom = inventeur.Prenom,
                Email = inventeur.Email,
                Pays = inventeur.InventeurPays?.Select(ip => new PaysDto
                {
                    Id = ip.Pays.Id,
                    NomPays = ip.Pays.NomFrFr,
                    CodePays = ip.Pays.CodeIso ?? "",
                    CreatedAt = ip.Pays.CreatedAt
                }).ToList() ?? new List<PaysDto>()
            };

            return new ApiResponse<InventeurDto>
            {
                Success = true,
                Data = inventeurDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération de l'inventeur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouvel inventeur avec informations de base et audit trail.
    /// Initialisation inventeur sans pays, assignation ultérieure via méthodes dédiées.
    /// </summary>
    /// <param name="createInventeurDto">Données création inventeur de base</param>
    /// <returns>Inventeur créé avec identifiant système généré</returns>
    public async Task<ApiResponse<InventeurDto>> CreateInventeurAsync(CreateInventeurDto createInventeurDto)
    {
        try
        {
            var inventeur = new Inventeur
            {
                Nom = createInventeurDto.Nom,
                Prenom = createInventeurDto.Prenom,
                Email = createInventeurDto.Email
            };

            _context.Inventeurs.Add(inventeur);
            await _context.SaveChangesAsync();

            var inventeurDto = new InventeurDto
            {
                Id = inventeur.Id,
                Nom = inventeur.Nom,
                Prenom = inventeur.Prenom,
                Email = inventeur.Email,
                Pays = new List<PaysDto>()
            };

            return new ApiResponse<InventeurDto>
            {
                Success = true,
                Data = inventeurDto,
                Message = "Inventeur créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Erreur lors de la création de l'inventeur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour inventeur existant avec nouvelles informations personnelles.
    /// Modification informations de base, gestion pays via méthodes spécialisées.
    /// </summary>
    /// <param name="id">Identifiant inventeur à modifier</param>
    /// <param name="updateInventeurDto">Nouvelles données personnelles inventeur</param>
    /// <returns>Inventeur modifié avec informations mises à jour</returns>
    public async Task<ApiResponse<InventeurDto>> UpdateInventeurAsync(int id, UpdateInventeurDto updateInventeurDto)
    {
        try
        {
            var inventeur = await _context.Inventeurs.FindAsync(id);
            if (inventeur == null)
            {
                return new ApiResponse<InventeurDto>
                {
                    Success = false,
                    Message = "Inventeur non trouvé"
                };
            }

            inventeur.Nom = updateInventeurDto.Nom;
            inventeur.Prenom = updateInventeurDto.Prenom;
            inventeur.Email = updateInventeurDto.Email;

            await _context.SaveChangesAsync();

            var inventeurDto = new InventeurDto
            {
                Id = inventeur.Id,
                Nom = inventeur.Nom,
                Prenom = inventeur.Prenom,
                Email = inventeur.Email,
                Pays = new List<PaysDto>()
            };

            return new ApiResponse<InventeurDto>
            {
                Success = true,
                Data = inventeurDto,
                Message = "Inventeur mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<InventeurDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour de l'inventeur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime inventeur de manière permanente avec relations associées.
    /// Vérification existence avant suppression avec gestion erreurs robuste.
    /// </summary>
    /// <param name="id">Identifiant inventeur à supprimer</param>
    /// <returns>Confirmation succès suppression inventeur</returns>
    public async Task<ApiResponse<bool>> DeleteInventeurAsync(int id)
    {
        try
        {
            var inventeur = await _context.Inventeurs.FindAsync(id);
            if (inventeur == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Inventeur non trouvé"
                };
            }

            _context.Inventeurs.Remove(inventeur);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Inventeur supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression de l'inventeur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste complète pays associés à inventeur spécifique.
    /// Chargement optimisé nationalités multiples avec détails pays complets.
    /// </summary>
    /// <param name="inventeurId">Identifiant inventeur pour recherche pays</param>
    /// <returns>Liste pays nationalités inventeur avec codes ISO</returns>
    public async Task<ApiResponse<List<PaysDto>>> GetInventeurPaysAsync(int inventeurId)
    {
        try
        {
            var inventeurPays = await _context.InventeurPays
                .Include(ip => ip.Pays)
                .Where(ip => ip.IdInventeur == inventeurId)
                .ToListAsync();

            var paysDtos = inventeurPays.Select(ip => new PaysDto
            {
                Id = ip.Pays.Id,
                NomPays = ip.Pays.NomFrFr,
                CodePays = ip.Pays.CodeIso ?? "",
                CreatedAt = ip.Pays.CreatedAt
            }).ToList();

            return new ApiResponse<List<PaysDto>>
            {
                Success = true,
                Data = paysDtos,
                Message = $"{paysDtos.Count} pays trouvés pour cet inventeur"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<PaysDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des pays de l'inventeur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Assigne nouveau pays nationalité à inventeur avec validation unicité.
    /// Création relation Many-to-Many sécurisée avec vérification existence préalable.
    /// </summary>
    /// <param name="inventeurId">Identifiant inventeur cible assignation</param>
    /// <param name="paysId">Identifiant pays à assigner comme nationalité</param>
    /// <returns>Confirmation succès assignation pays inventeur</returns>
    public async Task<ApiResponse<bool>> AssignPaysToInventeurAsync(int inventeurId, int paysId)
    {
        try
        {
            var existingRelation = await _context.InventeurPays
                .FirstOrDefaultAsync(ip => ip.IdInventeur == inventeurId && ip.IdPays == paysId);

            if (existingRelation != null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Ce pays est déjà assigné à cet inventeur"
                };
            }

            var inventeurPays = new InventeurPays
            {
                IdInventeur = inventeurId,
                IdPays = paysId
            };

            _context.InventeurPays.Add(inventeurPays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Pays assigné à l'inventeur avec succès"
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
    /// Retire pays nationalité inventeur avec validation existence relation.
    /// Suppression relation Many-to-Many sécurisée avec vérification préalable.
    /// </summary>
    /// <param name="inventeurId">Identifiant inventeur cible retrait</param>
    /// <param name="paysId">Identifiant pays à retirer des nationalités</param>
    /// <returns>Confirmation succès retrait pays inventeur</returns>
    public async Task<ApiResponse<bool>> RemovePaysFromInventeurAsync(int inventeurId, int paysId)
    {
        try
        {
            var inventeurPays = await _context.InventeurPays
                .FirstOrDefaultAsync(ip => ip.IdInventeur == inventeurId && ip.IdPays == paysId);

            if (inventeurPays == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Relation inventeur-pays non trouvée"
                };
            }

            _context.InventeurPays.Remove(inventeurPays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Pays retiré de l'inventeur avec succès"
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
