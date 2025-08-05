/*
 * ================================================================================================
 * SERVICE INVENTEUR - STARTINGBLOCH
 * ================================================================================================
 * 
 * Service pour la gestion des inventeurs.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { 
  Inventeur, 
  CreateInventeurDto, 
  UpdateInventeurDto, 
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

export const inventeurService = {
  // Récupérer tous les inventeurs
  getAll: async (): Promise<PagedApiResponse<Inventeur>> => {
    try {
      console.log('🧑‍💼 Inventeur Service - Récupération de tous les inventeurs...');
      
      const response = await api.get('/inventeur');
      
      console.log('✅ Inventeur Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((inventeur: any) => ({
        id: inventeur.Id,
        nomInventeur: inventeur.NomInventeur,
        prenomInventeur: inventeur.PrenomInventeur,
        adresseInventeur: inventeur.AdresseInventeur,
        emailInventeur: inventeur.EmailInventeur,
        telephoneInventeur: inventeur.TelephoneInventeur,
        createdAt: inventeur.CreatedAt,
        updatedAt: inventeur.UpdatedAt
      })) || [];
      
      console.log('🔄 Inventeur Service - Données transformées:', transformedData);
      
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
      console.error('❌ Inventeur Service - Erreur:', error);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des inventeurs',
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

  // Récupérer un inventeur par son ID
  getById: async (id: number): Promise<ApiResponse<Inventeur>> => {
    try {
      const response = await api.get(`/inventeur/${id}`);
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Inventeur récupéré avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Inventeur,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de l\'inventeur',
        errors: error.response?.data?.errors
      };
    }
  },

  // Créer un nouvel inventeur
  create: async (inventeurData: CreateInventeurDto): Promise<ApiResponse<Inventeur>> => {
    try {
      const response = await api.post('/inventeur', {
        nom_inventeur: inventeurData.nomInventeur,
        prenom_inventeur: inventeurData.prenomInventeur,
        adresse_inventeur: inventeurData.adresseInventeur,
        email_inventeur: inventeurData.emailInventeur,
        telephone_inventeur: inventeurData.telephoneInventeur
      });
      return {
        data: response.data,
        success: true,
        message: 'Inventeur créé avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Inventeur,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création de l\'inventeur',
        errors: error.response?.data?.errors
      };
    }
  },

  // Mettre à jour un inventeur existant
  update: async (inventeurData: UpdateInventeurDto): Promise<ApiResponse<Inventeur>> => {
    try {
      const response = await api.put(`/inventeur/${inventeurData.id}`, {
        nom_inventeur: inventeurData.nomInventeur,
        prenom_inventeur: inventeurData.prenomInventeur,
        adresse_inventeur: inventeurData.adresseInventeur,
        email_inventeur: inventeurData.emailInventeur,
        telephone_inventeur: inventeurData.telephoneInventeur
      });
      return {
        data: response.data.data || response.data,
        success: true,
        message: 'Inventeur mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        data: {} as Inventeur,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'inventeur',
        errors: error.response?.data?.errors
      };
    }
  },

  // Supprimer un inventeur
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/inventeur/${id}`);
      return {
        data: undefined,
        success: true,
        message: 'Inventeur supprimé avec succès'
      };
    } catch (error: any) {
      return {
        data: undefined,
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression de l\'inventeur',
        errors: error.response?.data?.errors
      };
    }
  }
};

export default inventeurService;
