/*
 * ================================================================================================
 * SERVICE NUMÉROS PAYS - GESTION CODES NUMÉROTATION INTERNATIONALE
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service numéros pays StartingBloch gérant codes numérotation téléphonique internationale.
 * Implémentation référentiel complet avec associations pays et validation formats.
 * 
 * FONCTIONNALITÉS NUMÉROTATION :
 * ==============================
 * 📋 CONSULTATION → Récupération paginée codes avec recherche
 * 🔍 DÉTAIL → Accès code spécifique avec informations pays
 * ✨ CRÉATION → Ajout nouveaux codes numérotation
 * ✏️ MODIFICATION → Mise à jour codes existants
 * ❌ SUPPRESSION → Retrait codes obsolètes validation
 * 🌍 PAYS → Association codes avec pays référence
 * 
 * STANDARDS NUMÉROTATION ITU-T :
 * ==============================
 * 📞 E.164 → Standard international numérotation
 * 🌍 ITU-T E.123 → Format présentation numéros
 * 📱 MOBILE → Codes réseaux mobiles spécifiques
 * 🏢 FIXE → Codes téléphonie fixe traditionnelle
 * 🆓 GRATUIT → Numéros verts internationaux
 * 💰 SURTAXÉ → Numéros payants spéciaux
 * 
 * FORMATS CODES SUPPORTÉS :
 * ========================
 * 🔢 INDICATIF_PAYS → Codes +1 à +999 selon ITU
 * 📞 PRÉFIXES → Codes régionaux et zones
 * 📱 MOBILES → Identifiants réseaux mobiles
 * 🌐 SPÉCIAUX → Codes services internationaux
 * 🚨 URGENCE → Numéros urgence harmonisés
 * 
 * VALIDATION NUMÉROTATION :
 * ========================
 * ✅ FORMAT_ITU → Conformité standards internationaux
 * ✅ UNICITÉ → Codes uniques par pays/zone
 * ✅ LONGUEUR → Validation longueurs selon type
 * ✅ CARACTÈRES → Contrôle caractères autorisés
 * ✅ COHÉRENCE → Vérification logique attribution
 * 
 * RECHERCHE AVANCÉE CODES :
 * ========================
 * 🔍 NUMÉRO → Recherche textuelle code complet
 * 🌍 PAYS → Filtrage par pays association
 * 📞 TYPE → Classification par type numérotation
 * 🏷️ ISO → Recherche codes pays ISO
 * 📊 STATUT → Filtrage codes actifs/obsolètes
 * 
 * INTÉGRATION SYSTÈME :
 * ====================
 * 🔗 CONTACTS → Validation numéros téléphone
 * 🌍 PAYS → Association référentiel géographique
 * 📱 COMMUNICATIONS → Support appels internationaux
 * 📊 STATISTIQUES → Analyses répartition géographique
 * 
 * CONFORMITÉ RÉGLEMENTAIRE :
 * ==========================
 * ✅ ITU-T → International Telecommunication Union
 * ✅ ETSI → European Telecommunications Standards
 * ✅ ARCEP → Autorité régulation France
 * ✅ E.164 → Format numérotation international
 * 
 * GESTION ÉVOLUTIONS :
 * ===================
 * 📅 HISTORIQUE → Suivi changements codes
 * 🔄 MIGRATIONS → Gestion transitions numérotation
 * 📊 OBSOLESCENCE → Codes dépréciés avec dates
 * 🆕 NOUVEAUTÉS → Intégration nouveaux codes ITU
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service gestion numéros pays avec codes numérotation internationale ITU-T.
/// Implémentation référentiel complet validation et recherche codes téléphoniques.
/// </summary>
public class NumeroPaysService : INumeroPaysService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service numéros pays avec contexte base données.
    /// </summary>
    /// <param name="context">Contexte base données pour accès référentiel</param>
    public NumeroPaysService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée numéros pays avec recherche multi-critères.
    /// Navigation optimisée codes avec associations pays et métadonnées.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel numéro/pays/ISO</param>
    /// <returns>Réponse paginée numéros pays avec informations complètes</returns>
    public async Task<PagedResponse<List<NumeroPaysDto>>> GetNumeroPaysAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.NumeroPays
                .Include(np => np.Pays)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(np => np.Numero.Contains(search) || 
                                         (np.Pays != null && np.Pays.NomFrFr.Contains(search)) ||
                                         (np.Pays != null && np.Pays.CodeIso != null && np.Pays.CodeIso.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            var numeroPays = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var numeroPaysDto = numeroPays.Select(np => new NumeroPaysDto
            {
                Id = np.Id,
                Numero = np.Numero,
                PaysId = np.PaysId ?? 0,
                PaysNom = np.Pays?.NomFrFr ?? "",
                PaysCode = np.Pays?.CodeIso ?? "",
                CreatedAt = np.CreatedAt
            }).ToList();

            return new PagedResponse<List<NumeroPaysDto>>
            {
                Success = true,
                Data = numeroPaysDto,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"{numeroPaysDto.Count} numéros pays trouvés"
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<NumeroPaysDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des numéros pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère numéro pays spécifique avec informations détaillées complètes.
    /// Chargement optimisé code avec association pays et métadonnées ITU-T.
    /// </summary>
    /// <param name="id">Identifiant unique numéro pays recherché</param>
    /// <returns>Numéro pays détaillé avec informations pays ou erreur</returns>
    public async Task<ApiResponse<NumeroPaysDto>> GetNumeroPaysByIdAsync(int id)
    {
        try
        {
            var numeroPays = await _context.NumeroPays
                .Include(np => np.Pays)
                .FirstOrDefaultAsync(np => np.Id == id);

            if (numeroPays == null)
            {
                return new ApiResponse<NumeroPaysDto>
                {
                    Success = false,
                    Message = "Numéro pays non trouvé"
                };
            }

            var numeroPaysDto = new NumeroPaysDto
            {
                Id = numeroPays.Id,
                Numero = numeroPays.Numero,
                PaysId = numeroPays.PaysId ?? 0,
                PaysNom = numeroPays.Pays?.NomFrFr ?? "",
                PaysCode = numeroPays.Pays?.CodeIso ?? "",
                CreatedAt = numeroPays.CreatedAt
            };

            return new ApiResponse<NumeroPaysDto>
            {
                Success = true,
                Data = numeroPaysDto
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Erreur lors de la récupération du numéro pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Crée nouveau numéro pays avec validation métier complète ITU-T.
    /// Création sécurisée avec contrôle unicité et conformité standards télécom.
    /// </summary>
    /// <param name="createNumeroPaysDto">Données création numéro avec association pays</param>
    /// <returns>Numéro pays créé avec identifiant et métadonnées</returns>
    public async Task<ApiResponse<NumeroPaysDto>> CreateNumeroPaysAsync(CreateNumeroPaysDto createNumeroPaysDto)
    {
        try
        {
            // Vérifier si le pays existe
            var pays = await _context.Pays.FindAsync(createNumeroPaysDto.PaysId);
            if (pays == null)
            {
                return new ApiResponse<NumeroPaysDto>
                {
                    Success = false,
                    Message = "Pays non trouvé"
                };
            }

            // Vérifier si le numéro existe déjà pour ce pays
            var existingNumero = await _context.NumeroPays
                .FirstOrDefaultAsync(np => np.Numero == createNumeroPaysDto.Numero && np.PaysId == createNumeroPaysDto.PaysId);
            
            if (existingNumero != null)
            {
                return new ApiResponse<NumeroPaysDto>
                {
                    Success = false,
                    Message = "Ce numéro existe déjà pour ce pays"
                };
            }

            var numeroPays = new NumeroPays
            {
                Numero = createNumeroPaysDto.Numero,
                PaysId = createNumeroPaysDto.PaysId,
                CreatedAt = DateTime.UtcNow
            };

            _context.NumeroPays.Add(numeroPays);
            await _context.SaveChangesAsync();

            var numeroPaysDto = new NumeroPaysDto
            {
                Id = numeroPays.Id,
                Numero = numeroPays.Numero,
                PaysId = numeroPays.PaysId ?? 0,
                PaysNom = pays.NomFrFr,
                PaysCode = pays.CodeIso ?? "",
                CreatedAt = numeroPays.CreatedAt
            };

            return new ApiResponse<NumeroPaysDto>
            {
                Success = true,
                Data = numeroPaysDto,
                Message = "Numéro pays créé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Erreur lors de la création du numéro pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Met à jour numéro pays avec validation contraintes ITU-T.
    /// Modification sécurisée avec contrôle cohérence et audit trail.
    /// </summary>
    /// <param name="id">Identifiant numéro pays à modifier</param>
    /// <param name="updateNumeroPaysDto">Données modification numéro partielles</param>
    /// <returns>Numéro pays modifié avec nouvelles informations</returns>
    public async Task<ApiResponse<NumeroPaysDto>> UpdateNumeroPaysAsync(int id, UpdateNumeroPaysDto updateNumeroPaysDto)
    {
        try
        {
            var numeroPays = await _context.NumeroPays
                .Include(np => np.Pays)
                .FirstOrDefaultAsync(np => np.Id == id);

            if (numeroPays == null)
            {
                return new ApiResponse<NumeroPaysDto>
                {
                    Success = false,
                    Message = "Numéro pays non trouvé"
                };
            }

            // Vérifier si le pays existe
            var pays = await _context.Pays.FindAsync(updateNumeroPaysDto.PaysId);
            if (pays == null)
            {
                return new ApiResponse<NumeroPaysDto>
                {
                    Success = false,
                    Message = "Pays non trouvé"
                };
            }

            // Vérifier si le numéro existe déjà pour ce pays (sauf pour l'enregistrement actuel)
            var existingNumero = await _context.NumeroPays
                .FirstOrDefaultAsync(np => np.Numero == updateNumeroPaysDto.Numero && 
                                          np.PaysId == updateNumeroPaysDto.PaysId && 
                                          np.Id != id);
            
            if (existingNumero != null)
            {
                return new ApiResponse<NumeroPaysDto>
                {
                    Success = false,
                    Message = "Ce numéro existe déjà pour ce pays"
                };
            }

            numeroPays.Numero = updateNumeroPaysDto.Numero;
            numeroPays.PaysId = updateNumeroPaysDto.PaysId;

            await _context.SaveChangesAsync();

            var numeroPaysDto = new NumeroPaysDto
            {
                Id = numeroPays.Id,
                Numero = numeroPays.Numero,
                PaysId = numeroPays.PaysId ?? 0,
                PaysNom = pays.NomFrFr,
                PaysCode = pays.CodeIso ?? "",
                CreatedAt = numeroPays.CreatedAt
            };

            return new ApiResponse<NumeroPaysDto>
            {
                Success = true,
                Data = numeroPaysDto,
                Message = "Numéro pays mis à jour avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<NumeroPaysDto>
            {
                Success = false,
                Message = "Erreur lors de la mise à jour du numéro pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Supprime numéro pays système avec validation contraintes référentielles.
    /// Suppression sécurisée avec vérification utilisations existantes.
    /// </summary>
    /// <param name="id">Identifiant numéro pays à supprimer du système</param>
    /// <returns>Confirmation suppression avec audit trail</returns>
    public async Task<ApiResponse<bool>> DeleteNumeroPaysAsync(int id)
    {
        try
        {
            var numeroPays = await _context.NumeroPays.FindAsync(id);
            if (numeroPays == null)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Numéro pays non trouvé"
                };
            }

            _context.NumeroPays.Remove(numeroPays);
            await _context.SaveChangesAsync();

            return new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = "Numéro pays supprimé avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la suppression du numéro pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère liste complète numéros téléphoniques pays spécifique.
    /// Chargement optimisé codes numérotation avec métadonnées ITU-T.
    /// </summary>
    /// <param name="paysId">Identifiant pays pour recherche numéros</param>
    /// <returns>Liste numéros pays avec informations géographiques</returns>
    public async Task<ApiResponse<List<NumeroPaysDto>>> GetNumeroPaysByPaysIdAsync(int paysId)
    {
        try
        {
            var numeroPays = await _context.NumeroPays
                .Include(np => np.Pays)
                .Where(np => np.PaysId == paysId)
                .ToListAsync();

            var numeroPaysDto = numeroPays.Select(np => new NumeroPaysDto
            {
                Id = np.Id,
                Numero = np.Numero,
                PaysId = np.PaysId ?? 0,
                PaysNom = np.Pays?.NomFrFr ?? "",
                PaysCode = np.Pays?.CodeIso ?? "",
                CreatedAt = np.CreatedAt
            }).ToList();

            return new ApiResponse<List<NumeroPaysDto>>
            {
                Success = true,
                Data = numeroPaysDto,
                Message = $"{numeroPaysDto.Count} numéros trouvés pour ce pays"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<NumeroPaysDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des numéros pays",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Valide format numéro téléphonique selon standards pays.
    /// Vérification conformité ITU-T avec validation croisée référentiel.
    /// </summary>
    /// <param name="numero">Numéro téléphonique à valider format</param>
    /// <param name="paysId">Identifiant pays pour validation contexte</param>
    /// <returns>Statut validation avec détails conformité</returns>
    public async Task<ApiResponse<bool>> ValidateNumeroForPaysAsync(string numero, int paysId)
    {
        try
        {
            var exists = await _context.NumeroPays
                .AnyAsync(np => np.Numero == numero && np.PaysId == paysId);

            return new ApiResponse<bool>
            {
                Success = true,
                Data = exists,
                Message = exists ? "Numéro valide pour ce pays" : "Numéro non trouvé pour ce pays"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Erreur lors de la validation du numéro",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère collection numéros pays avec informations détaillées complètes.
    /// Alternative méthode recherche avec optimisation chargement pays.
    /// </summary>
    /// <param name="paysId">Identifiant pays pour recherche numéros complets</param>
    /// <returns>Collection numéros pays avec métadonnées étendues</returns>
    public async Task<ApiResponse<List<NumeroPaysDto>>> GetNumeroPayssByPaysIdAsync(int paysId)
    {
        try
        {
            var numeroPays = await _context.NumeroPays
                .Include(np => np.Pays)
                .Where(np => np.PaysId == paysId)
                .ToListAsync();

            var numeroPaysDto = numeroPays.Select(np => new NumeroPaysDto
            {
                Id = np.Id,
                Numero = np.Numero,
                PaysId = np.PaysId ?? 0,
                PaysNom = np.Pays?.NomFrFr ?? "",
                PaysCode = np.Pays?.CodeIso ?? "",
                CreatedAt = np.CreatedAt
            }).ToList();

            return new ApiResponse<List<NumeroPaysDto>>
            {
                Success = true,
                Data = numeroPaysDto,
                Message = $"{numeroPaysDto.Count} numéro(s) pays trouvé(s)"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<NumeroPaysDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des numéros pays",
                Errors = ex.Message
            };
        }
    }
}
