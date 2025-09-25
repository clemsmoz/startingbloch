/*
 * ================================================================================================
 * SERVICE AUTHENTIFICATION - API CLIENT
 * ================================================================================================
 * 
 * Service de gestion de l'authentification JWT pour StartingBloch.
 * Inclut login, refresh token, validation et gestion du stockage sécurisé.
 * 
 * ================================================================================================
 */

import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { config } from '../config';
import type { User, LoginRequest, AuthResponse } from '../types';

class AuthService {
  private tokenKey = config.auth.tokenKey;
  private refreshTokenKey = config.auth.refreshTokenKey;
  private userKey = config.auth.userKey;

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${config.api.baseUrl}${config.api.endpoints.auth}/login`,
        credentials
      );

      const { token, refreshToken, user } = response.data;

      // Stocker les tokens et informations utilisateur
      this.storeTokens(token, refreshToken);
      this.storeUser(user);

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      const token = this.getStoredToken();
      if (token) {
        await axios.post(
          `${config.api.baseUrl}${config.api.endpoints.auth}/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      this.clearStorage();
    }
  }

  /**
   * Rafraîchir le token JWT
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await axios.post<{ token: string; refreshToken: string }>(
        `${config.api.baseUrl}${config.api.endpoints.auth}/refresh`,
        { refreshToken }
      );

      const { token, refreshToken: newRefreshToken } = response.data;
      this.storeTokens(token, newRefreshToken);

      return token;
    } catch (error) {
      this.clearStorage();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        throw new Error('Aucun token disponible');
      }

      const response = await axios.get<User>(
        `${config.api.baseUrl}${config.api.endpoints.auth}/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.storeUser(response.data);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Valider la validité d'un token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Vérifier l'expiration côté client
      if (this.isTokenExpired(token)) {
        return false;
      }

      // Vérifier côté serveur
      const response = await axios.get(
        `${config.api.baseUrl}${config.api.endpoints.auth}/validate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Rafraîchir le token si nécessaire
   */
  async refreshTokenIfNeeded(): Promise<void> {
    const token = this.getStoredToken();
    if (!token) return;

    // Rafraîchir si le token expire dans moins de 5 minutes
    if (this.isTokenExpiringSoon(token, 5 * 60 * 1000)) {
      await this.refreshToken();
    }
  }

  /**
   * Obtenir le token stocké
   */
  getStoredToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Obtenir le refresh token stocké
   */
  getStoredRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Obtenir l'utilisateur stocké
   */
  getStoredUser(): User | null {
    try {
      const userData = sessionStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur parsing user data:', error);
      return null;
    }
  }

  /**
   * Stocker les tokens
   */
  private storeTokens(token: string, refreshToken: string): void {
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  /**
   * Stocker les informations utilisateur
   */
  private storeUser(user: User): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Nettoyer le stockage
   */
  clearStorage(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<{ exp?: number }>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp ? decoded.exp < currentTime : true;
    } catch (error) {
      return true;
    }
  }

  /**
   * Vérifier si le token expire bientôt
   */
  private isTokenExpiringSoon(token: string, bufferMs: number): boolean {
    try {
      const decoded = jwtDecode<{ exp?: number }>(token);
      const currentTime = Date.now() / 1000;
      const bufferSeconds = bufferMs / 1000;
      return decoded.exp ? decoded.exp < (currentTime + bufferSeconds) : true;
    } catch (error) {
      return true;
    }
  }

  /**
   * Gérer les erreurs d'authentification
   */
  private handleAuthError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(`Erreur d'authentification: ${message}`);
    }
    return error instanceof Error ? error : new Error('Erreur inconnue');
  }
}

export const authService = new AuthService();
