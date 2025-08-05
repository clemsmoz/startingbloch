/*
 * ================================================================================================
 * SERVICE TITULAIRE - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des titulaires.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Titulaire, 
  CreateTitulaireDto, 
  UpdateTitulaireDto, 
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

export const titulaireService = {
  // Récupérer tous les titulaires
  getAll: async (): Promise<PagedApiResponse<Titulaire>> => {
    try {
      console.log('👑 Titulaire Service - Récupération de tous les titulaires...');
      
      const response = await api.get('/titulaire');
      
      console.log('✅ Titulaire Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((titulaire: any) => ({
        id: titulaire.Id,
        nomTitulaire: titulaire.NomTitulaire,
        prenomTitulaire: titulaire.PrenomTitulaire,
        adresseTitulaire: titulaire.AdresseTitulaire,
        emailTitulaire: titulaire.EmailTitulaire,
        telephoneTitulaire: titulaire.TelephoneTitulaire,
        createdAt: titulaire.CreatedAt,
        updatedAt: titulaire.UpdatedAt
      })) || [];
      
      console.log('🔄 Titulaire Service - Données transformées:', transformedData);
      
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
      console.error('❌ Titulaire Service - Erreur:', error);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des titulaires',
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

  // Récupérer un titulaire par son ID
  getById: async (id: number): Promise<ApiResponse<Titulaire>> => {
    try {
      const response = await api.get(`/titulaire/${id}`);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Titulaire récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Titulaire,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du titulaire',
        errors: error.response?.data?.errors
      };
    }
  },

  // Créer un nouveau titulaire
  create: async (titulaireData: CreateTitulaireDto): Promise<ApiResponse<Titulaire>> => {
    try {
      const response = await api.post('/titulaire', {
        nom_titulaire: titulaireData.nomTitulaire,
        adresse_titulaire: titulaireData.adresseTitulaire,
        email_titulaire: titulaireData.emailTitulaire,
        telephone_titulaire: titulaireData.telephoneTitulaire
      });
      return {
        data: response.data,
        success: true,
        message: 'Titulaire créé avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Titulaire,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création du titulaire',
        errors: error.response?.data?.errors
      };
    }
  },

  // Mettre à jour un titulaire existant
  update: async (titulaireData: UpdateTitulaireDto): Promise<ApiResponse<Titulaire>> => {
    try {
      const response = await api.put(`/titulaire/${titulaireData.id}`, {
        nom_titulaire: titulaireData.nomTitulaire,
        adresse_titulaire: titulaireData.adresseTitulaire,
        email_titulaire: titulaireData.emailTitulaire,
        telephone_titulaire: titulaireData.telephoneTitulaire
      });
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Titulaire mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Titulaire,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du titulaire',
        errors: error.response?.data?.errors
      };
    }
  },

  // Supprimer un titulaire
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/titulaire/${id}`);
      return {
        data: undefined,
        success: true,
        message: 'Titulaire supprimé avec succès'
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression du titulaire',
        errors: error.response?.data?.errors
      };
    }
  }
};

export default titulaireService;
