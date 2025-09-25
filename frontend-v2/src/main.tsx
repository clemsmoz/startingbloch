/*
 * ================================================================================================
 * POINT D'ENTRÉE PRINCIPAL - STARTINGBLOCH FRONTEND V2
 * ================================================================================================
 * 
 * Configuration React 18 avec Ant Design, authentification et routing
 * pour l'application de gestion de propriété intellectuelle.
 * 
 * ================================================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';

import App from './App';
import './i18n';
import { QueryClientProvider } from 'react-query';
import queryClient from './services/queryClient';
// optional devtools
// import { ReactQueryDevtools } from 'react-query-devtools';

// read saved language or default to fr
const saved = window.localStorage?.getItem('sb_lang') ?? undefined;
const initialLang = saved ?? (navigator.language?.startsWith('en') ? 'en' : 'fr');

const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
};

function RootApp() {
  const [lang, setLang] = React.useState<string>(initialLang);

  // apply dayjs locale when lang changes
  React.useEffect(() => {
    console.log('[RootApp] applying language', lang);
    dayjs.locale(lang === 'en' ? 'en' : 'fr');
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem('sb_lang', lang);
    } catch (e) {
      console.warn('[RootApp] failed to persist sb_lang to localStorage', e);
    }
  }, [lang]);

  // listen for the event dispatched by LanguageSwitcher
  React.useEffect(() => {
    const handler = (e: Event) => {
      const newLang = (e as CustomEvent).detail as string;
      console.log('[RootApp] sb-language-changed event received ->', newLang);
      // show a visible notification so the user sees the event
      console.log('[RootApp] would show visible notification for language change (removed)');
      if (newLang && newLang !== lang) setLang(newLang);
    };
    window.addEventListener('sb-language-changed', handler as EventListener);
    return () => window.removeEventListener('sb-language-changed', handler as EventListener);
  }, [lang]);

  const antdLocale = lang === 'en' ? enUS : frFR;

  return (
    <BrowserRouter>
      <ConfigProvider locale={antdLocale} theme={antdTheme} componentSize={'middle'}>
        <QueryClientProvider client={queryClient}>
          <App key={lang} />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
