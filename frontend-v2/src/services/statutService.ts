/*
 * ================================================================================================
 * SERVICE STATUTS API
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { ApiResponse } from '../types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Intercepteur pour ajouter le token JWT
const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export interface StatutDto {
  id: number;
  nomStatut: string;
  description?: string;
  createdAt: string;
}

export const statutService = {
  // Récupérer tous les statuts
  getAll: async (): Promise<ApiResponse<StatutDto[]>> => {
    try {
      console.log('📊 Statut Service - Récupération des statuts...');
      
      const response = await api.get(`${config.api.baseUrl}/api/Statuts`);
      
      console.log('✅ Statut Service - Réponse reçue:', response.data);
      
      // Transformer les données pour correspondre aux types frontend
      const transformedData = response.data.Data?.map((statut: any) => ({
        id: statut.Id,
        nomStatut: statut.NomStatut,
        description: statut.Description,
        createdAt: statut.CreatedAt
      })) || [];
      
      return {
        success: response.data.Success,
        data: transformedData,
        message: response.data.Message
      };
    } catch (error: any) {
      console.error('❌ Statut Service - Erreur:', error);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des statuts',
        errors: error.response?.data?.errors
      };
    }
  }
};
