// components/BrevetDetailModal.js

import React, { useState, useEffect, useCallback } from 'react';
import { Modal as BootstrapModal, Button as BootstrapButton, Container } from 'react-bootstrap';
import Flag from 'react-world-flags';

import { 
  Dialog, Box, Typography, IconButton, Button, Card, CardContent, CardHeader,
  Grid, Divider, Chip, List, ListItem, ListItemText, Paper, Avatar, Fade, 
  useTheme, alpha, ListItemAvatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CommentIcon from '@mui/icons-material/Comment';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import useBrevetData from '../hooks/useBrevetData';
import { API_BASE_URL } from '../config';

// Composants stylisés pour un design plus moderne
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'transform 0.3s, box-shadow 0.3s',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: '16px 24px',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2.5),
  height: '100%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, index }) => ({
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  transition: 'background-color 0.2s',
  backgroundColor: index % 2 === 0 ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const FlagChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 16,
  fontWeight: 500,
  '& .MuiChip-avatar': {
    width: 18,
    height: 18,
  },
}));

const CountryFlag = ({ code, size = 18 }) => {
  return code ? (
    <Avatar sx={{ width: size, height: size, p: 0 }}>
      <Flag code={code} width={size} height={size} />
    </Avatar>
  ) : (
    <FlagIcon sx={{ width: size, height: size }} />
  );
};

