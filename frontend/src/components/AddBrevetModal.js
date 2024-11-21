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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete'; // Importer l'icône de suppression

import useAddBrevet from '../hooks/useAddBrevet';

const AddBrevetModal = ({ show, handleClose }) => {
  const {
    formData,
    setFormData, // Assurez-vous que setFormData est bien inclus ici
    clientsList,
    statuts,
    paysList,
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
    isError,
    confirmationModal,
    confirmationMessage,
    handleCloseConfirmationModal,
  } = useAddBrevet(handleClose);

  // Fonction pour gérer le changement de fichiers
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      pieces_jointes: [...formData.pieces_jointes, ...files],
    });
  };

  // Fonction pour supprimer un fichier de la liste
  const handleRemoveFile = (index) => {
    const newFiles = formData.pieces_jointes.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      pieces_jointes: newFiles,
    });
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
                        value={client.id_client}
                        onChange={(e) => handleDynamicChange(e, index, 'clients')}
                        name="id_client"
                        required
                      >
                        <MenuItem value="">Sélectionner un client</MenuItem>
                        {clientsList.map((clientOption) => (
                          <MenuItem key={clientOption.id_client} value={clientOption.id_client}>
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
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                  />
                </Stack>
              </Card>

           {/* Pays, Numéro de Dépôt et Numéro de Publication + Statut */}
<Card sx={{ mb: 3, p: 2 }}>
  <Typography variant="h5">
    Pays, Numéro de Dépôt, Numéro de Publication et Statut
  </Typography>
  {formData.pays.map((item, index) => (
    <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Pays</InputLabel>
        <Select
          value={item.id_pays}
          onChange={(e) => handleDynamicChange(e, index, 'pays')}
          name="id_pays"
          required
        >
          <MenuItem value="">Sélectionner un pays</MenuItem>
          {paysList.map((paysItem) => (
            <MenuItem key={paysItem.id_pays} value={paysItem.id_pays}>
              {paysItem.nom_fr_fr}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Numéro de dépôt"
        name="numero_depot"
        value={item.numero_depot}  // Utilisation correcte de `item.numero_depot`
        onChange={(e) => handleDynamicChange(e, index, 'pays')}
        required
      />
      <TextField
        fullWidth
        label="Numéro de publication"
        name="numero_publication"
        value={item.numero_publication}  // Utilisation correcte de `item.numero_publication`
        onChange={(e) => handleDynamicChange(e, index, 'pays')}
      />

      <FormControl fullWidth>
        <InputLabel>Statut</InputLabel>
        <Select
          value={item.id_statuts}  // Utilisation correcte de `item.id_statuts`
          onChange={(e) => handleDynamicChange(e, index, 'pays')}
          name="id_statuts"
          required
        >
          <MenuItem value="">Sélectionner un statut</MenuItem>
          {statuts.map((statut) => (
            <MenuItem key={statut.id_statuts} value={statut.id_statuts}>
              {statut.valeur}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="space-between">
        <TextField
          type="date"
          label="Date Dépôt"
          name="date_depot"
          value={item.date_depot}  // Utilisation correcte de `item.date_depot`
          onChange={(e) => handleDynamicChange(e, index, 'pays')}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1, mr: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Numéro Délivrance"
          name="numero_delivrance"
          value={item.numero_delivrance}  // Utilisation correcte de `item.numero_delivrance`
          onChange={(e) => handleDynamicChange(e, index, 'pays')}
          sx={{ flex: 1, mr: 2 }}
        />
        <TextField
          type="date"
          label="Date Délivrance"
          name="date_delivrance"
          value={item.date_delivrance}  // Utilisation correcte de `item.date_delivrance`
          onChange={(e) => handleDynamicChange(e, index, 'pays')}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1 }}
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={item.licence}  // Utilisation correcte de `item.licence`
            onChange={(e) => handleDynamicChange(e, index, 'pays')}
            name="licence"
          />
        }
        label="Licence"
      />

      <Button
        variant="contained"
        color="error"
        onClick={() => handleRemoveField(index, 'pays')}
        sx={{ height: '56px' }}
      >
        <FaMinus />
      </Button>
    </Stack>
  ))}

  <Button
    variant="contained"
    color="primary"
    onClick={() => handleAddField('pays')}
    sx={{ mt: 2 }}
  >
    <FaPlus /> Ajouter un pays
  </Button>
</Card>


              {/* Inventeurs */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Inventeurs</Typography>
                {formData.inventeurs.map((item, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="nom_inventeur"
                      value={item.nom_inventeur}
                      onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="prenom_inventeur"
                      value={item.prenom_inventeur}
                      onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email_inventeur"
                      type="email"
                      value={item.email_inventeur}
                      onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                    />
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="telephone_inventeur"
                      type="tel"
                      value={item.telephone_inventeur}
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
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('inventeurs')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un inventeur
                </Button>
              </Card>

              {/* Déposants */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Déposants</Typography>
                {formData.deposants.map((item, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="nom_deposant"
                      value={item.nom_deposant}
                      onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="prenom_deposant"
                      value={item.prenom_deposant}
                      onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email_deposant"
                      type="email"
                      value={item.email_deposant}
                      onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                    />
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="telephone_deposant"
                      type="tel"
                      value={item.telephone_deposant}
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
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('deposants')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un déposant
                </Button>
              </Card>

              {/* Titulaires */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Titulaires</Typography>
                {formData.titulaires.map((item, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="nom_titulaire"
                      value={item.nom_titulaire}
                      onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="prenom_titulaire"
                      value={item.prenom_titulaire}
                      onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email_titulaire"
                      type="email"
                      value={item.email_titulaire}
                      onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                    />
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="telephone_titulaire"
                      type="tel"
                      value={item.telephone_titulaire}
                      onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.executant}
                          onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                          name="executant"
                        />
                      }
                      label="Exécutant"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.client_correspondant}
                          onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                          name="client_correspondant"
                        />
                      }
                      label="Client Correspondant"
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
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('titulaires')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un titulaire
                </Button>
              </Card>

              {/* Cabinets de Procédure et Contacts */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Cabinets de Procédure et Contacts</Typography>
                {formData.cabinets_procedure.map((item, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Cabinet</InputLabel>
                      <Select
                        value={item.id_cabinet_procedure}
                        onChange={(e) => {
                          handleDynamicChange(e, index, 'cabinets_procedure');
                          fetchContacts(e.target.value, 'procedure');
                        }}
                        name="id_cabinet_procedure"
                        required
                      >
                        <MenuItem value="">Sélectionner un cabinet</MenuItem>
                        {cabinets.procedure.map((cabinet) => (
                          <MenuItem key={cabinet.id_cabinet} value={cabinet.id_cabinet}>
                            {cabinet.nom_cabinet}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Référence"
                      name="reference"
                      value={item.reference}
                      onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                      required
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.dernier_intervenant}
                          onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                          name="dernier_intervenant"
                        />
                      }
                      label="Dernier Intervenant"
                    />
                    <FormControl fullWidth>
                      <InputLabel>Contact</InputLabel>
                      <Select
                        value={item.id_contact_procedure}
                        onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                        name="id_contact_procedure"
                      >
                        <MenuItem value="">Sélectionner un contact</MenuItem>
                        {contactsProcedure.map((contact) => (
                          <MenuItem key={contact.id_contact} value={contact.id_contact}>
                            {contact.nom} {contact.prenom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'cabinets_procedure')}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('cabinets_procedure')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un cabinet de procédure
                </Button>
              </Card>

              {/* Cabinets d'Annuité et Contacts */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Cabinets d'Annuité et Contacts</Typography>
                {formData.cabinets_annuite.map((item, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Cabinet</InputLabel>
                      <Select
                        value={item.id_cabinet_annuite}
                        onChange={(e) => {
                          handleDynamicChange(e, index, 'cabinets_annuite');
                          fetchContacts(e.target.value, 'annuite');
                        }}
                        name="id_cabinet_annuite"
                        required
                      >
                        <MenuItem value="">Sélectionner un cabinet</MenuItem>
                        {cabinets.annuite.map((cabinet) => (
                          <MenuItem key={cabinet.id_cabinet} value={cabinet.id_cabinet}>
                            {cabinet.nom_cabinet}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Référence"
                      name="reference"
                      value={item.reference}
                      onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                      required
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.dernier_intervenant}
                          onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                          name="dernier_intervenant"
                        />
                      }
                      label="Dernier Intervenant"
                    />
                    <FormControl fullWidth>
                      <InputLabel>Contact</InputLabel>
                      <Select
                        value={item.id_contact_annuite}
                        onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                        name="id_contact_annuite"
                      >
                        <MenuItem value="">Sélectionner un contact</MenuItem>
                        {contactsAnnuite.map((contact) => (
                          <MenuItem key={contact.id_contact} value={contact.id_contact}>
                            {contact.nom} {contact.prenom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'cabinets_annuite')}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('cabinets_annuite')}
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
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<AttachFileIcon />}
                  >
                    Ajouter des pièces jointes
                    <input
                      type="file"
                      hidden
                      name="pieces_jointes"
                      multiple
                      onChange={handleFilesChange}
                    />
                  </Button>
                  {/* Affichage des pièces jointes sélectionnées */}
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseConfirmationModal}
              fullWidth
            >
              OK
            </Button>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default AddBrevetModal;
