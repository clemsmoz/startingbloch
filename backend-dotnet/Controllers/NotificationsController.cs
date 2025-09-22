using Microsoft.AspNetCore.Mvc;
using StartingBloch.Backend.Services;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        // GET: api/notifications?clientId=123&page=1&pageSize=50
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? clientId = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var notifications = clientId.HasValue
                ? await _notificationService.GetNotificationsForClientAsync(clientId.Value, page, pageSize)
                : await _notificationService.GetNotificationsForAllAsync(page, pageSize);

            return Ok(new { Success = true, Data = notifications });
        }

        // GET: api/notifications/client/123
        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetForClient(int clientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var notifications = await _notificationService.GetNotificationsForClientAsync(clientId, page, pageSize);
            return Ok(new { Success = true, Data = notifications });
        }

        // POST: api/notifications/mark-read
        // Body: { ids: [1,2,3] }
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkRead([FromBody] MarkReadRequest req)
        {
            if (req?.Ids == null || req.Ids.Length == 0)
                return BadRequest(new { Success = false, Message = "No ids provided" });

            await _notificationService.MarkAsReadAsync(req.Ids);
            return Ok(new { Success = true });
        }

        public class MarkReadRequest
        {
            public int[]? Ids { get; set; }
        }

        // GET: api/notifications/preferences?clientId=123
        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences([FromQuery] int? clientId = null)
        {
            var prefs = await _notificationService.GetPreferencesForClientAsync(clientId);

            // If user is authenticated, return only preferences belonging to that user
            try
            {
                if (User?.Identity?.IsAuthenticated == true)
                {
                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                 ?? User.FindFirst("sub")?.Value
                                 ?? User.FindFirst("id")?.Value;
                    if (!string.IsNullOrEmpty(userId))
                    {
                        prefs = prefs.Where(p => p.UserId == userId).ToList();
                    }
                    else
                    {
                        prefs = new List<StartingBloch.Backend.Models.NotificationPreference>();
                    }
                }
                else
                {
                    // not authenticated: return empty set
                    prefs = new List<StartingBloch.Backend.Models.NotificationPreference>();
                }
            }
            catch
            {
                // on error, default to empty
                prefs = new List<StartingBloch.Backend.Models.NotificationPreference>();
            }

            // Normalize prefs: convert empty strings to null for JSON consumers
            foreach (var pp in prefs)
            {
                if (string.IsNullOrWhiteSpace(pp.NotificationType)) pp.NotificationType = null;
                if (string.IsNullOrWhiteSpace(pp.UserId)) pp.UserId = null;
            }

            return Ok(new { Success = true, Data = prefs });
        }

        // PUT: api/notifications/preferences
        // Body: { clientId: 123, notificationType: "Brevet", enabled: true }
        [HttpPut("preferences")]
        public async Task<IActionResult> UpsertPreference([FromBody] PreferenceRequest req)
        {
            if (req == null)
                return BadRequest(new { Success = false, Message = "Invalid payload" });
            var pref = new StartingBloch.Backend.Models.NotificationPreference
            {
                ClientId = req.ClientId,
                NotificationType = req.NotificationType,
                Enabled = req.Enabled
            };

            // Structured logging of incoming request
            try
            {
                var callerId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "(anonymous)";
                _logger.LogInformation("[DEBUG] UpsertPreference called by User={UserId} Payload={Payload}", callerId, new { req.ClientId, req.NotificationType, req.Enabled });
            }
            catch (Exception ex)
            {
                // non-blocking
                try { _logger.LogDebug(ex, "Failed to log UpsertPreference payload"); } catch { }
            }

            // If user is authenticated, attach the UserId so the preference becomes per-user
            try
            {
                if (User?.Identity?.IsAuthenticated == true)
                {
                    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                 ?? User.FindFirst("sub")?.Value
                                 ?? User.FindFirst("id")?.Value;
                    if (!string.IsNullOrEmpty(userId))
                        pref.UserId = userId;
                }
            }
            catch
            {
                // ignore if claims not available
            }

            await _notificationService.UpsertPreferenceAsync(pref);
            return Ok(new { Success = true });
        }

        public class PreferenceRequest
        {
            public int? ClientId { get; set; }
            public string? NotificationType { get; set; }
            public bool Enabled { get; set; }
        }
    }
}
