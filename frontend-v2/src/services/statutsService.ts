/*
 * ================================================================================================
 * SERVICE STATUTS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des statuts.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Statuts, 
  CreateStatutsDto, 
  UpdateStatutsDto, 
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

export const statutsService = {
  // Récupérer tous les statuts
  getAll: async (): Promise<PagedApiResponse<Statuts>> => {
    try {
      console.log('📊 Statuts Service - Récupération de tous les statuts...');
      
  const response = await api.get(config.api.endpoints.statuts);
      
      console.log('✅ Statuts Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((statut: any) => ({
        id: statut.Id,
        description: statut.Description ?? statut.Nom ?? statut.DescriptionStatut ?? statut.NomStatut,
      })) || [];
      
      console.log('🔄 Statuts Service - Données transformées:', transformedData);
      
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
      console.error('❌ Statuts Service - Erreur:', error);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des statuts',
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

  // Récupérer un statut par son ID
  getById: async (id: number): Promise<ApiResponse<Statuts>> => {
    try {
  const response = await api.get(`${config.api.endpoints.statuts}/${id}`);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Statut récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Statuts,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du statut',
        errors: error.response?.data?.errors
      };
    }
  },

  // Créer un nouveau statut
  create: async (statutsData: CreateStatutsDto): Promise<ApiResponse<Statuts>> => {
    try {
  const response = await api.post(config.api.endpoints.statuts, {
        description: statutsData.description
      });
      return {
        data: response.data,
        success: true,
        message: 'Statut créé avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Statuts,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du statut',
        errors: error.response?.data?.errors
      };
    }
  },

  // Mettre à jour un statut existant
  update: async (statutsData: UpdateStatutsDto): Promise<ApiResponse<Statuts>> => {
    try {
  const response = await api.put(`${config.api.endpoints.statuts}/${statutsData.id}`, {
        description: statutsData.description
      });
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Statut mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Statuts,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du statut',
        errors: error.response?.data?.errors
      };
    }
  },

  // Supprimer un statut
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
  await api.delete(`${config.api.endpoints.statuts}/${id}`);
      return {
        data: undefined,
        success: true,
        message: 'Statut supprimé avec succès'
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression du statut',
        errors: error.response?.data?.errors
      };
    }
  }
};

export default statutsService;
