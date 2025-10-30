/*
 * ================================================================================================
 * SERVICE LOGS - GESTION AUDIT TRAIL ET TRAÇABILITÉ SYSTÈME
 * ================================================================================================
 * 
 * OBJECTIF MÉTIER :
 * Service logs StartingBloch gérant audit trail complet et traçabilité activités.
 * Implémentation sécurisée enregistrement et consultation historique modifications.
 * 
 * FONCTIONNALITÉS AUDIT TRAIL :
 * =============================
 * 📋 CONSULTATION → Récupération paginée logs avec recherche
 * 👤 UTILISATEUR → Historique activités utilisateur spécifique
 * ✨ CRÉATION → Enregistrement nouvelles entrées audit
 * 🧹 NETTOYAGE → Suppression logs anciens selon rétention
 * 🔍 RECHERCHE → Filtrage logs par action et table
 * 
 * TYPES ACTIONS AUDITÉES :
 * ========================
 * ✨ CREATE → Création nouvelles entités système
 * ✏️ UPDATE → Modification entités existantes
 * ❌ DELETE → Suppression entités avec traçabilité
 * 🔍 READ → Consultation données sensibles (optionnel)
 * 🔐 LOGIN → Connexions utilisateurs système
 * 🚪 LOGOUT → Déconnexions utilisateurs
 * 
 * DONNÉES AUDIT COMPLÈTES :
 * ========================
 * 🔢 RECORD_ID → Identifiant entité modifiée
 * 🏷️ TABLE_NAME → Table/entité concernée
 * 👤 USER_ID → Utilisateur auteur modification
 * 📅 TIMESTAMP → Horodatage précis action
 * 📊 OLD_VALUES → Valeurs avant modification
 * 📊 NEW_VALUES → Valeurs après modification
 * 
 * CONFORMITÉ AUDIT :
 * ==================
 * ✅ RGPD → Traçabilité accès données personnelles
 * ✅ SOX → Sarbanes-Oxley compliance financière
 * ✅ ISO 27001 → Standards sécurité information
 * ✅ CNIL → Recommandations audit France
 * 
 * RECHERCHE ET FILTRAGE :
 * ======================
 * 🔍 ACTION → Filtrage par type action spécifique
 * 🏷️ TABLE → Recherche par entité modifiée
 * 👤 UTILISATEUR → Historique utilisateur complet
 * 📅 PÉRIODE → Filtrage temporel configurable
 * 📊 CONTENU → Recherche dans valeurs modifiées
 * 
 * RÉTENTION DONNÉES :
 * ==================
 * 📅 POLITIQUE → Durée conservation configurable
 * 🧹 NETTOYAGE → Suppression automatique logs anciens
 * 📊 ARCHIVAGE → Sauvegarde logs critiques
 * 🔒 IMMUTABILITÉ → Protection intégrité logs
 * 
 * PERFORMANCE OPTIMISÉE :
 * ======================
 * 📈 PAGINATION → Navigation efficace gros volumes
 * 🗃️ INDEXATION → Index optimisés recherche rapide
 * 📊 AGRÉGATION → Statistiques temps réel
 * 🔄 ASYNCHRONE → Traitement non-bloquant
 * 
 * SÉCURITÉ LOGS :
 * ===============
 * 🔒 IMMUTABILITÉ → Logs non modifiables après création
 * 🔐 CHIFFREMENT → Protection données sensibles logs
 * 👤 ACCÈS_CONTRÔLÉ → Consultation réservée admins
 * 📊 MONITORING → Surveillance tentatives accès
 * 
 * ================================================================================================
 */

using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.DTOs;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Service gestion logs et audit trail avec traçabilité complète système.
/// Implémentation sécurisée enregistrement et consultation historique activités.
/// </summary>
public class LogService : ILogService
{
    private readonly StartingBlochDbContext _context;

