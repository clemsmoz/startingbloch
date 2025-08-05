/*
 * ================================================================================================
 * UTILITAIRES AUTH - TOKEN JWT
 * ================================================================================================
 */

/**
 * Récupère le token JWT depuis le sessionStorage
 */
export const getAuthToken = (): string | null => {
  try {
    // D'abord essayer de récupérer le token directement
    let token = sessionStorage.getItem('startingbloch_token');
    console.log('🔑 Auth Utils - Token direct:', token ? 'présent' : 'absent');
    
    if (!token) {
      // Fallback: essayer depuis le store Zustand
      const authStore = localStorage.getItem('startingbloch-auth');
      if (authStore) {
        const { state } = JSON.parse(authStore);
        token = state?.token || null;
        console.log('🔑 Auth Utils - Token depuis Zustand:', token ? 'présent' : 'absent');
      }
    }
    
    return token;
  } catch (error) {
    console.error('❌ Auth Utils - Erreur lors de la récupération du token:', error);
  }
  return null;
};

/**
 * Intercepteur Axios pour ajouter automatiquement le token JWT
 */
export const createAuthInterceptor = () => ({
  request: (config: any) => {
    const token = getAuthToken();
    
    console.log('🔐 Auth Interceptor - Configuration de la requête...');
    console.log('Token trouvé:', token ? 'OUI' : 'NON');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Auth Interceptor - Token ajouté à l\'en-tête Authorization');
      console.log('🔍 Token (premiers 50 caractères):', token.substring(0, 50) + '...');
      console.log('🔍 En-tête Authorization:', config.headers.Authorization.substring(0, 70) + '...');
    } else {
      console.warn('⚠️ Auth Interceptor - Aucun token disponible !');
    }
    
    return config;
  },
  error: (error: any) => {
    console.error('❌ Auth Interceptor - Erreur:', error);
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
});
