import React, { useState, useEffect } from 'react';
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
  Checkbox,
  ListItemText,
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
    pays: [], // Champ pour stocker les IDs des pays sélectionnés
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [paysList, setPaysList] = useState([]); // Liste des pays récupérés

  // Charger la liste des pays depuis l'API
  useEffect(() => {
    const fetchPays = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/pays`);
        const data = await response.json();
        setPaysList(data.data); // Assurez-vous que la structure des données correspond
      } catch (error) {
        console.error('Erreur lors de la récupération des pays:', error);
      }
    };

    fetchPays();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePaysChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prevData) => ({
      ...prevData,
      pays: typeof value === 'string' ? value.split(',') : value, // Gestion multiple
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
              name="nom_cabinet"  // Modifié ici
              value={formData.nom_cabinet}  // Modifié ici
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Référence"
              name="reference_cabinet"  // Modifié ici
              value={formData.reference_cabinet}  // Modifié ici
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Email"
              name="email_cabinet"  // Modifié ici
              type="email"
              value={formData.email_cabinet}  // Modifié ici
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Téléphone"
              name="telephone_cabinet"  // Modifié ici
              value={formData.telephone_cabinet}  // Modifié ici
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Pays</InputLabel>
              <Select
                name="pays"
                multiple
                value={formData.pays}
                onChange={handlePaysChange}
                renderValue={(selected) => {
                  const selectedPaysNames = paysList
                    .filter((pays) => selected.includes(pays.id))
                    .map((pays) => pays.nom_fr_fr)
                    .join(', ');
                  return selectedPaysNames;
                }}
              >
                {paysList.map((pays) => (
                  <MenuItem key={pays.id} value={pays.id}>
                    <Checkbox checked={formData.pays.includes(pays.id)} />
                    <ListItemText primary={pays.nom_fr_fr} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Pays sélectionnés :</strong>
              </Typography>
              <Box sx={{ mt: 1 }}>
                <ul>
                  {formData.pays.map((paysId) => {
                    const pays = paysList.find((p) => p.id === paysId);
                    return pays ? (
                      <li key={pays.id}>{pays.nom_fr_fr}</li>
                    ) : null;
                  })}
                </ul>
              </Box>
            </Box>
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
