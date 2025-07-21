/**
 * Constantes pour les clés de traduction
 * Centralise toutes les clés utilisées dans l'application
 */

export const TRANSLATION_KEYS = {
  // Navigation et pages principales
  WELCOME: 'welcome',
  HOME: 'home',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Formulaires
  EMAIL: 'email',
  PASSWORD: 'password',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  NAME: 'name',
  
  // Boutons d'action
  CONNECT: 'connect',
  CANCEL: 'cancel',
  SAVE: 'save',
  DELETE: 'delete',
  EDIT: 'edit',
  ADD: 'add',
  CLOSE: 'close',
  CONFIRM: 'confirm',

  // Messages de statut
  CONNECTING: 'connecting',
  CONNECTION_SUCCESS: 'connectionSuccess',
  CONNECTION_ERROR: 'connectionError',
  LOADING: 'loading',
  
  // Messages d'erreur
  ALL_FIELDS_REQUIRED: 'allFieldsRequired',
  ACCOUNT_BLOCKED: 'accountBlocked',
  CONNECTION_FAILED: 'connectionFailed',
  NETWORK_ERROR: 'networkError',
  UNKNOWN_ERROR: 'unknownError',
  ADMIN_CREATION_ERROR: 'adminCreationError',

  // Messages de succès
  ADMIN_CREATED: 'adminCreated',
  ACCOUNT_CREATED: 'accountCreated',

  // Labels spécifiques
  SHOW_PASSWORD: 'showPassword',
  HIDE_PASSWORD: 'hidePassword',
  FIRST_CONNECTION: 'firstConnection',
  CREATE_ADMIN_ACCOUNT: 'createAdminAccount',
  ADMIN_ACCOUNT_CREATION: 'adminAccountCreation',

  // Gestion des utilisateurs
  CONTACT_ADMINISTRATOR: 'contactAdministrator',
  
  // Interface
  LANGUAGE_SWITCH: 'languageSwitch'
};

/**
 * Messages par défaut pour les traductions
 * Utilisés comme fallback si la traduction n'existe pas
 */
export const DEFAULT_MESSAGES = {
  [TRANSLATION_KEYS.WELCOME]: 'Bienvenue',
  [TRANSLATION_KEYS.EMAIL]: 'Email',
  [TRANSLATION_KEYS.PASSWORD]: 'Mot de passe',
  [TRANSLATION_KEYS.CONNECT]: 'Se connecter',
  [TRANSLATION_KEYS.CANCEL]: 'Annuler',
  [TRANSLATION_KEYS.CLOSE]: 'Fermer',
  [TRANSLATION_KEYS.CONNECTING]: 'Connexion en cours...',
  [TRANSLATION_KEYS.CONNECTION_ERROR]: 'Erreur de connexion',
  [TRANSLATION_KEYS.ALL_FIELDS_REQUIRED]: 'Tous les champs sont obligatoires',
  [TRANSLATION_KEYS.ACCOUNT_BLOCKED]: 'Votre compte est bloqué. Contactez l\'administrateur.',
  [TRANSLATION_KEYS.ADMIN_CREATED]: 'Compte admin créé avec succès ! Connectez-vous.',
  [TRANSLATION_KEYS.NETWORK_ERROR]: 'Erreur réseau',
  [TRANSLATION_KEYS.ADMIN_CREATION_ERROR]: 'Erreur lors de la création du compte admin',
  [TRANSLATION_KEYS.SHOW_PASSWORD]: 'Afficher le mot de passe',
  [TRANSLATION_KEYS.HIDE_PASSWORD]: 'Masquer le mot de passe',
  [TRANSLATION_KEYS.FIRST_CONNECTION]: 'Première connexion (créer le compte admin)',
  [TRANSLATION_KEYS.CREATE_ADMIN_ACCOUNT]: 'Créer le compte admin',
  [TRANSLATION_KEYS.ADMIN_ACCOUNT_CREATION]: 'Création du compte administrateur',
  [TRANSLATION_KEYS.FIRST_NAME]: 'Prénom',
  [TRANSLATION_KEYS.LAST_NAME]: 'Nom'
};

export default TRANSLATION_KEYS;
