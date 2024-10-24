import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Container, TextField, Select, MenuItem, Typography, Button, Paper, IconButton, Pagination, FormControl } from '@mui/material';
import { FaEdit, FaTrash, FaInfoCircle, FaPlus, FaArrowUp } from 'react-icons/fa';
import AddBrevetModal from '../components/AddBrevetModal';
import BrevetDetailModal from '../components/BrevetDetailModal';
import EditBrevetModal from '../components/EditBrevetModal';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct

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
  const [page, setPage] = useState(1); // Page actuelle
  const [rowsPerPage, setRowsPerPage] = useState(8); // Nombre d'éléments par page
  const navigate = useNavigate();

  useEffect(() => {
    refreshBrevets();
    fetchClientName();
  }, [clientId]);

  const refreshBrevets = () => {
    axios.get(`http://localhost:3100/brevets/client/${clientId}`)
      .then(response => {
        setBrevets(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the brevets!', error);
      });
  };

  const fetchClientName = () => {
    axios.get(`http://localhost:3100/clients/${clientId}`)
      .then(response => {
        setClientName(response.data.data.nom_client);
      })
      .catch(error => {
        console.error('There was an error fetching the client name!', error);
      });
  };

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

  // Fonction pour la recherche
  const normalizeString = (str) => {
    return str.trim().toLowerCase();
  };

  const normalizedSearchTerm = normalizeString(searchTerm);

  const filteredBrevets = brevets.filter((brevet) => {
    if (searchFilter === 'titre') {
      return normalizeString(brevet.titre)?.includes(normalizedSearchTerm);
    } else if (searchFilter === 'reference_famille') {
      return normalizeString(brevet.reference_famille)?.includes(normalizedSearchTerm);
    } else if (searchFilter === 'pays') {
      return (
        brevet.pays &&
        brevet.pays.some((p) =>
          normalizeString(p.nom_fr_fr)?.includes(normalizedSearchTerm)
        )
      );
    }



    return true;
  });

  // Pagination : Calcul des brevets affichés par page
  const indexOfLastBrevet = page * rowsPerPage;
  const indexOfFirstBrevet = indexOfLastBrevet - rowsPerPage;
  const currentBrevets = filteredBrevets.slice(indexOfFirstBrevet, indexOfLastBrevet);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Réinitialiser à la première page
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container sx={{ padding: '40px' }} maxWidth="xl">
           {/* Logo de l'entreprise */}
           <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>
        
        <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mb: 4 }}>
          Retour
        </Button>
        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
          Portefeuille de brevet de {clientName}
        </Typography>

        {/* Barre de recherche et filtre */}
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
            {/* <MenuItem value="pays">Rechercher par Pays</MenuItem> */}
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
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              variant="outlined"
            >
              <MenuItem value={8}>8 par page</MenuItem>
              <MenuItem value={16}>16 par page</MenuItem>
              <MenuItem value={32}>32 par page</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShowAddModal}
            startIcon={<FaPlus />}
          >
            Ajouter un brevet
          </Button>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Le portefeuille contient {brevets.length} brevet{brevets.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {currentBrevets && currentBrevets.length > 0 ? (
            currentBrevets.map(brevet => (
              <Paper
                key={brevet.id_brevet}
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
                  <Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {brevet.titre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Référence Famille: {brevet.reference_famille}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Numéro Publication:</strong> {brevet.numero_publication}<br />
                  <strong>Date Dépôt:</strong> {new Date(brevet.date_depot).toLocaleDateString()}<br />
                  <strong>Numéro Délivrance:</strong> {brevet.numero_delivrance}<br />
                  <strong>Date Délivrance:</strong> {new Date(brevet.date_delivrance).toLocaleDateString()}<br />
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <IconButton color="info" onClick={(event) => handleShowDetailModal(brevet.id_brevet, event)}>
                    <FaInfoCircle size={24} />
                  </IconButton>
                  <IconButton color="warning" onClick={(event) => handleShowEditModal(brevet, event)}>
                    <FaEdit size={24} />
                  </IconButton>
                  <IconButton color="error">
                    <FaTrash size={24} />
                  </IconButton>
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
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              variant="outlined"
            >
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
          {/* Bouton "Retour en haut" toujours visible */}
          <IconButton
          onClick={scrollTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
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
