import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, IconButton, Modal, Paper } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FaBars } from 'react-icons/fa';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3100/login', {
      email_user: email,
      password: password
    })
    .then(response => {
      console.log('User authenticated:', response.data);
      setModalMessage("Authentification réussie, vous allez être redirigé vers la page d'accueil");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/acceuil');
      }, 2000);
    })
    .catch(error => {
      console.error("Erreur lors de la tentative d'authentication", error);
      setModalMessage("Erreur lors de la tentative d'authentication");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    });
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Logo de l'entreprise */}
      <Box sx={{ mb: 20, textAlign: 'center' }}>
        <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
      </Box>

      
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 3, width: '100%', maxWidth: 500 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
            Connexion
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 2 }}>
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
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <IconButton
                onClick={toggleShowPassword}
                sx={{ position: 'absolute', right: 10, top: '30%' }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase' }}
            >
              Se connecter
            </Button>
          </Box>
          <Button
            variant="text"
            onClick={navigateToRegister}
            sx={{ mt: 2, color: 'secondary.main', fontWeight: 'bold', textTransform: 'uppercase' }}
          >
            Créer un compte
          </Button>
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

export default LoginPage;
