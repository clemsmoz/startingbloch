using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Security.Claims;

namespace StartingBloch.Backend.Hubs;

public class NotificationsHub : Hub
{
    private readonly ILogger<NotificationsHub> _logger;
    private readonly StartingBloch.Backend.Services.ConnectionRegistry _registry;

    public NotificationsHub(ILogger<NotificationsHub> logger, StartingBloch.Backend.Services.ConnectionRegistry registry)
    {
        _logger = logger;
        _registry = registry;
    }

    public override Task OnConnectedAsync()
    {
        var http = Context.GetHttpContext();
        var conn = Context.ConnectionId;

    try
        {
            var userId = Context.UserIdentifier;
            var qs = http?.Request?.QueryString.HasValue == true ? http.Request.QueryString.Value : string.Empty;
            var marker = "\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m"; // red background, white text
            _logger.LogInformation("{Marker} [NOTIF] SignalR connection established. ConnectionId={ConnectionId} UserIdentifier={UserIdentifier} QueryString={QueryString}", marker, conn, userId ?? "(null)", qs);
            _logger.LogWarning("{Marker} [NOTIF-WARN] SignalR connection established. ConnectionId={ConnectionId} UserIdentifier={UserIdentifier} QueryString={QueryString}", marker, conn, userId ?? "(null)", qs);

            // Diagnostic: whether user is authenticated on this request, presence of access_token (do NOT log token value), and a short claims summary
            bool isAuth = Context.User?.Identity?.IsAuthenticated == true;
            bool hasAccessToken = http?.Request?.Query?.ContainsKey("access_token") == true;
            var claimSummary = Context.User?.Claims.Select(c =>
            {
                if (c.Type == ClaimTypes.NameIdentifier || c.Type == "sub" || c.Type == "id" || c.Type == "nameid")
                    return c.Type + "=" + c.Value;
                return c.Type + "=<redacted>";
            }).ToArray() ?? new string[0];

            _logger.LogInformation("{Marker} [NOTIF-DIAG] IsAuthenticated={IsAuth} HasAccessTokenQuery={HasAccessToken} ClaimsCount={Count} ClaimsSummary={ClaimsSummary}", marker, isAuth, hasAccessToken, claimSummary.Length, string.Join(';', claimSummary));
            // Register connection for user if available
            if (!string.IsNullOrWhiteSpace(userId))
            {
                _registry.Add(userId, conn);
                try
                {
                    var conns = _registry.GetConnectionsForUser(userId).ToArray();
                    _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Registered connection for User={UserId} Connections={Conns}", userId, string.Join(',', conns));
                }
                catch { }
            }
        }
        catch (Exception ex)
        {
            _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] SignalR connection established. ConnectionId={ConnectionId} (claims logging failed) Exception={Ex}", conn, ex.Message);
        }

        // If the client provides a clientId via query string, add to group
        if (http != null && http.Request.Query.ContainsKey("clientId"))
        {
            var cid = http.Request.Query["clientId"].ToString();
            if (!string.IsNullOrWhiteSpace(cid))
            {
                Groups.AddToGroupAsync(conn, $"client_{cid}");
                _logger.LogInformation("[NOTIF] Connection {ConnectionId} added to group client_{ClientId}", conn, cid);
            }
        }

        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        // Remove connection from registry
        try
        {
            // Before removal, get the user (if known) and log connections
            try
            {
                if (_registry != null)
                {
                    // we can try to see if connection exists in reverse map by attempting RemoveConnection
                }
            }
            catch { }
            _registry.RemoveConnection(Context.ConnectionId);
            try
            {
                // We cannot reliably get userId from connection here (reverse lookup is internal),
                // so just log that the connection was removed
                _logger.LogInformation("\u001b[41m\u001b[37m NOTIF-KEY \u001b[0m [NOTIF] Connection removed: ConnectionId={ConnectionId}", Context.ConnectionId);
            }
            catch { }
        }
        catch { }
        return base.OnDisconnectedAsync(exception);
    }

    public Task SubscribeClient(int clientId)
    {
        _logger.LogInformation("[NOTIF] Connection {ConnectionId} subscribing to client_{ClientId}", Context.ConnectionId, clientId);
        return Groups.AddToGroupAsync(Context.ConnectionId, $"client_{clientId}");
    }

    public Task UnsubscribeClient(int clientId)
    {
        _logger.LogInformation("[NOTIF] Connection {ConnectionId} unsubscribing from client_{ClientId}", Context.ConnectionId, clientId);
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"client_{clientId}");
    }
}
