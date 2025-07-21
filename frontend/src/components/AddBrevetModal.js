import React from 'react';
import {
  Dialog,
  TextField,
  Button,
  Card,
  Box,
  Stack,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import T from '../components/T';
import useAddBrevet from '../hooks/useAddBrevet';

const AddBrevetModal = ({ show, handleClose }) => {
  const {
    formData,
    clientsList,
    statuts,
    paysList,
    loading,
    handleChange,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    handleSubmit,
    handleDynamicChangeForSubField,
    handleAddSubField,
    handleRemoveSubField,
    isError,
    confirmationModal,
    confirmationMessage,
    handleCloseConfirmationModal,
    loadingInitialData,
    newClientName,
    setNewClientName,
    creatingClient,
    clientError,
    clientSuccess,
    handleCreateClient,
  } = useAddBrevet(handleClose);

  // Fonctions helpers
  const handleClientSelect = (e, index) => {
    console.log('[AddBrevetModal] Sélection client dans la liste déroulante :', e.target.value);
    handleDynamicChange(e, index, 'clients');
  };

  const getCountriesForSelection = () => {
    return paysList;
  };

  // Affichage d'une modale de chargement si les données initiales ne sont pas prêtes
  if (loadingInitialData) {
    return (
      <Dialog open={show} fullWidth maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={60} sx={{ mr: 2 }} />
          <Typography variant="h6"><T>Chargement des données (clients, pays, statuts, cabinets)...</T></Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={show} onClose={handleClose} fullWidth maxWidth="xl">
        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
          <Card
            sx={{
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '80%',
              p: 4,
              position: 'relative',
            }}
          >
            {/* Bouton de fermeture */}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'gray',
              }}
            >
              <CloseIcon sx={{ fontSize: 30 }} />
            </IconButton>
            <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
              <T>Ajouter un nouveau brevet</T>
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Clients */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Clients</T></Typography>
                {(formData.clients || []).map((client, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel><T>Client</T></InputLabel>
                      <Select
                        value={client.id_client || ''}
                        onChange={(e) => handleClientSelect(e, index)}
                        name="id_client">
                        <MenuItem value=""><T>Sélectionner un client</T></MenuItem>
                        {clientsList.map((clientOption) => (
                          <MenuItem key={clientOption.id} value={clientOption.id}>
                            {clientOption.nom_client}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained" 
                      color="error" 
                      onClick={() => handleRemoveField(index, 'clients')}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                ))}
                <Button
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleAddField('clients')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter un client</T>
                </Button>
                
                {/* Champ pour créer un nouveau client à la volée */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <TextField
                    label={<T>Nouveau client</T>}
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    size="small"
                  />
                  <Button
                    variant="outlined" 
                    color="success" 
                    onClick={handleCreateClient}
                    disabled={creatingClient}
                  >
                    {creatingClient ? <CircularProgress size={18} /> : <T>Créer ce client</T>}
                  </Button>
                  {clientError && (
                    <Typography color="error" sx={{ ml: 2 }}>{clientError}</Typography>
                  )}
                  {clientSuccess && (
                    <Typography color="success.main" sx={{ ml: 2 }}>{clientSuccess}</Typography>
                  )}
                </Box>
              </Card>

              {/* Informations Générales */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Informations Générales</T></Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label={<T>Référence Famille</T>}
                    name="reference_famille" 
                    value={formData.reference_famille || ''}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    label={<T>Titre</T>}
                    name="titre" 
                    value={formData.titre || ''}
                    onChange={handleChange}
                  />
                </Stack>
              </Card>

              {/* Informations de dépôt */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Informations de dépôt</T></Typography>
                {(formData.informations_depot || []).map((info, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    {/* Pays et numéro de dépôt */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel><T>Pays</T></InputLabel>
                        <Select   
                          value={typeof info?.id_pays !== 'undefined' ? String(info.id_pays) : ''}
                          onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                          name="id_pays">
                          <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                          {paysList.map((paysItem) => (
                            <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                              {paysItem.nom_fr_fr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label={<T>Numéro de dépôt</T>}
                        name="numero_depot" 
                        value={info.numero_depot || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                      />
                    </Stack>
                    
                    {/* Numéros de publication et délivrance */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label={<T>Numéro de publication</T>}
                        name="numero_publication" 
                        value={info.numero_publication || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Numéro de délivrance</T>}
                        name="numero_delivrance" 
                        value={info.numero_delivrance || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                      />
                    </Stack>
                    
                    {/* Dates */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        type="date" 
                        label={<T>Date de dépôt</T>}
                        name="date_depot" 
                        value={info.date_depot || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        type="date" 
                        label={<T>Date de publication</T>}
                        name="date_publication" 
                        value={info.date_publication || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        type="date" 
                        label={<T>Date de délivrance</T>}
                        name="date_delivrance" 
                        value={info.date_delivrance || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Stack>
                    
                    {/* Statut et licence */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <FormControl fullWidth>
                        <InputLabel><T>Statut</T></InputLabel>
                        <Select
                          value={info.id_statuts || ''}
                          onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                          name="id_statuts">
                          <MenuItem value=""><T>Sélectionner un statut</T></MenuItem>
                          {statuts.map((statut) => (
                            <MenuItem key={statut.id_statuts} value={statut.id_statuts}>
                              {statut.valeur}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(info?.licence)}
                            onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                            name="licence"/>
                        }
                        label={<T>Licence</T>}
                      />
                      <Button
                        variant="contained" 
                        color="error" 
                        onClick={() => handleRemoveField(index, 'informations_depot')}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                  </Box>
                ))}
                <Button
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleAddField('informations_depot')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter des informations de dépôt</T>
                </Button>
              </Card>

              {/* Inventeurs */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Inventeurs</T></Typography>
                {(formData.inventeurs || []).map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label={<T>Nom</T>}
                        name="nom_inventeur" 
                        value={item.nom_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Prénom</T>}
                        name="prenom_inventeur" 
                        value={item.prenom_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Email</T>}
                        name="email_inventeur" 
                        type="email"
                        value={item.email_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Téléphone</T>}
                        name="telephone_inventeur" 
                        type="tel"
                        value={item.telephone_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <Button
                        variant="contained" 
                        color="error" 
                        onClick={() => handleRemoveField(index, 'inventeurs')}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    
                    {/* Sous-section Pays et Licence pour l'inventeur */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays et Licence</T></Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel><T>Pays</T></InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) => handleDynamicChangeForSubField(e, index, 'inventeurs', pIndex)}
                            name="id_pays">
                            <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(p?.licence)}
                              onChange={(e) => handleDynamicChangeForSubField(e, index, 'inventeurs', pIndex)}
                              name="licence"/>
                          }
                          label={<T>Licence</T>}
                        />
                        <Button
                          variant="contained" 
                          color="error" 
                          onClick={() => handleRemoveSubField(index, 'inventeurs', pIndex)}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleAddSubField(index, 'inventeurs', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> <T>Ajouter un pays</T>
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleAddField('inventeurs')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter un inventeur</T>
                </Button>
              </Card>

              {/* Commentaire */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Commentaire</T></Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label={<T>Commentaire</T>}
                    name="commentaire" 
                    value={formData.commentaire || ''}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Stack>
              </Card>

              {/* Bouton de soumission */}
              <Button
                variant="contained" 
                color="primary"
                type="submit" 
                startIcon={loading ? <CircularProgress size={20} /> : <FaSave />}
                disabled={loading}
              >
                {loading ? <T>En cours...</T> : <T>Ajouter</T>}
              </Button>
            </form>
          </Card>
        </Box>
      </Dialog>

      {/* Modal de confirmation */}
      <Dialog open={confirmationModal} onClose={handleCloseConfirmationModal} fullWidth maxWidth="sm">
        <Box sx={{ p: 4 }}>
          <Typography variant="h5">{isError ? <T>Erreur</T> : <T>Succès</T>}</Typography>
          <Typography variant="body1" sx={{ my: 2 }}>
            {confirmationMessage}
          </Typography>
          <Button
            variant="contained" 
            color="primary" 
            onClick={handleCloseConfirmationModal}
            fullWidth
          >
            <T>OK</T>
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default AddBrevetModal;
