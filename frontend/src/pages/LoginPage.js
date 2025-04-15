import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button as MuiButton, Container, Typography, Box, Modal, CircularProgress, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
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
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setLoadingStage(0);
    
    try {
      // Message de chargement initial
      setModalMessage("Connexion en cours, chargement des données...");
      setShowModal(true);
      setLoadingProgress({ message: 'Préparation du chargement...', percent: 10 });
      
      // Première étape: authentification
      setLoadingStage(1);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Deuxième étape: préchargement des données avec progression détaillée
      setLoadingStage(2);
      
      // Utilisation du callback de progression pour mettre à jour l'interface
      const preloadResult = await cacheService.preloadBrevets((progress) => {
        // Transformer le pourcentage pour qu'il soit entre 30 et 80
        const adjustedPercent = 30 + (progress.percent * 0.5);
        setLoadingProgress({ 
          message: progress.message, 
          percent: adjustedPercent 
        });
      });
      
      // Troisième étape: analyse des données
      setLoadingStage(3);
      if (preloadResult.success) {
        if (preloadResult.fromCache) {
          setLoadingProgress({ message: 'Utilisation des données en cache', percent: 80 });
        } else {
          // Afficher un récapitulatif des données chargées
          const counts = preloadResult.counts || {};
          const summary = [
            `${counts.brevets || 0} brevets`,
            `${counts.cabinets || 0} cabinets`,
            `${counts.clients || 0} clients`
          ].join(', ');
          
          setLoadingProgress({ 
            message: `Données chargées avec succès: ${summary}`, 
            percent: 80 
          });
        }
      } else {
        console.warn('Préchargement des données non réussi:', preloadResult.error);
        setLoadingProgress({ 
          message: 'Certaines données n\'ont pas pu être préchargées. L\'application fonctionnera malgré tout.', 
          percent: 70 
        });
      }
      
      // Quatrième étape: finalisation
      setLoadingStage(4);
      setLoadingProgress({ message: 'Redirection vers la page d\'accueil...', percent: 100 });
      
      // Petit délai pour afficher le message de finalisation
      setTimeout(() => {
        setShowModal(false);
        setIsLoading(false);
        navigate('/home'); // Redirection vers HomePage
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de la connexion", error);
      setModalMessage("Erreur lors de la connexion: " + (error.message || "Erreur inconnue"));
      setShowModal(true);
      setIsLoading(false);
      
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
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

            <LoginButton
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLogin}
              sx={{ mt: 2 }}
            >
              Se connecter
            </LoginButton>
          </>
        ) : (
          /* Affichage pendant le chargement */
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%', 
            pt: 2, 
            pb: 3 
          }}>
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="primary" 
              sx={{ mb: 3, textAlign: 'center' }}
            >
              Chargement en cours
            </Typography>

            {/* Circle progress avec pourcentage */}
            <CircularProgressWithLabel value={loadingProgress.percent} />
            
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="subtitle1" color="primary" fontWeight="600" sx={{ mb: 1 }}>
                État du chargement :
              </Typography>
              
              {/* Liste des étapes de chargement */}
              <Box sx={{ pl: 2 }}>
                {loadingStages.map(stage => (
                  <LoadingStage 
                    key={stage.id}
                    message={stage.message} 
                    isActive={stage.id === loadingStage} 
                  />
                ))}
              </Box>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 2, fontStyle: 'italic', textAlign: 'center' }}
            >
              Merci de patienter pendant la préparation de vos données...
            </Typography>
          </Box>
        )}
      </Box>

      <Modal
        open={showModal}
        onClose={() => !isLoading && setShowModal(false)}
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
    </Container>
  );
};

export default LoginPage;
