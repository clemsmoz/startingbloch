/*
 * ================================================================================================
 * CONFIGURATION ENVIRONNEMENT - STARTINGBLOCH FRONTEND V2
 * ================================================================================================
 * 
 * Configuration centralisée des variables d'environnement et constantes applicatives
 * pour l'interface de gestion de propriété intellectuelle StartingBloch.
 * 
 * FONCTIONNALITÉS :
 * ================
 * 🌐 API_URL → URL base du backend .NET
 * 🔐 AUTH → Configuration authentification JWT
 * 📊 PAGINATION → Paramètres tableaux et listes
 * 🎨 THEME → Configuration thème Ant Design
 * 📝 VALIDATION → Règles validation formulaires
 * 
 * ================================================================================================
 */

export const config = {
  // Configuration API Backend .NET
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 10000,
    endpoints: {
      auth: '/api/auth',
      users: '/api/admin/useradmin',
      clients: '/api/client',
      brevets: '/api/brevet',
      contacts: '/api/contact',
      cabinets: '/api/cabinet',
      inventeurs: '/api/inventeur',
      titulaires: '/api/titulaire',
      logs: '/api/log',
      pays: '/api/pays',
      statuts: '/api/statuts',
    },
  },

  // Configuration Authentification
  auth: {
    tokenKey: 'startingbloch_token',
    refreshTokenKey: 'startingbloch_refresh_token',
    userKey: 'startingbloch_user',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 heures
  },

  // Configuration Pagination par défaut
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: ['10', '20', '50', '100'],
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: number[]) =>
      `${range[0]}-${range[1]} sur ${total} éléments`,
  },

  // Configuration Thème Ant Design
  theme: {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      wireframe: false,
    },
  },

  // Configuration Validation
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
      requireSpecialChar: true,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },

  // Configuration Notifications
  notifications: {
    duration: 4.5,
    placement: 'topRight' as const,
    maxCount: 3,
  },

  // Configuration Upload de fichiers
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  },

  // Configuration Date/Heure
  dateTime: {
    format: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD/MM/YYYY HH:mm',
    locale: 'fr',
  },

  // Configuration Application
  app: {
    name: 'StartingBloch',
    version: import.meta.env.VITE_APP_VERSION || '2.0.0',
    description: 'Plateforme de gestion de propriété intellectuelle',
    copyright: '© 2025 StartingBloch. Tous droits réservés.',
  },
} as const;

// Types pour la configuration
export type Config = typeof config;
export type ApiEndpoints = keyof typeof config.api.endpoints;
