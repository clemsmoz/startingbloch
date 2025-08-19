import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { ApiResponse, RoleItem } from '../types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const roleService = {
  getAll: async (): Promise<ApiResponse<RoleItem[]>> => {
    const response = await api.get('/api/roles');
    const data = (response.data?.Data || []).map((r: any) => ({
      id: r.Id,
      name: r.Name,
      description: r.Description,
      createdAt: r.CreatedAt,
    }));
    return {
      success: !!response.data?.Success,
      data,
      message: response.data?.Message,
      errors: response.data?.Errors,
    };
  },
};
