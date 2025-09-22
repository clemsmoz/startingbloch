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
      
      
      const response = await api.get(config.api.endpoints.cabinets, {
        params: { page, pageSize }
      });
      
      
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((cabinet: any) => ({
        id: cabinet.Id,
        nomCabinet: cabinet.NomCabinet,
        adresseCabinet: cabinet.AdresseCabinet,
        codePostal: cabinet.CodePostal,
        paysCabinet: cabinet.PaysCabinet,
        emailCabinet: cabinet.EmailCabinet,
        telephoneCabinet: cabinet.TelephoneCabinet,
        type: cabinet.Type,
        createdAt: cabinet.CreatedAt,
        updatedAt: cabinet.UpdatedAt,
        nombreClients: cabinet.NombreClients,
        clients: cabinet.Clients
      })) || [];
      
      
      
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

  // Récupérer les cabinets du client connecté
  getMine: async (): Promise<ApiResponse<Cabinet[]>> => {
    try {
      const response = await api.get(`${config.api.endpoints.cabinets}/my`);

      const list = response.data.Data || response.data.data || [];
      const transformed: Cabinet[] = (list as any[]).map((cabinet: any) => ({
        id: cabinet.Id ?? cabinet.id,
        nomCabinet: cabinet.NomCabinet ?? cabinet.nomCabinet,
        adresseCabinet: cabinet.AdresseCabinet ?? cabinet.adresseCabinet,
        codePostal: cabinet.CodePostal ?? cabinet.codePostal,
        paysCabinet: cabinet.PaysCabinet ?? cabinet.paysCabinet,
        emailCabinet: cabinet.EmailCabinet ?? cabinet.emailCabinet,
        telephoneCabinet: cabinet.TelephoneCabinet ?? cabinet.telephoneCabinet,
        type: cabinet.Type ?? cabinet.type,
        createdAt: cabinet.CreatedAt ?? cabinet.createdAt ?? new Date().toISOString(),
        updatedAt: cabinet.UpdatedAt ?? cabinet.updatedAt ?? new Date().toISOString(),
      }));

      return {
        success: true,
        data: transformed,
        message: response.data.Message || response.data.message || 'Cabinets du client récupérés',
      };
    } catch (error: any) {
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de vos cabinets',
        errors: error.response?.data?.errors,
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
      console.log('🏢 Cabinet Service - Création avec données:', cabinetData);
      
      const requestData = {
        NomCabinet: cabinetData.nomCabinet,
        AdresseCabinet: cabinetData.adresseCabinet,
        CodePostal: cabinetData.codePostal,
        PaysCabinet: cabinetData.paysCabinet,
        EmailCabinet: cabinetData.emailCabinet,
        TelephoneCabinet: cabinetData.telephoneCabinet,
        Type: cabinetData.type
      };
      
      console.log('🔄 Cabinet Service - Données envoyées au backend:', requestData);
      
      const response = await api.post(config.api.endpoints.cabinets, requestData);
      
      console.log('✅ Cabinet Service - Réponse du backend:', response.data);
      
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Cabinet créé avec succès'
      };
    } catch (error: any) {
      // Log plus verbeux pour capturer la réponse server-side (JSON) proprement
      try {
        console.error('❌ Cabinet Service - Erreur lors de la création:', error?.toString ? error.toString() : error);
        console.error('❌ Cabinet Service - Détails (response.data):', JSON.stringify(error.response?.data ?? error.response ?? error, null, 2));
      } catch (logErr) {
        console.error('❌ Cabinet Service - Erreur lors du logging:', logErr);
      }

      return {
        data: {} as Cabinet,
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la création du cabinet',
        errors: error.response?.data?.Errors || error.response?.data?.errors || error.response?.data
      };
    }
  },

  // Créer un cabinet pour le client connecté (et le lier)
  createForMe: async (cabinetData: CreateCabinetDto): Promise<ApiResponse<Cabinet>> => {
    try {
      const requestData = {
        NomCabinet: cabinetData.nomCabinet,
        AdresseCabinet: cabinetData.adresseCabinet,
        CodePostal: cabinetData.codePostal,
        PaysCabinet: cabinetData.paysCabinet,
        EmailCabinet: cabinetData.emailCabinet,
        TelephoneCabinet: cabinetData.telephoneCabinet,
        Type: cabinetData.type,
      };
      const response = await api.post(`${config.api.endpoints.cabinets}/my`, requestData);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Cabinet créé et lié au client avec succès',
      };
    } catch (error: any) {
      return {
        data: {} as Cabinet,
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la création du cabinet (client)',
        errors: error.response?.data?.Errors || error.response?.data?.errors,
      };
    }
  },

  // Lier un cabinet existant au client connecté
  linkExistingForMe: async (cabinetId: number): Promise<ApiResponse<boolean>> => {
    try {
      const response = await api.post(`${config.api.endpoints.cabinets}/my/link/${cabinetId}`, {});
      return {
        data: true as any,
        success: true,
        message: response.data.Message || response.data.message || 'Cabinet lié au client',
      };
    } catch (error: any) {
      return {
        data: false as any,
        success: false,
        message: error.response?.data?.message || 'Erreur lors du lien du cabinet',
        errors: error.response?.data?.errors,
      };
    }
  },

  // Mettre à jour un cabinet existant
  update: async (cabinetData: UpdateCabinetDto): Promise<ApiResponse<Cabinet>> => {
    try {
      console.log('🏢 Cabinet Service - Mise à jour avec données:', cabinetData);
      
      const requestData = {
        NomCabinet: cabinetData.nomCabinet,
        AdresseCabinet: cabinetData.adresseCabinet,
        CodePostal: cabinetData.codePostal,
        PaysCabinet: cabinetData.paysCabinet,
        EmailCabinet: cabinetData.emailCabinet,
        TelephoneCabinet: cabinetData.telephoneCabinet,
        Type: cabinetData.type
      };
      
      console.log('🔄 Cabinet Service - Données envoyées au backend:', requestData);
      
      const response = await api.put(`${config.api.endpoints.cabinets}/${cabinetData.id}`, requestData);

      console.log('✅ Cabinet Service - Réponse mise à jour:', response.data);

      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Cabinet mis à jour avec succès'
      };
    } catch (error: any) {
      // Log verbeux pour diagnostiquer les erreurs PUT
      try {
        console.error('❌ Cabinet Service - Erreur lors de la mise à jour:', error?.toString ? error.toString() : error);
        console.error('❌ Cabinet Service - HTTP status:', error.response?.status);
        console.error('❌ Cabinet Service - Détails (response.data):', JSON.stringify(error.response?.data ?? error.response ?? error, null, 2));
      } catch (logErr) {
        console.error('❌ Cabinet Service - Erreur lors du logging:', logErr);
      }

      return {
        data: {} as Cabinet,
        success: false,
        message: error.response?.data?.Message || error.response?.data?.message || 'Erreur lors de la mise à jour du cabinet',
        errors: error.response?.data?.Errors || error.response?.data?.errors
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
