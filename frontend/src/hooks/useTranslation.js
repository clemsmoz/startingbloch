import { useTranslation as useI18nTranslation } from 'react-i18next';
import { TRANSLATION_KEYS, DEFAULT_MESSAGES } from './translationKeys';

/**
 * Hook personnalisé pour la traduction optimisé pour toute l'application
 * Simplifie l'usage avec des fonctions helper pour tous types de messages
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  // Fonction de base pour traduire avec fallback
  const translate = (key, defaultValue = '', options = {}) => {
    const translated = t(key, options);
    // Si la traduction retourne la même clé, utiliser la valeur par défaut
    return translated === key && defaultValue ? defaultValue : translated;
  };

  // Fonction pour les messages d'alerte (alert, confirm, etc.)
  const alert = (messageKey, defaultMessage = '') => {
    const message = translate(messageKey, defaultMessage || DEFAULT_MESSAGES[messageKey]);
    window.alert(message);
    return message;
  };

  // Fonction pour les messages de confirmation
  const confirm = (messageKey, defaultMessage = '') => {
    const message = translate(messageKey, defaultMessage || DEFAULT_MESSAGES[messageKey]);
    return window.confirm(message);
  };

  // Fonction pour les messages d'erreur
  const error = (errorKey, defaultMessage = '') => {
    return translate(errorKey, defaultMessage || DEFAULT_MESSAGES[errorKey]);
  };

  // Fonction pour les messages de succès
  const success = (successKey, defaultMessage = '') => {
    return translate(successKey, defaultMessage || DEFAULT_MESSAGES[successKey]);
  };

  // Fonction pour les labels de formulaire
  const label = (labelKey, defaultLabel = '') => {
    return translate(labelKey, defaultLabel || DEFAULT_MESSAGES[labelKey]);
  };

  // Fonction pour les boutons
  const button = (buttonKey, defaultText = '') => {
    return translate(buttonKey, defaultText || DEFAULT_MESSAGES[buttonKey]);
  };

  // Fonction pour les messages de statut (loading, connecting, etc.)
  const status = (statusKey, defaultMessage = '') => {
    return translate(statusKey, defaultMessage || DEFAULT_MESSAGES[statusKey]);
  };

  // Fonction utilitaire pour changer la langue
  const changeLanguage = (lng) => {
    return i18n.changeLanguage(lng);
  };

  // Fonction utilitaire pour obtenir la langue actuelle
  const getCurrentLanguage = () => {
    return i18n.language;
  };

  // Fonction pour vérifier si une traduction existe
  const hasTranslation = (key) => {
    return i18n.exists(key);
  };

  // Fonction rapide pour les clés prédéfinies avec constantes
  const quick = {
    // Messages communs
    welcome: () => translate(TRANSLATION_KEYS.WELCOME, DEFAULT_MESSAGES[TRANSLATION_KEYS.WELCOME]),
    email: () => translate(TRANSLATION_KEYS.EMAIL, DEFAULT_MESSAGES[TRANSLATION_KEYS.EMAIL]),
    password: () => translate(TRANSLATION_KEYS.PASSWORD, DEFAULT_MESSAGES[TRANSLATION_KEYS.PASSWORD]),
    connect: () => translate(TRANSLATION_KEYS.CONNECT, DEFAULT_MESSAGES[TRANSLATION_KEYS.CONNECT]),
    cancel: () => translate(TRANSLATION_KEYS.CANCEL, DEFAULT_MESSAGES[TRANSLATION_KEYS.CANCEL]),
    close: () => translate(TRANSLATION_KEYS.CLOSE, DEFAULT_MESSAGES[TRANSLATION_KEYS.CLOSE]),
    
    // Messages d'erreur communs
    connectionError: () => translate(TRANSLATION_KEYS.CONNECTION_ERROR, DEFAULT_MESSAGES[TRANSLATION_KEYS.CONNECTION_ERROR]),
    networkError: () => translate(TRANSLATION_KEYS.NETWORK_ERROR, DEFAULT_MESSAGES[TRANSLATION_KEYS.NETWORK_ERROR]),
    allFieldsRequired: () => translate(TRANSLATION_KEYS.ALL_FIELDS_REQUIRED, DEFAULT_MESSAGES[TRANSLATION_KEYS.ALL_FIELDS_REQUIRED]),
    accountBlocked: () => translate(TRANSLATION_KEYS.ACCOUNT_BLOCKED, DEFAULT_MESSAGES[TRANSLATION_KEYS.ACCOUNT_BLOCKED]),
    
    // Messages de statut
    connecting: () => translate(TRANSLATION_KEYS.CONNECTING, DEFAULT_MESSAGES[TRANSLATION_KEYS.CONNECTING]),
    
    // Messages de succès
    adminCreated: () => translate(TRANSLATION_KEYS.ADMIN_CREATED, DEFAULT_MESSAGES[TRANSLATION_KEYS.ADMIN_CREATED]),
    
    // Labels
    firstName: () => translate(TRANSLATION_KEYS.FIRST_NAME, DEFAULT_MESSAGES[TRANSLATION_KEYS.FIRST_NAME]),
    lastName: () => translate(TRANSLATION_KEYS.LAST_NAME, DEFAULT_MESSAGES[TRANSLATION_KEYS.LAST_NAME]),
    showPassword: () => translate(TRANSLATION_KEYS.SHOW_PASSWORD, DEFAULT_MESSAGES[TRANSLATION_KEYS.SHOW_PASSWORD]),
    hidePassword: () => translate(TRANSLATION_KEYS.HIDE_PASSWORD, DEFAULT_MESSAGES[TRANSLATION_KEYS.HIDE_PASSWORD]),
    
    // Boutons et actions
    createAdminAccount: () => translate(TRANSLATION_KEYS.CREATE_ADMIN_ACCOUNT, DEFAULT_MESSAGES[TRANSLATION_KEYS.CREATE_ADMIN_ACCOUNT]),
    firstConnection: () => translate(TRANSLATION_KEYS.FIRST_CONNECTION, DEFAULT_MESSAGES[TRANSLATION_KEYS.FIRST_CONNECTION]),
    adminAccountCreation: () => translate(TRANSLATION_KEYS.ADMIN_ACCOUNT_CREATION, DEFAULT_MESSAGES[TRANSLATION_KEYS.ADMIN_ACCOUNT_CREATION]),
  };

  return {
    // Fonction de base react-i18next
    t,
    
    // Fonctions helper optimisées
    translate,
    alert,
    confirm,
    error,
    success,
    label,
    button,
    status,
    
    // Utilitaires
    changeLanguage,
    getCurrentLanguage,
    hasTranslation,
    
    // Accès rapide aux traductions communes
    quick,
    
    // Objet i18n original pour usages avancés
    i18n
  };
};

export default useTranslation;
