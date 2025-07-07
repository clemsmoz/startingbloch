import React, { useRef, useState, useEffect } from 'react';
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
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService'; // Ajoute ceci

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
      console.log('Filtre "titre":', { titre: brevet.titre, result });
      return result;
    } else if (searchFilter === 'reference_famille') {
      const result = safeSearch(brevet.reference_famille, normalizedSearchTerm);
      console.log('Filtre "reference_famille":', { reference_famille: brevet.reference_famille, result });
      return result;
    } else if (searchFilter === 'reference_cabinet') {
      const result = brevet.Cabinets?.some((cabinet) =>
        cabinet.BrevetCabinets &&
        safeSearch(cabinet.BrevetCabinets.reference, normalizedSearchTerm)
      );
      console.log('Filtre "reference_cabinet":', { Cabinets: brevet.Cabinets, result });
      return result;
    } else if (searchFilter === 'client') {
      const result = brevet.Clients?.some((client) =>
        safeSearch(client.nom_client, normalizedSearchTerm)
      );
      console.log('Filtre "client":', { Clients: brevet.Clients, result });
      return result;
    } else if (searchFilter === 'cabinet') {
      const result = brevet.Cabinets?.some((cabinet) =>
        safeSearch(cabinet.nom_cabinet, normalizedSearchTerm)
      );
      console.log('Filtre "cabinet":', { Cabinets: brevet.Cabinets, result });
      return result;
    }

    console.log('Aucun filtre appliqué, retour par défaut.');
    return true;
  });

  console.log('Brevets après filtrage:', { filteredBrevets, searchFilter, normalizedSearchTerm });

  const indexOfLastBrevet = page * rowsPerPage;
  const indexOfFirstBrevet = indexOfLastBrevet - rowsPerPage;
  const currentBrevets = filteredBrevets.slice(indexOfFirstBrevet, indexOfLastBrevet);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

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
  const [selectedClientIds, setSelectedClientIds] = useState([]);

  // Buffer pour l'import Excel
  const [importLoading, setImportLoading] = useState(false);
  const [importPhase, setImportPhase] = useState('idle'); // 'idle' | 'upload' | 'processing'
  const [importPercent, setImportPercent] = useState(0);
  const [importEstimatedTotal, setImportEstimatedTotal] = useState(0);
  const [processingElapsed, setProcessingElapsed] = useState(0);
  const [importStatus, setImportStatus] = useState(null);
  const [importId, setImportId] = useState(null);

  // Charger la liste des clients au montage (pour la modale)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/clients`)
      .then(res => res.json())
      .then(data => setClientsList(Array.isArray(data.data) ? data.data : []))
      .catch(() => setClientsList([]));
  }, []);

  // Handler pour le bouton Excel
  const handleExcelButtonClick = () => {
    setShowClientSelectModal(true);
  };

  // Handler pour la sélection du fichier dans la modale
  const handleExcelFileChange = (event) => {
    const file = event.target.files?.[0];
    setExcelFileToImport(file || null);
  };

  // Handler pour la sélection des clients dans la modale
  const handleClientSelectChange = (event) => {
    setSelectedClientIds(event.target.value);
  };

  // Handler pour valider l'import Excel avec clients (remplacé par XMLHttpRequest)
  const handleValidateExcelImport = async () => {
    if (!excelFileToImport || selectedClientIds.length === 0) {
      alert('Veuillez sélectionner un fichier Excel et au moins un client.');
      return;
    }
    const formData = new FormData();
    formData.append('file', excelFileToImport);
    formData.append('client_ids', JSON.stringify(selectedClientIds));

    setImportLoading(true);
    setImportPhase('upload');
    setProcessingElapsed(0);
    setImportEstimatedTotal(0);
    setImportPercent(0);
    setProcessingElapsed(0);
    setImportStatus(null);
    setImportId(null);

    let uploadStart = Date.now();
    let uploadTimer = setInterval(() => {
      setProcessingElapsed(Math.floor((Date.now() - uploadStart) / 1000));
    }, 500);

    const xhr = new window.XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/brevets/import-excel`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setImportPercent(percent);
        const elapsed = (Date.now() - uploadStart) / 1000;
        setProcessingElapsed(Math.round(elapsed));
        // Estimation dynamique du temps total d'upload
        if (event.loaded > 0 && elapsed > 0) {
          const speed = event.loaded / 1024 / 1024 / elapsed; // Mo/s
          const estimatedTotal = (event.total / 1024 / 1024) / speed;
          setImportEstimatedTotal(Math.round(estimatedTotal));
        }
      }
    };

    xhr.onload = () => {
      clearInterval(uploadTimer);
      setImportPhase('processing');
      setImportPercent(100);
      setProcessingElapsed(Math.round((Date.now() - uploadStart) / 1000));
      // Démarre le timer pour la phase de traitement serveur
      let processingStart = Date.now();
      setProcessingElapsed(0);
      let processingTimer = setInterval(() => {
        setProcessingElapsed(Math.floor((Date.now() - processingStart) / 1000));
      }, 500);

      let result = {};
      try {
        result = JSON.parse(xhr.responseText);
      } catch (e) {
        result = {};
      }

      // Récupère l'importId pour le polling
      if (result.importId) {
        setImportId(result.importId);
        // Polling sur l'état d'avancement du backend
        let pollInterval = setInterval(async () => {
          try {
            const resp = await fetch(`${API_BASE_URL}/api/brevets/import-status/${result.importId}`);
            const status = await resp.json();
            setImportStatus(status);
            if (status.status === 'done' || status.status === 'error') {
              clearInterval(pollInterval);
              clearInterval(processingTimer);
              setTimeout(() => {
                setImportLoading(false);
                setShowClientSelectModal(false);
                setExcelFileToImport(null);
                setSelectedClientIds([]);
                setImportPhase('idle');
                setProcessingElapsed(0);
                setImportStatus(null);
                setImportId(null);
                if (status.status === 'done') {
                  alert('Import Excel réussi');
                  window.location.reload();
                } else {
                  alert(status.message || 'Erreur lors de l\'import Excel');
                }
              }, 1000);
            }
          } catch (err) {
            // ignore polling errors
          }
        }, 1000);
      } else {
        // fallback : pas d'importId, on termine comme avant
        setTimeout(() => {
          clearInterval(processingTimer);
          setImportLoading(false);
          setShowClientSelectModal(false);
          setExcelFileToImport(null);
          setSelectedClientIds([]);
          setImportPhase('idle');
          setProcessingElapsed(0);
          setImportStatus(null);
          setImportId(null);
          if (xhr.status === 200) {
            alert(result.message || 'Import Excel réussi');
            window.location.reload();
          } else {
            alert(result.error || 'Erreur lors de l\'import Excel');
          }
        }, 500);
      }
    };

    xhr.onerror = () => {
      clearInterval(uploadTimer);
      setImportLoading(false);
      setImportPhase('idle');
      setProcessingElapsed(0);
      setImportStatus(null);
      setImportId(null);
      alert('Erreur lors de l\'import Excel');
    };

    xhr.send(formData);
  };

  // Pour la création d'un nouveau client dans la modale Excel
  const [newClientName, setNewClientName] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientError, setClientError] = useState('');

  // Correction : fonction complète pour créer un client à la volée
  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      setClientError('Veuillez saisir un nom de client.');
      return;
    }
    setCreatingClient(true);
    setClientError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_client: newClientName.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du client');
      
      // Récupérer l'ID du client depuis la réponse de l'API
      const clientId = data.id || data.id_client || data.data?.id || data.data?.id_client;
      
      if (!clientId) {
        throw new Error('ID client non trouvé dans la réponse');
      }

      // Créer le nouveau client avec la même structure que les clients existants
      const newClient = {
        id: clientId,
        id_client: clientId, // Pour la compatibilité
        nom_client: newClientName.trim()
      };
      
      // Mise à jour de la liste des clients
      setClientsList(prev => [...prev, newClient]);
      
      // Ajouter automatiquement le nouveau client à la sélection
      setSelectedClientIds(prev => [...prev, clientId]);
      
      // Debug
      console.log('Client créé:', newClient);
      console.log('Nouvelle liste de clients:', [...clientsList, newClient]);
      console.log('IDs clients sélectionnés:', [...selectedClientIds, clientId]);
      
      setNewClientName('');
      setClientError('');
    } catch (e) {
      console.error('Erreur création client:', e);
      setClientError(e.message);
    } finally {
      setCreatingClient(false);
    }
  };

  // Supprime toute redéclaration de 'user' et 'canWrite' dans le composant, il ne doit y avoir qu'UNE SEULE déclaration :

  const user = typeof cacheService.get === "function"
    ? cacheService.get('user')
    : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);
  const canWrite = !!(user && (user.role === 'admin' || user.canWrite === true));

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
            <MenuItem value="client">Rechercher par Client</MenuItem>
            <MenuItem value="cabinet">Rechercher par Cabinet</MenuItem>
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
          {canWrite && (
            <Button variant="contained" color="primary" onClick={handleShowAddModal} startIcon={<FaPlus />}>
              Ajouter un brevet
            </Button>
          )}
          {canWrite && (
            <Button
              variant="outlined"
              color="success"
              sx={{ ml: 2 }}
              startIcon={
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ verticalAlign: 'middle' }}>
                  <rect width="20" height="20" rx="3" fill="#217346"/>
                  <text x="50%" y="60%" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">X</text>
                </svg>
              }
              onClick={handleExcelButtonClick}
            >
              Ajouter via Excel
            </Button>
          )}
          <Typography variant="h6" sx={{ ml: 2 }}>
            Le portefeuille contient {brevets.length} brevet{brevets.length > 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Modale de sélection des clients et du fichier Excel */}
        <Dialog open={showClientSelectModal} onClose={() => setShowClientSelectModal(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Importer des brevets via Excel</DialogTitle>
          <DialogContent>
            <Box sx={{ my: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Clients à lier</InputLabel>
                <Select
                  multiple
                  value={selectedClientIds}
                  onChange={handleClientSelectChange}
                  renderValue={(selected) =>
                    clientsList
                      .filter(c => selected.includes(c.id))
                      .map(c => c.nom_client)
                      .join(', ')
                  }
                >
                  {clientsList.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      <Checkbox checked={selectedClientIds.includes(client.id)} />
                      <Typography>{client.nom_client}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Champ pour créer un nouveau client à la volée */}
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MuiTextField
                  label="Nouveau client"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  size="small"
                  fullWidth
                />
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleCreateClient}
                  disabled={creatingClient}
                >
                  {creatingClient ? <CircularProgress size={18} /> : 'Créer'}
                </Button>
              </Box>
              {clientError && (
                <Typography color="error" sx={{ mt: 1 }}>{clientError}</Typography>
              )}
            </Box>
            <Box sx={{ my: 2 }}>
              <Button
                variant="contained"
                component="label"
                fullWidth
              >
                Sélectionner un fichier Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleExcelFileChange}
                />
              </Button>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {excelFileToImport ? excelFileToImport.name : 'Aucun fichier sélectionné'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowClientSelectModal(false)}>Annuler</Button>
            <Button variant="contained" color="primary" onClick={handleValidateExcelImport} disabled={importLoading}>
              {importLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Importer
            </Button>
          </DialogActions>
        </Dialog>
        {/* Buffer global pendant l'import Excel avec estimation */}
        <Dialog open={importLoading} maxWidth="xs" fullWidth>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6">
              {importPhase === 'upload'
                ? 'Envoi du fichier Excel...'
                : 'Traitement serveur en cours...'}
            </Typography>
            {importPhase === 'upload' && (
              <>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Temps écoulé : {processingElapsed} seconde{processingElapsed > 1 ? 's' : ''}
                </Typography>
                {importEstimatedTotal > 0 && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Estimation totale : {importEstimatedTotal} seconde{importEstimatedTotal > 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Progression upload : {Math.min(100, Math.round(importPercent))}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, importPercent)}
                      sx={{ width: '100%', mt: 1 }}
                    />
                  </>
                )}
              </>
            )}
            {importPhase === 'processing' && (
              <>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Temps traitement serveur : {processingElapsed} seconde{processingElapsed > 1 ? 's' : ''}
                </Typography>
                {importStatus && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {importStatus.message}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Progression serveur : {importStatus.progress || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={importStatus.progress || 0}
                      sx={{ width: '100%', mt: 1 }}
                    />
                  </>
                )}
              </>
            )}
          </Box>
        </Dialog>

        {loading && <Typography>Chargement...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {currentBrevets.length > 0 ? (
            currentBrevets.map((brevet) => {
              const brevetId = safe(brevet.id) || safe(brevet.id_brevet);
              console.log('[PortefeuilleBrevetPage] Render brevet card:', { brevetId, titre: brevet.titre });
              return (
                <Paper
                  key={brevetId}
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
                        {safe(brevet.titre)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Référence Famille: {safe(brevet.reference_famille)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <IconButton 
                      color="info" 
                      onClick={() => {
                        console.log('[PortefeuilleBrevetPage] IconButton clicked for brevetId:', brevetId);
                        handleDetailClick(brevetId);
                      }}
                      aria-label="Voir les détails"
                    >
                      <FaInfoCircle size={24} />
                    </IconButton>
                    {canWrite && (
                      <>
                        <IconButton 
                          color="warning" 
                          onClick={() => handleEditClick(brevetId)}
                          aria-label="Modifier"
                        >
                          <FaEdit size={24} />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteBrevet(brevetId)}>
                          <FaTrash size={24} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Paper>
              );
            })
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

        {showDetailModal && selectedBrevetId !== null && (
          <>
            {console.log('[PortefeuilleBrevetPage] showDetailModal:', showDetailModal, 'selectedBrevetId:', selectedBrevetId)}
            <BrevetDetailModal
              key={selectedBrevetId}
              show={showDetailModal}
              handleClose={handleCloseDetailModal}
              brevetId={selectedBrevetId}
              onError={(err) => console.error('Erreur dans BrevetDetailModal:', err)}
            />
          </>
        )}

        <EditBrevetModal 
          show={showEditModal} 
          handleClose={handleCloseEditModal} 
          brevetId={selectedBrevetId} 
        />

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
        {/* Close the Container wrapping the whole content */}
      </Container>
    </Box>
  );
};

export default PortefeuilleBrevetPage;