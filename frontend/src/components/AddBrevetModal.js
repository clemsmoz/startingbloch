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
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import T from '../components/T';
import useAddBrevet from '../hooks/useAddBrevet';

const AddBrevetModal = ({ show, handleClose }) => {
  const {
    formData,
    setFormData,
    clientsList,
    setClientsList,
    statuts,
    paysList,
    associatedCountries,
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    loading,
    handleChange,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    handleSubmit,
    fetchContacts,
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

  // Fonction pour la gestion des pays multiples
  const handleAddCountry = (parentIndex, field) => {
    handleAddSubField(parentIndex, field, 'pays');
  };

  // Affichage d'une modale de chargement si les données initiales ne sont pas prêtes
  if (loadingInitialData) {
    return (
      <Dialog open={show} fullWidth maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6"><T>Chargement des données (clients, pays, statuts, cabinets)...</T></Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={show} onClose={handleClose} fullWidth maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
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
                              <T>{paysItem.nom_fr_fr}</T>
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
                                <T>{paysItem.nom_fr_fr}</T>
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

              {/* Déposants */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Déposants</T></Typography>
                {(formData.deposants || []).map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label={<T>Nom</T>}
                        name="nom_deposant"
                        value={item.nom_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Prénom</T>}
                        name="prenom_deposant"
                        value={item.prenom_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Email</T>}
                        name="email_deposant"
                        type="email"
                        value={item.email_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Téléphone</T>}
                        name="telephone_deposant"
                        type="tel"
                        value={item.telephone_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveField(index, 'deposants')}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    {/* Sous-section Pays et Licence pour le déposant */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays et Licence</T></Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel><T>Pays</T></InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'deposants', pIndex)
                            }
                            name="id_pays"
                          >
                            <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                <T>{paysItem.nom_fr_fr}</T>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(p?.licence)}
                              onChange={(e) =>
                                handleDynamicChangeForSubField(e, index, 'deposants', pIndex)
                              }
                              name="licence"
                            />
                          }
                          label={<T>Licence</T>}
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'deposants', pIndex)}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'deposants', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> <T>Ajouter un pays</T>
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('deposants')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter un déposant</T>
                </Button>
              </Card>

              {/* Titulaires */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Titulaires</T></Typography>
                {(formData.titulaires || []).map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label={<T>Nom</T>}
                        name="nom_titulaire"
                        value={item.nom_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Prénom</T>}
                        name="prenom_titulaire"
                        value={item.prenom_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Email</T>}
                        name="email_titulaire"
                        type="email"
                        value={item.email_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <TextField
                        fullWidth
                        label={<T>Téléphone</T>}
                        name="telephone_titulaire"
                        type="tel"
                        value={item.telephone_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.executant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                            name="executant"
                          />
                        }
                        label={<T>Exécutant</T>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.client_correspondant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                            name="client_correspondant"
                          />
                        }
                        label={<T>Client Correspondant</T>}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveField(index, 'titulaires')}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    {/* Sous-section Pays et Licence pour le titulaire */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays et Licence</T></Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel><T>Pays</T></InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'titulaires', pIndex)
                            }
                            name="id_pays"
                          >
                            <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                <T>{paysItem.nom_fr_fr}</T>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(p?.licence)}
                              onChange={(e) =>
                                handleDynamicChangeForSubField(e, index, 'titulaires', pIndex)
                              }
                              name="licence"
                            />
                          }
                          label={<T>Licence</T>}
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'titulaires', pIndex)}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'titulaires', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> <T>Ajouter un pays</T>
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('titulaires')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter un titulaire</T>
                </Button>
              </Card>

              {/* Cabinets de Procédure et Contacts */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Cabinets de Procédure et Contacts</T></Typography>
                {(formData.cabinets_procedure || []).map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    {/* Cabinet et Référence */}
                    <Stack direction="row" spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel><T>Cabinet</T></InputLabel>
                        <Select
                          value={item.id_cabinet || ''}
                          onChange={(e) => {
                            handleDynamicChange(e, index, 'cabinets_procedure');
                            fetchContacts(e.target.value, 'procedure');
                          }}
                          name="id_cabinet"
                        >
                          <MenuItem value=""><T>Sélectionner un cabinet</T></MenuItem>
                          {(cabinets?.procedure || []).map((cabinet) => (
                            <MenuItem key={cabinet.id} value={cabinet.id}>
                              {cabinet.nom_cabinet}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label={<T>Référence</T>}
                        name="reference"
                        value={item.reference || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                      />
                    </Stack>

                    {/* Dernier Intervenant et Contact */}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.dernier_intervenant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                            name="dernier_intervenant"
                          />
                        }
                        label={<T>Dernier Intervenant</T>}
                      />
                      <FormControl fullWidth>
                        <InputLabel><T>Contact</T></InputLabel>
                        <Select
                          value={item.id_contact || ''}
                          onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                          name="id_contact"
                        >
                          <MenuItem value=""><T>Sélectionner un contact</T></MenuItem>
                          {Array.isArray(contactsProcedure) && contactsProcedure.map((contact) => (
                            <MenuItem key={contact.id} value={contact.id}>
                              {contact.nom_contact} {contact.prenom_contact}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Pays */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays</T></Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel><T>Pays</T></InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'cabinets_procedure', pIndex)
                            }
                            name="id_pays"
                          >
                            <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                <T>{paysItem.nom_fr_fr}</T>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'cabinets_procedure', pIndex)}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'cabinets_procedure', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> <T>Ajouter un pays</T>
                    </Button>

                    {/* Bouton pour supprimer le cabinet entier */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'cabinets_procedure')}
                      sx={{ mt: 2, width: '100%' }}
                    >
                      <FaMinus /> <T>Supprimer ce cabinet</T>
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('cabinets_procedure')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter un cabinet de procédure</T>
                </Button>
              </Card>

              {/* Cabinets d'Annuité et Contacts */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5"><T>Cabinets d'Annuité et Contacts</T></Typography>
                {(formData.cabinets_annuite || []).map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    {/* Cabinet et Référence */}
                    <Stack direction="row" spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel><T>Cabinet</T></InputLabel>
                        <Select
                          value={item.id_cabinet || ''}
                          onChange={(e) => {
                            handleDynamicChange(e, index, 'cabinets_annuite');
                            fetchContacts(e.target.value, 'annuite');
                          }}
                          name="id_cabinet"
                        >
                          <MenuItem value=""><T>Sélectionner un cabinet</T></MenuItem>
                          {(cabinets?.annuite || []).map((cabinet) => (
                            <MenuItem key={cabinet.id} value={cabinet.id}>
                              {cabinet.nom_cabinet}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label={<T>Référence</T>}
                        name="reference"
                        value={item.reference || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                      />
                    </Stack>

                    {/* Dernier Intervenant et Contact */}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.dernier_intervenant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                            name="dernier_intervenant"
                          />
                        }
                        label={<T>Dernier Intervenant</T>}
                      />
                      <FormControl fullWidth>
                        <InputLabel><T>Contact</T></InputLabel>
                        <Select
                          value={item.id_contact || ''}
                          onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                          name="id_contact"
                        >
                          <MenuItem value=""><T>Sélectionner un contact</T></MenuItem>
                          {Array.isArray(contactsAnnuite) && contactsAnnuite.map((contact) => (
                            <MenuItem key={contact.id} value={contact.id}>
                              {contact.nom_contact} {contact.prenom_contact}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Pays */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays</T></Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel><T>Pays</T></InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'cabinets_annuite', pIndex)
                            }
                            name="id_pays"
                          >
                            <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                <T>{paysItem.nom_fr_fr}</T>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'cabinets_annuite', pIndex)}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'cabinets_annuite', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> <T>Ajouter un pays</T>
                    </Button>

                    {/* Bouton pour supprimer le cabinet entier */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'cabinets_annuite')}
                      sx={{ mt: 2, width: '100%' }}
                    >
                      <FaMinus /> <T>Supprimer ce cabinet</T>
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('cabinets_annuite')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> <T>Ajouter un cabinet d'annuité</T>
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
      <Dialog open={confirmationModal} onClose={handleCloseConfirmationModal} fullWidth maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Card sx={{ p: 4, width: '400px' }}>
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
          </Card>
        </Box>
      </Dialog>
    </>
  );
};

export default AddBrevetModal;
