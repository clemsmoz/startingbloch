import React, { useRef, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import T from '../components/T';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Checkbox,
  CircularProgress,
  TextField as MuiTextField,
  LinearProgress
} from '@mui/material';
import {
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaPlus,
  FaArrowUp,
} from 'react-icons/fa';
import usePortefeuilleBrevet from '../hooks/usePortefeuilleBrevet';
import AddBrevetModal from '../components/AddBrevetModal';
import BrevetDetailModal from '../components/BrevetDetailModal';
import EditBrevetModal from '../components/EditBrevetModal';
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
    safeString,
    safeSearch,
  } = usePortefeuilleBrevet();

  // États pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState('titre');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  // Version sécurisée de normalizeString qui évite les erreurs avec null/undefined
  const normalizeString = (str) => {
    return safeString(str).toLowerCase();
  };
  
  const normalizedSearchTerm = normalizeString(searchTerm);

  const filteredBrevets = brevets.filter((brevet) => {
    console.log('Filtrage brevet:', { brevet, searchFilter, normalizedSearchTerm });

    if (searchFilter === 'titre') {
      const result = safeSearch(brevet.titre, normalizedSearchTerm);
      console.log('Filtre titre:', { titre: brevet.titre, result });
      return result;
    } else if (searchFilter === 'reference_famille') {
      const result = safeSearch(brevet.reference_famille, normalizedSearchTerm);
      console.log('Filtre reference_famille:', { reference_famille: brevet.reference_famille, result });
      return result;
    } else if (searchFilter === 'reference_cabinet') {
      const result = brevet.Cabinets?.some((cabinet) =>
        cabinet.BrevetCabinets &&
        safeSearch(cabinet.BrevetCabinets.reference, normalizedSearchTerm)
      );
      console.log('Filtre reference_cabinet:', { Cabinets: brevet.Cabinets, result });
      return result;
    } else if (searchFilter === 'client') {
      const result = brevet.Clients?.some((client) =>
        safeSearch(client.nom_client, normalizedSearchTerm)
      );
      console.log('Filtre client:', { Clients: brevet.Clients, result });
      return result;
    } else if (searchFilter === 'cabinet') {
      const result = brevet.Cabinets?.some((cabinet) =>
        safeSearch(cabinet.nom_cabinet, normalizedSearchTerm)
      );
      console.log('Filtre cabinet:', { Cabinets: brevet.Cabinets, result });
      return result;
    } else if (searchFilter === 'inventeur') {
      const result = brevet.Inventeurs?.some((inventeur) =>
        safeSearch(inventeur.nom_inventeur, normalizedSearchTerm)
      );
      console.log('Filtre inventeur:', { Inventeurs: brevet.Inventeurs, result });
      return result;
    } else if (searchFilter === 'deposant') {
      const result = brevet.Deposants?.some((deposant) =>
        safeSearch(deposant.nom_deposant, normalizedSearchTerm)
      );
      console.log('Filtre deposant:', { Deposants: brevet.Deposants, result });
      return result;
    } else if (searchFilter === 'titulaire') {
      const result = brevet.Titulaires?.some((titulaire) =>
        safeSearch(titulaire.nom_titulaire, normalizedSearchTerm)
      );
      console.log('Filtre titulaire:', { Titulaires: brevet.Titulaires, result });
      return result;
    }
    return false;
  });

  console.log('filteredBrevets:', filteredBrevets);

  // Pagination
  const paginatedBrevets = filteredBrevets.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredBrevets.length / rowsPerPage);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Améliorer la fonction handleShowDetailModal avec des logs de débogage
  const handleDetailClick = (brevetId) => {
    console.log('[PortefeuilleBrevetPage] handleDetailClick brevetId:', brevetId);
    handleShowDetailModal(brevetId);
    setTimeout(() => {
      console.log('[PortefeuilleBrevetPage] selectedBrevetId:', selectedBrevetId, 'showDetailModal:', showDetailModal);
    }, 100);
  };

  // Améliorer handleShowEditModal avec des logs de débogage
  const handleEditClick = (brevetId) => {
    console.log('Ouverture du modal modification pour le brevet ID:', brevetId);
    handleShowEditModal(brevetId);
    setTimeout(() => {
      console.log('État après clic sur modification:', {
        selectedId: selectedBrevetId,
        modalVisible: showEditModal
      });
    }, 100);
  };

  const safe = (val) => val ?? '';

  const fileInputRef = useRef();

  // Pour la sélection des clients lors de l'import Excel
  const [showClientSelectModal, setShowClientSelectModal] = useState(false);
  const [excelFileToImport, setExcelFileToImport] = useState(null);
  const [clientsList, setClientsList] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // États pour le traitement d'import avec indicateur de progression
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);
  const [importedBrevets, setImportedBrevets] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [processingElapsed, setProcessingElapsed] = useState(0);
  const [importEstimatedTotal, setImportEstimatedTotal] = useState(0);

  // Effet pour calculer le temps écoulé pendant l'import
  useEffect(() => {
    let interval;
    if (isImporting && processingStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - processingStartTime) / 1000);
        setProcessingElapsed(elapsed);
        
        // Estimation basée sur les brevets traités
        if (importedCount > 0 && totalToImport > importedCount) {
          const averageTimePerBrevet = elapsed / importedCount;
          const remainingBrevets = totalToImport - importedCount;
          const estimatedRemaining = Math.ceil(averageTimePerBrevet * remainingBrevets);
          setImportEstimatedTotal(elapsed + estimatedRemaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isImporting, processingStartTime, importedCount, totalToImport]);

  // Fonction pour charger les clients
  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      if (response.ok) {
        const clients = await response.json();
        setClientsList(clients);
      } else {
        console.error('Erreur lors du chargement des clients');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Fonction pour gérer l'import Excel
  const handleExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    if (!isExcelFile) {
      alert('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      event.target.value = '';
      return;
    }

    setExcelFileToImport(file);
    await loadClients();
    setShowClientSelectModal(true);
    event.target.value = '';
  };

  // Fonction pour lancer l'import avec le client sélectionné
  const launchImportWithClient = async () => {
    if (!selectedClientId || !excelFileToImport) {
      alert('Veuillez sélectionner un client');
      return;
    }

    const formData = new FormData();
    formData.append('excel', excelFileToImport);
    formData.append('clientId', selectedClientId);

    setIsImporting(true);
    setImportProgress(0);
    setImportedCount(0);
    setTotalToImport(0);
    setImportedBrevets([]);
    setImportErrors([]);
    setProcessingStartTime(Date.now());
    setProcessingElapsed(0);
    setImportEstimatedTotal(0);
    setShowClientSelectModal(false);

    try {
      const response = await fetch(`${API_BASE_URL}/brevets/import-excel`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Résultat de l\'import:', result);
        
        setImportedCount(result.imported?.length || 0);
        setTotalToImport(result.total || 0);
        setImportedBrevets(result.imported || []);
        setImportErrors(result.errors || []);
        setImportProgress(100);
        
        // Recharger les données du portefeuille
        window.location.reload();
      } else {
        const errorResult = await response.json();
        console.error('Erreur lors de l\'import:', errorResult);
        alert(`Erreur lors de l'import: ${errorResult.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import du fichier Excel');
    } finally {
      setIsImporting(false);
      setExcelFileToImport(null);
      setSelectedClientId('');
    }
  };

  // Fonction pour fermer le modal de sélection de client
  const closeClientSelectModal = () => {
    setShowClientSelectModal(false);
    setExcelFileToImport(null);
    setSelectedClientId('');
  };

  // Fonction pour exporter les données en Excel
  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brevets/export-excel`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `portefeuille_brevets_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Erreur lors de l\'export');
        alert('Erreur lors de l\'export des données');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Sidebar />
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress size={60} />
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Sidebar />
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h5" color="error">
            <T>Erreur lors du chargement des brevets:</T> {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Sidebar />
        <Container sx={{ padding: '40px' }} maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
          </Box>

          <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
            <T>Portefeuille Brevet</T>
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <TextField
              variant="outlined"
              label={<T>Rechercher des brevets...</T>}
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
              <MenuItem value="titre"><T>Rechercher par Titre</T></MenuItem>
              <MenuItem value="reference_famille"><T>Rechercher par Référence Famille</T></MenuItem>
              <MenuItem value="reference_cabinet"><T>Rechercher par Référence Cabinet</T></MenuItem>
              <MenuItem value="client"><T>Rechercher par Client</T></MenuItem>
              <MenuItem value="cabinet"><T>Rechercher par Cabinet</T></MenuItem>
              <MenuItem value="inventeur"><T>Rechercher par Inventeur</T></MenuItem>
              <MenuItem value="deposant"><T>Rechercher par Déposant</T></MenuItem>
              <MenuItem value="titulaire"><T>Rechercher par Titulaire</T></MenuItem>
            </Select>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="h6" color="textSecondary">
              <T>Le portefeuille contient {brevets.length} brevet{brevets.length > 1 ? 's' : ''}</T>
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaPlus />}
                onClick={handleShowAddModal}
                sx={{ mr: 2 }}
              >
                <T>Ajouter un brevet</T>
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => fileInputRef.current?.click()}
                sx={{ mr: 2 }}
              >
                <T>Importer Excel</T>
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleExportExcel}
              >
                <T>Exporter Excel</T>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
              />
            </Box>
          </Box>

          {/* Modal d'import avec indicateur de progression */}
          {isImporting && (
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#e3f2fd' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <T>Import en cours...</T>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={importProgress} 
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="textSecondary">
                <T>Brevets importés:</T> {importedCount} / {totalToImport}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <T>Temps écoulé:</T> {processingElapsed} <T>seconde{processingElapsed > 1 ? 's' : ''}</T>
              </Typography>
              {importEstimatedTotal > 0 && (
                <Typography variant="body2" color="textSecondary">
                  <T>Estimation totale:</T> {importEstimatedTotal} <T>seconde{importEstimatedTotal > 1 ? 's' : ''}</T>
                </Typography>
              )}
            </Paper>
          )}

          {/* Affichage des résultats d'import */}
          {!isImporting && importedBrevets.length > 0 && (
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#e8f5e8' }}>
              <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                <T>Import terminé avec succès!</T>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <T>Brevets importés:</T> {importedBrevets.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <T>Temps traitement serveur:</T> {processingElapsed} <T>seconde{processingElapsed > 1 ? 's' : ''}</T>
              </Typography>
              {importErrors.length > 0 && (
                <>
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    <T>Erreurs rencontrées:</T> {importErrors.length}
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
                    {importErrors.map((error, index) => (
                      <Typography key={index} variant="body2" color="error">
                        • {error}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
            {paginatedBrevets.map((brevet, index) => (
              <Paper
                key={brevet.id}
                elevation={3}
                sx={{
                  width: { xs: '100%', sm: '45%', md: '30%', lg: '22%' },
                  p: 2,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ flex: 1 }}>
                    {safe(brevet.titre)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleDetailClick(brevet.id)}
                    >
                      <FaInfoCircle />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(brevet.id)}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBrevet(brevet.id)}
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <strong><T>Référence:</T></strong> {safe(brevet.reference_famille)}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <strong><T>Date de dépôt:</T></strong> {safe(brevet.date_depot)}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  <strong><T>Statut:</T></strong> {safe(brevet.statut)}
                </Typography>
              </Paper>
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}

          <IconButton
            onClick={scrollTop}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <FaArrowUp />
          </IconButton>
        </Container>
      </Box>

      {/* Modal de sélection de client pour l'import */}
      <Dialog open={showClientSelectModal} onClose={closeClientSelectModal} maxWidth="sm" fullWidth>
        <DialogTitle><T>Sélectionner un client pour l'import</T></DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel><T>Client</T></InputLabel>
            <Select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              label="Client"
            >
              {isLoadingClients ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <T>Chargement...</T>
                </MenuItem>
              ) : (
                clientsList.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.nom_client}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeClientSelectModal} color="secondary">
            <T>Annuler</T>
          </Button>
          <Button 
            onClick={launchImportWithClient} 
            color="primary" 
            variant="contained"
            disabled={!selectedClientId}
          >
            <T>Importer</T>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debug log pour le modal de détail */}
      {showDetailModal && selectedBrevetId !== null && (
        <>
          {console.log('[PortefeuilleBrevetPage] showDetailModal:', showDetailModal, 'selectedBrevetId:', selectedBrevetId)}
        </>
      )}

      {/* Modals */}
      <AddBrevetModal 
        show={showAddModal} 
        handleClose={handleCloseAddModal} 
      />
      
      <BrevetDetailModal 
        show={showDetailModal} 
        handleClose={handleCloseDetailModal} 
        brevetId={selectedBrevetId} 
      />
      
      <EditBrevetModal 
        show={showEditModal} 
        handleClose={handleCloseEditModal} 
        brevetId={selectedBrevetId} 
      />
    </>
  );
};

export default PortefeuilleBrevetPage;