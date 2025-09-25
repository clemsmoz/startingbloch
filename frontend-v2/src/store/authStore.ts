/*
 * ================================================================================================
 * STORE AUTHENTIFICATION - ZUSTAND
 * ================================================================================================
 * 
 * Gestion de l'état d'authentification global avec Zustand pour StartingBloch.
 * Inclut la gestion JWT, les rôles utilisateur et la persistance de session.
 * 
 * ================================================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthState {
  // État
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed properties
  isAdmin: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Computed properties
      get isAdmin() {
        const state = get();
        return state.user?.role === 'Admin';
      },

      // Actions
      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔐 Tentative de connexion pour:', email);
          const result = await authService.login({ email, password });
          
          console.log('✅ Réponse de connexion reçue:', result);
          
          // Le backend peut retourner Token (majuscule) au lieu de token (minuscule)
          const resultAny = result as any;
          const token = result.token ?? resultAny.Token ?? '';
          const refreshToken = result.refreshToken ?? resultAny.RefreshToken ?? '';
          const userRaw = (result.user ?? resultAny.User ?? null) as any;
          
          // Mapper les propriétés backend vers frontend
          const user = userRaw ? {
            id: userRaw.id ?? userRaw.Id,
            email: userRaw.email ?? userRaw.Email,
            username: userRaw.username ?? userRaw.Username ?? userRaw.email ?? userRaw.Email,
            nom: userRaw.nom ?? userRaw.LastName,
            prenom: userRaw.prenom ?? userRaw.FirstName,
            role: userRaw.role ?? userRaw.Role,
            isActive: userRaw.isActive !== undefined ? userRaw.isActive : userRaw.IsActive,
            createdAt: userRaw.createdAt ?? userRaw.CreatedAt ?? new Date().toISOString(),
            updatedAt: userRaw.updatedAt ?? userRaw.UpdatedAt ?? new Date().toISOString()
          } : null;
          
          console.log('📝 Stockage des tokens...');
          console.log('Token:', token ? 'présent' : 'absent');
          console.log('RefreshToken:', refreshToken ? 'présent' : 'absent');
          console.log('User:', user ? user.email : 'absent');
          console.log('User complet:', JSON.stringify(user, null, 2));
          
          // Stocker dans sessionStorage pour la session uniquement
          sessionStorage.setItem('startingbloch_token', token);
          sessionStorage.setItem('startingbloch_refresh_token', refreshToken);
          sessionStorage.setItem('startingbloch_user', JSON.stringify(user));
          
          console.log('💾 Tokens stockés dans localStorage');
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ État d\'authentification mis à jour');
          
          return true;
        } catch (error) {
          console.error('❌ Erreur de connexion:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        }
        
        // Nettoyer aussi le sessionStorage
        sessionStorage.removeItem('startingbloch_token');
        sessionStorage.removeItem('startingbloch_refresh_token');
        sessionStorage.removeItem('startingbloch_user');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const storedToken = sessionStorage.getItem('startingbloch_token');
        const storedRefreshToken = sessionStorage.getItem('startingbloch_refresh_token');
        const storedUser = sessionStorage.getItem('startingbloch_user');
        
        console.log('🔄 RefreshAuth - Token:', storedToken ? 'présent' : 'absent');
        console.log('🔄 RefreshAuth - User brut:', storedUser);
        
        // Si nous avons déjà un token valide, l'utiliser
        if (storedToken && storedUser) {
          try {
            const userRaw = JSON.parse(storedUser);
            console.log('🔄 RefreshAuth - User parsé:', userRaw);
            
            // Mapper les propriétés comme dans le login
            const user = {
              id: userRaw.id ?? userRaw.Id,
              email: userRaw.email ?? userRaw.Email,
              username: userRaw.username ?? userRaw.Username ?? userRaw.email ?? userRaw.Email,
              nom: userRaw.nom ?? userRaw.LastName,
              prenom: userRaw.prenom ?? userRaw.FirstName,
              role: userRaw.role ?? userRaw.Role,
              isActive: userRaw.isActive !== undefined ? userRaw.isActive : userRaw.IsActive,
              createdAt: userRaw.createdAt ?? userRaw.CreatedAt ?? new Date().toISOString(),
              updatedAt: userRaw.updatedAt ?? userRaw.UpdatedAt ?? new Date().toISOString()
            };
            
            console.log('🔄 RefreshAuth - User mappé:', user);
            
            set({
              token: storedToken,
              refreshToken: storedRefreshToken,
              user,
              isAuthenticated: true,
              error: null,
            });
            return;
          } catch (error) {
            console.error('Erreur parsing stored user:', error);
          }
        }
        
        // Sinon essayer de rafraîchir le token
        if (storedRefreshToken) {
          try {
            const newToken = await authService.refreshToken();
            const user = authService.getStoredUser();
            
            set({
              token: newToken,
              refreshToken: storedRefreshToken,
              user,
              isAuthenticated: true,
              error: null,
            });
          } catch (error) {
            console.error('Erreur lors du refresh token:', error);
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              error: null,
            });
          }
        } else {
          set({ isAuthenticated: false });
        }
      },

      setUser: (user: User) => set({ user }),
      
      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'startingbloch-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
