import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Toujours démarrer en français - ne pas mémoriser
localStorage.removeItem('i18nextLng');
console.log('🔄 localStorage i18nextLng supprimé');

// Configuration ultra-simple avec traduction automatique
i18n
  .use(initReactI18next)
  .init({
    // Pas de ressources prédéfinies - traduction automatique via Google Translate
    resources: {},
    
    // Langue par défaut
    lng: 'fr',
    fallbackLng: 'fr',
    
    // Langues supportées
    supportedLngs: ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl'],

    // Configuration pour éviter les warnings
    debug: true, // Activer les logs i18n
    
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
  })
  .then((t) => {
    console.log('✅ i18n initialisé avec succès');
    console.log('🌐 Langue courante:', i18n.language);
    console.log('🔧 Langues supportées:', i18n.options.supportedLngs);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'initialisation i18n:', error);
  });

// Écouter les changements de langue
i18n.on('languageChanged', (lng) => {
  console.log('🔄 Langue changée vers:', lng);
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
