import React from 'react';
import {
  Modal,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import useAddBrevet from '../hooks/useAddBrevet';
import PropTypes from 'prop-types';

const AddBrevetModal = ({ show, handleClose }) => {
  const {
    formData,
    clientsList,
    statuts,
    paysList,
    selectedPays,
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    loading,
    confirmationModal,
    confirmationMessage,
    isError,
    
    // Nouvelles fonctions
    updateFormData,
    addArrayItem,
    removeArrayItem,
    handleChange,
    handleRemoveFile,
    fetchContacts,
    handleSubmit,
    handleCloseConfirmationModal,
    toggleLicence, // Ajouter la fonction toggleLicence
  } = useAddBrevet(handleClose);
  // Fonction pour gérer les fichiers importés
  // Fonction pour gérer les fichiers importés
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    handleChange({ target: { name: 'pieces_jointes', files } });
  };

  return (
    <>
      <Modal open={show} onClose={handleClose}>
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
              Ajouter un nouveau brevet
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Clients */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Clients</Typography>
                {formData.clients.map((client, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Client</InputLabel>
                      <Select
                        value={client?.id_client ?? ''}
                        onChange={(e) => updateFormData(`clients.${index}.id_client`, e.target.value)}
                        required
                      >
                        <MenuItem value="">Sélectionner un client</MenuItem>
                        {clientsList?.map((clientOption) => (
                          <MenuItem key={clientOption.id} value={String(clientOption.id)}>
                            {clientOption.nom_client}
                          </MenuItem>
                        )) ?? []}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => removeArrayItem('clients', index)}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('clients', { id_client: '' })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un client
                </Button>
              </Card>

              {/* Informations Générales */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Informations Générales</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Référence Famille"
                    name="reference_famille"
                    value={formData.reference_famille}
                    onChange={(e) => updateFormData('reference_famille', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Titre"
                    name="titre"
                    value={formData.titre}
                    onChange={(e) => updateFormData('titre', e.target.value)}
                    required
                  />
                </Stack>
              </Card>

              {/* Numéros de dépôt et informations nationales - DÉPLACÉ ICI */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Numéros de dépôt et informations nationales</Typography>
                {formData.numeros_pays?.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="column" spacing={2}>
                      {/* Pays et Numéros de dépôt/publication */}
                      <Stack direction="row" spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel>Pays</InputLabel>
                          <Select
                            value={item?.id_pays ?? ''}
                            onChange={(e) => updateFormData(`numeros_pays.${index}.id_pays`, e.target.value)}
                            required
                          >
                            <MenuItem value="">Sélectionner un pays</MenuItem>
                            {paysList?.map((paysItem) => (
                              <MenuItem key={paysItem.id_pays} value={String(paysItem.id_pays)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            )) ?? []}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Numéro de dépôt"
                          value={item?.numero_depot ?? ''}
                          onChange={(e) => updateFormData(`numeros_pays.${index}.numero_depot`, e.target.value)}
                          required
                        />
                      </Stack>

                      {/* Numéro de publication et Statut */}
                      <Stack direction="row" spacing={2}>
                        <TextField
                          fullWidth
                          label="Numéro de publication"
                          value={item?.numero_publication ?? ''}
                          onChange={(e) => updateFormData(`numeros_pays.${index}.numero_publication`, e.target.value)}
                        />
                        <FormControl fullWidth>
                          <InputLabel>Statut</InputLabel>
                          <Select
                            value={item?.id_statuts ?? ''}
                            onChange={(e) => updateFormData(`numeros_pays.${index}.id_statuts`, e.target.value)}
                            required
                          >
                            <MenuItem value="">Sélectionner un statut</MenuItem>
                            {statuts?.map((statut) => (
                              <MenuItem key={statut.id_statuts} value={String(statut.id_statuts)}>
                                {statut.valeur}
                              </MenuItem>
                            )) ?? []}
                          </Select>
                        </FormControl>
                      </Stack>

                      {/* Dates */}
                      <Stack direction="row" spacing={2}>
                        <TextField
                          type="date"
                          label="Date Dépôt"
                          value={item?.date_depot ?? ''}
                          onChange={(e) => updateFormData(`numeros_pays.${index}.date_depot`, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                        <TextField
                          type="date"
                          label="Date Délivrance"
                          value={item?.date_delivrance ?? ''}
                          onChange={(e) => updateFormData(`numeros_pays.${index}.date_delivrance`, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          fullWidth
                          label="Numéro de délivrance"
                          value={item?.numero_delivrance ?? ''}
                          onChange={(e) => updateFormData(`numeros_pays.${index}.numero_delivrance`, e.target.value)}
                        />
                      </Stack>

                      {/* Licence */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item?.licence ?? false}
                            onChange={(e) => updateFormData(`numeros_pays.${index}.licence`, e.target.checked)}
                          />
                        }
                        label="Licence"
                      />

                      {/* Bouton Supprimer */}
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeArrayItem('numeros_pays', index)}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                  </Box>
                )) ?? []}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('numeros_pays', { 
                    id_pays: '', 
                    numero_depot: '', 
                    numero_publication: '', 
                    id_statuts: '', 
                    date_depot: '', 
                    date_delivrance: '', 
                    numero_delivrance: '', 
                    licence: false 
                  })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter une information nationale
                </Button>
              </Card>

              {/* Inventeurs - Modification pour utiliser la sélection multiple de pays */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Inventeurs</Typography>
                {formData.inventeurs?.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label="Nom"
                        value={item?.nom_inventeur ?? ''}
                        onChange={(e) => updateFormData(`inventeurs.${index}.nom_inventeur`, e.target.value)}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={item?.prenom_inventeur ?? ''}
                        onChange={(e) => updateFormData(`inventeurs.${index}.prenom_inventeur`, e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={item?.email_inventeur ?? ''}
                        onChange={(e) => updateFormData(`inventeurs.${index}.email_inventeur`, e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Téléphone"
                        type="tel"
                        value={item?.telephone_inventeur ?? ''}
                        onChange={(e) => updateFormData(`inventeurs.${index}.telephone_inventeur`, e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeArrayItem('inventeurs', index)}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    
                    {/* Remplacer la section pays actuelle par un sélecteur multiple */}
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Pays associés</InputLabel>
                        <Select
                          multiple
                          value={item?.pays_associes ?? []}
                          onChange={(e) => updateFormData(`inventeurs.${index}.pays_associes`, e.target.value)}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const pays = selectedPays?.find(p => p.id_pays === value);
                                return (
                                  <Box key={value} component="span" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                                    {pays?.nom_fr_fr ?? value}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        >
                          <MenuItem value="">
                            <em>Aucun</em>
                          </MenuItem>
                          {selectedPays?.map((paysItem) => (
                            <MenuItem key={paysItem.id_pays} value={String(paysItem.id_pays)}>
                              {paysItem.nom_fr_fr}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('inventeurs', { 
                    nom_inventeur: '', 
                    prenom_inventeur: '', 
                    email_inventeur: '', 
                    telephone_inventeur: '', 
                    pays_associes: [] 
                  })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un inventeur
                </Button>
              </Card>

              {/* Déposants - Modification pour utiliser la sélection multiple de pays */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Déposants</Typography>
                {formData.deposants?.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label="Nom"
                        value={item?.nom_deposant ?? ''}
                        onChange={(e) => updateFormData(`deposants.${index}.nom_deposant`, e.target.value)}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={item?.prenom_deposant ?? ''}
                        onChange={(e) => updateFormData(`deposants.${index}.prenom_deposant`, e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={item?.email_deposant ?? ''}
                        onChange={(e) => updateFormData(`deposants.${index}.email_deposant`, e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Téléphone"
                        type="tel"
                        value={item?.telephone_deposant ?? ''}
                        onChange={(e) => updateFormData(`deposants.${index}.telephone_deposant`, e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeArrayItem('deposants', index)}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    
                    {/* Remplacer la section pays actuelle par un sélecteur multiple */}
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Pays associés</InputLabel>
                        <Select
                          multiple
                          value={item?.pays_associes ?? []}
                          onChange={(e) => updateFormData(`deposants.${index}.pays_associes`, e.target.value)}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const pays = selectedPays?.find(p => p.id_pays === value);
                                return (
                                  <Box key={value} component="span" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                                    {pays?.nom_fr_fr ?? value}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        >
                          <MenuItem value="">
                            <em>Aucun</em>
                          </MenuItem>
                          {selectedPays?.map((paysItem) => (
                            <MenuItem key={paysItem.id_pays} value={String(paysItem.id_pays)}>
                              {paysItem.nom_fr_fr}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('deposants', { 
                    nom_deposant: '', 
                    prenom_deposant: '', 
                    email_deposant: '', 
                    telephone_deposant: '', 
                    pays_associes: [] 
                  })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un déposant
                </Button>
              </Card>

              {/* Titulaires - Modification pour utiliser la sélection multiple de pays */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Titulaires</Typography>
                {formData.titulaires?.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label="Nom"
                        value={item?.nom_titulaire ?? ''}
                        onChange={(e) => updateFormData(`titulaires.${index}.nom_titulaire`, e.target.value)}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={item?.prenom_titulaire ?? ''}
                        onChange={(e) => updateFormData(`titulaires.${index}.prenom_titulaire`, e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={item?.email_titulaire ?? ''}
                        onChange={(e) => updateFormData(`titulaires.${index}.email_titulaire`, e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Téléphone"
                        type="tel"
                        value={item?.telephone_titulaire ?? ''}
                        onChange={(e) => updateFormData(`titulaires.${index}.telephone_titulaire`, e.target.value)}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item?.executant ?? false}
                            onChange={(e) => updateFormData(`titulaires.${index}.executant`, e.target.checked)}
                          />
                        }
                        label="Exécutant"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item?.client_correspondant ?? false}
                            onChange={(e) => updateFormData(`titulaires.${index}.client_correspondant`, e.target.checked)}
                          />
                        }
                        label="Client Correspondant"
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeArrayItem('titulaires', index)}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    
                    {/* Remplacer la section pays actuelle par un sélecteur multiple */}
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Pays associés</InputLabel>
                        <Select
                          multiple
                          value={item?.pays_associes ?? []}
                          onChange={(e) => updateFormData(`titulaires.${index}.pays_associes`, e.target.value)}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const pays = selectedPays?.find(p => p.id_pays === value);
                                return (
                                  <Box key={value} component="span" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                                    {pays?.nom_fr_fr ?? value}
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        >
                          <MenuItem value="">
                            <em>Aucun</em>
                          </MenuItem>
                          {selectedPays?.map((paysItem) => (
                            <MenuItem key={paysItem.id_pays} value={String(paysItem.id_pays)}>
                              {paysItem.nom_fr_fr}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('titulaires', { 
                    nom_titulaire: '', 
                    prenom_titulaire: '', 
                    email_titulaire: '', 
                    telephone_titulaire: '', 
                    executant: false, 
                    client_correspondant: false, 
                    pays_associes: [] 
                  })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un titulaire
                </Button>
              </Card>

              {/* Cabinets de Procédure - Modification pour la sélection multiple de pays */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Cabinets de Procédure et Contacts</Typography>
                {formData.cabinets_procedure?.map((item, index) => (
                  <Stack direction="column" spacing={2} key={index} sx={{ mt: 2 }}>
                    {/* Cabinet et Référence */}
                    <Stack direction="row" spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Cabinet</InputLabel>
                        <Select
                          value={item?.id_cabinet ?? ''}
                          onChange={(e) => {
                            updateFormData(`cabinets_procedure.${index}.id_cabinet`, e.target.value);
                            fetchContacts(e.target.value, 'procedure');
                          }}
                          required
                        >
                          <MenuItem value="">Sélectionner un cabinet</MenuItem>
                          {cabinets?.procedure?.map((cabinet) => (
                            <MenuItem key={cabinet.id} value={String(cabinet.id)}>
                              {cabinet.nom_cabinet}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Référence"
                        value={item?.reference ?? ''}
                        onChange={(e) => updateFormData(`cabinets_procedure.${index}.reference`, e.target.value)}
                        required
                      />
                    </Stack>

                    {/* Dernier Intervenant et Contact */}
                    <Stack direction="row" spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item?.dernier_intervenant ?? false}
                            onChange={(e) => updateFormData(`cabinets_procedure.${index}.dernier_intervenant`, e.target.checked)}
                          />
                        }
                        label="Dernier Intervenant"
                      />
                      <FormControl fullWidth>
                        <InputLabel>Contact</InputLabel>
                        <Select
                          value={item?.id_contact ?? ''}
                          onChange={(e) => updateFormData(`cabinets_procedure.${index}.id_contact`, e.target.value)}
                        >
                          <MenuItem value="">Sélectionner un contact</MenuItem>
                          {contactsProcedure?.map((contact) => (
                            <MenuItem key={contact.id} value={String(contact.id)}>
                              {contact?.nom_contact} {contact?.prenom_contact ?? ''}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Association avec PLUSIEURS pays */}
                    <FormControl fullWidth>
                      <InputLabel>Pays associés</InputLabel>
                      <Select
                        multiple
                        value={item?.pays_associes ?? []}
                        onChange={(e) => updateFormData(`cabinets_procedure.${index}.pays_associes`, e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const pays = selectedPays?.find(p => p.id_pays === value);
                              return (
                                <Box key={value} component="span" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                                  {pays?.nom_fr_fr ?? value}
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      >
                        <MenuItem value="">
                          <em>Aucun</em>
                        </MenuItem>
                        {selectedPays?.map((paysItem) => (
                          <MenuItem key={paysItem.id_pays} value={String(paysItem.id_pays)}>
                            {paysItem?.nom_fr_fr}
                          </MenuItem>
                        )) ?? []}
                      </Select>
                    </FormControl>

                    {/* Bouton Supprimer */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => removeArrayItem('cabinets_procedure', index)}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                )) ?? []}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('cabinets_procedure', { 
                    id_cabinet: '', 
                    reference: '', 
                    dernier_intervenant: false, 
                    id_contact: '', 
                    pays_associes: [] 
                  })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un cabinet de procédure
                </Button>
              </Card>

              {/* Cabinets d'Annuité - Même modification */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Cabinets d'Annuité et Contacts</Typography>
                {formData.cabinets_annuite?.map((item, index) => (
                  <Stack direction="column" spacing={2} key={index} sx={{ mt: 2 }}>
                    {/* Cabinet et Référence */}
                    <Stack direction="row" spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Cabinet</InputLabel>
                        <Select
                          value={item?.id_cabinet ?? ''}
                          onChange={(e) => {
                            updateFormData(`cabinets_annuite.${index}.id_cabinet`, e.target.value);
                            fetchContacts(e.target.value, 'annuite');
                          }}
                          required
                        >
                          <MenuItem value="">Sélectionner un cabinet</MenuItem>
                          {cabinets?.annuite?.map((cabinet) => (
                            <MenuItem key={cabinet.id} value={String(cabinet.id)}>
                              {cabinet.nom_cabinet}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Référence"
                        value={item?.reference ?? ''}
                        onChange={(e) => updateFormData(`cabinets_annuite.${index}.reference`, e.target.value)}
                        required
                      />
                    </Stack>

                    {/* Dernier Intervenant et Contact */}
                    <Stack direction="row" spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item?.dernier_intervenant ?? false}
                            onChange={(e) => updateFormData(`cabinets_annuite.${index}.dernier_intervenant`, e.target.checked)}
                          />
                        }
                        label="Dernier Intervenant"
                      />
                      <FormControl fullWidth>
                        <InputLabel>Contact</InputLabel>
                        <Select
                          value={item?.id_contact ?? ''}
                          onChange={(e) => updateFormData(`cabinets_annuite.${index}.id_contact`, e.target.value)}
                        >
                          <MenuItem value="">Sélectionner un contact</MenuItem>
                          {contactsAnnuite?.map((contact) => (
                            <MenuItem key={contact.id} value={String(contact.id)}>
                              {contact?.nom_contact} {contact?.prenom_contact ?? ''}
                            </MenuItem>
                          )) ?? []}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Association avec PLUSIEURS pays */}
                    <FormControl fullWidth>
                      <InputLabel>Pays associés</InputLabel>
                      <Select
                        multiple
                        value={item?.pays_associes ?? []}
                        onChange={(e) => updateFormData(`cabinets_annuite.${index}.pays_associes`, e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const pays = selectedPays?.find(p => p.id_pays === value);
                              return (
                                <Box key={value} component="span" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                                  {pays?.nom_fr_fr ?? value}
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      >
                        <MenuItem value="">
                          <em>Aucun</em>
                        </MenuItem>
                        {selectedPays?.map((paysItem) => (
                          <MenuItem key={paysItem.id_pays} value={String(paysItem.id_pays)}>
                            {paysItem?.nom_fr_fr}
                          </MenuItem>
                        )) ?? []}
                      </Select>
                    </FormControl>

                    {/* Bouton Supprimer */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => removeArrayItem('cabinets_annuite', index)}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                )) ?? []}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addArrayItem('cabinets_annuite', { 
                    id_cabinet: '', 
                    reference: '', 
                    dernier_intervenant: false, 
                    id_contact: '', 
                    pays_associes: [] 
                  })}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un cabinet d'annuité
                </Button>
              </Card>

              {/* Commentaire et Pièces Jointes */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Commentaire et Pièces Jointes</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Commentaire"
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={(e) => updateFormData('commentaire', e.target.value)}
                    multiline
                    rows={4}
                  />
                  <Button variant="contained" component="label" startIcon={<AttachFileIcon />}>
                    Ajouter des pièces jointes
                    <input
                      type="file"
                      hidden
                      name="pieces_jointes"
                      multiple
                      onChange={handleFilesChange}
                    />
                  </Button>
                  {formData.pieces_jointes.length > 0 && (
                    <List>
                      {formData.pieces_jointes.map((file, index) => (
                        <ListItem key={index} divider>
                          <ListItemText primary={file.name} />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Stack>
              </Card>

              {/* Bouton de soumission */}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <FaSave />}
              >
                {loading ? 'En cours...' : 'Ajouter'}
              </Button>
            </form>
          </Card>
        </Box>
      </Modal>

      {/* Modal de confirmation */}
      <Modal open={confirmationModal} onClose={handleCloseConfirmationModal}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Card sx={{ p: 4, width: '400px' }}>
            <Typography variant="h5">{isError ? 'Erreur' : 'Succès'}</Typography>
            <Typography variant="body1" sx={{ my: 2 }}>
              {confirmationMessage}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleCloseConfirmationModal} fullWidth>
              OK
            </Button>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

// Ajouter des PropTypes pour les validations de props
AddBrevetModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default AddBrevetModal;
