import React, { useState } from 'react';
import {
  Modal,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '../config';

const ROLE_OPTIONS = [
  "Responsable PI",
  "Responsable juridique",
  "Responsable administratif",
  "Responsable technique",
  "Correspondant annuités",
  "Correspondant brevets",
  "Correspondant facturation",
  "Correspondant général",
  "Autre"
];

const AddContactModal = ({ show, handleClose, refreshContacts, cabinetId, clientId }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    emails: [''],
    phones: [''],
    roles: []
  });

  // Gestion dynamique des emails
  const handleEmailChange = (idx, value) => {
    setFormData((prev) => {
      const emails = [...prev.emails];
      emails[idx] = value;
      return { ...prev, emails };
    });
  };
  const handleAddEmail = () => {
    setFormData((prev) => ({ ...prev, emails: [...prev.emails, ''] }));
  };
  const handleRemoveEmail = (idx) => {
    setFormData((prev) => {
      const emails = prev.emails.filter((_, i) => i !== idx);
      return { ...prev, emails: emails.length ? emails : [''] };
    });
  };

  // Gestion dynamique des téléphones
  const handlePhoneChange = (idx, value) => {
    setFormData((prev) => {
      const phones = [...prev.phones];
      phones[idx] = value;
      return { ...prev, phones };
    });
  };
  const handleAddPhone = () => {
    setFormData((prev) => ({ ...prev, phones: [...prev.phones, ''] }));
  };
  const handleRemovePhone = (idx) => {
    setFormData((prev) => {
      const phones = prev.phones.filter((_, i) => i !== idx);
      return { ...prev, phones: phones.length ? phones : [''] };
    });
  };

  // Gestion des rôles multiples
  const handleRoleChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let url = '';
    let dataToSend = {};

    if (cabinetId) {
      url = `${API_BASE_URL}/api/contacts/cabinets`;
      dataToSend = {
        nom_contact: formData.nom,
        prenom_contact: formData.prenom,
        poste_contact: formData.fonction,
        emails: formData.emails.filter(e => e.trim() !== ''),
        phones: formData.phones.filter(t => t.trim() !== ''),
        roles: formData.roles,
        cabinet_id: cabinetId
      };
    } else if (clientId) {
      url = `${API_BASE_URL}/api/contacts/clients`;
      dataToSend = {
        nom_contact: formData.nom,
        prenom_contact: formData.prenom,
        poste_contact: formData.fonction,
        emails: formData.emails.filter(e => e.trim() !== ''),
        phones: formData.phones.filter(t => t.trim() !== ''),
        roles: formData.roles,
        client_id: clientId
      };
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then(response => response.json())
      .then(data => {
        if (cabinetId) {
          refreshContacts({ cabinet_id: cabinetId });
        } else if (clientId) {
          refreshContacts({ client_id: clientId });
        }
        handleClose();
      })
      .catch(error => {
        console.error('There was an error adding the contact!', error);
      });
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: 700, // Largeur augmentée
          mx: 'auto',
          mt: '5%',
          maxHeight: '95vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Ajouter un nouveau contact
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Colonne 1 : Infos principales */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Fonction"
                name="fonction"
                value={formData.fonction}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              {/* Champ rôles multiples */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="roles-label">Rôles</InputLabel>
                <Select
                  labelId="roles-label"
                  multiple
                  value={formData.roles}
                  onChange={handleRoleChange}
                  renderValue={(selected) => selected.join(', ')}
                  label="Rôles"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={formData.roles.indexOf(role) > -1} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Colonne 2 : Emails et téléphones dynamiques */}
            <Grid item xs={12} md={6}>
              {/* Emails dynamiques */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Emails</Typography>
                {formData.emails.map((email, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      label={`Email ${idx + 1}`}
                      type="email"
                      value={email}
                      onChange={e => handleEmailChange(idx, e.target.value)}
                      fullWidth
                      variant="outlined"
                    />
                    <IconButton
                      aria-label="Supprimer"
                      onClick={() => handleRemoveEmail(idx)}
                      disabled={formData.emails.length === 1}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  onClick={handleAddEmail}
                  sx={{ mt: 1 }}
                >
                  Ajouter un email
                </Button>
              </Box>
              {/* Téléphones dynamiques */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Téléphones</Typography>
                {formData.phones.map((phone, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      label={`Téléphone ${idx + 1}`}
                      value={phone}
                      onChange={e => handlePhoneChange(idx, e.target.value)}
                      fullWidth
                      variant="outlined"
                    />
                    <IconButton
                      aria-label="Supprimer"
                      onClick={() => handleRemovePhone(idx)}
                      disabled={formData.phones.length === 1}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  onClick={handleAddPhone}
                  sx={{ mt: 1 }}
                >
                  Ajouter un téléphone
                </Button>
              </Box>
            </Grid>
            {/* Bouton submit sur toute la largeur */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{
                  mt: 2,
                  transition: '0.3s',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                Ajouter
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default AddContactModal;
