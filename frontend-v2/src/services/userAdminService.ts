/*
 * ================================================================================================
 * SERVICE USERS ADMIN API
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { User, ApiResponse, PagedApiResponse } from '../types';

// Payloads adaptés aux endpoints backend .NET
export interface CreateEmployeeDto {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user'; // attendu en minuscule par l'API
  canWrite?: boolean;
  isActive?: boolean;
}

export interface CreateUserForClientDto {
  clientId: number;
  username: string;
  email: string;
  password: string;
  canWrite?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  role?: 'Admin' | 'User' | 'Client';
  isActive?: boolean;
  canWrite?: boolean;
  clientId?: number | null;
}

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Intercepteur pour ajouter le token JWT
const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const userAdminService = {
  // Récupérer tous les utilisateurs
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<User>> => {
    try {
      
  const response = await api.get(`${config.api.endpoints.users}/users`, {
        params: { page, pageSize }
      });
      
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const mapRole = (r: any) => {
  const v = (String(r ?? '')).toLowerCase();
        if (v === 'admin') return 'Admin';
        if (v === 'user') return 'User';
        if (v === 'client') return 'Client';
        return 'User';
      };
      const transformedData = response.data.Data?.map((user: any) => ({
        id: user.Id,
        username: user.Username,
        email: user.Email,
        nom: user.LastName,        // Map vers nom pour compatibilité
        prenom: user.FirstName,    // Map vers prenom pour compatibilité
        firstName: user.FirstName,
        lastName: user.LastName,
        role: mapRole(user.Role),
        isActive: user.IsActive,
        isBlocked: user.IsBlocked,
        lastLogin: user.LastLogin,
        createdAt: user.CreatedAt,
        canRead: user.CanRead,
        canWrite: user.CanWrite,
        clientId: user.ClientId,
        client: user.Client,
        userRoles: user.UserRoles
  })) ?? [];
      
      console.log('🔄 UserAdmin Service - Données transformées:', transformedData);
      
      // Retourner dans le format attendu par le frontend
      return {
        success: response.data.Success,
        data: transformedData,
        message: response.data.Message,
        page: response.data.Page,
        pageSize: response.data.PageSize,
        totalCount: response.data.TotalCount,
        totalPages: response.data.TotalPages,
        hasNextPage: response.data.HasNextPage,
        hasPreviousPage: response.data.HasPreviousPage
      };
    } catch (error: any) {
      
      return {
        data: [],
        success: false,
  message: error.response?.data?.message ?? 'Erreur lors de la récupération des utilisateurs',
        errors: error.response?.data?.errors,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  },

  // Création employé (admin/user)
  createEmployee: async (payload: CreateEmployeeDto): Promise<ApiResponse<User>> => {
    const response = await api.post(`${config.api.endpoints.users}/create-employee`, payload);
    return response.data;
  },

  // Création compte pour client existant
  createClientAccount: async (payload: CreateUserForClientDto): Promise<ApiResponse<User>> => {
    const response = await api.post(`${config.api.endpoints.users}/create-client-account`, payload);
    return response.data;
  },

  // Mettre à jour un utilisateur
  update: async (id: number, user: UpdateUserDto): Promise<ApiResponse<User>> => {
    const payload: any = { ...user };
    if (user.role) {
      const map: Record<string, string> = { Admin: 'admin', User: 'user', Client: 'client' };
      payload.role = map[user.role];
    }
    const response = await api.put(`${config.api.endpoints.users}/${id}`, payload);
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete(`${config.api.endpoints.users}/user/${id}`);
    return response.data;
  },

  // Activer / désactiver
  activate: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.put(`${config.api.endpoints.users}/user/${id}/activate`);
    return response.data;
  },
  deactivate: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await api.put(`${config.api.endpoints.users}/user/${id}/deactivate`);
    return response.data;
  },

  // Mettre à jour permissions (lecture/écriture)
  updatePermissions: async (id: number, canRead: boolean, canWrite: boolean): Promise<ApiResponse<boolean>> => {
    const response = await api.put(`${config.api.endpoints.users}/user/${id}/permissions`, { canRead, canWrite });
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (id: number, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`${config.api.endpoints.users}/${id}/password`, {
      password: newPassword
    });
    return response.data;
  }
};
