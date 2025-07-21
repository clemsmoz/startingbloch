import React, { useState } from 'react';
import T from '../components/T';
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
  const [formData, setFormData] = useState({
    type: "",
    nom_cabinet: '',
    reference_cabinet: '',
    email_cabinet: '',
    telephone_cabinet: '',
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
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Erreur lors de l\'ajout');
        return;
      }
      await response.json();
      refreshCabinets();
      handleClose();
      setFormData({
        type: "",
        nom_cabinet: '',
        reference_cabinet: '',
        email_cabinet: '',
        telephone_cabinet: '',
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Erreur de connexion');
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
          width: 600,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          mt: '10%',
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          <T>Ajouter un nouveau cabinet</T>
        </Typography>
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel><T>Type</T></InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="annuite"><T>Annuité</T></MenuItem>
              <MenuItem value="procedure"><T>Procédure</T></MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label={<T>Nom du Cabinet</T>}
            name="nom_cabinet"
            value={formData.nom_cabinet}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={<T>Référence Cabinet</T>}
            name="reference_cabinet"
            value={formData.reference_cabinet}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={<T>Email Cabinet</T>}
            name="email_cabinet"
            type="email"
            value={formData.email_cabinet}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={<T>Téléphone Cabinet</T>}
            name="telephone_cabinet"
            value={formData.telephone_cabinet}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              '&:hover': { boxShadow: 6 },
            }}
          >
            <T>Ajouter</T>
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddCabinetModal;
