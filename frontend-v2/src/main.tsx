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
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import App from './App';

// Configuration locale pour dayjs
dayjs.locale('fr');

// Configuration du thème Ant Design
const antdConfig = {
  locale: frFR,
  theme: {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
    },
  },
  componentSize: 'middle' as const,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider {...antdConfig}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
