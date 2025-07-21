import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as MuiButton, Container, Typography, Box, Modal, CircularProgress, LinearProgress, TextField, InputAdornment, IconButton, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useTranslation from '../hooks/useTranslation';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService';
import T, {LanguageSwitch }from '../components/T';

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

const LoginPage = () => {
  const { t, alert, quick } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ message: '', percent: 0 });
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
        // Ajoute des logs pour comprendre le contenu des users et leur rôle
        console.log("=== DEBUG ADMIN EXISTENCE ===");
        console.log("Liste des users récupérés:", users);
        users.forEach((u, i) => {
          console.log(`User[${i}] - email: ${u.email_user}, role:`, u.role, typeof u.role);
        });
        const adminFound = users.some(u => (u.role && String(u.role).toLowerCase() === 'admin'));
        console.log("adminFound:", adminFound);
        setAdminExists(adminFound);
        if (adminFound) setShowAdminForm(false);
      })
      .catch((err) => {
        console.log("Erreur lors du fetch des users:", err);
        setAdminExists(true);
      });
  }, [showAdminForm]);

  const handleLogin = async () => {
    setIsLoading(true);
    setModalMessage(quick.connecting());
    setShowModal(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_user: email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setModalMessage(data.error || quick.connectionError());
        setIsLoading(false);
        setTimeout(() => setShowModal(false), 2000);
        return;
      }
      if (data.user && data.user.isBlocked) {
        setModalMessage(quick.accountBlocked());
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
      setLoadingProgress({ message: t('Connexion réussie'), percent: 100 });
      setTimeout(() => {
        setShowModal(false);
        setIsLoading(false);
        navigate('/home');
      }, 1000);
    } catch (error) {
      setModalMessage(t("Erreur lors de la connexion:") + " " + (error.message || t("Erreur inconnue")));
      setIsLoading(false);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  // Création d'un admin
  const handleCreateAdmin = async () => {
    if (!adminForm.nom_user || !adminForm.prenom_user || !adminForm.email_user || !adminForm.password) {
      alert('ALL_FIELDS_REQUIRED', quick.allFieldsRequired());
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
        alert('ADMIN_CREATED', quick.adminCreated());
        setShowAdminForm(false);
        setAdminExists(true);
      } else {
        const data = await res.json();
        alert('ADMIN_CREATION_ERROR', data.error || t('Erreur lors de la création du compte admin'));
      }
    } catch (e) {
      console.error('Erreur lors de la création de l\'admin:', e);
      alert('NETWORK_ERROR', quick.networkError());
    }
    setAdminFormLoading(false);
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
        {/* Sélecteur de langue en haut à droite */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            zIndex: 10
          }}
        >
          <LanguageSwitch size="small" />
        </Box>
        
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
              <T>Bienvenue</T>
            </Typography>
            {/* Champ email avec liste déroulante */}
            <TextField
              label={<T>Email</T>}
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
              label={<T>Mot de passe</T>}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? <T>Masquer le mot de passe</T> : <T>Afficher le mot de passe</T>}
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
              <T>Se connecter</T>
            </LoginButton>
            {/* Bouton première connexion admin */}
            {(() => {
              console.log("RENDER: adminExists =", adminExists, "| showAdminForm =", showAdminForm);
              return (!adminExists && !showAdminForm) ? (
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => setShowAdminForm(true)}
                >
                  <T>Première connexion (créer le compte admin)</T>
                </MuiButton>
              ) : null;
            })()}
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
                <T>Création du compte administrateur</T>
              </Typography>
              <TextField
                label={<T>Nom</T>}
                value={adminForm.nom_user}
                onChange={e => setAdminForm({ ...adminForm, nom_user: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label={<T>Prénom</T>}
                value={adminForm.prenom_user}
                onChange={e => setAdminForm({ ...adminForm, prenom_user: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label={<T>Email</T>}
                type="email"
                value={adminForm.email_user}
                onChange={e => setAdminForm({ ...adminForm, email_user: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label={<T>Mot de passe</T>}
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
                {adminFormLoading ? <CircularProgress size={24} /> : <T>Créer le compte admin</T>}
              </MuiButton>
              <MuiButton
                variant="text"
                color="secondary"
                fullWidth
                onClick={() => setShowAdminForm(false)}
                sx={{ mt: 1 }}
              >
                <T>Annuler</T>
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
                <T>Fermer</T>
              </MuiButton>
            )}
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};

export default LoginPage;
