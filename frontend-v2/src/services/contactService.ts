/*
 * ================================================================================================
 * SERVICE CONTACTS API
 * ================================================================================================
 */

import axios from 'axios';
import { config } from '../config';
import { createAuthInterceptor } from '../utils/auth';
import type { Contact, ApiResponse, CreateContactDto, UpdateContactDto, PagedApiResponse } from '../types';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Intercepteur pour ajouter le token JWT
const authInterceptor = createAuthInterceptor();
api.interceptors.request.use(authInterceptor.request, authInterceptor.error);

export const contactService = {
  // Récupérer tous les contacts
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Contact>> => {
    try {
      const response = await api.get(config.api.endpoints.contacts, {
        params: { page, pageSize }
      });
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((contact: any) => ({
        id: contact.Id,
        nom: contact.Nom,
        prenom: contact.Prenom,
        email: contact.Email,
        telephone: contact.Telephone,
        role: contact.Role,
        idClient: contact.IdClient,
        idCabinet: contact.IdCabinet,
        createdAt: contact.CreatedAt,
        updatedAt: contact.UpdatedAt,
        emails: contact.Emails || [],
        phones: contact.Phones || [],
        roles: contact.Roles || []
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
        message: error.response?.data?.message || 'Erreur lors de la récupération des contacts',
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

  // Récupérer un contact par ID
  getById: async (id: number): Promise<ApiResponse<Contact>> => {
    const response = await api.get(`${config.api.endpoints.contacts}/${id}`);
    return response.data;
  },

  // Créer un nouveau contact
  create: async (contact: CreateContactDto): Promise<ApiResponse<Contact>> => {
    const response = await api.post(config.api.endpoints.contacts, contact);
    return response.data;
  },

  // Mettre à jour un contact
  update: async (id: number, contact: UpdateContactDto): Promise<ApiResponse<Contact>> => {
    try {
      const response = await api.put(`${config.api.endpoints.contacts}/${id}`, contact);
      return response.data;
    } catch (error: any) {
      // return structured error without noisy logs

      return {
        data: {} as Contact,
        success: false,
        message: error.response?.data?.message || error.response?.data?.Message || 'Erreur lors de la mise à jour du contact',
        errors: error.response?.data?.errors || error.response?.data?.Errors
      };
    }
  },

  // Supprimer un contact
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`${config.api.endpoints.contacts}/${id}`);
    return response.data;
  },

  // Rechercher des contacts
  search: async (query: string): Promise<ApiResponse<Contact[]>> => {
    const response = await api.get(`${config.api.endpoints.contacts}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Récupérer les contacts d'un client spécifique
  getByClient: async (clientId: number, page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Contact>> => {
    try {
      const response = await api.get(`${config.api.endpoints.contacts}/client/${clientId}`, {
        params: { page, pageSize }
      });
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((contact: any) => ({
        id: contact.Id,
        nom: contact.Nom,
        prenom: contact.Prenom,
        email: contact.Email,
        telephone: contact.Telephone,
        role: contact.Role,
        idClient: contact.IdClient,
        idCabinet: contact.IdCabinet,
        createdAt: contact.CreatedAt,
        updatedAt: contact.UpdatedAt,
        emails: contact.Emails || [],
        phones: contact.Phones || [],
        roles: contact.Roles || [],
        cabinetNom: contact.CabinetNom,
        clientNom: contact.ClientNom
      })) || [];
      
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
        message: error.response?.data?.message || 'Erreur lors de la récupération des contacts du client',
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

  // Récupérer les contacts d'un cabinet spécifique
  getByCabinet: async (cabinetId: number, page: number = 1, pageSize: number = 10): Promise<PagedApiResponse<Contact>> => {
    try {
      const response = await api.get(`${config.api.endpoints.contacts}/cabinet/${cabinetId}`, {
        params: { page, pageSize }
      });
      // Transformer les données pour correspondre aux types frontend (camelCase)
      const transformedData = response.data.Data?.map((contact: any) => ({
        id: contact.Id,
        nom: contact.Nom,
        prenom: contact.Prenom,
        email: contact.Email,
        telephone: contact.Telephone,
        role: contact.Role,
        idClient: contact.IdClient,
        idCabinet: contact.IdCabinet,
        createdAt: contact.CreatedAt,
        updatedAt: contact.UpdatedAt,
        emails: contact.Emails || [],
        phones: contact.Phones || [],
        roles: contact.Roles || [],
        cabinetNom: contact.CabinetNom,
        clientNom: contact.ClientNom
      })) || [];
      
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
        message: error.response?.data?.message || 'Erreur lors de la récupération des contacts du cabinet',
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
};
