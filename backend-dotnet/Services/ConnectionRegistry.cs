using System.Collections.Concurrent;

namespace StartingBloch.Backend.Services;

/// <summary>
/// Tracks active SignalR connections per user and per connection id.
/// Used to determine connection ids to exclude from group broadcasts when users opt-out.
/// </summary>
public class ConnectionRegistry
{
    // userId -> set of connectionIds
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _byUser = new();
    // connectionId -> userId (reverse lookup)
    private readonly ConcurrentDictionary<string, string> _byConnection = new();

    public void Add(string userId, string connectionId)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(connectionId)) return;
        var dict = _byUser.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        dict[connectionId] = 0;
        _byConnection[connectionId] = userId;
    }

    public void RemoveConnection(string connectionId)
    {
        if (string.IsNullOrWhiteSpace(connectionId)) return;
        if (_byConnection.TryRemove(connectionId, out var userId))
        {
            if (_byUser.TryGetValue(userId, out var dict))
            {
                dict.TryRemove(connectionId, out _);
                if (dict.IsEmpty)
                {
                    _byUser.TryRemove(userId, out _);
                }
            }
        }
    }

    public IReadOnlyList<string> GetConnectionsForUser(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return Array.Empty<string>();
        if (_byUser.TryGetValue(userId, out var dict))
        {
            return dict.Keys.ToList();
        }
        return Array.Empty<string>();
    }
}
