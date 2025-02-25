const isPackaged = process.env.NODE_ENV === 'production';

// Détermine l'URL de l'API en fonction du mode d'exécution
export const API_BASE_URL = isPackaged
  ? 'http://127.0.0.1:3000' // URL locale utilisée dans Electron packagé
  : 'http://localhost:3000'; // Mode développement

// Autres configurations possibles
export const APP_CONFIG = {
  appName: "Gestion Patman",
  version: "1.0.0",
  debug: !isPackaged,  // Active les logs en mode développement
};

// Fonction utilitaire pour afficher les logs en mode dev
export const logDebug = (...args) => {
  if (APP_CONFIG.debug) {
    console.log("🔍 [DEBUG] :", ...args);
  }
};

logDebug("📌 API Base URL :", API_BASE_URL);
