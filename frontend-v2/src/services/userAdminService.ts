/*
 * ================================================================================================
 * SERVICE USERS ADMIN API
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { User, ApiResponse, UserRole, PagedApiResponse } from '../types';

interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
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
      // console.log(`👥 UserAdmin Service - Récupération des utilisateurs (page ${page}, taille ${pageSize})...`);
      // console.log('URL complète:', `${config.api.baseUrl}${config.api.endpoints.users}/users`);
      
      const response = await api.get(`${config.api.endpoints.users}/users`, {
        params: { page, pageSize }
      });
      
      // console.log('✅ UserAdmin Service - Réponse reçue:', response.data);
      // console.log('🔍 UserAdmin Service - Structure de response.data:', Object.keys(response.data || {}));
      // console.log('🔍 UserAdmin Service - response.data.Success:', response.data?.Success);
      // console.log('🔍 UserAdmin Service - response.data.Data:', response.data?.Data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((user: any) => ({
        id: user.Id,
        username: user.Username,
        email: user.Email,
        nom: user.LastName,        // Map vers nom pour compatibilité
        prenom: user.FirstName,    // Map vers prenom pour compatibilité
        firstName: user.FirstName,
        lastName: user.LastName,
        role: user.Role,
        isActive: user.IsActive,
        isBlocked: user.IsBlocked,
        lastLogin: user.LastLogin,
        createdAt: user.CreatedAt,
        canRead: user.CanRead,
        canWrite: user.CanWrite,
        clientId: user.ClientId,
        client: user.Client,
        userRoles: user.UserRoles
      })) || [];
      
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
      // console.error('❌ UserAdmin Service - Erreur:', error);
      // console.error('Status:', error.response?.status);
      // console.error('Status Text:', error.response?.statusText);
      // console.error('Data:', error.response?.data);
      // console.error('URL:', error.config?.url);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs',
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

  // Récupérer un utilisateur par ID
  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`${config.api.endpoints.users}/${id}`);
    return response.data;
  },

  // Créer un nouvel utilisateur
  create: async (user: CreateUserDto): Promise<ApiResponse<User>> => {
    const response = await api.post(config.api.endpoints.users, user);
    return response.data;
  },

  // Mettre à jour un utilisateur
  update: async (id: number, user: UpdateUserDto): Promise<ApiResponse<User>> => {
    const response = await api.put(`${config.api.endpoints.users}/${id}`, user);
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`${config.api.endpoints.users}/${id}`);
    return response.data;
  },

  // Changer le statut actif/inactif
  toggleActive: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.patch(`${config.api.endpoints.users}/${id}/toggle-active`);
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
