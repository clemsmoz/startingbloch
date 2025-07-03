import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PortefeuilleBrevetPage from './pages/PortefeuilleBrevetPage';
import ContactsPage from './pages/ContactsPage';
import CabinetsPage from './pages/CabinetsPage';
import ClientsPage from './pages/ClientsPage';
import BrevetClientPage from './pages/BrevetClientPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        
        {/* Pour compatibilité avec les anciennes routes */}
        <Route path="/acceuil" element={<Navigate to="/home" replace />} />
        <Route path='user-management' element={<AdminUserManagementPage />} />
        
        {/* Autres routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/portefeuille-brevet" element={<PortefeuilleBrevetPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/cabinets" element={<CabinetsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/brevets/client/:clientId" element={<BrevetClientPage />} />
        
        {/* Route de fallback pour attraper les URL inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
