import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PortefeuilleBrevetPage from './pages/PortefeuilleBrevetPage';
import ContactsPage from './pages/ContactsPage';
import CabinetsPage from './pages/CabinetsPage'; // Import du nouveau composant
import ClientsPage from './pages/ClientsPage'; // Importez le composant ClientsPage
import BrevetClientPage from './pages/BrevetClientPage';






const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/portefeuille-brevet" element={<PortefeuilleBrevetPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/cabinets" element={<CabinetsPage />} /> {/* Nouvelle route */}
        <Route path="/clients" element={<ClientsPage />} /> {/* Nouvelle route */}
        <Route path="/brevets/client/:clientId" element={<BrevetClientPage />} />






      </Routes>
    </Router>
  );
};

export default App;
