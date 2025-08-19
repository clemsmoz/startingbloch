/*
 * ================================================================================================
 * SERVICE CLIENTS API
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { Client, ApiResponse, CreateClientDto, CreateClientWithUserDto, UpdateClientDto, PagedApiResponse } from '../types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Intercepteur pour ajouter le token JWT
const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const clientService = {
  // Récupérer tous les clients
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Client>> => {
    try {
      console.log(`👥 Client Service - Récupération des clients (page ${page}, taille ${pageSize})...`);
      console.log('URL complète:', `${config.api.baseUrl}${config.api.endpoints.clients}`);
      
      const response = await api.get(config.api.endpoints.clients, {
        params: { page, pageSize }
      });
      
      console.log('✅ Client Service - Réponse reçue:', response.data);
      console.log('🔍 Client Service - Structure complète:', JSON.stringify(response.data, null, 2));
      
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((client: any) => ({
        id: client.Id,
        nomClient: client.NomClient,
        referenceClient: client.ReferenceClient,
        adresseClient: client.AdresseClient,
        codePostal: client.CodePostal,
        paysClient: client.PaysClient,
        emailClient: client.EmailClient,
        telephoneClient: client.TelephoneClient,
        createdAt: client.CreatedAt,
        updatedAt: client.UpdatedAt,
        nombreBrevets: client.NombreBrevets,
        brevets: client.Brevets
      })) || [];
      
      console.log('🔄 Client Service - Données transformées:', transformedData);
      
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
      console.error('❌ Client Service - Erreur:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      return {
        data: [],
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des clients',
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

  // Récupérer un client par ID
  getById: async (id: number): Promise<ApiResponse<Client>> => {
    const response = await api.get(`${config.api.endpoints.clients}/${id}`);
    return response.data;
  },

  // Créer un nouveau client
  create: async (client: CreateClientDto): Promise<ApiResponse<Client>> => {
    const response = await api.post(config.api.endpoints.clients, client);
    return response.data;
  },

  // Créer un nouveau client avec compte utilisateur
  createWithUser: async (clientWithUser: CreateClientWithUserDto): Promise<ApiResponse<Client>> => {
    console.log('🚀 Client Service - Création client avec utilisateur:', clientWithUser);
    const response = await api.post('/api/clients/create-with-user', clientWithUser);
    console.log('✅ Client Service - Réponse création client+user:', response.data);
    return response.data;
  },

  // Mettre à jour un client
  update: async (id: number, client: UpdateClientDto): Promise<ApiResponse<Client>> => {
    const response = await api.put(`${config.api.endpoints.clients}/${id}`, client);
    return response.data;
  },

  // Supprimer un client
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`${config.api.endpoints.clients}/${id}`);
    return response.data;
  },

  // Rechercher des clients
  search: async (query: string): Promise<ApiResponse<Client[]>> => {
    const response = await api.get(`${config.api.endpoints.clients}/search`, {
      params: { q: query }
    });
    return response.data;
  },
};
