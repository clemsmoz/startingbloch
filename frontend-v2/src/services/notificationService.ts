import axios from 'axios';
import { createAuthInterceptor } from '../utils/auth';
import { config } from '../config';

const authInterceptor = createAuthInterceptor();

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const notificationService = {
  getPreferences: async (clientId?: number) => {
    const params = clientId ? `?clientId=${clientId}` : '';
    const res = await api.get(`/api/notifications/preferences${params}`);
    // API returns an envelope { Success, Data }. Normalize to the Data payload (array) so callers get the actual list.
    const raw = res.data?.data ?? res.data?.Data ?? res.data;
    if (Array.isArray(raw)) {
      // normalize keys and types
      return raw.map((p: any) => {
        const id = p.Id ?? p.id ?? null;
        const clientIdNorm = p.ClientId ?? p.clientId ?? null;
        const rawType = p.NotificationType ?? p.notificationType ?? null;
        const notificationType = (rawType === null || rawType === undefined || String(rawType).trim() === '') ? null : String(rawType);
        const userId = p.UserId ?? p.userId ?? null;
        const enabledRaw = p.Enabled ?? p.enabled ?? false;
        const enabled = enabledRaw === 1 || enabledRaw === '1' || enabledRaw === true;
        return { id, clientId: clientIdNorm, notificationType, userId, enabled };
      });
    }
    return raw;
  },

  getNotifications: async (clientId?: number, page: number = 1, pageSize: number = 50, types?: string[]) => {
    const params: any = { page, pageSize };
    if (clientId) params.clientId = clientId;
    if (types && types.length > 0) params.types = types.join(',');
    const res = await api.get('/api/notifications', { params });
    return res.data;
  },

  markAsRead: async (ids: number[]) => {
    const res = await api.post('/api/notifications/mark-read', { ids });
    return res.data;
  },

  upsertPreference: async (clientId: number | null, notificationType: string | null, enabled: boolean) => {
    const payload = { clientId, notificationType, enabled };
    const res = await api.put('/api/notifications/preferences', payload);
    return res.data;
  }
};
