import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'; // Importation du fichier de configuration

// Hook pour gérer le portefeuille de brevets global 
const usePortefeuilleBrevet = () => {
  const [brevets, setBrevets] = useState([]);
  const [selectedBrevetId, setSelectedBrevetId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer tous les brevets
  const fetchBrevets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/brevets`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      // Vérifier si les données sont dans une propriété "data" ou directement dans la réponse
      const brevetsData = data.data || data;
      setBrevets(brevetsData);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la récupération des brevets:", error);
      setError('Erreur lors de la récupération des brevets');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un brevet
  const addBrevet = async (brevetData) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/brevets`, {
        method: 'POST',
        body: JSON.stringify(brevetData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      fetchBrevets(); // Refresh the list after adding
      setError(null);
    } catch (error) {
      setError('Erreur lors de l\'ajout du brevet');
    } finally {
      setLoading(false);
    }
  };

  // Modifier un brevet
  const updateBrevet = async (brevetId, brevetData) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/brevets/${brevetId}`, {
        method: 'PUT',
        body: JSON.stringify(brevetData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      fetchBrevets(); // Refresh the list after editing
      setError(null);
    } catch (error) {
      setError('Erreur lors de la modification du brevet');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un brevet
  const deleteBrevet = async (brevetId) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/brevets/${brevetId}`, {
        method: 'DELETE',
      });
      fetchBrevets(); // Refresh the list after deletion
      setError(null);
    } catch (error) {
      setError('Erreur lors de la suppression du brevet');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrevet = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce brevet ?")) {
      try {
        await fetch(`${API_BASE_URL}/api/brevets/${id}`, {
          method: 'DELETE',
        });
        fetchBrevets(); // Actualiser la liste des brevets après suppression
      } catch (error) {
        console.error('Erreur lors de la suppression du brevet', error);
      }
    }
  };

  // Gestion des modals
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleShowDetailModal = (brevetId, event) => {
    setSelectedBrevetId(brevetId);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => setShowDetailModal(false);

  const handleShowEditModal = (brevetId, event) => {
    setSelectedBrevetId(brevetId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  // Fonction utilitaire pour gérer les chaînes potentiellement nulles
  const safeString = (str) => {
    return str !== null && str !== undefined ? String(str) : '';
  };
  
  // Fonction utilitaire pour rechercher de manière sécurisée
  const safeSearch = (text, searchTerm) => {
    if (searchTerm === null || searchTerm === undefined || searchTerm === '') return true;
    if (text === null || text === undefined) return false;
    return String(text).toLowerCase().includes(searchTerm.toLowerCase());
  };

  useEffect(() => {
    fetchBrevets();
  }, []);

  return {
    brevets,
    selectedBrevetId,
    showAddModal,
    showDetailModal,
    showEditModal,
    loading,
    error,
    setSelectedBrevetId,
    fetchBrevets,
    addBrevet,
    updateBrevet,
    deleteBrevet,
    handleDeleteBrevet, // Ajout de la fonction handleDeleteBrevet
    handleShowAddModal,
    handleCloseAddModal,
    handleShowDetailModal,
    handleCloseDetailModal,
    handleShowEditModal,
    handleCloseEditModal,
    safeString, // Export de la fonction utilitaire pour les chaînes sécurisées
    safeSearch, // Export de la fonction utilitaire pour les recherches sécurisées
  };
};

export default usePortefeuilleBrevet;