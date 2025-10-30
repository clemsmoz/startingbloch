using System;

namespace StartingBloch.Backend.Models
{
    public class Notification
    {
        public int Id { get; set; }
        // Type: Brevet, Client, Cabinet, Contact
        public string Type { get; set; } = string.Empty;
        // Action: Created, Updated, Deleted
        public string Action { get; set; } = string.Empty;
        // Message to display
        public string Message { get; set; } = string.Empty;
        // Optional reference to entity id (brevet id, client id...)
        public int? ReferenceId { get; set; }
        // If notification is about a specific client, set ClientId
        public int? ClientId { get; set; }
        // Metadata as JSON (optional) - stored in DB as jsonb but kept as string in model
        public string? Metadata { get; set; }
        // Read status
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class NotificationPreference
    {
        public int Id { get; set; }
        // Optional: null means global default
        public int? ClientId { get; set; }
        // Notification type e.g. "Brevet", "Client", "Cabinet", "Contact". Null means applies to all types
        public string? NotificationType { get; set; }
        // Optional: when set, this preference is specific to a user (string id from auth token)
        public string? UserId { get; set; }
        // Enabled or disabled
        public bool Enabled { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
