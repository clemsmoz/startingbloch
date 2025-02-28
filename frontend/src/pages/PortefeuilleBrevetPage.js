import React from 'react';
import Sidebar from '../components/Sidebar';
import AddBrevetModal from '../components/AddBrevetModal';
import BrevetDetailModal from '../components/BrevetDetailModal';
import EditBrevetModal from '../components/EditBrevetModal';
import {
  Box,
  Container,
  TextField,
  Select,
  MenuItem,
  Typography,
  Button,
  Paper,
  IconButton,
  Pagination,
  FormControl,
} from '@mui/material';
import {
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaPlus,
  FaArrowUp,
} from 'react-icons/fa';
import usePortefeuilleBrevet from '../hooks/usePortefeuilleBrevet';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';

const PortefeuilleBrevetPage = () => {
  // On récupère les données et fonctions depuis le hook personnalisé
  const {
    brevets,
    selectedBrevetId,
    showAddModal,
    showDetailModal,
    showEditModal,
    loading,
    error,
    handleShowAddModal,
    handleCloseAddModal,
    handleShowDetailModal,
    handleCloseDetailModal,
    handleShowEditModal,
    handleCloseEditModal,
    handleDeleteBrevet,
  } = usePortefeuilleBrevet();

  // États pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState('titre');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const normalizeString = (str) => str.trim().toLowerCase();
  const normalizedSearchTerm = normalizeString(searchTerm);

  const filteredBrevets = brevets.filter((brevet) => {
    if (searchFilter === 'titre') {
      return normalizeString(brevet.titre)?.includes(normalizedSearchTerm);
    } else if (searchFilter === 'reference_famille') {
      return normalizeString(brevet.reference_famille)?.includes(normalizedSearchTerm);
    } else if (searchFilter === 'reference_cabinet') {
      return brevets.some((ref) => normalizeString(ref.reference_cabinet)?.includes(normalizedSearchTerm));
    } else if (searchFilter === 'client') {
      return (
        brevet.clients &&
        brevet.clients.some((client) =>
          normalizeString(client.nom_client)?.includes(normalizedSearchTerm)
        )
      );
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

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ padding: '40px' }} maxWidth="xl">
        <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>

        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
          Portefeuille Brevet
        </Typography>

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
            <MenuItem value="reference_cabinet">Rechercher par Référence Cabinet</MenuItem>
          </Select>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
          <Pagination count={Math.ceil(filteredBrevets.length / rowsPerPage)} page={page} onChange={handleChangePage} color="primary" />
          <FormControl sx={{ width: '150px' }}>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} variant="outlined">
              <MenuItem value={8}>8 par page</MenuItem>
              <MenuItem value={16}>16 par page</MenuItem>
              <MenuItem value={32}>32 par page</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
          <Button variant="contained" color="primary" onClick={handleShowAddModal} startIcon={<FaPlus />}>
            Ajouter un brevet
          </Button>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Le portefeuille contient {brevets.length} brevet{brevets.length > 1 ? 's' : ''}
          </Typography>
        </Box>

        {loading && <Typography>Chargement...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {currentBrevets.length > 0 ? (
            currentBrevets.map((brevet) => (
              <Paper
                key={brevet.id_brevet}
                elevation={6}
                sx={{
                  width: '300px',
                  padding: 3,
                  borderRadius: 3,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                }}
              >
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {brevet.titre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Référence Famille: {brevet.reference_famille}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <IconButton color="info" onClick={() => handleShowDetailModal(brevet.id_brevet)}>
                    <FaInfoCircle size={24} />
                  </IconButton>
                  <IconButton color="warning" onClick={() => handleShowEditModal(brevet.id_brevet)}>
                    <FaEdit size={24} />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteBrevet(brevet.id_brevet)}>
                    <FaTrash size={24} />
                  </IconButton>
                </Box>
              </Paper>
            ))
          ) : (
            <Typography>Aucun brevet disponible.</Typography>
          )}
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
          <Pagination count={Math.ceil(filteredBrevets.length / rowsPerPage)} page={page} onChange={handleChangePage} color="primary" />
          <FormControl sx={{ width: '150px' }}>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} variant="outlined">
              <MenuItem value={8}>8 par page</MenuItem>
              <MenuItem value={16}>16 par page</MenuItem>
              <MenuItem value={32}>32 par page</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <AddBrevetModal show={showAddModal} handleClose={handleCloseAddModal} />

        {selectedBrevetId && (
          <BrevetDetailModal show={showDetailModal} handleClose={handleCloseDetailModal} brevetId={selectedBrevetId} />
        )}

        {selectedBrevetId && (
          <EditBrevetModal show={showEditModal} handleClose={handleCloseEditModal} brevetId={selectedBrevetId} />
        )}

        <IconButton
          onClick={scrollTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
          aria-label="Retour en haut"
        >
          <FaArrowUp />
        </IconButton>
      </Container>
    </Box>
  );
};

export default PortefeuilleBrevetPage;
