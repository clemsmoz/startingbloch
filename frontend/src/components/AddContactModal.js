import React, { useState } from 'react';
import {
  Modal,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { API_BASE_URL } from '../config';

const AddContactModal = ({ show, handleClose, refreshContacts, cabinetId, clientId }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let url = '';
    let dataToSend = {};

    if (cabinetId) {
      url = `${API_BASE_URL}/contacts/cabinets`;
      dataToSend = { ...formData, id_cabinet: cabinetId };
    } else if (clientId) {
      url = `${API_BASE_URL}/contacts/clients`;
      dataToSend = { ...formData, id_client: clientId };
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
        refreshContacts();
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
          maxWidth: 400,
          mx: 'auto', // Centrer horizontalement
          mt: '10%', // Décalage vertical
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Ajouter un nouveau contact
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Fonction"
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Box>
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
        </form>
      </Box>
    </Modal>
  );
};

export default AddContactModal;
