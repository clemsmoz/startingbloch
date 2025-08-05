/*
 * ================================================================================================
 * SERVICE CABINET - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des cabinets d'avocats.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Cabinet, 
  CreateCabinetDto, 
  UpdateCabinetDto, 
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

export const cabinetService = {
  // Récupérer tous les cabinets
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Cabinet>> => {
    try {
      // console.log(`🏢 Cabinet Service - Récupération des cabinets (page ${page}, taille ${pageSize})...`);
      // console.log('URL complète:', `${config.api.baseUrl}${config.api.endpoints.cabinets}`);
      
      const response = await api.get(config.api.endpoints.cabinets, {
        params: { page, pageSize }
      });
      
      // console.log('✅ Cabinet Service - Réponse reçue:', response.data);
      // console.log('🔍 Cabinet Service - Structure complète:', JSON.stringify(response.data, null, 2));
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((cabinet: any) => ({
        id: cabinet.Id,
        nomCabinet: cabinet.NomCabinet,
        adresseCabinet: cabinet.AdresseCabinet,
        codePostal: cabinet.CodePostal,
        paysCabinet: cabinet.PaysCabinet,
        emailCabinet: cabinet.EmailCabinet,
        telephoneCabinet: cabinet.TelephoneCabinet,
        referenceCabinet: cabinet.ReferenceCabinet,
        type: cabinet.Type,
        createdAt: cabinet.CreatedAt,
        updatedAt: cabinet.UpdatedAt,
        nombreClients: cabinet.NombreClients,
        clients: cabinet.Clients
      })) || [];
      
      //console.log('🔄 Cabinet Service - Données transformées:', transformedData);
      
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
      // console.error('❌ Cabinet Service - Erreur:', error);
      // console.error('Détails de l\'erreur:', error.response?.data);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des cabinets',
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

  // Récupérer un cabinet par son ID
  getById: async (id: number): Promise<ApiResponse<Cabinet>> => {
    try {
      const response = await api.get(`${config.api.endpoints.cabinets}/${id}`);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Cabinet récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Cabinet,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du cabinet',
        errors: error.response?.data?.errors
      };
    }
  },

  // Créer un nouveau cabinet
  create: async (cabinetData: CreateCabinetDto): Promise<ApiResponse<Cabinet>> => {
    try {
      const response = await api.post(config.api.endpoints.cabinets, {
        nom_cabinet: cabinetData.nomCabinet,
        email_cabinet: cabinetData.emailCabinet,
        telephone_cabinet: cabinetData.telephoneCabinet,
        reference_cabinet: cabinetData.referenceCabinet,
        type: cabinetData.type
      });
      return {
        data: response.data,
        success: true,
        message: 'Cabinet créé avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Cabinet,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du cabinet',
        errors: error.response?.data?.errors
      };
    }
  },

  // Mettre à jour un cabinet existant
  update: async (cabinetData: UpdateCabinetDto): Promise<ApiResponse<Cabinet>> => {
    try {
      const response = await api.put(`${config.api.endpoints.cabinets}/${cabinetData.id}`, {
        nom_cabinet: cabinetData.nomCabinet,
        email_cabinet: cabinetData.emailCabinet,
        telephone_cabinet: cabinetData.telephoneCabinet,
        reference_cabinet: cabinetData.referenceCabinet,
        type: cabinetData.type
      });
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Cabinet mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Cabinet,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du cabinet',
        errors: error.response?.data?.errors
      };
    }
  },

  // Supprimer un cabinet
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`${config.api.endpoints.cabinets}/${id}`);
      return {
        data: undefined,
        success: true,
        message: 'Cabinet supprimé avec succès'
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression du cabinet',
        errors: error.response?.data?.errors
      };
    }
  },

  // Récupérer les cabinets par brevet
  getCabinetsByBrevetId: async (brevetId: number): Promise<ApiResponse<Cabinet[]>> => {
    try {
      const response = await api.get(`${config.api.endpoints.cabinets}?id_brevet=${brevetId}`);
      return {
        data: response.data || [],
        success: true,
        message: 'Cabinets du brevet récupérés avec succès'
      };
    } catch (error: any) {
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des cabinets du brevet',
        errors: error.response?.data?.errors
      };
    }
  }
};
