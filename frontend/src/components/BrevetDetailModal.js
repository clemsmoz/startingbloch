import React, { useState, useEffect, useCallback } from 'react';
import Flag from 'react-world-flags';
import { 
  Dialog, Box, Typography, IconButton, Button, Card, CardContent,
  Grid, Divider, Chip, List, ListItem, ListItemText, Paper, Avatar, Fade, 
  alpha, styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FlagIcon from '@mui/icons-material/Flag';
import T from './T';
import useTranslation from '../hooks/useTranslation';
import useBrevetData from '../hooks/useBrevetData';

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
  const { alert, error } = useTranslation();
  
  // États locaux
  const [shouldRender, setShouldRender] = useState(true);

  // Hook useBrevetData
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
    statut, 
    generatePDF,
    loading,
    error: brevetError
  } = useBrevetData(brevetId);

  // Version renforcée de la fonction d'exportation PDF
  const handleExportPDF = useCallback(() => {
    console.log("[PDF-Modal] Clic sur le bouton d'exportation PDF");
    
    try {
      if (typeof generatePDF !== 'function') {
        console.error("[PDF-Modal] ERREUR: generatePDF n'est pas une fonction!", generatePDF);
        alert("La fonction d'exportation PDF n'est pas disponible. Veuillez rafraîchir la page.");
        return;
      }
      
      console.log("[PDF-Modal] Tentative d'exécution de generatePDF...");
      const result = generatePDF();
      console.log("[PDF-Modal] Résultat de generatePDF:", result);
    } catch (err) {
      console.error("[PDF-Modal] ERREUR lors de l'appel à generatePDF:", err);
      alert(`Erreur lors de l'exportation: ${err.message || "Erreur inconnue"}`);
    }
  }, [generatePDF, alert]);

  // Fonction pour formater les dates
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
    } catch (err) {
      console.error('Erreur lors du formatage de la date:', err);
      return 'N/A';
    }
  }, []);

  // Fonction utilitaire pour afficher les pays associés à une personne
  const renderPaysChips = useCallback((paysArray) => {
    if (!paysArray || !Array.isArray(paysArray) || paysArray.length === 0) return null;
    
    return (
      <Box mt={1} display="flex" flexWrap="wrap">
        {paysArray.map((p, i) => {
          const paysInfo = p || {};
          
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

  // Effets
  useEffect(() => {
    if (show && brevetId) {
      console.log('Modal ouverte pour brevet:', brevetId);
      setShouldRender(true);
    } else if (!show) {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show, brevetId]);

  // Gestion des erreurs
  useEffect(() => {
    if (brevetError) {
      console.error('Erreur lors du chargement du brevet:', brevetError);
      error("Erreur lors du chargement des données du brevet");
    }
  }, [brevetError, error]);

  // Ne pas rendre si pas nécessaire
  if (!shouldRender) return null;

  // Affichage de chargement
  if (loading) {
    return (
      <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
        <Box p={4} textAlign="center">
          <Typography variant="h6">
            <T>Chargement des données du brevet...</T>
          </Typography>
        </Box>
      </Dialog>
    );
  }

  // Si pas de données
  if (!brevet) {
    return (
      <Dialog open={show} onClose={handleClose} maxWidth="sm" fullWidth>
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="error">
            <T>Aucune donnée disponible pour ce brevet</T>
          </Typography>
          <Button onClick={handleClose} variant="contained" sx={{ mt: 2 }}>
            <T>Fermer</T>
          </Button>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={show} 
      onClose={handleClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <Fade in={show}>
        <Box>
          {/* En-tête avec actions */}
          <Box 
            sx={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              <T>Détail du Brevet</T> #{brevet.numero_brevet || brevet.id}
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPDF}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <T>Export PDF</T>
              </Button>
              <IconButton 
                onClick={handleClose}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Contenu principal */}
          <Box sx={{ p: 3, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            <Grid container spacing={3}>
              {/* Informations générales */}
              <Grid item xs={12} md={6}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <T>Informations Générales</T>
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong><T>Numéro</T>:</strong> {brevet.numero_brevet || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong><T>Titre</T>:</strong> {brevet.titre_brevet || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong><T>Date de dépôt</T>:</strong> {formatDate(brevet.date_depot)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong><T>Date de priorité</T>:</strong> {formatDate(brevet.date_priorite)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong><T>Statut</T>:</strong> {statut?.nom_statut || 'N/A'}
                    </Typography>
                  </Box>
                </StyledPaper>
              </Grid>

              {/* Inventeurs */}
              <Grid item xs={12} md={6}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <T>Inventeurs</T> ({inventeurs.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    {inventeurs.length > 0 ? inventeurs.map((inventeur, index) => (
                      <StyledListItem 
                        key={index}
                      >
                        <ListItemText
                          primary={`${inventeur.prenom_inventeur} ${inventeur.nom_inventeur}`}
                          secondary={inventeur.adresse_inventeur}
                        />
                        {renderPaysChips(inventeur.pays)}
                      </StyledListItem>
                    )) : (
                      <ListItem>
                        <ListItemText primary={<T>Aucun inventeur</T>} />
                      </ListItem>
                    )}
                  </List>
                </StyledPaper>
              </Grid>

              {/* Déposants */}
              <Grid item xs={12} md={6}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <T>Déposants</T> ({deposants.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    {deposants.length > 0 ? deposants.map((deposant, index) => (
                      <StyledListItem 
                        key={index}
                      >
                        <ListItemText
                          primary={`${deposant.prenom_deposant} ${deposant.nom_deposant}`}
                          secondary={deposant.adresse_deposant}
                        />
                        {renderPaysChips(deposant.pays)}
                      </StyledListItem>
                    )) : (
                      <ListItem>
                        <ListItemText primary={<T>Aucun déposant</T>} />
                      </ListItem>
                    )}
                  </List>
                </StyledPaper>
              </Grid>

              {/* Titulaires */}
              <Grid item xs={12} md={6}>
                <StyledPaper>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                    <T>Titulaires</T> ({titulaires.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    {titulaires.length > 0 ? titulaires.map((titulaire, index) => (
                      <StyledListItem 
                        key={index}
                      >
                        <ListItemText
                          primary={`${titulaire.prenom_titulaire} ${titulaire.nom_titulaire}`}
                          secondary={titulaire.adresse_titulaire}
                        />
                        {renderPaysChips(titulaire.pays)}
                      </StyledListItem>
                    )) : (
                      <ListItem>
                        <ListItemText primary={<T>Aucun titulaire</T>} />
                      </ListItem>
                    )}
                  </List>
                </StyledPaper>
              </Grid>

              {/* Cabinets de procédure */}
              {procedureCabinets.length > 0 && (
                <Grid item xs={12} md={6}>
                  <StyledPaper>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <T>Cabinets de Procédure</T> ({procedureCabinets.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {procedureCabinets.map((cabinet, index) => (
                        <StyledListItem 
                          key={index}
                        >
                          <ListItemText
                            primary={cabinet.nom_cabinet}
                            secondary={`${cabinet.type} - ${cabinet.adresse_cabinet}`}
                          />
                        </StyledListItem>
                      ))}
                    </List>
                  </StyledPaper>
                </Grid>
              )}

              {/* Cabinets d'annuité */}
              {annuiteCabinets.length > 0 && (
                <Grid item xs={12} md={6}>
                  <StyledPaper>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <T>Cabinets d'Annuité</T> ({annuiteCabinets.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {annuiteCabinets.map((cabinet, index) => (
                        <StyledListItem 
                          key={index}
                        >
                          <ListItemText
                            primary={cabinet.nom_cabinet}
                            secondary={`${cabinet.type} - ${cabinet.adresse_cabinet}`}
                          />
                        </StyledListItem>
                      ))}
                    </List>
                  </StyledPaper>
                </Grid>
              )}

              {/* Contacts de procédure */}
              {contactsProcedure.length > 0 && (
                <Grid item xs={12} md={6}>
                  <StyledPaper>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <T>Contacts de Procédure</T> ({contactsProcedure.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {contactsProcedure.map((contact, index) => (
                        <StyledListItem 
                          key={index}
                        >
                          <ListItemText
                            primary={`${contact.nom_contact} ${contact.prenom_contact}`}
                            secondary={contact.poste_contact}
                          />
                        </StyledListItem>
                      ))}
                    </List>
                  </StyledPaper>
                </Grid>
              )}

              {/* Contacts d'annuité */}
              {contactsAnnuite.length > 0 && (
                <Grid item xs={12} md={6}>
                  <StyledPaper>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <T>Contacts d'Annuité</T> ({contactsAnnuite.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {contactsAnnuite.map((contact, index) => (
                        <StyledListItem 
                          key={index}
                        >
                          <ListItemText
                            primary={`${contact.nom_contact} ${contact.prenom_contact}`}
                            secondary={contact.poste_contact}
                          />
                        </StyledListItem>
                      ))}
                    </List>
                  </StyledPaper>
                </Grid>
              )}

              {/* Clients */}
              {clients.length > 0 && (
                <Grid item xs={12}>
                  <StyledPaper>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <T>Clients</T> ({clients.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {clients.map((client, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card
                            sx={{ 
                              transition: 'all 0.2s',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: 4 
                              }
                            }}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {client.nom_client}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {client.adresse_client}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </StyledPaper>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Fade>
    </Dialog>
  );
};

export default BrevetDetailModal;
