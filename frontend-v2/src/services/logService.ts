/*
 * ================================================================================================
 * SERVICE LOG - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des logs système.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Log, 
  ApiResponse,
  PagedApiResponse
} from '../types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Intercepteur pour ajouter le token JWT
const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const logService = {
  // Récupérer tous les logs avec pagination
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Log>> => {
    try {
      console.log(`📋 Log Service - Récupération des logs (page ${page}, taille ${pageSize})...`);
      
      const response = await api.get(config.api.endpoints.logs, {
        params: { page, pageSize }
      });
      
      console.log('✅ Log Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((log: any) => ({
        id: log.Id,
        userId: log.UserId,
        userEmail: log.UserEmail,
        userName: log.UserName,
        userFullName: log.UserFullName,
        action: log.Action,
        details: log.Details,
        ipAddress: log.IpAddress,
        timestamp: log.Timestamp,
        createdAt: log.CreatedAt ?? log.Timestamp,
        entityType: log.EntityType,
        entityId: log.EntityId,
        entityName: log.EntityName,
        oldValues: log.OldValues,
        newValues: log.NewValues,
      })) || [];
      
      console.log('🔄 Log Service - Données transformées:', transformedData);
      
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
      console.error('❌ Log Service - Erreur:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la récupération des logs',
        errors: error.response?.data?.Errors || error.response?.data?.errors,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  },

  // Récupérer un log par son ID
  getById: async (id: number): Promise<ApiResponse<Log>> => {
    try {
      const response = await api.get(`${config.api.endpoints.logs}/${id}`);
      
      const transformedData = {
        id: response.data.Id,
        userId: response.data.UserId,
        userEmail: response.data.UserEmail,
        userName: response.data.UserName,
        userFullName: response.data.UserFullName,
        action: response.data.Action,
        details: response.data.Details,
        ipAddress: response.data.IpAddress,
        timestamp: response.data.Timestamp,
        createdAt: response.data.CreatedAt ?? response.data.Timestamp,
        entityType: response.data.EntityType,
        entityId: response.data.EntityId,
        entityName: response.data.EntityName,
        oldValues: response.data.OldValues,
        newValues: response.data.NewValues,
      };
      
      return {
        data: transformedData,
        success: true,
        message: 'Log récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Log,
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la récupération du log',
        errors: error.response?.data?.Errors || error.response?.data?.errors
      };
    }
  },

  // Rechercher dans les logs
  search: async (query: string): Promise<ApiResponse<Log[]>> => {
    try {
      const response = await api.get(`${config.api.endpoints.logs}/search`, {
        params: { q: query }
      });
      
      const transformedData = response.data.map((log: any) => ({
        id: log.Id,
        userId: log.UserId,
        userEmail: log.UserEmail,
        userName: log.UserName,
        userFullName: log.UserFullName,
        action: log.Action,
        details: log.Details,
        ipAddress: log.IpAddress,
        timestamp: log.Timestamp,
        createdAt: log.CreatedAt ?? log.Timestamp,
        entityType: log.EntityType,
        entityId: log.EntityId,
        entityName: log.EntityName,
        oldValues: log.OldValues,
        newValues: log.NewValues,
      }));
      
      return {
        data: transformedData,
        success: true,
        message: 'Recherche effectuée avec succès'
      };
    } catch (error: any) {
      return {
        data: [],
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la recherche',
        errors: error.response?.data?.Errors || error.response?.data?.errors
      };
    }
  },

  // Filtrer les logs par utilisateur
  getByUser: async (userId: number, page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Log>> => {
    try {
      console.log(`📱 Log Service Frontend - Appel API pour utilisateur ${userId}, page ${page}, taille ${pageSize}`);
      console.log(`📱 URL complète: ${config.api.baseUrl}${config.api.endpoints.logs}/user/${userId}`);
      
      const response = await api.get(`${config.api.endpoints.logs}/user/${userId}`, {
        params: { page, pageSize }
      });
      
      console.log(`📱 Log Service Frontend - Réponse brute:`, response.data);
      console.log(`📱 Log Service Frontend - Success: ${response.data.Success}, TotalCount: ${response.data.TotalCount}`);
      
      const transformedData = response.data.Data?.map((log: any) => ({
        id: log.Id,
        userId: log.UserId,
        userEmail: log.UserEmail,
        userName: log.UserName,
        userFullName: log.UserFullName,
        action: log.Action,
        details: log.Details,
        ipAddress: log.IpAddress,
        timestamp: log.Timestamp,
        createdAt: log.CreatedAt ?? log.Timestamp,
        entityType: log.EntityType,
        entityId: log.EntityId,
        entityName: log.EntityName,
        oldValues: log.OldValues,
        newValues: log.NewValues,
      })) || [];
      
      console.log(`📱 Log Service Frontend - Données transformées: ${transformedData.length} logs`);
      console.log(`📱 Log Service Frontend - Premier log exemple:`, transformedData[0]);
      
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
      console.error(`❌ Log Service Frontend - ERREUR pour utilisateur ${userId}:`, error);
      console.error(`❌ Response data:`, error.response?.data);
      console.error(`❌ Status:`, error.response?.status);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la récupération des logs utilisateur',
        errors: error.response?.data?.Errors || error.response?.data?.errors,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  },

  // Filtrer les logs par action
  getByAction: async (action: string, page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Log>> => {
    try {
      const response = await api.get(`${config.api.endpoints.logs}/action/${encodeURIComponent(action)}`, {
        params: { page, pageSize }
      });
      
      const transformedData = response.data.Data?.map((log: any) => ({
        id: log.Id,
        userId: log.UserId,
        userEmail: log.UserEmail,
        userName: log.UserName,
        userFullName: log.UserFullName,
        action: log.Action,
        details: log.Details,
        ipAddress: log.IpAddress,
        timestamp: log.Timestamp,
        createdAt: log.CreatedAt ?? log.Timestamp,
        entityType: log.EntityType,
        entityId: log.EntityId,
        entityName: log.EntityName,
        oldValues: log.OldValues,
        newValues: log.NewValues,
      })) || [];
      
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
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la récupération des logs par action',
        errors: error.response?.data?.Errors || error.response?.data?.errors,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }
};
