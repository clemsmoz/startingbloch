using System.Collections.Generic;
using System.Threading.Tasks;
using StartingBloch.Backend.Models;

namespace StartingBloch.Backend.Services
{
    public interface INotificationService
    {
    Task<Notification?> CreateNotificationAsync(Notification notification);
        Task<List<Notification>> GetNotificationsForClientAsync(int clientId, int page = 1, int pageSize = 50);
        Task<List<Notification>> GetNotificationsForAllAsync(int page = 1, int pageSize = 50);
        Task MarkAsReadAsync(int[] ids);

        // Preferences
        Task<List<StartingBloch.Backend.Models.NotificationPreference>> GetPreferencesForClientAsync(int? clientId = null);
        Task UpsertPreferenceAsync(StartingBloch.Backend.Models.NotificationPreference pref);
    }
}
