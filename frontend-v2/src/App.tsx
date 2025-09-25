/*
 * ================================================================================================
 * APPLICATION PRINCIPALE - STARTINGBLOCH FRONTEND V2
 * ================================================================================================
 * 
 * Point d'entrée principal de l'application React avec routing,
 * authentification et configuration globale.
 * 
 * ================================================================================================
 */

import React, { useEffect } from 'react';
import { 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import BrevetsPage from './pages/BrevetsPage';
import ClientBrevetsPage from './pages/ClientBrevetsPage';
import ContactsPage from './pages/ContactsPage';
import CabinetsPage from './pages/CabinetsPage';
import LogsPage from './pages/LogsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

// Stores
import { useAuthStore } from './store/authStore';

// Configuration
import { config } from './config';

/**
 * Composant de route protégée
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Garde supplémentaire: bloque l'accès aux clients pour le rôle 'client'
const ClientsRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const role = (user?.role ?? '').toLowerCase();
  if (role === 'client') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

/**
 * Application principale
 */
const App: React.FC = () => {
  const { isLoading, refreshAuth } = useAuthStore();

  // Vérification de l'authentification au démarrage
  useEffect(() => {
    const token = sessionStorage.getItem('startingbloch_token');
    const user = sessionStorage.getItem('startingbloch_user');
    
    if (token && user) {
      refreshAuth();
    }
  }, [refreshAuth]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider 
      theme={config.theme}
    >
      {/* LanguageSwitcher moved into Settings > Compte tab to keep account settings together */}
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="clients"
            element={
              <ClientsRouteGuard>
                <ClientsPage />
              </ClientsRouteGuard>
            }
          />
          <Route path="brevets" element={<BrevetsPage />} />
          <Route path="clients/:clientId/brevets" element={<ClientBrevetsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="cabinets" element={<CabinetsPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* SettingsNotifications inlined into /settings page */}
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
