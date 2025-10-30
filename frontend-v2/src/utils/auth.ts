/*
 * ================================================================================================
 * UTILITAIRES AUTH - TOKEN JWT
 * ================================================================================================
 */

/**
 * Récupère le token JWT depuis le sessionStorage
 */
export const getAuthToken = (): string | null => {
  let token: string | null = null;
  try {
    // D'abord essayer de récupérer le token directement
    token = sessionStorage.getItem('startingbloch_token');

    if (!token) {
      // Fallback: essayer depuis le store Zustand
      const authStore = localStorage.getItem('startingbloch-auth');
      if (authStore) {
        const { state } = JSON.parse(authStore);
        token = state?.token ?? null;
      }
    }
  } catch {
    // ignore errors when reading storage
  }

  return token;
};

/**
 * Intercepteur Axios pour ajouter automatiquement le token JWT
 */
export const createAuthInterceptor = () => ({
  request: (config: any) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error: (error: any) => {
    // forward error silently
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
});
