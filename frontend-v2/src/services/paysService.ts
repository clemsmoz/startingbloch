/*
 * ================================================================================================
 * SERVICE PAYS - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des pays.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Pays, 
  CreatePaysDto, 
  UpdatePaysDto, 
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

export const paysService = {
  // Récupérer tous les pays
  getAll: async (): Promise<PagedApiResponse<Pays>> => {
    try {
      console.log('🌍 Pays Service - Récupération de tous les pays...');
      
  const response = await api.get(config.api.endpoints.pays);
      
      console.log('✅ Pays Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((pays: any) => ({
        id: pays.Id,
        nomPays: pays.NomPays,
        codePays: pays.CodePays,
        iso2: pays.Iso2,
        iso3: pays.Iso3,
        createdAt: pays.CreatedAt,
        updatedAt: pays.UpdatedAt
      })) || [];
      
      console.log('🔄 Pays Service - Données transformées:', transformedData);
      
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
      console.error('❌ Pays Service - Erreur:', error);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des pays',
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

  // Récupérer un pays par son ID
  getById: async (id: number): Promise<ApiResponse<Pays>> => {
    try {
  const response = await api.get(`${config.api.endpoints.pays}/${id}`);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Pays récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Pays,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du pays',
        errors: error.response?.data?.errors
      };
    }
  },

  // Créer un nouveau pays
  create: async (paysData: CreatePaysDto): Promise<ApiResponse<Pays>> => {
    try {
  const response = await api.post(config.api.endpoints.pays, {
        nom_pays: paysData.nomPays,
        code_pays: paysData.codePays,
        iso_pays: paysData.isoPays
      });
      return {
        data: response.data,
        success: true,
        message: 'Pays créé avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Pays,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du pays',
        errors: error.response?.data?.errors
      };
    }
  },

  // Mettre à jour un pays existant
  update: async (paysData: UpdatePaysDto): Promise<ApiResponse<Pays>> => {
    try {
  const response = await api.put(`${config.api.endpoints.pays}/${paysData.id}`, {
        nom_pays: paysData.nomPays,
        code_pays: paysData.codePays,
        iso_pays: paysData.isoPays
      });
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Pays mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Pays,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du pays',
        errors: error.response?.data?.errors
      };
    }
  },

  // Supprimer un pays
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
  await api.delete(`${config.api.endpoints.pays}/${id}`);
      return {
        data: undefined,
        success: true,
        message: 'Pays supprimé avec succès'
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression du pays',
        errors: error.response?.data?.errors
      };
    }
  }
};

export default paysService;
