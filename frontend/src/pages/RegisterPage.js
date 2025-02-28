import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct
import { TextField, Button, Container, Typography, Box, Modal, Paper } from '@mui/material';
import { API_BASE_URL } from '../config'; // Importation du fichier de configuration

const RegisterPage = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nom_user: nom,
        prenom_user: prenom,
        email_user: email,
        password: password,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('User created:', data);
      setModalMessage('Création réussie, vous allez être redirigé sur la page de connexion !');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/');
      }, 3500);
    })
    .catch(error => {
      console.error("Erreur lors de la création de l'utilisateur", error);
      setModalMessage('Il y a eu une erreur lors de la création !');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 3500);
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Logo de l'entreprise */}
      <Box sx={{ mb: 20, textAlign: 'center' }}>
        <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
      </Box>
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 3, width: '100%', maxWidth: 500 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Inscription
          </Typography>
          <Box component="form" onSubmit={handleRegister} sx={{ width: '100%', mt: 2 }}>
            <TextField
              label="Nom"
              type="text"
              fullWidth
              variant="outlined"
              margin="normal"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
            <TextField
              label="Prénom"
              type="text"
              fullWidth
              variant="outlined"
              margin="normal"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase' }}
            >
              S'inscrire
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(-1)} 
              fullWidth
              sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase' }}
            >
              Retour
            </Button>
          </Box>
        </Box>
      </Paper>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-description" sx={{ mt: 2 }}>
            {modalMessage}
          </Typography>
          <Button onClick={() => setShowModal(false)} sx={{ mt: 2 }} variant="contained" color="secondary">
            Fermer
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default RegisterPage;
