using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StartingBloch.Backend.Data;
using StartingBloch.Backend.Models;
using StartingBloch.Backend.Hubs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StartingBloch.Backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly StartingBlochDbContext _context;
    private readonly IHubContext<NotificationsHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
    private readonly StartingBloch.Backend.Services.ConnectionRegistry _registry;

        public NotificationService(StartingBlochDbContext context, ILogger<NotificationService> logger, IServiceScopeFactory scopeFactory, IHubContext<NotificationsHub>? hubContext = null, StartingBloch.Backend.Services.ConnectionRegistry? registry = null)
        {
            _context = context;
            _hubContext = hubContext!;
            _logger = logger;
            _scopeFactory = scopeFactory;
            _registry = registry!;
        }

        public async Task<Notification?> CreateNotificationAsync(Notification notification)
        {
            // Use a new scope for DB operations so CreateNotificationAsync can be called fire-and-forget
            try
            {
                var clientId = notification.ClientId;
                var type = notification.Type;

                using var scope = _scopeFactory.CreateScope();
                var scopedContext = scope.ServiceProvider.GetRequiredService<StartingBlochDbContext>();

                // Charger préférences pertinentes (user-specific, client-specific et global)
                var prefs = await scopedContext.NotificationPreferences
                    .Where(p => p.ClientId == clientId || p.ClientId == null)
                    .ToListAsync();

                // Normaliser les valeurs chargées : traiter "" comme null pour NotificationType/UserId
                foreach (var pp in prefs)
                {
                    if (string.IsNullOrWhiteSpace(pp.NotificationType)) pp.NotificationType = null;
                    if (string.IsNullOrWhiteSpace(pp.UserId)) pp.UserId = null;
                }

                // Attempt to get current user id from scope HttpContext if available
                string? currentUserId = null;
                try
                {
                    var httpAccessor = scope.ServiceProvider.GetService(typeof(Microsoft.AspNetCore.Http.IHttpContextAccessor)) as Microsoft.AspNetCore.Http.IHttpContextAccessor;
                    if (httpAccessor?.HttpContext?.User?.Identity?.IsAuthenticated == true)
                    {
                        currentUserId = httpAccessor.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                         ?? httpAccessor.HttpContext.User.FindFirst("sub")?.Value
                                         ?? httpAccessor.HttpContext.User.FindFirst("id")?.Value;
                    }
                }
                catch { /* ignore */ }

                // Resolve precedence:
                // 1) user+client+type
                // 2) user+client+all
                // 3) client+type
                // 4) client+all
                // 5) global+type
                // 6) global+all
                bool? resolved = null;
                StartingBloch.Backend.Models.NotificationPreference? p = null;

                // normalize the event type for case-insensitive comparison
                var eventType = string.IsNullOrWhiteSpace(type) ? null : type;

                if (!string.IsNullOrEmpty(currentUserId))
                {
                    p = prefs.FirstOrDefault(x => string.Equals(x.UserId, currentUserId) && x.ClientId == clientId && (x.NotificationType == null ? type == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)));
                    if (p != null) resolved = p.Enabled;
                    if (resolved == null)
                    {
                        p = prefs.FirstOrDefault(x => string.Equals(x.UserId, currentUserId) && x.ClientId == clientId && x.NotificationType == null);
                        if (p != null) resolved = p.Enabled;
                    }
                }

                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == clientId && (x.NotificationType == null ? type == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)) && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == clientId && x.NotificationType == null && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == null && (x.NotificationType == null ? type == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)) && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == null && x.NotificationType == null && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }

                // Diagnostic: log which preference (if any) was used to resolve
                try
                {
                    if (p != null)
                    {
                        _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Resolved preference: Id={Id} UserId={UserId} ClientId={ClientId} Type={Type} Enabled={Enabled}", p.Id, p.UserId, p.ClientId, p.NotificationType, p.Enabled);
                    }
                    else
                    {
                        _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] No matching preference found for User={User} ClientId={ClientId} Type={Type}", currentUserId, clientId, eventType);
                    }
                }
                catch { }

                if (resolved == false)
                {
                    _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Notification skipped by preference. Type={Type} ClientId={ClientId} Message={Message}", type, clientId, notification.Message);
                    return null;
                }

                // Before persisting, determine user-specific enabled prefs for this client (if any)
                List<string> userIds = new List<string>();
                bool anyUserSpecificPrefsExist = false;

                if (notification.ClientId.HasValue)
                {
                    var cid = notification.ClientId.Value;
                    var notifTypeLower = notification.Type == null ? null : notification.Type.ToLower();
                    var enabledUserPrefs = await scopedContext.NotificationPreferences
                        .Where(p => p.ClientId == cid && p.UserId != null && p.Enabled == true
                            && ((p.NotificationType == null && notifTypeLower == null)
                                || (p.NotificationType != null && notifTypeLower != null && p.NotificationType.ToLower() == notifTypeLower)))
                        .ToListAsync();

                    userIds = enabledUserPrefs.Select(p => p.UserId).Where(u => !string.IsNullOrWhiteSpace(u)).Distinct().ToList();

                    anyUserSpecificPrefsExist = await scopedContext.NotificationPreferences
                        .AnyAsync(p => p.ClientId == cid && p.UserId != null);

                    // Note: do NOT skip creating the notification here. Even if some user-specific
                    // preferences exist and none are enabled, there may be other users without
                    // explicit preferences who should still receive group broadcasts. We'll
                    // handle exclusion of opted-out users during SignalR emission below.
                }

                _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Creating notification. Type={Type} Action={Action} ClientId={ClientId} ReferenceId={ReferenceId} Message={Message}", notification.Type, notification.Action, notification.ClientId, notification.ReferenceId, notification.Message);

                scopedContext.Notifications.Add(notification);
                await scopedContext.SaveChangesAsync();

                // SignalR emission (non-blocking)
                try
                {
                    if (_hubContext != null)
                    {
                        if (notification.ClientId.HasValue)
                        {
                            var cid = notification.ClientId.Value;
                            _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Emitting SignalR to client group client_{ClientId} with filtering by preferences", cid);

                            if (userIds.Count > 0)
                            {
                                // Send to each user individually (will be delivered to their connections)
                                foreach (var uid in userIds)
                                {
                                    if (string.IsNullOrWhiteSpace(uid)) continue; // defensive
                                    var uidNonNull = uid!; // tell analyzer this is non-null
                                    try
                                    {
                                        await _hubContext.Clients.User(uidNonNull).SendAsync("ReceiveNotification", notification);
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.LogDebug(ex, "\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Failed to send notification to user {UserId}", uidNonNull);
                                    }
                                }
                            }
                            else if (anyUserSpecificPrefsExist)
                            {
                                // There are user-specific prefs defined but none are enabled for the "enabled list" above.
                                // Instead of skipping broadcast entirely, compute the opted-out users and exclude their
                                // active connectionIds from the group broadcast. This ensures users who explicitly
                                // opted out won't receive the notification while others still do.
                                _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] User-specific prefs exist for client_{ClientId}; broadcasting to group excluding opted-out users", cid);

                                var optedOutUserIds = await scopedContext.NotificationPreferences
                                    .Where(p => p.ClientId == cid && p.UserId != null && p.Enabled == false)
                                    .Select(p => p.UserId)
                                    .ToListAsync();

                                // Deduplicate userIds (DB may contain duplicates)
                                optedOutUserIds = optedOutUserIds.Where(u => !string.IsNullOrWhiteSpace(u)).Distinct().ToList();

                                var excludeConnectionIds = new List<string>();
                                foreach (var uid in optedOutUserIds)
                                {
                                    if (string.IsNullOrWhiteSpace(uid)) continue;
                                    var conns = _registry.GetConnectionsForUser(uid!);
                                    if (conns?.Count > 0)
                                    {
                                        excludeConnectionIds.AddRange(conns);
                                    }
                                }
                                // Diagnostic: log which userIds opted out and how many connectionIds will be excluded
                                try
                                {
                                    _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Opted-out userIds={OptedOut} ExcludeConnectionCount={ExcludeCount}", string.Join(',', optedOutUserIds), excludeConnectionIds.Count);
                                    if (excludeConnectionIds.Count > 0)
                                    {
                                        _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] ExcludeConnectionIds={Ids}", string.Join(',', excludeConnectionIds));
                                    }
                                }
                                catch { }

                                if (excludeConnectionIds.Count > 0)
                                {
                                    await _hubContext.Clients.GroupExcept($"client_{cid}", excludeConnectionIds).SendAsync("ReceiveNotification", notification);
                                }
                                else
                                {
                                    await _hubContext.Clients.Group($"client_{cid}").SendAsync("ReceiveNotification", notification);
                                }
                            }
                            else
                            {
                                // No explicit user prefs -> fallback to group broadcast (legacy behavior)
                                _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] No user-specific enabled prefs found; emitting to group client_{ClientId}", cid);

                                // Determine users who have explicit user-specific preferences for this client and have disabled them
                                var optedOutUserIds = await scopedContext.NotificationPreferences
                                    .Where(p => p.ClientId == cid && p.UserId != null && p.Enabled == false)
                                    .Select(p => p.UserId)
                                    .ToListAsync();

                                // From registry, collect connectionIds for those opted-out users to exclude
                                var excludeConnectionIds = new List<string>();
                                foreach (var uid in optedOutUserIds)
                                {
                                    if (string.IsNullOrWhiteSpace(uid)) continue;
                                    var conns = _registry.GetConnectionsForUser(uid!);
                                    if (conns?.Count > 0)
                                    {
                                        excludeConnectionIds.AddRange(conns);
                                    }
                                }
                                // Deduplicate connection ids
                                excludeConnectionIds = excludeConnectionIds.Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().ToList();

                                if (excludeConnectionIds.Count > 0)
                                {
                                    await _hubContext.Clients.GroupExcept($"client_{cid}", excludeConnectionIds).SendAsync("ReceiveNotification", notification);
                                }
                                else
                                {
                                    await _hubContext.Clients.Group($"client_{cid}").SendAsync("ReceiveNotification", notification);
                                }
                            }
                        }
                        else
                        {
                            _logger.LogInformation("[NOTIF] Emitting SignalR to all clients (global notification)");
                            await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[NOTIF] SignalR emission failed for notification Id={Id}", notification.Id);
                }

                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NOTIF] Failed to create notification (background-safe)");
                return null;
            }
        }

        public async Task<List<Notification>> GetNotificationsForClientAsync(int clientId, int page = 1, int pageSize = 50)
        {
            // Return notifications targeted to the client AND global notifications (ClientId == null)
            // If the caller is authenticated, filter out notifications for which that user has an
            // explicit resolved preference of Enabled == false.
            // Use a simple approach: load the page and then filter in-memory by preferences.
            var query = _context.Notifications
                .Where(n => n.ClientId == clientId || n.ClientId == null)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var notifications = await query.ToListAsync();

            // Attempt to get current user id from ambient HttpContext
            string? currentUserId = null;
            try
            {
                var httpAccessor = (Microsoft.AspNetCore.Http.IHttpContextAccessor?)null;
                // try to resolve via IServiceScopeFactory to avoid injecting IHttpContextAccessor here
                // but we can use the existing _scopeFactory to create a scope and read HttpContext if available
                using var scope = _scopeFactory.CreateScope();
                httpAccessor = scope.ServiceProvider.GetService(typeof(Microsoft.AspNetCore.Http.IHttpContextAccessor)) as Microsoft.AspNetCore.Http.IHttpContextAccessor;
                if (httpAccessor?.HttpContext?.User?.Identity?.IsAuthenticated == true)
                {
                    currentUserId = httpAccessor.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                     ?? httpAccessor.HttpContext.User.FindFirst("sub")?.Value
                                     ?? httpAccessor.HttpContext.User.FindFirst("id")?.Value;
                }
            }
            catch { /* ignore */ }

            if (string.IsNullOrEmpty(currentUserId)) return notifications;

            // Load preferences relevant to this user and client(s) of the page notifications
            var clientIds = notifications.Select(n => n.ClientId).Distinct().ToList();
            var prefs = await _context.NotificationPreferences
                .Where(p => (p.UserId == currentUserId || p.UserId == null) && (p.ClientId == null || clientIds.Contains(p.ClientId.Value)) )
                .ToListAsync();

            // Normalize
            foreach (var pp in prefs)
            {
                if (string.IsNullOrWhiteSpace(pp.NotificationType)) pp.NotificationType = null;
                if (string.IsNullOrWhiteSpace(pp.UserId)) pp.UserId = null;
            }

            // Filter notifications per resolved preference for the user
            var result = new List<Notification>();
            foreach (var n in notifications)
            {
                bool? resolved = null;
                StartingBloch.Backend.Models.NotificationPreference? p = null;
                var eventType = string.IsNullOrWhiteSpace(n.Type) ? null : n.Type;
                var cid = n.ClientId;

                if (!string.IsNullOrEmpty(currentUserId) && cid.HasValue)
                {
                    p = prefs.FirstOrDefault(x => string.Equals(x.UserId, currentUserId) && x.ClientId == cid && (x.NotificationType == null ? eventType == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)));
                    if (p != null) resolved = p.Enabled;
                    if (resolved == null)
                    {
                        p = prefs.FirstOrDefault(x => string.Equals(x.UserId, currentUserId) && x.ClientId == cid && x.NotificationType == null);
                        if (p != null) resolved = p.Enabled;
                    }
                }

                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == cid && (x.NotificationType == null ? eventType == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)) && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == cid && x.NotificationType == null && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == null && (x.NotificationType == null ? eventType == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)) && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == null && x.NotificationType == null && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }

                if (resolved == false) continue; // do not include this notification for this user
                result.Add(n);
            }

            return result;
        }

        public async Task<List<Notification>> GetNotificationsForAllAsync(int page = 1, int pageSize = 50)
        {
            // Similar filtering as GetNotificationsForClientAsync: if authenticated, exclude notifications
            // the user has explicitly disabled.
            var query = _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            var notifications = await query.ToListAsync();

            string? currentUserId = null;
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var httpAccessor = scope.ServiceProvider.GetService(typeof(Microsoft.AspNetCore.Http.IHttpContextAccessor)) as Microsoft.AspNetCore.Http.IHttpContextAccessor;
                if (httpAccessor?.HttpContext?.User?.Identity?.IsAuthenticated == true)
                {
                    currentUserId = httpAccessor.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                     ?? httpAccessor.HttpContext.User.FindFirst("sub")?.Value
                                     ?? httpAccessor.HttpContext.User.FindFirst("id")?.Value;
                }
            }
            catch { }

            if (string.IsNullOrEmpty(currentUserId)) return notifications;

            var clientIds = notifications.Select(n => n.ClientId).Distinct().ToList();
            var prefs = await _context.NotificationPreferences
                .Where(p => (p.UserId == currentUserId || p.UserId == null) && (p.ClientId == null || clientIds.Contains(p.ClientId.Value)) )
                .ToListAsync();
            foreach (var pp in prefs)
            {
                if (string.IsNullOrWhiteSpace(pp.NotificationType)) pp.NotificationType = null;
                if (string.IsNullOrWhiteSpace(pp.UserId)) pp.UserId = null;
            }

            var result = new List<Notification>();
            foreach (var n in notifications)
            {
                bool? resolved = null;
                StartingBloch.Backend.Models.NotificationPreference? p = null;
                var eventType = string.IsNullOrWhiteSpace(n.Type) ? null : n.Type;
                var cid = n.ClientId;

                if (!string.IsNullOrEmpty(currentUserId) && cid.HasValue)
                {
                    p = prefs.FirstOrDefault(x => string.Equals(x.UserId, currentUserId) && x.ClientId == cid && (x.NotificationType == null ? eventType == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)));
                    if (p != null) resolved = p.Enabled;
                    if (resolved == null)
                    {
                        p = prefs.FirstOrDefault(x => string.Equals(x.UserId, currentUserId) && x.ClientId == cid && x.NotificationType == null);
                        if (p != null) resolved = p.Enabled;
                    }
                }

                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == cid && (x.NotificationType == null ? eventType == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)) && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == cid && x.NotificationType == null && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == null && (x.NotificationType == null ? eventType == null : string.Equals(x.NotificationType, eventType, System.StringComparison.OrdinalIgnoreCase)) && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }
                if (resolved == null)
                {
                    p = prefs.FirstOrDefault(x => x.ClientId == null && x.NotificationType == null && x.UserId == null);
                    if (p != null) resolved = p.Enabled;
                }

                if (resolved == false) continue;
                result.Add(n);
            }

            return result;
        }

        public async Task MarkAsReadAsync(int[] ids)
        {
            var notifications = await _context.Notifications.Where(n => ids.Contains(n.Id)).ToListAsync();
            foreach (var n in notifications)
            {
                n.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

                // Preferences
        public async Task<List<StartingBloch.Backend.Models.NotificationPreference>> GetPreferencesForClientAsync(int? clientId = null)
        {
            // Return prefs optionally filtered by clientId. User-specific preferences are included (no filtering by UserId here)
            if (clientId.HasValue)
                return await _context.NotificationPreferences.Where(p => p.ClientId == clientId.Value).ToListAsync();
            return await _context.NotificationPreferences.ToListAsync();
        }

        public async Task UpsertPreferenceAsync(StartingBloch.Backend.Models.NotificationPreference pref)
        {
            try
            {
                _logger.LogInformation("[NOTIF] UpsertPreference received: UserId={UserId}, ClientId={ClientId}, Type={Type}, Enabled={Enabled}", pref.UserId, pref.ClientId, pref.NotificationType, pref.Enabled);
            }
            catch { }
            // Normalize incoming pref: treat empty strings as null
            if (string.IsNullOrWhiteSpace(pref.NotificationType)) pref.NotificationType = null;
            if (string.IsNullOrWhiteSpace(pref.UserId)) pref.UserId = null;

            // Find existing. Uniqueness considers UserId (may be null), ClientId and NotificationType
            // DB may contain empty strings for NotificationType/UserId, so consider "" equivalent to null in the query
            var existing = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => (p.UserId == pref.UserId || (p.UserId == "" && pref.UserId == null))
                    && p.ClientId == pref.ClientId
                    && (p.NotificationType == pref.NotificationType || (p.NotificationType == "" && pref.NotificationType == null)));
            if (existing == null)
            {
                pref.CreatedAt = DateTime.UtcNow;
                pref.UpdatedAt = DateTime.UtcNow;
                _context.NotificationPreferences.Add(pref);
                _logger.LogInformation("[NOTIF] Inserting new preference for UserId={UserId} ClientId={ClientId} Type={Type} Enabled={Enabled}", pref.UserId, pref.ClientId, pref.NotificationType, pref.Enabled);
            }
            else
            {
                existing.Enabled = pref.Enabled;
                existing.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("[NOTIF] Updating existing preference Id={Id} Enabled={Enabled}", existing.Id, existing.Enabled);
            }
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("[NOTIF] SaveChanges successful for preference UserId={UserId} ClientId={ClientId} Type={Type}", pref.UserId, pref.ClientId, pref.NotificationType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NOTIF] SaveChanges failed for preference UserId={UserId} ClientId={ClientId} Type={Type}", pref.UserId, pref.ClientId, pref.NotificationType);
                throw;
            }
        }
    }
}
