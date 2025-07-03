import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as MuiButton, Container, Typography, Box, Modal, CircularProgress, LinearProgress, TextField, InputAdornment, IconButton, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService';

// Style personnalisé pour le bouton de connexion
const LoginButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: '28px',
  padding: '12px 30px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(45deg, #1976d2 0%, #2196f3 100%)',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(25, 118, 210, 0.5)',
    transform: 'translateY(-3px)'
  }
}));

// Progress circle avec texte centré
const CircularProgressWithLabel = ({ value }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <CircularProgress 
      variant="determinate" 
      value={value} 
      size={120} 
      thickness={4} 
      sx={{ color: '#1976d2' }}
    />
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h5"
        component="div"
        color="primary"
        sx={{ fontWeight: 'bold' }}
      >
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  </Box>
);

// Section de chargement animée
const LoadingStage = ({ message, isActive }) => (
  <Box sx={{ 
    opacity: isActive ? 1 : 0.5, 
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    mb: 1,
    pl: 1
  }}>
    {isActive && (
      <Box sx={{ mr: 2, width: 20, height: 20, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={16} />
      </Box>
    )}
    <Typography 
      variant="body2" 
      color={isActive ? "primary" : "text.secondary"} 
      fontWeight={isActive ? 600 : 400}
    >
      {message}
    </Typography>
  </Box>
);

const LoginPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ message: '', percent: 0 });
  const [loadingStage, setLoadingStage] = useState(0); // Étape actuelle du chargement (0-4)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nom_user: '',
    prenom_user: '',
    email_user: '',
    password: '',
  });
  const [adminExists, setAdminExists] = useState(true);
  const [adminFormLoading, setAdminFormLoading] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Vérifie s'il existe déjà un admin
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        const users = Array.isArray(data.data) ? data.data : [];
        setEmailList(users.map(u => u.email_user).filter(Boolean));
        setAdminExists(users.some(u => u.role === 'admin'));
        // Si un admin vient d'être créé, on ferme le formulaire si besoin
        if (users.some(u => u.role === 'admin')) setShowAdminForm(false);
      })
      .catch(() => setAdminExists(true)); // Par défaut, cache le bouton si erreur
  }, [showAdminForm]); // <-- Ajoute showAdminForm comme dépendance pour rafraîchir après création

  const handleLogin = async () => {
    setIsLoading(true);
    setLoadingStage(1);
    setModalMessage("Connexion en cours...");
    setShowModal(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_user: email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setModalMessage(data.error || "Erreur de connexion");
        setIsLoading(false);
        setTimeout(() => setShowModal(false), 2000);
        return;
      }
      if (data.user && data.user.isBlocked) {
        setModalMessage("Votre compte est bloqué. Contactez l'administrateur.");
        setIsLoading(false);
        setTimeout(() => setShowModal(false), 3000);
        return;
      }
      // Correction ici : vérifier que cacheService.set existe bien avant de l'appeler
      if (typeof cacheService.set === "function") {
        cacheService.set('user', data.user);
      } else if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem('user', JSON.stringify(data.user));
      }
      setLoadingProgress({ message: 'Connexion réussie', percent: 100 });
      setTimeout(() => {
        setShowModal(false);
        setIsLoading(false);
        navigate('/home');
      }, 1000);
    } catch (error) {
      setModalMessage("Erreur lors de la connexion: " + (error.message || "Erreur inconnue"));
      setIsLoading(false);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  // Création d'un admin
  const handleCreateAdmin = async () => {
    if (!adminForm.nom_user || !adminForm.prenom_user || !adminForm.email_user || !adminForm.password) {
      alert('Tous les champs sont obligatoires');
      return;
    }
    setAdminFormLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminForm,
          role: 'admin',
          canRead: true,
          canWrite: true,
          isBlocked: false
        })
      });
      if (res.ok) {
        alert('Compte admin créé avec succès ! Connectez-vous.');
        setShowAdminForm(false);
        setAdminExists(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la création du compte admin');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
    setAdminFormLoading(false);
  };

  // Définir les étapes du chargement
  const loadingStages = [
    { id: 0, message: "Initialisation..." },
    { id: 1, message: "Authentification..." },
    { id: 2, message: "Chargement des données (brevets, cabinets, clients)..." },
    { id: 3, message: "Analyse des données..." },
    { id: 4, message: "Finalisation..." },
  ];

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
        background: 'linear-gradient(120deg, #f0f2f5 0%, #e3f2fd 100%)'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 5,
          borderRadius: 4,
          bgcolor: 'white',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          maxWidth: 500,
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Indicateur de chargement en haut */}
        {isLoading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 6,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4
            }}
            variant="determinate"
            value={loadingProgress.percent}
          />
        )}
        
        {/* Logo de l'entreprise */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img src={logo} alt="Logo Starting Bloch" style={{ maxWidth: '100%', height: '200px' }} />
        </Box>

        {!isLoading ? (
          <>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="primary" 
              sx={{ mb: 4, textAlign: 'center' }}
            >
              Bienvenue
            </Typography>
            {/* Champ email avec liste déroulante */}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              select={emailList.length > 0}
              SelectProps={{
                MenuProps: { PaperProps: { style: { maxHeight: 200 } } }
              }}
              InputProps={{
                endAdornment: emailList.length > 0 ? (
                  <InputAdornment position="end">
                    <IconButton tabIndex={-1} edge="end" disabled>
                      {/* Icône d'utilisateur ou rien */}
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            >
              {emailList.map((mail, idx) => (
                <MenuItem key={mail} value={mail}>
                  {mail}
                </MenuItem>
              ))}
            </TextField>
            {/* Champ mot de passe avec icône visibilité */}
            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      onClick={() => setShowPassword(v => !v)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <LoginButton
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLogin}
              sx={{ mt: 2 }}
            >
              Se connecter
            </LoginButton>
            {/* Bouton première connexion admin */}
            {!adminExists && !showAdminForm && (
              <MuiButton
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => setShowAdminForm(true)}
              >
                Première connexion (créer le compte admin)
              </MuiButton>
            )}
          </>
        ) : null}

        {/* Formulaire de création d'admin */}
        {showAdminForm && (
          <Modal
            open={showAdminForm}
            onClose={() => setShowAdminForm(false)}
            aria-labelledby="admin-modal-title"
            aria-describedby="admin-modal-description"
          >
            <Box
              sx={{
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                mx: 'auto',
                mt: '10vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography id="admin-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                Création du compte administrateur
              </Typography>
              <TextField
                label="Nom"
                value={adminForm.nom_user}
                onChange={e => setAdminForm({ ...adminForm, nom_user: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Prénom"
                value={adminForm.prenom_user}
                onChange={e => setAdminForm({ ...adminForm, prenom_user: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                type="email"
                value={adminForm.email_user}
                onChange={e => setAdminForm({ ...adminForm, email_user: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Mot de passe"
                type="password"
                value={adminForm.password}
                onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <MuiButton
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateAdmin}
                disabled={adminFormLoading}
                sx={{ mt: 2 }}
              >
                {adminFormLoading ? <CircularProgress size={24} /> : "Créer le compte admin"}
              </MuiButton>
              <MuiButton
                variant="text"
                color="secondary"
                fullWidth
                onClick={() => setShowAdminForm(false)}
                sx={{ mt: 1 }}
              >
                Annuler
              </MuiButton>
            </Box>
          </Modal>
        )}

        {/* Modal de chargement et messages */}
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              mx: 'auto',
              mt: '10vh'
            }}
          >
            <Typography id="modal-description" sx={{ mt: 2, mb: 2 }}>
              {modalMessage}
            </Typography>

            {isLoading && (
              <Box sx={{ width: '100%', mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loadingProgress.message}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {`${Math.round(loadingProgress.percent)}%`}
                  </Typography>
                </Box>

                <Box sx={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${loadingProgress.percent}%`,
                      background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                      height: '100%',
                      borderRadius: 1,
                      transition: 'width 0.5s ease-in-out',
                      animation: loadingProgress.percent < 100 ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.7 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.7 }
                      }
                    }}
                  />
                </Box>
              </Box>
            )}

            {!isLoading && (
              <MuiButton
                onClick={() => setShowModal(false)}
                sx={{ mt: 2 }}
                variant="contained"
                color="secondary"
              >
                Fermer
              </MuiButton>
            )}
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};

export default LoginPage;


