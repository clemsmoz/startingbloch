import React, { useState } from 'react';
import {
  Modal,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { API_BASE_URL } from '../config';

const AddCabinetModal = ({ show, handleClose, refreshCabinets }) => {
  // Modifiez ici les clés pour qu'elles correspondent au modèle
  const [formData, setFormData] = useState({
    type: 'annuite',
    nom_cabinet: '',
    reference_cabinet: '',
    email_cabinet: '',
    telephone_cabinet: '',
    // Suppression du champ pays
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${API_BASE_URL}/api/cabinet`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du cabinet');
      }
      refreshCabinets();
      handleClose();
    } catch (error) {
      console.error('There was an error adding the cabinet!', error);
      setErrorMessage('Error: ' + error.message);
    }
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: 600,
          mx: 'auto',
          mt: '10%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" color="primary" component="h2" gutterBottom>
          Ajouter un nouveau Cabinet
        </Typography>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={formData.type} onChange={handleChange}>
                <MenuItem value="annuite">Annuité</MenuItem>
                <MenuItem value="procedure">Procédure</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Nom"
              name="nom_cabinet"
              value={formData.nom_cabinet}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Référence"
              name="reference_cabinet"
              value={formData.reference_cabinet}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Email"
              name="email_cabinet"
              type="email"
              value={formData.email_cabinet}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Téléphone"
              name="telephone_cabinet"
              value={formData.telephone_cabinet}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          {/* Section pays supprimée */}
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
            Ajouter cabinet
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddCabinetModal;