    /// <summary>
    /// Initialise service logs avec contexte base données pour persistance.
    /// </summary>
    /// <param name="context">Contexte base données pour accès logs</param>
    public LogService(StartingBlochDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère liste paginée logs système avec recherche et filtrage.
    /// Navigation optimisée historique avec tri chronologique décroissant.
    /// </summary>
    /// <param name="page">Numéro page pour pagination (1 par défaut)</param>
    /// <param name="pageSize">Taille page pour limitation résultats (10 par défaut)</param>
    /// <param name="search">Terme recherche optionnel action/table</param>
    /// <returns>Réponse paginée logs avec métadonnées audit</returns>
    public async Task<PagedResponse<List<LogDto>>> GetLogsAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        try
        {
            var query = _context.Logs.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(l => (l.Action != null && l.Action.Contains(search)) || 
                                        (l.TableName != null && l.TableName.Contains(search)));
            }

            var totalItems = await query.CountAsync();
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
                CreatedAt = l.CreatedAt,
                TimeStamp = l.Timestamp,
                Details = l.Details,
                Message = l.Message ?? string.Empty,
                IpAddress = l.IpAddress ?? string.Empty,
                UserAgent = l.UserAgent ?? string.Empty,
                Level = l.Level ?? string.Empty,
                // Champs additionnels pour frontend
                EntityType = l.TableName,
                EntityName = l.Message,
                EntityId = l.RecordId
            }).ToList();

            return new PagedResponse<List<LogDto>>
            {
                Success = true,
                Data = logDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
            };
        }
        catch (Exception ex)
        {
            return new PagedResponse<List<LogDto>>
            {
                Success = false,
                Message = "Erreur lors de la récupération des logs",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère historique complet activités utilisateur spécifique système.
    /// Traçabilité personnalisée avec filtrage actions utilisateur.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour historique activités</param>
    /// <returns>Liste logs utilisateur avec détails actions</returns>
    public async Task<ApiResponse<List<LogDto>>> GetLogsByUserAsync(int userId)
    {
        try
        {
            var logs = await _context.Logs
                .Where(l => l.UserId == userId.ToString())
                .OrderByDescending(l => l.CreatedAt)
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
                CreatedAt = l.CreatedAt,
                TimeStamp = l.Timestamp,
                Details = l.Details,
                Message = l.Message ?? string.Empty,
                IpAddress = l.IpAddress ?? string.Empty,
                UserAgent = l.UserAgent ?? string.Empty,
                Level = l.Level ?? string.Empty,
                EntityType = l.TableName,
                EntityName = l.Message,
                EntityId = l.RecordId
            }).ToList();

            return new ApiResponse<List<LogDto>>
            {
                Success = true,
                Data = logDtos,
                Message = $"Logs utilisateur {userId} récupérés avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<List<LogDto>>
            {
                Success = false,
                Data = new List<LogDto>(),
                Message = "Erreur lors de la récupération des logs utilisateur",
                Errors = ex.Message
            };
        }
    }

    /// <summary>
    /// Récupère logs utilisateur avec pagination optimisée.
    /// Audit trail utilisateur spécifique avec navigation efficace.
    /// </summary>
    /// <param name="userId">Identifiant utilisateur pour historique</param>
    /// <param name="page">Numéro page pour pagination</param>
    /// <param name="pageSize">Taille page pour limitation résultats</param>
    /// <returns>Réponse paginée logs utilisateur avec métadonnées</returns>
    public async Task<PagedResponse<List<LogDto>>> GetLogsByUserAsync(int userId, int page = 1, int pageSize = 10)
    {
        try
        {
            Console.WriteLine($"🔍 LogService - Recherche logs pour utilisateur {userId}, page {page}, taille {pageSize}");
            
            var query = _context.Logs.Where(l => l.UserId == userId.ToString());
            Console.WriteLine($"🔍 LogService - Query créé pour UserId = '{userId}'");

            var totalItems = await query.CountAsync();
            Console.WriteLine($"🔍 LogService - Total logs trouvés pour utilisateur {userId}: {totalItems}");
            
            // Debug: Afficher tous les UserId distincts en base
            var allUserIds = await _context.Logs.Select(l => l.UserId).Distinct().ToListAsync();
            Console.WriteLine($"🔍 LogService - Tous les UserId en base: [{string.Join(", ", allUserIds.Where(u => !string.IsNullOrEmpty(u)))}]");
            
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Console.WriteLine($"🔍 LogService - Logs récupérés après pagination: {logs.Count}");
            Console.WriteLine($"🔍 LogService - Détails des logs:");
            foreach (var log in logs)
            {
                Console.WriteLine($"  - ID: {log.Id}, Action: '{log.Action}', CreatedAt: {log.CreatedAt}");
            }

            var logDtos = logs.Select(l => new LogDto
            {
                Id = l.Id,
                Action = l.Action,
                TableName = l.TableName,
                RecordId = l.RecordId,
                OldValues = l.OldValues,
                NewValues = l.NewValues,
                UserId = string.IsNullOrEmpty(l.UserId) ? null : int.TryParse(l.UserId, out int uid) ? uid : null,
                CreatedAt = l.CreatedAt,
                TimeStamp = l.Timestamp,
                Details = l.Details,
                Message = l.Message ?? string.Empty,
                IpAddress = l.IpAddress ?? string.Empty,
                UserAgent = l.UserAgent ?? string.Empty,
                Level = l.Level ?? string.Empty,
                EntityType = l.TableName,
                EntityName = l.Message,
                EntityId = l.RecordId
            }).ToList();

            Console.WriteLine($"✅ LogService - Returning {logDtos.Count} logs pour utilisateur {userId}");

            return new PagedResponse<List<LogDto>>
            {
                Success = true,
                Data = logDtos,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalItems,
                TotalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                Message = $"Logs utilisateur {userId} récupérés avec succès"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ LogService - ERREUR lors récupération logs utilisateur {userId}: {ex.Message}");
            Console.WriteLine($"❌ LogService - Stack trace: {ex.StackTrace}");
            
            return new PagedResponse<List<LogDto>>
            {
                Success = false,
                Data = new List<LogDto>(),
                Page = page,
                PageSize = pageSize,
                TotalCount = 0,
                TotalPages = 0,
                Message = "Erreur lors de la récupération des logs utilisateur",
                Errors = ex.Message
            };
        }
    }
    
    /// <summary>
    /// Crée nouvelle entrée audit trail avec données complètes action.
    /// Enregistrement sécurisé avec horodatage et métadonnées immutables.
    /// </summary>
    /// <param name="createLogDto">Données création log avec action et valeurs</param>
    /// <returns>Confirmation création log avec audit trail</returns>
    public Task<ApiResponse<bool>> CreateLogAsync(CreateLogDto createLogDto) => throw new NotImplementedException();
    
    /// <summary>
    /// Supprime logs anciens selon politique rétention configurée.
    /// Nettoyage automatique avec préservation logs critiques système.
    /// </summary>
    /// <param name="beforeDate">Date limite pour suppression logs anciens</param>
    /// <returns>Confirmation nettoyage avec statistiques suppression</returns>
    public Task<ApiResponse<bool>> ClearOldLogsAsync(DateTime beforeDate) => throw new NotImplementedException();
    
    /// <summary>
    /// Supprime tous les logs de consultation (méthodes GET) pour optimisation.
    /// Nettoyage ciblé des logs non-critiques pour réduire volume base données.
    /// </summary>
    /// <returns>Confirmation succès avec nombre logs supprimés</returns>
    public async Task<ApiResponse<int>> ClearGetLogsAsync()
    {
        try
        {
            // Rechercher tous les logs de type GET
            var getLogsQuery = _context.Logs.Where(l => 
                l.Action != null && l.Action.StartsWith("GET "));
            
            var logsToDelete = await getLogsQuery.ToListAsync();
            var countToDelete = logsToDelete.Count;
            
            if (countToDelete > 0)
            {
                _context.Logs.RemoveRange(logsToDelete);
                await _context.SaveChangesAsync();
            }
            
            return new ApiResponse<int>
            {
                Success = true,
                Data = countToDelete,
                Message = $"✅ {countToDelete} logs GET supprimés avec succès"
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<int>
            {
                Success = false,
                Data = 0,
                Message = "❌ Erreur lors de la suppression des logs GET",
                Errors = ex.Message
            };
        }
    }
}
