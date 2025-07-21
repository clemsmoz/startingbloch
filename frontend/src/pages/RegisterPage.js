import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Modal,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useTranslation from '../hooks/useTranslation';
import T from '../components/T';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';

// Style personnalisé pour le bouton d'inscription
const RegisterButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: '12px 30px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(45deg, #4caf50 0%, #66bb6a 100%)',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(76, 175, 80, 0.5)',
    transform: 'translateY(-3px)'
  }
}));

const RegisterPage = () => {
  const { alert, quick } = useTranslation();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!nom || !prenom || !email || !password) {
      alert('ALL_FIELDS_REQUIRED', quick.allFieldsRequired());
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
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
      });

      const data = await response.json();

      if (response.ok) {
        console.log('User created:', data);
        setModalMessage('Création réussie, vous allez être redirigé sur la page de connexion !');
        setIsSuccess(true);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate('/');
        }, 3500);
      } else {
        setModalMessage(data.error || 'Erreur lors de la création du compte');
        setIsSuccess(false);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3500);
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      setModalMessage('Il y a eu une erreur lors de la création !');
      setIsSuccess(false);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3500);
    }
  };

  return (
    <Container 
      maxWidth={false}
      sx={{ 
        mt: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e8f5e8 0%, #f1f8e9 100%)'
      }}
    >
      <Paper 
        elevation={8}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 5,
          borderRadius: 4,
          maxWidth: 500,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Logo de l'entreprise */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <img 
            src={logo} 
            alt="Logo Starting Bloch" 
            style={{ maxWidth: '100%', height: '150px' }} 
          />
        </Box>

        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="primary" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          <T>Inscription</T>
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
          <TextField
            label={<T>Nom</T>}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          
          <TextField
            label={<T>Prénom</T>}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          
          <TextField
            label={<T>Email</T>}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          
          <TextField
            label={<T>Mot de passe</T>}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />

          <RegisterButton
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            <T>S'inscrire</T>
          </RegisterButton>

          <Button
            variant="text"
            color="primary"
            fullWidth
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            <T>Retour à la connexion</T>
          </Button>
        </Box>

        {/* Modal de notification */}
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
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Alert 
              severity={isSuccess ? "success" : "error"} 
              sx={{ mb: 2 }}
            >
              <Typography id="modal-description">
                {modalMessage}
              </Typography>
            </Alert>
            
            <Button
              onClick={() => setShowModal(false)}
              variant="contained"
              color={isSuccess ? "success" : "error"}
              fullWidth
            >
              <T>Fermer</T>
            </Button>
          </Box>
        </Modal>
      </Paper>
    </Container>
  );
};

export default RegisterPage;

