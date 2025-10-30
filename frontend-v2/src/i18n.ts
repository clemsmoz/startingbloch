import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    debug: false,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Prefer explicit saved preference in localStorage, then navigator, querystring, cookie
      order: ['localStorage', 'navigator', 'querystring', 'cookie'],
      // Persist chosen language in localStorage under key 'sb_lang'
      caches: ['localStorage'],
      lookupLocalStorage: 'sb_lang'
    },
    backend: {
      // locales are served from /locales/{{lng}}/{{ns}}.json
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });

console.log('[i18n] initialized, detected language ->', i18n.language);
console.log('[i18n] fallbackLng -> fr, supported:', ['fr', 'en']);

// Attach listeners for debug
(i18n as any).on('initialized', () => {
  console.log('[i18n:event] initialized ->', i18n.language);
});
(i18n as any).on('languageChanged', (lng: string) => {
  console.log('[i18n:event] languageChanged ->', lng);
  try {
    // Dispatch a DOM event so other parts of the app can react to language changes
    // Use a simple string in detail to avoid passing an object which can become
    // displayed as `[object Object]` when used as Select value elsewhere.
    window.dispatchEvent(new CustomEvent('sb-language-changed', { detail: lng }));
  } catch (e) {
    console.warn('[i18n] failed to dispatch sb-language-changed event', e);
  }
});
(i18n as any).on('loaded', (loaded: any) => {
  console.log('[i18n:event] resources loaded ->', loaded);
});

export default i18n;

/**
 * Set application language, persist to localStorage (sb_lang) and dispatch sb-language-changed event.
 */
export const setAppLanguage = async (lng: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('sb_lang', lng);
    }
  } catch (e) {
    console.warn('[i18n] failed to write sb_lang to localStorage', e);
  }
  await i18n.changeLanguage(lng);
  try {
    // Older code paths previously used { detail: { language: lng } }
    // Normalize to a simple string payload for compatibility with Select values.
    window.dispatchEvent(new CustomEvent('sb-language-changed', { detail: lng }));
  } catch (e) {
    console.warn('[i18n] failed to dispatch sb-language-changed event', e);
  }
};
