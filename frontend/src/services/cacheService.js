import axios from 'axios';
import { API_BASE_URL } from '../config';

const CACHE_KEYS = {
  BREVETS: 'cached_brevets',
  CABINETS: 'cached_cabinets',
  CLIENTS: 'cached_clients',
  TIMESTAMP: 'brevets_cache_timestamp',
  LAST_UPDATE: 'brevets_last_update',
};

// Durée de validité du cache en millisecondes (24 heures)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Vérifier si le cache est encore valide
const isCacheValid = () => {
  const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
  if (!timestamp) return false;
  
  const now = new Date().getTime();
  return (now - parseInt(timestamp)) < CACHE_DURATION;
};

// Mettre en cache les données des brevets
const cacheBrevetData = async (data, lastUpdate) => {
  try {
    localStorage.setItem(CACHE_KEYS.BREVETS, JSON.stringify(data));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, new Date().getTime().toString());
    
    if (lastUpdate) {
      localStorage.setItem(CACHE_KEYS.LAST_UPDATE, lastUpdate);
    }
    
    console.log(`Données de ${data.length} brevets mises en cache avec succès`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise en cache des brevets:', error);
    // En cas d'erreur (probablement quota dépassé), on nettoie le cache
    clearCache();
    return false;
  }
};

// Mettre en cache les données des cabinets
const cacheCabinetData = async (data) => {
  try {
    localStorage.setItem(CACHE_KEYS.CABINETS, JSON.stringify(data));
    console.log(`Données de ${data.length} cabinets mises en cache avec succès`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise en cache des cabinets:', error);
    return false;
  }
};

// Mettre en cache les données des clients
const cacheClientData = async (data) => {
  try {
    localStorage.setItem(CACHE_KEYS.CLIENTS, JSON.stringify(data));
    console.log(`Données de ${data.length} clients mises en cache avec succès`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise en cache des clients:', error);
    return false;
  }
};

// Récupérer les données en cache
const getCachedBrevetData = () => {
  try {
    if (!isCacheValid()) {
      console.log('Cache des brevets expiré ou inexistant');
      return null;
    }
    
    const cachedData = localStorage.getItem(CACHE_KEYS.BREVETS);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Erreur lors de la récupération du cache des brevets:', error);
    clearCache();
    return null;
  }
};

// Récupérer les cabinets en cache
const getCachedCabinetData = () => {
  try {
    if (!isCacheValid()) return null;
    
    const cachedData = localStorage.getItem(CACHE_KEYS.CABINETS);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Erreur lors de la récupération du cache des cabinets:', error);
    return null;
  }
};

// Récupérer les clients en cache
const getCachedClientData = () => {
  try {
    if (!isCacheValid()) return null;
    
    const cachedData = localStorage.getItem(CACHE_KEYS.CLIENTS);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Erreur lors de la récupération du cache des clients:', error);
    return null;
  }
};

// Nettoyer le cache
const clearCache = () => {
  localStorage.removeItem(CACHE_KEYS.BREVETS);
  localStorage.removeItem(CACHE_KEYS.CABINETS);
  localStorage.removeItem(CACHE_KEYS.CLIENTS);
  localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
  console.log('Cache nettoyé');
};

// Préchargement des données en arrière-plan avec progression
const preloadBrevets = async (progressCallback = null) => {
  try {
    console.log('Démarrage du préchargement des données...');
    
    // Par défaut, si aucun callback de progression n'est fourni
    if (!progressCallback) {
      progressCallback = (progress) => console.log(`Progression: ${progress.percent}% - ${progress.message}`);
    }
    
    // Étape 1: Vérifier si le cache est valide (10%)
    progressCallback({ message: 'Vérification du cache...', percent: 10 });
    
    if (isCacheValid()) {
      console.log('Utilisation du cache existant');
      progressCallback({ message: 'Cache existant valide', percent: 100 });
      return { success: true, fromCache: true };
    }
    
    // Étape 2: Récupérer la date de dernière mise à jour (15%)
    progressCallback({ message: 'Récupération des informations de mise à jour...', percent: 15 });
    
    const lastUpdateServer = await axios.get(`${API_BASE_URL}/api/brevets/last-update`)
      .then(res => res.data.lastUpdate)
      .catch(() => null);
    
    const lastUpdateCache = localStorage.getItem(CACHE_KEYS.LAST_UPDATE);
    
    // Si la date de dernière mise à jour est identique, utiliser le cache
    if (lastUpdateServer && lastUpdateCache && lastUpdateServer === lastUpdateCache && isCacheValid()) {
      console.log('Les données du cache sont à jour');
      progressCallback({ message: 'Données du cache à jour', percent: 100 });
      return { success: true, fromCache: true };
    }
    
    // Étape 3: Préchargement des brevets (20-50%)
    progressCallback({ message: 'Chargement des brevets...', percent: 20 });
    
    const brevetsResponse = await axios.get(`${API_BASE_URL}/api/brevets`);
    
    if (!brevetsResponse.data || !brevetsResponse.data.data) {
      progressCallback({ message: 'Erreur lors du chargement des brevets', percent: 30 });
      return { success: false, error: 'Format de réponse inattendu pour les brevets' };
    }
    
    const brevets = brevetsResponse.data.data;
    await cacheBrevetData(brevets, lastUpdateServer);
    
    progressCallback({ message: `${brevets.length} brevets chargés`, percent: 50 });
    
    // Étape 4: Préchargement des cabinets (50-75%)
    progressCallback({ message: 'Chargement des cabinets...', percent: 50 });
    
    const cabinetsResponse = await axios.get(`${API_BASE_URL}/api/cabinets`);
    
    if (cabinetsResponse.data && cabinetsResponse.data.data) {
      const cabinets = cabinetsResponse.data.data;
      await cacheCabinetData(cabinets);
      progressCallback({ message: `${cabinets.length} cabinets chargés`, percent: 75 });
    } else {
      progressCallback({ message: 'Erreur lors du chargement des cabinets', percent: 60 });
    }
    
    // Étape 5: Préchargement des clients (75-95%)
    progressCallback({ message: 'Chargement des clients...', percent: 75 });
    
    const clientsResponse = await axios.get(`${API_BASE_URL}/api/clients`);
    
    if (clientsResponse.data && clientsResponse.data.data) {
      const clients = clientsResponse.data.data;
      await cacheClientData(clients);
      progressCallback({ message: `${clients.length} clients chargés`, percent: 95 });
    } else {
      progressCallback({ message: 'Erreur lors du chargement des clients', percent: 85 });
    }
    
    // Finalisation (100%)
    progressCallback({ message: 'Préchargement terminé avec succès', percent: 100 });
    
    return { 
      success: true, 
      fromCache: false, 
      counts: {
        brevets: brevets.length,
        cabinets: cabinetsResponse.data?.data?.length || 0,
        clients: clientsResponse.data?.data?.length || 0
      }
    };
  } catch (error) {
    console.error('Erreur lors du préchargement des données:', error);
    progressCallback({ 
      message: `Erreur: ${error.message || 'Erreur inconnue'}`, 
      percent: 30 
    });
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
};

// Récupération d'un brevet spécifique avec vérification du cache
const getBrevetById = async (brevetId) => {
  try {
    // Vérifier d'abord si les données sont en cache
    const cachedData = getCachedBrevetData();
    
    if (cachedData) {
      // Rechercher le brevet dans le cache
      const cachedBrevet = cachedData.find(b => b.id == brevetId);
      
      if (cachedBrevet) {
        console.log(`Brevet ${brevetId} récupéré depuis le cache`);
        return { success: true, data: cachedBrevet, fromCache: true };
      }
    }
    
    // Si pas en cache ou non trouvé, faire la requête API
    console.log(`Brevet ${brevetId} non trouvé en cache, requête API`);
    const response = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}`);
    
    return { success: true, data: response.data.data, fromCache: false };
  } catch (error) {
    console.error(`Erreur lors de la récupération du brevet ${brevetId}:`, error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
};

// Récupération d'un cabinet spécifique avec vérification du cache
const getCabinetById = async (cabinetId) => {
  try {
    // Vérifier d'abord si les données sont en cache
    const cachedData = getCachedCabinetData();
    
    if (cachedData) {
      // Rechercher le cabinet dans le cache
      const cachedCabinet = cachedData.find(c => c.id == cabinetId);
      
      if (cachedCabinet) {
        console.log(`Cabinet ${cabinetId} récupéré depuis le cache`);
        return { success: true, data: cachedCabinet, fromCache: true };
      }
    }
    
    // Si pas en cache ou non trouvé, faire la requête API
    console.log(`Cabinet ${cabinetId} non trouvé en cache, requête API`);
    const response = await axios.get(`${API_BASE_URL}/api/cabinets/${cabinetId}`);
    
    return { success: true, data: response.data.data, fromCache: false };
  } catch (error) {
    console.error(`Erreur lors de la récupération du cabinet ${cabinetId}:`, error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
};

// Récupération d'un client spécifique avec vérification du cache
const getClientById = async (clientId) => {
  try {
    // Vérifier d'abord si les données sont en cache
    const cachedData = getCachedClientData();
    
    if (cachedData) {
      // Rechercher le client dans le cache
      const cachedClient = cachedData.find(c => c.id == clientId);
      
      if (cachedClient) {
        console.log(`Client ${clientId} récupéré depuis le cache`);
        return { success: true, data: cachedClient, fromCache: true };
      }
    }
    
    // Si pas en cache ou non trouvé, faire la requête API
    console.log(`Client ${clientId} non trouvé en cache, requête API`);
    const response = await axios.get(`${API_BASE_URL}/api/clients/${clientId}`);
    
    return { success: true, data: response.data.data, fromCache: false };
  } catch (error) {
    console.error(`Erreur lors de la récupération du client ${clientId}:`, error);
    return { success: false, error: error.message || 'Erreur inconnue' };
  }
};

export default {
  preloadBrevets,
  getCachedBrevetData,
  getCachedCabinetData,
  getCachedClientData,
  getBrevetById,
  getCabinetById,
  getClientById,
  clearCache,
  isCacheValid
};
