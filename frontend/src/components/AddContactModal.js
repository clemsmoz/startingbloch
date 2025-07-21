import React, { useState } from 'react';
import T from './T';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';

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
    nom: "",
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

  // Gestion des rôles
  const handleRoleChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, roles: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = cacheService.get('user') || JSON.parse(localStorage.getItem('user') || 'null');
      const payload = {
        ...formData,
        cabinet_id: cabinetId || null,
        client_id: clientId || null,
        user_id: user?.id_user
      };

      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        refreshContacts();
        handleClose();
        setFormData({
          nom: "",
          prenom: '',
          fonction: '',
          emails: [''],
          phones: [''],
          roles: []
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
    }
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          <T>Ajouter un nouveau contact</T>
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={<T>Nom</T>}
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={<T>Prénom</T>}
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={<T>Fonction</T>}
                name="fonction"
                value={formData.fonction}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Emails */}
            <Grid item xs={12}>
              <Typography variant="subtitle1"><T>Emails</T></Typography>
              {formData.emails.map((email, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label={<T>Email</T>}
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    sx={{ mr: 1 }}
                  />
                  {formData.emails.length > 1 && (
                    <IconButton 
                      onClick={() => handleRemoveEmail(idx)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button onClick={handleAddEmail} variant="outlined" size="small">
                <T>Ajouter email</T>
              </Button>
            </Grid>

            {/* Téléphones */}
            <Grid item xs={12}>
              <Typography variant="subtitle1"><T>Téléphones</T></Typography>
              {formData.phones.map((phone, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label={<T>Téléphone</T>}
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    sx={{ mr: 1 }}
                  />
                  {formData.phones.length > 1 && (
                    <IconButton 
                      onClick={() => handleRemovePhone(idx)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button onClick={handleAddPhone} variant="outlined" size="small">
                <T>Ajouter téléphone</T>
              </Button>
            </Grid>

            {/* Rôles */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel><T>Rôles</T></InputLabel>
                <Select
                  multiple
                  value={formData.roles}
                  onChange={handleRoleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <MenuItem key={role} value={role}>
                      <T>{role}</T>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  mt: 2,
                  '&:hover': { boxShadow: 6 },
                }}
              >
                <T>Ajouter Contact</T>
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default AddContactModal;
