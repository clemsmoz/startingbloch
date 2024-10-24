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
import axios from 'axios';

const AddCabinetModal = ({ show, handleClose, refreshCabinets }) => {
  const [formData, setFormData] = useState({
    type: 'annuite',
    nom: '',
    reference: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = 'http://localhost:3100/cabinet'; // URL générique pour la création d'un cabinet
    axios.post(url, {
      type: formData.type,
      nom: formData.nom,
      reference: formData.reference,
    })
    .then(() => {
      refreshCabinets(); // Rafraîchir la liste des cabinets après ajout
      handleClose(); // Fermer la modal
    })
    .catch((error) => {
      console.error('There was an error adding the cabinet!', error);
      setErrorMessage('Error: ' + error.response?.data?.error || 'Unknown error');
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
          mx: 'auto',
          mt: '10%',
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
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <MenuItem value="annuite">Annuité</MenuItem>
                <MenuItem value="procedure">Procédure</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
              label="Référence"
              name="reference"
              value={formData.reference}
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
            Ajouter cabinet
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddCabinetModal;
