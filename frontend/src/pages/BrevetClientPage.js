import React, { useState, useEffect } from 'react';
import {
  Box, Container, TextField, Select, MenuItem, Typography, Button, Paper,
  IconButton, Pagination, FormControl, Checkbox, FormControlLabel
} from '@mui/material';
import { FaEdit, FaTrash, FaInfoCircle, FaPlus, FaArrowUp } from 'react-icons/fa';
import AddBrevetModal from '../components/AddBrevetModal';
import BrevetDetailModal from '../components/BrevetDetailModal';
import EditBrevetModal from '../components/EditBrevetModal';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';

// ----- IMPORT DE FONCTION EXPORT PDF ICI -----
import { exportBrevetsPDF } from '../hooks/exportPortfolioPDF'; // Adapter le chemin selon ton projet
import cacheService from '../services/cacheService';

const BrevetClientPage = () => {
  const { clientId } = useParams();
  const [brevets, setBrevets] = useState([]);
  const [clientName, setClientName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrevetId, setSelectedBrevetId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('titre');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Sélection multiple de brevets
  const [selectedBrevets, setSelectedBrevets] = useState([]);
  const allSelected = selectedBrevets.length === brevets.length && brevets.length > 0;

  const navigate = useNavigate();
  const safe = (val) => val ?? '';

  useEffect(() => {
    refreshBrevets();
    fetchClientName();
  }, [clientId]);

  const refreshBrevets = () => {
    fetch(`${API_BASE_URL}/api/brevets/client/${clientId}`)
      .then(response => response.json())
      .then(data => {
        const brevetsArray = Array.isArray(data.data) ? data.data : data;
        setBrevets(brevetsArray);
        setSelectedBrevets([]); // Reset la sélection à chaque rafraîchissement
      })
      .catch(error => {
        console.error('There was an error fetching the brevets!', error);
      });
  };

  const fetchClientName = () => {
    fetch(`${API_BASE_URL}/api/clients/${clientId}`)
      .then(response => response.json())
      .then(data => {
        setClientName(data.data.nom_client);
      })
      .catch(error => {
        console.error('There was an error fetching the client name!', error);
      });
  };

  // ------ GESTION SELECTION ------
  const handleSelectBrevet = (id) => {
    setSelectedBrevets((prev) =>
      prev.includes(id) ? prev.filter(brevetId => brevetId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedBrevets([]);
    } else {
      setSelectedBrevets(brevets.map(b => b.id_brevet));
    }
  };

  // ------ EXPORT PDF ------
  const handleExportAll = async () => {
  await exportBrevetsPDF(brevets, clientName, logo);
};

const handleExportSelected = async () => {
  const brevetsToExport = brevets.filter(b => selectedBrevets.includes(b.id_brevet));
  if (brevetsToExport.length === 0) {
    alert('Sélectionne au moins un brevet à exporter !');
    return;
  }
  await exportBrevetsPDF(brevetsToExport, clientName, logo);
  setSelectedBrevets([]);
};

  // ------ AUTRES HANDLERS ------
  const handleShowEditModal = (brevet, event) => {
    event.stopPropagation();
    setSelectedBrevetId(brevet.id_brevet);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowDetailModal = (brevetId, event) => {
    event.stopPropagation();
    setSelectedBrevetId(brevetId);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => setShowDetailModal(false);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleDeleteBrevet = async (brevetId, event) => {
    event.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce brevet ?")) {
      try {
        await fetch(`${API_BASE_URL}/api/brevets/${brevetId}`, { method: 'DELETE' });
        refreshBrevets();
      } catch (error) {
        console.error('Erreur lors de la suppression du brevet', error);
      }
    }
  };

  // Fonction de normalisation pour la recherche
  const normalizeString = (str) => str.trim().toLowerCase();
  const normalizedSearchTerm = normalizeString(searchTerm);

  const filteredBrevets = brevets.filter((brevet) => {
    if (searchFilter === 'titre') {
      return normalizeString(brevet.titre)?.includes(normalizedSearchTerm);
    } else if (searchFilter === 'reference_famille') {
      return normalizeString(brevet.reference_famille)?.includes(normalizedSearchTerm);
    }
    return true;
  });

  const indexOfLastBrevet = page * rowsPerPage;
  const indexOfFirstBrevet = indexOfLastBrevet - rowsPerPage;
  const currentBrevets = filteredBrevets.slice(indexOfFirstBrevet, indexOfLastBrevet);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Récupère le rôle de l'utilisateur connecté
  const user = typeof cacheService.get === "function"
    ? cacheService.get('user')
    : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);
  const canWrite = !!(user && (user.role === 'admin' || user.canWrite === true));

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container sx={{ padding: '40px' }} maxWidth="xl">
        {/* Logo */}
        <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>

        <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mb: 4 }}>
          Retour
        </Button>
        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
          Portefeuille de brevet de {clientName}
        </Typography>

        {/* ---- EXPORT BUTTONS ---- */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button variant="contained" color="primary" onClick={handleExportAll}>
            Exporter tout
          </Button>
          <Button variant="contained" color="secondary" onClick={handleExportSelected} disabled={selectedBrevets.length === 0}>
            Exporter la sélection ({selectedBrevets.length})
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                onChange={handleSelectAll}
                color="primary"
                sx={{ ml: 2 }}
              />
            }
            label="Tout sélectionner"
            sx={{ ml: 3 }}
          />
        </Box>

        {/* Recherche et filtre */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <TextField
            variant="outlined"
            label="Rechercher des brevets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '70%', backgroundColor: 'white', borderRadius: 1 }}
          />
          <Select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            variant="outlined"
            sx={{ width: '25%', backgroundColor: 'white', borderRadius: 1 }}
          >
            <MenuItem value="titre">Rechercher par Titre</MenuItem>
            <MenuItem value="reference_famille">Rechercher par Référence Famille</MenuItem>
          </Select>
        </Box>

        {/* Pagination en haut */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Pagination
            count={Math.ceil(filteredBrevets.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
          <FormControl sx={{ width: '150px' }}>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} variant="outlined">
              <MenuItem value={8}>8 par page</MenuItem>
              <MenuItem value={16}>16 par page</MenuItem>
              <MenuItem value={32}>32 par page</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
          {canWrite && (
            <Button variant="contained" color="primary" onClick={handleShowAddModal} startIcon={<FaPlus />}>
              Ajouter un brevet
            </Button>
          )}
          <Typography variant="h6" sx={{ ml: 2 }}>
            Le portefeuille contient {brevets.length} brevet{brevets.length > 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* ---- LISTE DES BREVETS ---- */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {currentBrevets && currentBrevets.length > 0 ? (
            currentBrevets.map(brevet => (
              <Paper
                key={safe(brevet.id_brevet)}
                elevation={6}
                sx={{
                  width: '300px',
                  padding: 3,
                  borderRadius: 3,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                  backgroundColor: '#ffffff'
                }}
              >
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  {/* Checkbox sélection brevet */}
                  <Checkbox
                    checked={selectedBrevets.includes(brevet.id_brevet)}
                    onChange={() => handleSelectBrevet(brevet.id_brevet)}
                    color="primary"
                    sx={{ mr: 1 }}
                    disabled={!canWrite}
                  />
                  <Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {safe(brevet.titre)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Référence Famille: {safe(brevet.reference_famille)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <IconButton color="info" onClick={(event) => handleShowDetailModal(brevet.id_brevet, event)}>
                    <FaInfoCircle size={24} />
                  </IconButton>
                  {canWrite && (
                    <>
                      <IconButton color="warning" onClick={(event) => handleShowEditModal(brevet, event)}>
                        <FaEdit size={24} />
                      </IconButton>
                      <IconButton color="error" onClick={(event) => handleDeleteBrevet(brevet.id_brevet, event)}>
                        <FaTrash size={24} />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Paper>
            ))
          ) : (
            <Typography>Aucun brevet disponible.</Typography>
          )}
        </Box>

        {/* Pagination en bas */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredBrevets.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
          <FormControl sx={{ width: '150px' }}>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} variant="outlined">
              <MenuItem value={8}>8 par page</MenuItem>
              <MenuItem value={16}>16 par page</MenuItem>
              <MenuItem value={32}>32 par page</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <AddBrevetModal
          show={showAddModal}
          handleClose={handleCloseAddModal}
          refreshBrevets={refreshBrevets}
        />

        {selectedBrevetId && (
          <BrevetDetailModal
            show={showDetailModal}
            handleClose={handleCloseDetailModal}
            brevetId={selectedBrevetId}
          />
        )}

        {selectedBrevetId && (
          <EditBrevetModal
            show={showEditModal}
            handleClose={handleCloseEditModal}
            brevetId={selectedBrevetId}
            refreshBrevets={refreshBrevets}
          />
        )}
        {/* Bouton "Retour en haut" */}
        <IconButton
          onClick={scrollTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
            zIndex: 1000,
          }}
          aria-label="Retour en haut"
        >
          <FaArrowUp />
        </IconButton>
      </Container>
    </Box>
  );
};

export default BrevetClientPage;
