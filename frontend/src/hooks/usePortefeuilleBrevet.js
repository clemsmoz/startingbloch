import { useState, useEffect } from 'react';
import axios from 'axios';


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
      const response = await axios.get('http://localhost:3100/brevets');
      setBrevets(response.data.data);
      setError(null);
    } catch (error) {
      setError('Erreur lors de la récupération des brevets');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un brevet
  const addBrevet = async (brevetData) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3100/brevets', brevetData);
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
      await axios.put(`http://localhost:3100/brevets/${brevetId}`, brevetData);
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
      await axios.delete(`http://localhost:3100/brevets/${brevetId}`);
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
        await axios.delete(`http://localhost:3100/brevets/${id}`);
        // refreshBrevets(); // Actualiser la liste des brevets après suppression
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
  };
};

export default usePortefeuilleBrevet;
