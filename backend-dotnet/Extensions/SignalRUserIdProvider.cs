using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace StartingBloch.Backend.Extensions;

/// <summary>
/// Provides a consistent UserIdentifier for SignalR connections based on JWT claims.
/// Tries common claim types in order: ClaimTypes.NameIdentifier, "sub", "id", "nameid".
/// </summary>
public class SignalRUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var user = connection.User;
        if (user == null) return null;

        string? id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? user.FindFirst("sub")?.Value
                     ?? user.FindFirst("id")?.Value
                     ?? user.FindFirst("nameid")?.Value;

        return id;
    }
}
