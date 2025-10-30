/*
 * ================================================================================================
 * SERVICE DEPOSANT - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des déposants.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Deposant, 
  CreateDeposantDto, 
  UpdateDeposantDto, 
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

export const deposantService = {
  // Récupérer tous les déposants
  getAll: async (page: number = 1, pageSize: number = 100): Promise<PagedApiResponse<Deposant>> => {
    try {
      console.log('👤 Deposant Service - Récupération de tous les déposants...');
      
  const response = await api.get(config.api.endpoints.deposants || '/api/deposant', { params: { page, pageSize } });
      
      console.log('✅ Deposant Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((deposant: any) => ({
        id: deposant.Id,
        nomDeposant: deposant.Nom,
        prenomDeposant: deposant.Prenom,
        emailDeposant: deposant.Email,
        // Champs facultatifs non présents côté backend gardés pour compat.
        adresseDeposant: deposant.AdresseDeposant,
        telephoneDeposant: deposant.TelephoneDeposant,
        createdAt: deposant.CreatedAt ?? '',
        updatedAt: deposant.UpdatedAt ?? ''
      })) || [];
      
      console.log('🔄 Deposant Service - Données transformées:', transformedData);
      
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
      console.error('❌ Deposant Service - Erreur:', error);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des déposants',
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

  // Récupérer un déposant par son ID
  getById: async (id: number): Promise<ApiResponse<Deposant>> => {
    try {
  const response = await api.get(`${config.api.endpoints.deposants || '/api/deposant'}/${id}`);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Déposant récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Deposant,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du déposant',
        errors: error.response?.data?.errors
      };
    }
  },

  // Créer un nouveau déposant
  create: async (deposantData: CreateDeposantDto): Promise<ApiResponse<Deposant>> => {
    try {
      const response = await api.post(config.api.endpoints.deposants || '/api/deposant', {
        // Backend attend Nom, Prenom, Email
        nom: deposantData.nomDeposant,
        prenom: deposantData.prenomDeposant,
        email: deposantData.emailDeposant,
      });
      return {
        data: response.data,
        success: true,
        message: 'Déposant créé avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Deposant,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du déposant',
        errors: error.response?.data?.errors
      };
    }
  },

  // Mettre à jour un déposant existant
  update: async (deposantData: UpdateDeposantDto): Promise<ApiResponse<Deposant>> => {
    try {
      const response = await api.put(`${config.api.endpoints.deposants || '/api/deposant'}/${deposantData.id}`, {
        nom: deposantData.nomDeposant,
        prenom: deposantData.prenomDeposant,
        email: deposantData.emailDeposant,
      });
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Déposant mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Deposant,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du déposant',
        errors: error.response?.data?.errors
      };
    }
  },

  // Supprimer un déposant
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
  await api.delete(`${config.api.endpoints.deposants || '/api/deposant'}/${id}`);
      return {
        data: undefined,
        success: true,
        message: 'Déposant supprimé avec succès'
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression du déposant',
        errors: error.response?.data?.errors
      };
    }
  }
};

export default deposantService;