const BrevetDetailModal = ({ show = false, handleClose = () => {}, brevetId = null }) => {
  // Logs pour le débogage
  console.log("BrevetDetailModal - Props:", { show, handleClose, brevetId });
  
  // États locaux - TOUJOURS DÉCLARER AU DÉBUT
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityType, setEntityType] = useState('');
  const [openEntityModal, setOpenEntityModal] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Hook useBrevetData - TOUJOURS APPELÉ, même si brevetId est null
  const {
    brevet,
    procedureCabinets = [],
    annuiteCabinets = [],
    contactsProcedure = [],
    contactsAnnuite = [],
    clients = [],
    inventeurs = [],
    deposants = [],
    titulaires = [],
    pays = [],
    statut, 
    statutsList = [],
    generatePDF,
    loading,
    error
  } = useBrevetData(brevetId);

  // Ajouter ces logs pour le débogage juste après l'appel de useBrevetData
  console.log("BrevetDetailModal - generatePDF function:", {
    isFunction: typeof generatePDF === 'function',
    function: generatePDF
  });

  // Version renforcée de la fonction d'exportation PDF avec plus de détails de débogage
  const handleExportPDF = useCallback(() => {
    console.log("[PDF-Modal] Clic sur le bouton d'exportation PDF");
    
    // Vérification complète de generatePDF
    console.log("[PDF-Modal] Type de generatePDF:", typeof generatePDF);
    console.log("[PDF-Modal] generatePDF est une fonction?", typeof generatePDF === 'function');
    console.log("[PDF-Modal] Contenu de generatePDF:", generatePDF);
    
    try {
      // Simulation simple pour vérifier l'accès à la fonction
      console.log("[PDF-Modal] Accès à la fonction test:", typeof (() => {}));
      
      if (typeof generatePDF !== 'function') {
        console.error("[PDF-Modal] ERREUR: generatePDF n'est pas une fonction!", generatePDF);
        alert("La fonction d'exportation PDF n'est pas disponible. Veuillez rafraîchir la page.");
        return;
      }
      
      console.log("[PDF-Modal] Tentative d'exécution de generatePDF...");
      
      // Version alternative d'appel de fonction pour contourner d'éventuels problèmes
      const result = (0, generatePDF)();
      
      console.log("[PDF-Modal] Résultat de generatePDF:", result);
    } catch (error) {
      console.error("[PDF-Modal] ERREUR GRAVE lors de l'appel à generatePDF:", error);
      console.error("[PDF-Modal] Stack trace:", error.stack);
      alert(`Erreur lors de l'exportation: ${error.message || "Erreur inconnue"}`);
    }
  }, [generatePDF]);

  // Fonction pour formater les dates - TOUJOURS DÉFINIE
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'N/A';
    }
  }, []);

  // Ajouter une fonction utilitaire pour afficher les pays associés à une personne
  const renderPaysChips = useCallback((paysArray) => {
    if (!paysArray || !Array.isArray(paysArray) || paysArray.length === 0) return null;
    
    console.log("Pays data to render:", paysArray); // Debug log
    
    return (
      <Box mt={1} display="flex" flexWrap="wrap">
        {paysArray.map((p, i) => {
          // Structure plus robuste pour extraire le nom et le code du pays
          const paysInfo = p || {};
          
          // Essayer différentes structures possibles
          const countryName = 
            paysInfo.nom_fr_fr || 
            (paysInfo.Pay && paysInfo.Pay.nom_fr_fr) || 
            (paysInfo.p && paysInfo.p.nom_fr_fr) ||
            (paysInfo.pays && paysInfo.pays.nom_fr_fr) ||
            paysInfo.code || 
            'Pays';
          
          const countryCode = 
            paysInfo.alpha2 || 
            (paysInfo.Pay && paysInfo.Pay.alpha2) || 
            (paysInfo.p && paysInfo.p.alpha2) ||
            (paysInfo.pays && paysInfo.pays.alpha2);
          
          return (
            <FlagChip
              key={i}
              size="small"
              label={countryName}
              variant="outlined" 
              avatar={countryCode && <CountryFlag code={countryCode} />}
            />
          );
        })}
      </Box>
    );
  }, []);

  // Gestionnaires d'événements - TOUJOURS DÉFINIS
  const handleOpenEntityModal = useCallback((entity, type) => {
    setSelectedEntity(entity);
    setEntityType(type);
    setOpenEntityModal(true);
  }, []);

  const handleCloseEntityModal = useCallback(() => {
    setOpenEntityModal(false);
    setSelectedEntity(null);
    setEntityType('');
  }, []);

  // Vérification de rendu APRÈS les hooks
  useEffect(() => {
    // Vérifier si on doit rendre le modal ou non
    setShouldRender(show && brevetId !== null);
    
    console.log("BrevetDetailModal - État des données:", { 
      loading, 
      error, 
      brevet: brevet ? "Brevet chargé" : "Aucun brevet", 
      brevetId,
      shouldShow: show && brevetId !== null
    });
  }, [show, brevetId, brevet, loading, error]);

  // Ajouter des logs pour déboguer les cabinets et contacts
  useEffect(() => {
    console.log("BrevetDetailModal - État des cabinets:", { 
      procedureCabinets: procedureCabinets?.length || 0, 
      annuiteCabinets: annuiteCabinets?.length || 0,
      brevetCabinets: brevet?.BrevetCabinets?.length || 0
    });
    
    // Vérifier mieux la structure des données des cabinets
    if (brevet?.BrevetCabinets?.length > 0) {
      console.log("Relations BrevetCabinets disponibles:", brevet.BrevetCabinets);
    }
    
    // Vérifier la structure des personnes et leurs pays associés
    if (inventeurs?.length > 0) {
      console.log("Premier inventeur et ses pays:", {
        inventeur: inventeurs[0],
        pays: inventeurs[0]?.Pays || []
      });
    }
    
    if (pays?.length > 0) {
      console.log("Premier pays (structure complète):", JSON.stringify(pays[0], null, 2));
    }
  }, [procedureCabinets, annuiteCabinets, contactsProcedure, contactsAnnuite, pays, brevet, inventeurs]);

  // Ajouter cette fonction de vérification de type avant useEffect
  const isCabinetType = useCallback((cabinet, typeToCheck) => {
    if (!cabinet) return false;
    
    // Vérifier d'abord le type direct du cabinet
    if (cabinet.type && cabinet.type.toLowerCase() === typeToCheck.toLowerCase()) {
      return true;
    }
    
    // Vérifier ensuite dans la relation BrevetCabinets
    if (cabinet.BrevetCabinets && cabinet.BrevetCabinets.type && 
        cabinet.BrevetCabinets.type.toLowerCase() === typeToCheck.toLowerCase()) {
      return true;
    }
    
    return false;
  }, []);

  // Ajouter cet effet de débogage après les autres useEffect
  useEffect(() => {
    if (brevet?.BrevetCabinets?.length > 0 || (brevet?.Cabinets?.length > 0)) {
      console.log("DÉTAIL DES CABINETS :");
      
      // Afficher toutes les relations BrevetCabinets
      if (brevet.BrevetCabinets?.length > 0) {
        console.log("Relations BrevetCabinets:", brevet.BrevetCabinets);
        
        // Compter et afficher les types trouvés
        const types = brevet.BrevetCabinets.map(rel => rel.type);
        console.log("Types de cabinets dans BrevetCabinets:", [...new Set(types)]);
        
        // Spécifiquement pour annuité
        const annuiteRels = brevet.BrevetCabinets.filter(rel => 
          rel.type && rel.type.toLowerCase().includes('annuit')
        );
        console.log(`Relations BrevetCabinets annuité trouvées: ${annuiteRels.length}`, annuiteRels);
      }
      
      // Vérifier les cabinets directs
      if (brevet.Cabinets?.length > 0) {
        console.log("Cabinets directs:", brevet.Cabinets);
        
        // Compter les types de cabinets
        const cabinetTypes = brevet.Cabinets.map(cab => cab.type);
        console.log("Types de cabinets directs:", [...new Set(cabinetTypes)]);
      }
    }
  }, [brevet]);

  // Si les conditions ne sont pas remplies, retourner null mais APRÈS avoir appelé tous les hooks
  if (!brevet) {
    // on affiche un loader le temps de récupérer les données
    return (
      <Dialog open={show} onClose={handleClose} fullWidth maxWidth="lg">
        {/* ...chargement... */}
      </Dialog>
    );
  }

  // Si en cours de chargement, afficher un message
  if (loading) {
    return (
      <BootstrapModal show={show} onHide={handleClose} centered>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Chargement des détails du brevet</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Typography>Chargement des données en cours...</Typography>
        </BootstrapModal.Body>
      </BootstrapModal>
    );
  }

  // Si erreur, afficher un message d'erreur
  if (error) {
    return (
      <BootstrapModal show={show} onHide={handleClose} centered>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Erreur</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Typography color="error">
            Une erreur s'est produite lors du chargement des détails du brevet: {error}
          </Typography>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <BootstrapButton variant="secondary" onClick={handleClose}>
            Fermer
          </BootstrapButton>
        </BootstrapModal.Footer>
      </BootstrapModal>
    );
  }

  // Si aucune donnée de brevet, afficher un message
  if (!brevet) {
    return (
      <BootstrapModal show={show} onHide={handleClose} centered>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Aucune donnée</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Typography>Aucune donnée trouvée pour ce brevet.</Typography>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <BootstrapButton variant="secondary" onClick={handleClose}>
            Fermer
          </BootstrapButton>
        </BootstrapModal.Footer>
      </BootstrapModal>
    );
  }

  // Calcul des longueurs avec sécurité
  const clientsLength = Array.isArray(clients) ? clients.length : 0;
  const invLength = Array.isArray(inventeurs) ? inventeurs.length : 0;
  const depLength = Array.isArray(deposants) ? deposants.length : 0;
  const titLength = Array.isArray(titulaires) ? titulaires.length : 0;
  const procCabLength = Array.isArray(procedureCabinets) ? procedureCabinets.length : 0;
  const annuiteCabLength = Array.isArray(annuiteCabinets) ? annuiteCabinets.length : 0;
  const paysLength = Array.isArray(pays) ? pays.length : 0;

  // Contenu principal si tout est bien chargé
  return (
    <>
      <Dialog open={show} onClose={handleClose} fullWidth maxWidth="lg">
        <BootstrapModal.Header closeButton style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px 24px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2', fontFamily: '"Poppins", "Roboto", sans-serif' }}>
              {brevet?.titre || 'Sans titre'}
            </Typography>
            {/* Remplacer le onClick par notre fonction wrapper */}
            <Button 
              variant="contained" 
              onClick={handleExportPDF} 
              startIcon={<DownloadIcon />}
              sx={{ 
                ml: 2, 
                borderRadius: '24px',
                textTransform: 'none',
                padding: '8px 20px',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }}
            >
              Exporter en PDF
            </Button>
          </Box>
        </BootstrapModal.Header>
        <BootstrapModal.Body style={{ backgroundColor: '#f8f9fa', padding: '30px' }}>
          <Container fluid>
            <Grid container spacing={3}>
              {/* Informations Générales */}
              <Grid item xs={12}>
                <Fade in={true} timeout={500}>
                  <StyledCard elevation={2}>
                    <StyledCardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon sx={{ mr: 1.5 }} /> 
                          <Typography variant="h6" fontWeight="600">Informations Générales</Typography>
                        </Box>
                      }
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" fontWeight="600" color="primary.main" gutterBottom>
                            Référence famille
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.08)',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {brevet?.reference_famille || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Typography variant="subtitle1" fontWeight="600" color="primary.main" gutterBottom>
                            Titre
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.08)',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {brevet?.titre || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </StyledCard>
                </Fade>
              </Grid>

              {/* Personnes liées - Ne montrer que si des données sont disponibles */}
              {(clientsLength > 0 || invLength > 0 || depLength > 0 || titLength > 0) && (
                <Grid item xs={12}>
                  <Fade in={true} timeout={700}>
                    <StyledCard elevation={2}>
                      <StyledCardHeader
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1.5 }} /> 
                            <Typography variant="h6" fontWeight="600">Personnes Liées</Typography>
                          </Box>
                        }
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          {/* Clients */}
                          {clientsLength > 0 && (
                            <Grid item xs={12} md={3}>
                              <StyledPaper>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  mb: 2 
                                }}>
                                  <Typography variant="h6" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 600,
                                    color: 'primary.main'
                                  }}>
                                    <BusinessIcon sx={{ mr: 1.5 }} /> Clients
                                  </Typography>
                                  <Chip 
                                    label={clientsLength} 
                                    size="small" 
                                    color="primary" 
                                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                                  />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding sx={{ 
                                  maxHeight: '300px', 
                                  overflow: 'auto',
                                  '&::-webkit-scrollbar': {
                                    width: '6px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    background: alpha('#1976d2', 0.2),
                                    borderRadius: '3px'
                                  },
                                  '&::-webkit-scrollbar-thumb:hover': {
                                    background: alpha('#1976d2', 0.3)
                                  }
                                }}>
                                  {clients.map((client, index) => {
                                    const paysAssocies = client?.Pays || [];
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => handleOpenEntityModal(client, 'client')}
                                        divider={index < clientsLength - 1}
                                        sx={{ borderRadius: '8px', mb: 1 }}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            <BusinessIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {client?.nom_client || 'Client sans nom'}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              {client?.email_client && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                  <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                  <Typography variant="body2" color="text.secondary">
                                                    {client.email_client}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {renderPaysChips(paysAssocies)}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  })}
                                </List>
                              </StyledPaper>
                            </Grid>
                          )}

                          {/* Inventeurs */}
                          {invLength > 0 && (
                            <Grid item xs={12} md={3}>
                              <StyledPaper>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  mb: 2 
                                }}>
                                  <Typography variant="h6" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 600,
                                    color: 'primary.main'
                                  }}>
                                    <PersonIcon sx={{ mr: 1.5 }} /> Inventeurs
                                  </Typography>
                                  <Chip 
                                    label={invLength} 
                                    size="small" 
                                    color="primary" 
                                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                                  />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding sx={{ 
                                  maxHeight: '300px', 
                                  overflow: 'auto',
                                  '&::-webkit-scrollbar': {
                                    width: '6px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    background: alpha('#1976d2', 0.2),
                                    borderRadius: '3px'
                                  },
                                  '&::-webkit-scrollbar-thumb:hover': {
                                    background: alpha('#1976d2', 0.3)
                                  }
                                }}>
                                  {Array.isArray(inventeurs) && inventeurs.map((inventeur, index) => {
                                    if (!inventeur) return null;
                                    
                                    const nom = inventeur?.nom_inventeur || inventeur?.nom || '';
                                    const prenom = inventeur?.prenom_inventeur || inventeur?.prenom || '';
                                    const email = inventeur?.email_inventeur || inventeur?.email || '';
                                    
                                    const paysAssocies = inventeur?.Pays || [];
                                    
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => handleOpenEntityModal(inventeur, 'inventeur')}
                                        divider={index < invLength - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <PersonIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {`${nom} ${prenom}`.trim() || 'Inventeur sans nom'}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              {email && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                  <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                  <Typography variant="body2" color="text.secondary">
                                                    {email}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {renderPaysChips(paysAssocies)}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  })}
                                </List>
                              </StyledPaper>
                            </Grid>
                          )}

                          {/* Déposants et Titulaires - style similaire aux sections ci-dessus */}
                          {depLength > 0 && (
                            <Grid item xs={12} md={3}>
                              <StyledPaper>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  mb: 2 
                                }}>
                                  <Typography variant="h6" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 600,
                                    color: 'primary.main'
                                  }}>
                                    <BusinessIcon sx={{ mr: 1.5 }} /> Déposants
                                  </Typography>
                                  <Chip 
                                    label={depLength} 
                                    size="small" 
                                    color="primary" 
                                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                                  />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding sx={{ 
                                  maxHeight: '300px', 
                                  overflow: 'auto',
                                  '&::-webkit-scrollbar': {
                                    width: '6px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    background: alpha('#1976d2', 0.2),
                                    borderRadius: '3px'
                                  },
                                  '&::-webkit-scrollbar-thumb:hover': {
                                    background: alpha('#1976d2', 0.3)
                                  }
                                }}>
                                  {Array.isArray(deposants) && deposants.map((deposant, index) => {
                                    if (!deposant) return null;
                                    
                                    const nom = deposant?.nom_deposant || deposant?.nom || '';
                                    const prenom = deposant?.prenom_deposant || deposant?.prenom || '';
                                    const email = deposant?.email_deposant || deposant?.email || '';
                                    
                                    const paysAssocies = deposant?.Pays || [];
                                    
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => handleOpenEntityModal(deposant, 'deposant')}
                                        divider={index < depLength - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <BusinessIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {`${nom} ${prenom}`.trim() || 'Déposant sans nom'}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              {email && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                  <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                  <Typography variant="body2" color="text.secondary">
                                                    {email}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {renderPaysChips(paysAssocies)}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  })}
                                </List>
                              </StyledPaper>
                            </Grid>
                          )}

                          {titLength > 0 && (
                            <Grid item xs={12} md={3}>
                              <StyledPaper>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  mb: 2 
                                }}>
                                  <Typography variant="h6" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 600,
                                    color: 'primary.main'
                                  }}>
                                    <BusinessIcon sx={{ mr: 1.5 }} /> Titulaires
                                  </Typography>
                                  <Chip 
                                    label={titLength} 
                                    size="small" 
                                    color="primary" 
                                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                                  />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding sx={{ 
                                  maxHeight: '300px', 
                                  overflow: 'auto',
                                  '&::-webkit-scrollbar': {
                                    width: '6px'
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    background: alpha('#1976d2', 0.2),
                                    borderRadius: '3px'
                                  },
                                  '&::-webkit-scrollbar-thumb:hover': {
                                    background: alpha('#1976d2', 0.3)
                                  }
                                }}>
                                  {Array.isArray(titulaires) && titulaires.map((titulaire, index) => {
                                    if (!titulaire) return null;
                                    
                                    const nom = titulaire?.nom_titulaire || titulaire?.nom || '';
                                    const prenom = titulaire?.prenom_titulaire || titulaire?.prenom || '';
                                    const email = titulaire?.email_titulaire || titulaire?.email || '';
                                    
                                    const paysAssocies = titulaire?.Pays || [];
                                    
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => handleOpenEntityModal(titulaire, 'titulaire')}
                                        divider={index < titLength - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <BusinessIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {`${nom} ${prenom}`.trim() || 'Titulaire sans nom'}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              {email && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                  <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                  <Typography variant="body2" color="text.secondary">
                                                    {email}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {renderPaysChips(paysAssocies)}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  })}
                                </List>
                              </StyledPaper>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Fade>
                </Grid>
              )}

              {/* Cabinets - Style modernisé */}
              <Grid item xs={12}>
                <Fade in={true} timeout={900}>
                  <StyledCard elevation={2}>
                    <StyledCardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1.5 }} />
                          <Typography variant="h6" fontWeight="600">Cabinets</Typography>
                        </Box>
                      }
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3}>
                        {/* Cabinets de Procédure - Conception moderne */}
                        <Grid item xs={12} md={6}>
                          <StyledPaper>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              mb: 2 
                            }}>
                              <Typography variant="h6" sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontWeight: 600,
                                color: 'primary.main'
                              }}>
                                <WorkIcon sx={{ mr: 1.5 }} /> Cabinets de Procédure
                              </Typography>
                              <Chip 
                                label={procCabLength} 
                                size="small" 
                                color="primary" 
                                sx={{ borderRadius: '12px', fontWeight: 600 }}
                              />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <List disablePadding sx={{ 
                              maxHeight: '400px', 
                              overflow: 'auto',
                              '&::-webkit-scrollbar': {
                                width: '6px'
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: alpha('#1976d2', 0.2),
                                borderRadius: '3px'
                              },
                              '&::-webkit-scrollbar-thumb:hover': {
                                background: alpha('#1976d2', 0.3)
                              }
                            }}>
                              {/* Même logique mais avec les nouveaux composants stylisés */}
                              {(() => {
                                // Tenter d'accéder aux cabinets via 3 sources différentes
                                
                                // 1. Chercher d'abord dans les relations BrevetCabinets du brevet
                                const procedureRelations = brevet?.BrevetCabinets?.filter(rel => 
                                  rel.type === 'procedure' || rel.type?.toLowerCase().includes('proced')
                                ) || [];
                                
                                // 2. Vérifier aussi procedureCabinets provenant du hook
                                const procCabinets = procedureCabinets || [];
                                
                                // 3. Vérifier si des cabinets sont présents directement dans le brevet (au cas où)
                                const brevetCabinets = brevet?.Cabinets?.filter(cab => 
                                  cab.type === 'procedure' || cab.type?.toLowerCase().includes('proced')
                                ) || [];
                                
                                // Si nous avons des données dans l'une des sources, les afficher
                                if (procedureRelations.length > 0) {
                                  return procedureRelations.map((relation, index) => {
                                    // Essayer de trouver le cabinet complet correspondant
                                    const matchingCabinet = procCabinets.find(cab => cab.id === relation.CabinetId || cab.id_cabinet === relation.CabinetId);
                                    const paysAssocies = matchingCabinet?.Pays || [];
                                    
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => matchingCabinet && handleOpenEntityModal(matchingCabinet, 'cabinet')}
                                        divider={index < procedureRelations.length - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <WorkIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {matchingCabinet ? (matchingCabinet.nom_cabinet || matchingCabinet.nom) : `Cabinet ID: ${relation.CabinetId}`}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              <Typography variant="body2" component="span">
                                                Référence: {relation.reference || 'Pas de référence'}
                                              </Typography>
                                              {renderPaysChips(matchingCabinet?.Pays || [])}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  });
                                } else if (procCabinets.length > 0) {
                                  return procCabinets.map((cabinet, index) => {
                                    const paysAssocies = cabinet?.Pays || [];
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => handleOpenEntityModal(cabinet, 'cabinet')}
                                        divider={index < procCabinets.length - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <WorkIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {cabinet?.nom_cabinet || cabinet?.nom || `Cabinet ID: ${cabinet?.id || cabinet?.id_cabinet}` || 'N/A'}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              <Typography variant="body2" component="span">
                                                {cabinet?.reference || cabinet?.BrevetCabinets?.reference || 'Pas de référence'}
                                              </Typography>
                                              {renderPaysChips(paysAssocies)}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  });
                                } else if (brevetCabinets.length > 0) {
                                  // ... code similaire pour brevetCabinets ...
                                  return <Typography variant="body2" color="text.secondary">Cabinets via Brevet.Cabinets: {brevetCabinets.length}</Typography>;
                                } else {
                                  // Dernière tentative - afficher une liste des relations brutes
                                  if (brevet?.BrevetCabinets && brevet.BrevetCabinets.length > 0) {
                                    return (
                                      <Typography variant="body2" color="text.secondary">Relations cabinet trouvées, mais sans détails</Typography>
                                    );
                                  } else {
                                    return <Typography variant="body2" color="text.secondary">Aucun cabinet de procédure</Typography>;
                                  }
                                }
                              })()}
                            </List>
                          </StyledPaper>
                        </Grid>

                        {/* Cabinets d'Annuité - Même style */}
                        <Grid item xs={12} md={6}>
                          <StyledPaper>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              mb: 2 
                            }}>
                              <Typography variant="h6" sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontWeight: 600,
                                color: 'primary.main'
                              }}>
                                <WorkIcon sx={{ mr: 1.5 }} /> Cabinets d'Annuité
                              </Typography>
                              <Chip 
                                label={annuiteCabLength} 
                                size="small" 
                                color="primary" 
                                sx={{ borderRadius: '12px', fontWeight: 600 }}
                              />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <List disablePadding sx={{ 
                              maxHeight: '400px', 
                              overflow: 'auto',
                              '&::-webkit-scrollbar': {
                                width: '6px'
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: alpha('#1976d2', 0.2),
                                borderRadius: '3px'
                              },
                              '&::-webkit-scrollbar-thumb:hover': {
                                background: alpha('#1976d2', 0.3)
                              }
                            }}>
                              {/* Même logique mais avec les nouveaux composants stylisés */}
                              {(() => {
                                // Rechercher les cabinets d'annuité à partir de 3 sources possibles
                                
                                // Préparation des sources pour être toujours traitables comme des tableaux
                                const brevetCabinetRelations = brevet?.BrevetCabinets || [];
                                const annuiteCabs = annuiteCabinets || [];
                                const brevetDirectCabinets = brevet?.Cabinets || [];
                                
                                // 1. Identifier correctement les relations de type annuité (avec meilleure tolérance)
                                const annuiteRelations = brevetCabinetRelations.filter(rel => 
                                  rel.type && 
                                  (rel.type.toLowerCase() === 'annuite' || rel.type.toLowerCase().includes('annuit'))
                                );
                                
                                // Commence par vérifier les relations (source la plus fiable)
                                if (annuiteRelations.length > 0) {
                                  return annuiteRelations.map((relation, index) => {
                                    // Essayer de trouver le cabinet complet correspondant
                                    const matchingCabinet = [...annuiteCabs, ...brevetDirectCabinets].find(
                                      cab => cab.id === relation.CabinetId || cab.id_cabinet === relation.CabinetId
                                    );
                                    const paysAssocies = matchingCabinet?.Pays || [];
                                    
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => matchingCabinet && handleOpenEntityModal(matchingCabinet, 'cabinet')}
                                        divider={index < annuiteRelations.length - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <WorkIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {matchingCabinet ? (matchingCabinet.nom_cabinet || matchingCabinet.nom) : `Cabinet ID: ${relation.CabinetId}`}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              <Typography variant="body2" component="span">
                                                Référence: {relation.reference || 'Pas de référence'}
                                              </Typography>
                                              {renderPaysChips(matchingCabinet?.Pays || [])}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  });
                                } 
                                // Ensuite, vérifier les cabinets du hook
                                else if (annuiteCabs.length > 0) {
                                  return annuiteCabs.map((cabinet, index) => {
                                    const paysAssocies = cabinet?.Pays || [];
                                    return (
                                      <StyledListItem 
                                        key={index}
                                        index={index}
                                        button
                                        onClick={() => handleOpenEntityModal(cabinet, 'cabinet')}
                                        divider={index < annuiteCabs.length - 1}
                                      >
                                        <ListItemAvatar>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <WorkIcon />
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                          primary={
                                            <Typography fontWeight="600">
                                              {cabinet?.nom_cabinet || cabinet?.nom || `Cabinet ID: ${cabinet?.id || cabinet?.id_cabinet}` || 'N/A'}
                                            </Typography>
                                          }
                                          secondary={
                                            <Box>
                                              <Typography variant="body2" component="span">
                                                {cabinet?.reference || cabinet?.BrevetCabinets?.reference || 'Pas de référence'}
                                              </Typography>
                                              {renderPaysChips(paysAssocies)}
                                            </Box>
                                          }
                                        />
                                      </StyledListItem>
                                    );
                                  });
                                } else {
                                  return <Typography variant="body2" color="text.secondary">Aucun cabinet d'annuité trouvé</Typography>;
                                }
                              })()}
                            </List>
                          </StyledPaper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </StyledCard>
                </Fade>
              </Grid>

              {/* Pays et Statut - Design amélioré avec cartes */}
              {paysLength > 0 && (
                <Grid item xs={12}>
                  <Fade in={true} timeout={1100}>
                    <StyledCard elevation={2}>
                      <StyledCardHeader
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FlagIcon sx={{ mr: 1.5 }} />
                            <Typography variant="h6" fontWeight="600">Pays et Statut</Typography>
                          </Box>
                        }
                      />
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          {pays && Array.isArray(pays) && paysLength > 0 ? pays.map((p, index) => {
                            if (!p) return null;
                            
                            // Même logique d'extraction des données
                            let matchingStatut = null;
                            if (statutsList && Array.isArray(statutsList)) {
                              if (p.Statut) {
                                matchingStatut = p.Statut;
                              } else if (p.id_statuts) {
                                matchingStatut = statutsList.find(st => st && st.id === p.id_statuts);
                              }
                            }
                            
                            const nomPays = p?.nom_fr_fr || p?.Pay?.nom_fr_fr || p?.nom || p?.Pay?.nom || 'N/A';
                            const alpha2 = p?.alpha2 || p?.Pay?.alpha2;
                            
                            return (
                              <Grid item xs={12} md={6} lg={4} key={index}>
                                <StyledPaper sx={{ 
                                  position: 'relative',
                                  overflow: 'hidden',
                                  borderTop: `4px solid ${alpha('#1976d2', 0.8)}`
                                }}>
                                  {/* En-tête du pays avec drapeau */}
                                  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                                    {alpha2 && (
                                      <CountryFlag code={alpha2} size={28} />
                                    )}
                                    <Typography variant="h6" fontWeight="600" sx={{ ml: 1.5 }}>
                                      {nomPays}
                                    </Typography>
                                  </Box>
                                  
                                  {/* Statut sous forme de chip */}
                                  <Box sx={{ mb: 2 }}>
                                    <Chip 
                                      label={matchingStatut ? (matchingStatut.valeur || matchingStatut.statuts) : 'N/A'} 
                                      color="primary" 
                                      size="small"
                                      sx={{ fontWeight: 500 }}
                                    />
                                  </Box>
                                  
                                  {/* Grille d'informations */}
                                  <Grid container spacing={1}>
                                    {p?.numero_depot && (
                                      <Grid item xs={12}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          bgcolor: 'background.paper',
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid rgba(0,0,0,0.08)'
                                        }}>
                                          <Typography variant="body2" fontWeight="600" width="130px">N° Dépôt:</Typography>
                                          <Typography variant="body2">{p.numero_depot}</Typography>
                                        </Box>
                                      </Grid>
                                    )}
                                    
                                    {p?.date_depot && (
                                      <Grid item xs={12}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          bgcolor: 'background.paper',
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid rgba(0,0,0,0.08)'
                                        }}>
                                          <Typography variant="body2" fontWeight="600" width="130px">Date Dépôt:</Typography>
                                          <Typography variant="body2">{formatDate(p.date_depot)}</Typography>
                                        </Box>
                                      </Grid>
                                    )}
                                    
                                    {/* Informations similaires pour les autres champs */}
                                    {p?.numero_publication && (
                                      <Grid item xs={12}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          bgcolor: 'background.paper',
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid rgba(0,0,0,0.08)'
                                        }}>
                                          <Typography variant="body2" fontWeight="600" width="130px">N° Publication:</Typography>
                                          <Typography variant="body2">{p.numero_publication}</Typography>
                                        </Box>
                                      </Grid>
                                    )}
                                    
                                    {p?.numero_delivrance && (
                                      <Grid item xs={12}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          bgcolor: 'background.paper',
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid rgba(0,0,0,0.08)'
                                        }}>
                                          <Typography variant="body2" fontWeight="600" width="130px">N° Délivrance:</Typography>
                                          <Typography variant="body2">{p.numero_delivrance}</Typography>
                                        </Box>
                                      </Grid>
                                    )}
                                    
                                    {p?.date_delivrance && (
                                      <Grid item xs={12}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          bgcolor: 'background.paper',
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid rgba(0,0,0,0.08)'
                                        }}>
                                          <Typography variant="body2" fontWeight="600" width="130px">Date Délivrance:</Typography>
                                          <Typography variant="body2">{formatDate(p.date_delivrance)}</Typography>
                                        </Box>
                                      </Grid>
                                    )}
                                    
                                    {p?.licence !== undefined && (
                                      <Grid item xs={12}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          bgcolor: 'background.paper',
                                          p: 1.5,
                                          borderRadius: 1,
                                          border: '1px solid rgba(0,0,0,0.08)'
                                        }}>
                                          <Typography variant="body2" fontWeight="600" width="130px">Licence:</Typography>
                                          <Typography variant="body2">{p.licence ? 'Oui' : 'Non'}</Typography>
                                        </Box>
                                      </Grid>
                                    )}
                                  </Grid>
                                </StyledPaper>
                              </Grid>
                            );
                          }) : (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Aucun pays trouvé</Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Fade>
                </Grid>
              )}

              {/* Commentaire avec design moderne */}
              <Grid item xs={12}>
                <Fade in={true} timeout={1300}>
                  <StyledCard elevation={2}>
                    <StyledCardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon sx={{ mr: 1.5 }} />
                          <Typography variant="h6" fontWeight="600">Commentaire</Typography>
                        </Box>
                      }
                    />
                    <CardContent sx={{ p: 3 }}>
                      <StyledPaper>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', p: 1 }}>
                          {brevet?.commentaire || 'Aucun commentaire'}
                        </Typography>
                      </StyledPaper>
                    </CardContent>
                  </StyledCard>
                </Fade>
              </Grid>
            </Grid>
          </Container>
        </BootstrapModal.Body>
        <BootstrapModal.Footer style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '16px 24px' }}>
          <BootstrapButton
            variant="primary"
            onClick={handleClose}
            style={{ 
              backgroundColor: '#1976d2', 
              borderColor: '#1976d2', 
              borderRadius: '24px',
              padding: '8px 24px',
              fontWeight: 500,
              boxShadow: '0 3px 10px rgba(25, 118, 210, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            Fermer
          </BootstrapButton>
        </BootstrapModal.Footer>
      </Dialog>

      {/* Modal pour les détails des entités - Style amélioré */}
      <Dialog
        open={openEntityModal}
        onClose={handleCloseEntityModal}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={openEntityModal}>
          <Box
            sx={{
              p: 4,
              bgcolor: 'background.paper',
              position: 'relative',
              width: '450px',
              maxWidth: '95vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 4,
              outline: 'none',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Barre de couleur supérieure */}
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: `linear-gradient(90deg, ${alpha('#1976d2', 0.8)} 0%, ${alpha('#1976d2', 0.6)} 100%)`
            }} />
            
            <IconButton
              aria-label="close"
              onClick={handleCloseEntityModal}
              sx={{ position: 'absolute', right: 8, top: 8, color: '#333' }}
            >
              <CloseIcon />
            </IconButton>
            {selectedEntity ? (
              <Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600, color: '#1976d2', mb: 3, mt: 1 }}
                >
                  Information du {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                </Typography>
                
                {/* Avatar et nom */}
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'primary.main', 
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                  }}
                >
                  {entityType === 'client' || entityType === 'cabinet' ? (
                    <BusinessIcon sx={{ fontSize: 40 }} />
                  ) : (
                    <PersonIcon sx={{ fontSize: 40 }} />
                  )}
                </Avatar>
                
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {selectedEntity?.nom || selectedEntity?.nom_client || selectedEntity?.nom_cabinet || ''}
                  {' '}
                  {selectedEntity?.prenom || selectedEntity?.prenom_client || ''}
                </Typography>
                
                {/* Informations de contact */}
                <Box sx={{ 
                  mt: 3, 
                  mb: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  bgcolor: alpha('#1976d2', 0.05),
                  p: 2,
                  borderRadius: 2
                }}>
                  {(selectedEntity?.email || selectedEntity?.email_client) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <EmailIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                      <Typography align="left">
                        {selectedEntity?.email || selectedEntity?.email_client}
                      </Typography>
                    </Box>
                  )}
                  {(selectedEntity?.telephone || selectedEntity?.telephone_client) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <PhoneIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                      <Typography align="left">
                        {selectedEntity?.telephone || selectedEntity?.telephone_client}
                      </Typography>
                    </Box>
                  )}
                  {selectedEntity?.adresse_client && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <LocationOnIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                      <Typography align="left">
                        {selectedEntity.adresse_client}
                      </Typography>
                    </Box>
                  )}
                  {selectedEntity?.reference && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                      <Typography align="left">
                        Référence: {selectedEntity.reference}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Button
                  variant="contained"
                  onClick={handleCloseEntityModal}
                  sx={{ 
                    mt: 1, 
                    borderRadius: '24px', 
                    paddingX: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                  }}
                >
                  Fermer
                </Button>
              </Box>
            ) : (
              <Typography color="error">Aucune information disponible</Typography>
            )}
          </Box>
        </Fade>
      </Dialog>
    </>
  );
};

export default BrevetDetailModal;
