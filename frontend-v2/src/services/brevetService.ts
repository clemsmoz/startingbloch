/*
 * ================================================================================================
 * SERVICE BREVETS API
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { Brevet, ApiResponse, CreateBrevetDto, UpdateBrevetDto, PagedApiResponse } from '../types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Intercepteur pour ajouter le token JWT
const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const brevetService = {
  // Récupérer tous les brevets
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Brevet>> => {
    try {
      const response = await api.get(config.api.endpoints.brevets, {
        params: { page, pageSize }
      });

      // Transformer les données pour correspondre aux types frontend (camelCase)
  const transformedData = response.data.Data?.map((brevet: any) => {
        return {
          id: brevet.Id,
          numeroBrevet: brevet.ReferenceFamille, // Mapping corrigé
          titreBrevet: brevet.Titre, // Mapping corrigé
          descriptionBrevet: brevet.Commentaire, // Mapping corrigé
          dateDepot: brevet.DateDepot ?? null,
          dateDelivrance: brevet.DateDelivrance ?? null,
          dateExpiration: brevet.DateExpiration ?? null,
          statutBrevet: brevet.StatutBrevet ?? null,
          paysBrevet: brevet.PaysBrevet ?? null,
          classesBrevet: brevet.ClassesBrevet ?? null,
          createdAt: brevet.CreatedAt,
          updatedAt: brevet.UpdatedAt,
          clientId: brevet.ClientId ?? null,
          clients: brevet.Clients ?? [], // Pluriel selon la structure backend
          inventeurs: brevet.Inventeurs ?? [],
          deposants: brevet.Deposants ?? [],
          titulaires: brevet.Titulaires ?? [],
          cabinets: brevet.Cabinets ?? [],
          informationsDepot: brevet.InformationsDepot ?? null
        };
  }) || [];
      
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
        message: error.response?.data?.message || 'Erreur lors de la récupération des brevets',
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

  // Récupérer un brevet par ID avec tous les détails
  getById: async (id: number): Promise<ApiResponse<Brevet>> => {
    try {
      const response = await api.get(`${config.api.endpoints.brevets}/${id}`);
      
      // Transformer les données pour correspondre aux types frontend
      if (response.data.Success && response.data.Data) {
        const brevet = response.data.Data;
        const transformedBrevet = {
          id: brevet.Id,
          numeroBrevet: brevet.ReferenceFamille,
          titreBrevet: brevet.Titre,
          descriptionBrevet: brevet.Commentaire,
          dateDepot: brevet.DateDepot ?? null,
          dateDelivrance: brevet.DateDelivrance ?? null,
          dateExpiration: brevet.DateExpiration ?? null,
          statutBrevet: brevet.StatutBrevet ?? null,
          paysBrevet: brevet.PaysBrevet ?? null,
          classesBrevet: brevet.ClassesBrevet ?? null,
          createdAt: brevet.CreatedAt,
          updatedAt: brevet.UpdatedAt,
          clientId: brevet.ClientId ?? null,
          clients: brevet.Clients ?? [],
          inventeurs: brevet.Inventeurs ?? [],
          deposants: brevet.Deposants ?? [],
          titulaires: brevet.Titulaires ?? [],
          cabinets: brevet.Cabinets ?? [],
          informationsDepot: brevet.InformationsDepot ?? []
        };
        
        return {
          success: true,
          data: transformedBrevet,
          message: response.data.Message
        };
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Créer un nouveau brevet
  create: async (brevet: CreateBrevetDto): Promise<ApiResponse<Brevet>> => {
    try {
      const response = await api.post(config.api.endpoints.brevets, brevet);
      const payload: any = response?.data ?? {};
      // Normalize common backend shapes (Success/Data/Message) to frontend ApiResponse
      const success = typeof payload.success !== 'undefined' ? payload.success : (typeof payload.Success !== 'undefined' ? payload.Success : true);
      const data = payload.data ?? payload.Data ?? payload;
      const message = payload.message ?? payload.Message ?? undefined;
      const errors = payload.errors ?? payload.Errors ?? undefined;
      return {
        success,
        data,
        message,
        errors,
      } as ApiResponse<Brevet>;
    } catch (error: any) {
      // Preserve throwing behavior for unexpected network/server errors
      throw error;
    }
  },

  // Mettre à jour un brevet
  update: async (id: number, brevet: UpdateBrevetDto): Promise<ApiResponse<Brevet>> => {
    try {
      const response = await api.put(`${config.api.endpoints.brevets}/${id}`, brevet);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Supprimer un brevet
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`${config.api.endpoints.brevets}/${id}`);
    return response.data;
  },

  // Rechercher des brevets
  search: async (query: string): Promise<ApiResponse<Brevet[]>> => {
    const response = await api.get(`${config.api.endpoints.brevets}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Récupérer les brevets d'un client
  getByClientId: async (clientId: number): Promise<ApiResponse<Brevet[]>> => {
    try {
      const resp = await api.get(`${config.api.endpoints.brevets}/client/${clientId}`);

      const payload: any = resp.data || {};
      const items = payload.Data || [];

      const transformed: Brevet[] = (items as any[]).map((brevet: any) => ({
        id: brevet.Id,
        numeroBrevet: brevet.ReferenceFamille,
        titreBrevet: brevet.Titre,
        descriptionBrevet: brevet.Commentaire,
        dateDepot: brevet.DateDepot ?? null,
        dateDelivrance: brevet.DateDelivrance ?? null,
        dateExpiration: brevet.DateExpiration ?? null,
        statutBrevet: brevet.StatutBrevet ?? null,
        paysBrevet: brevet.PaysBrevet ?? null,
        classesBrevet: brevet.ClassesBrevet ?? null,
        createdAt: brevet.CreatedAt,
        updatedAt: brevet.UpdatedAt,
        clientId: brevet.ClientId ?? null,
        clients: brevet.Clients ?? [],
        inventeurs: brevet.Inventeurs ?? [],
        deposants: brevet.Deposants ?? [],
        titulaires: brevet.Titulaires ?? [],
        cabinets: brevet.Cabinets ?? [],
        informationsDepot: brevet.InformationsDepot ?? []
      }));

      return {
        success: !!payload.Success,
        data: transformed,
        message: payload.Message,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erreur lors de la récupération des brevets du client',
        errors: error.response?.data?.errors,
      };
    }
  },
};
