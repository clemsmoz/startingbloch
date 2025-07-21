import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Configuration ultra-simple avec traduction automatique
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Pas de ressources prédéfinies - traduction automatique via Google Translate
    resources: {},
    
    // Langue par défaut
    fallbackLng: 'fr',
    
    // Langues supportées
    supportedLngs: ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl'],
    
    // Détection automatique de la langue
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },

    // Configuration pour éviter les warnings
    debug: false,
    
    interpolation: {
      escapeValue: false
    },

    // Retourner la clé immédiatement, la traduction se fera de manière asynchrone
    parseMissingKeyHandler: (key, defaultValue) => {
      const currentLang = i18n.language;
      
      // Si c'est du français, retourner tel quel
      if (currentLang === 'fr') {
        return defaultValue || key;
      }

      // Retourner immédiatement la valeur par défaut
      const textToTranslate = defaultValue || key;
      
      // Lancer la traduction en arrière-plan
      translateInBackground(textToTranslate, currentLang, key);
      
      return textToTranslate; // Retour synchrone
    },

    // Configuration pour forcer les mises à jour
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: 'added'
    }
  });

// Fonction de traduction en arrière-plan
const translateInBackground = async (text, targetLang, key) => {
  try {
    // Vérifier si déjà traduit
    if (i18n.store.data[targetLang]?.translation?.[key]) {
      return;
    }

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    
    const result = await response.json();
    const translatedText = result[0][0][0];
    
    // Stocker la traduction
    if (!i18n.store.data[targetLang]) {
      i18n.store.data[targetLang] = {};
    }
    if (!i18n.store.data[targetLang].translation) {
      i18n.store.data[targetLang].translation = {};
    }
    i18n.store.data[targetLang].translation[key] = translatedText;
    
    // Déclencher plusieurs événements pour garantir la mise à jour
    i18n.emit('languageChanged', targetLang);
    i18n.emit('added', targetLang, 'translation');
    
    // Forcer une mise à jour globale
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('i18nUpdated'));
    }, 100);
    
  } catch (error) {
    console.warn('Erreur de traduction automatique:', error);
  }
};

export default i18n;
