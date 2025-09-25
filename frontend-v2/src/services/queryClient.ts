import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Force les requêtes à se refetch à chaque montage pour désactiver l'effet de cache
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // Pas de cache persistant
      staleTime: 0,
      cacheTime: 0,
      // éviter retries automatiques pour rendre le comportement plus prévisible
      retry: 0,
    },
  },
});

export default queryClient;
