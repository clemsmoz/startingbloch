// components/BrevetDetailModal.js

import React, { useState, useEffect, useCallback } from 'react';
import { Modal as BootstrapModal, Button as BootstrapButton, Container } from 'react-bootstrap';
import Flag from 'react-world-flags';

import { 
  Modal, Box, Typography, IconButton, Button, Card, CardContent, CardHeader,
  Grid, Divider, Chip, List, ListItem, ListItemText, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CommentIcon from '@mui/icons-material/Comment';
import useBrevetData from '../hooks/useBrevetData';
import { API_BASE_URL } from '../config';

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
    procedureCabinets,
    annuiteCabinets,
    contactsProcedure,
    contactsAnnuite,
    clients,
    inventeurs,
    deposants,
    titulaires,
    pays,
    statut, 
    statutsList,
    generatePDF,
    loading,
    error
  } = useBrevetData(brevetId);

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

  // Si les conditions ne sont pas remplies, retourner null mais APRÈS avoir appelé tous les hooks
  if (!shouldRender) {
    console.log("BrevetDetailModal: Modal non affichée ou brevet non défini", { show, brevetId });
    return null;
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
      <BootstrapModal show={show} onHide={handleClose} fullscreen>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff', fontFamily: 'Roboto, sans-serif' }}>
            Détails du Brevet: {brevet?.titre || 'Sans titre'}
            {typeof generatePDF === 'function' && (
              <Button 
                variant="contained" 
                onClick={generatePDF} 
                startIcon={<DownloadIcon />}
                sx={{ ml: 2 }}
              >
                Exporter en PDF
              </Button>
            )}
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body style={{ backgroundColor: '#f0f2f5', padding: '30px' }}>
          <Container fluid>
            <Grid container spacing={3}>
              {/* Informations Générales */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardHeader
                    title="Informations Générales" 
                    sx={{ backgroundColor: '#007bff', color: 'white', py: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="bold">Référence famille:</Typography>
                        <Typography variant="body1">{brevet?.reference_famille || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle1" fontWeight="bold">Titre:</Typography>
                        <Typography variant="body1">{brevet?.titre || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Personnes liées - Ne montrer que si des données sont disponibles */}
              {(clientsLength > 0 || invLength > 0 || depLength > 0 || titLength > 0) && (
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardHeader
                      title="Personnes Liées" 
                      sx={{ backgroundColor: '#007bff', color: 'white', py: 1 }}
                    />
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* Clients */}
                        {clientsLength > 0 && (
                          <Grid item xs={12} md={3}>
                            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <BusinessIcon sx={{ mr: 1 }} /> Clients
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <List dense>
                                {clients.map((client, index) => (
                                  <ListItem 
                                    key={index}
                                    button
                                    onClick={() => handleOpenEntityModal(client, 'client')}
                                    divider={index < clientsLength - 1}
                                  >
                                    <ListItemText 
                                      primary={`${client?.nom_client || ''} ${client?.prenom_client || ''}`}
                                      secondary={client?.email_client || 'Aucun email'}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                        )}

                        {/* Inventeurs */}
                        {invLength > 0 && (
                          <Grid item xs={12} md={3}>
                            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ mr: 1 }} /> Inventeurs
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <List dense>
                                {inventeurs.map((inventeur, index) => (
                                  <ListItem 
                                    key={index}
                                    button
                                    onClick={() => handleOpenEntityModal(inventeur, 'inventeur')}
                                    divider={index < invLength - 1}
                                  >
                                    <ListItemText 
                                      primary={`${inventeur?.nom || inventeur?.nom_inventeur || ''} ${inventeur?.prenom || inventeur?.prenom_inventeur || ''}`}
                                      secondary={inventeur?.email || inventeur?.email_inventeur || 'Aucun email'}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                        )}

                        {/* Déposants */}
                        {depLength > 0 && (
                          <Grid item xs={12} md={3}>
                            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <BusinessIcon sx={{ mr: 1 }} /> Déposants
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <List dense>
                                {deposants.map((deposant, index) => (
                                  <ListItem 
                                    key={index}
                                    button
                                    onClick={() => handleOpenEntityModal(deposant, 'deposant')}
                                    divider={index < depLength - 1}
                                  >
                                    <ListItemText 
                                      primary={`${deposant?.nom || deposant?.nom_deposant || ''} ${deposant?.prenom || deposant?.prenom_deposant || ''}`}
                                      secondary={deposant?.email || deposant?.email_deposant || 'Aucun email'}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                        )}

                        {/* Titulaires */}
                        {titLength > 0 && (
                          <Grid item xs={12} md={3}>
                            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <BusinessIcon sx={{ mr: 1 }} /> Titulaires
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <List dense>
                                {titulaires.map((titulaire, index) => (
                                  <ListItem 
                                    key={index}
                                    button
                                    onClick={() => handleOpenEntityModal(titulaire, 'titulaire')}
                                    divider={index < titLength - 1}
                                  >
                                    <ListItemText 
                                      primary={`${titulaire?.nom || titulaire?.nom_titulaire || ''} ${titulaire?.prenom || titulaire?.prenom_titulaire || ''}`}
                                      secondary={titulaire?.email || titulaire?.email_titulaire || 'Aucun email'}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Cabinets - Ne montrer que si des données sont disponibles */}
              {(procCabLength > 0 || annuiteCabLength > 0) && (
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardHeader
                      title="Cabinets" 
                      sx={{ backgroundColor: '#007bff', color: 'white', py: 1 }}
                    />
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* Cabinets de Procédure */}
                        <Grid item xs={12} md={6}>
                          <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <BusinessIcon sx={{ mr: 1 }} /> Cabinets de Procédure
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {procedureCabinets && procCabLength > 0 ? (
                              procedureCabinets.map((cabinet, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight="bold" 
                                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                                    onClick={() => handleOpenEntityModal(cabinet, 'cabinet')}
                                  >
                                    {cabinet?.nom_cabinet || 'N/A'}
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Contacts:</Typography>
                                  {contactsProcedure && Array.isArray(contactsProcedure) ? 
                                    contactsProcedure
                                      .filter(contact => contact && contact.id_cabinet === cabinet?.id_cabinet)
                                      .map((contact, idx) => (
                                        <Chip
                                          key={idx}
                                          label={`${contact?.nom || ''} ${contact?.prenom || ''}`}
                                          onClick={() => handleOpenEntityModal(contact, 'contact')}
                                          sx={{ mr: 1, mt: 1 }}
                                          color="primary"
                                          variant="outlined"
                                        />
                                      ))
                                    : null}
                                  {index < procCabLength - 1 && <Divider sx={{ my: 2 }} />}
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">Aucun cabinet de procédure</Typography>
                            )}
                          </Paper>
                        </Grid>

                        {/* Cabinets d'Annuité */}
                        <Grid item xs={12} md={6}>
                          <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <BusinessIcon sx={{ mr: 1 }} /> Cabinets d'Annuité
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {annuiteCabinets && annuiteCabLength > 0 ? (
                              annuiteCabinets.map((cabinet, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight="bold" 
                                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                                    onClick={() => handleOpenEntityModal(cabinet, 'cabinet')}
                                  >
                                    {cabinet?.nom_cabinet || 'N/A'}
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Contacts:</Typography>
                                  {contactsAnnuite && Array.isArray(contactsAnnuite) ? 
                                    contactsAnnuite
                                      .filter(contact => contact && contact.id_cabinet === cabinet?.id_cabinet)
                                      .map((contact, idx) => (
                                        <Chip
                                          key={idx}
                                          label={`${contact?.nom || ''} ${contact?.prenom || ''}`}
                                          onClick={() => handleOpenEntityModal(contact, 'contact')}
                                          sx={{ mr: 1, mt: 1 }}
                                          color="primary"
                                          variant="outlined"
                                        />
                                      ))
                                    : null}
                                  {index < annuiteCabLength - 1 && <Divider sx={{ my: 2 }} />}
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">Aucun cabinet d'annuité</Typography>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Pays et Statut - Ne montrer que si des données sont disponibles */}
              {paysLength > 0 && (
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardHeader
                      title="Pays et Statut" 
                      sx={{ backgroundColor: '#007bff', color: 'white', py: 1 }}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        {pays && Array.isArray(pays) && paysLength > 0 ? pays.map((p, index) => {
                          if (!p) return null; // Vérification supplémentaire pour les pays undefined
                          const matchingStatut = statutsList && Array.isArray(statutsList) ? 
                            statutsList.find(st => st && p && st.id_statuts === p.id_statuts) : null;
                          return (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                              <Paper elevation={2} sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                                  {p.alpha2 && (
                                    <Flag code={p.alpha2} width="32" style={{ marginRight: '12px' }} />
                                  )}
                                  <Typography variant="h6">{p?.nom_fr_fr || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, mb: 1 }}>
                                  <Typography variant="body2" fontWeight="bold">Statut:</Typography>
                                  <Chip 
                                    label={matchingStatut ? matchingStatut.valeur : 'N/A'} 
                                    color="primary" 
                                    size="small"
                                  />
                                  
                                  <Typography variant="body2" fontWeight="bold">N° Dépôt:</Typography>
                                  <Typography variant="body2">{p?.numero_depot || 'N/A'}</Typography>
                                  
                                  <Typography variant="body2" fontWeight="bold">Date Dépôt:</Typography>
                                  <Typography variant="body2">{formatDate(p?.date_depot)}</Typography>
                                  
                                  <Typography variant="body2" fontWeight="bold">N° Publication:</Typography>
                                  <Typography variant="body2">{p?.numero_publication || 'N/A'}</Typography>
                                  
                                  <Typography variant="body2" fontWeight="bold">N° Délivrance:</Typography>
                                  <Typography variant="body2">{p?.numero_delivrance || 'N/A'}</Typography>
                                  
                                  <Typography variant="body2" fontWeight="bold">Date Délivrance:</Typography>
                                  <Typography variant="body2">{formatDate(p?.date_delivrance)}</Typography>
                                  
                                  <Typography variant="body2" fontWeight="bold">Licence:</Typography>
                                  <Typography variant="body2">{p?.licence ? 'Oui' : 'Non'}</Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        }) : (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Aucun pays trouvé</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Commentaire uniquement - sans les pièces jointes */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardHeader
                    title="Commentaire" 
                    sx={{ backgroundColor: '#007bff', color: 'white', py: 1 }}
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Commentaire - Toujours visible, pleine largeur */}
                      <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <CommentIcon sx={{ mr: 1 }} /> Commentaire
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body1">
                            {brevet?.commentaire || 'Aucun commentaire'}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <BootstrapButton
            variant="primary"
            onClick={handleClose}
            style={{ backgroundColor: '#007bff', borderColor: '#007bff', borderRadius: '50px' }}
          >
            Fermer
          </BootstrapButton>
        </BootstrapModal.Footer>
      </BootstrapModal>

      {/* Modal pour les détails des entités (Clients, Inventeurs, etc.) */}
      <Modal
        open={openEntityModal}
        onClose={handleCloseEntityModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            position: 'relative',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: 24,
            borderRadius: 4,
            outline: 'none',
            textAlign: 'center',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseEntityModal}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#333' }}
          >
            <CloseIcon />
          </IconButton>
          {selectedEntity ? (
            <div>
              <Typography
                variant="h5"
                gutterBottom
                style={{ fontWeight: 'bold', color: '#007bff', fontFamily: 'Roboto, sans-serif' }}
              >
                Information du {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </Typography>
              <Typography variant="h6">
                {selectedEntity?.nom || selectedEntity?.nom_client || selectedEntity?.nom_cabinet || ''}
                {' '}
                {selectedEntity?.prenom || selectedEntity?.prenom_client || ''}
              </Typography>
              {(selectedEntity?.email || selectedEntity?.email_client) && (
                <Typography>Email: {selectedEntity?.email || selectedEntity?.email_client}</Typography>
              )}
              {(selectedEntity?.telephone || selectedEntity?.telephone_client) && (
                <Typography>Téléphone: {selectedEntity?.telephone || selectedEntity?.telephone_client}</Typography>
              )}
              {selectedEntity?.adresse_client && (
                <Typography>Adresse: {selectedEntity.adresse_client}</Typography>
              )}
              {selectedEntity?.reference && (
                <Typography>Référence: {selectedEntity.reference}</Typography>
              )}
            </div>
          ) : (
            <Typography color="error">Aucune information disponible</Typography>
          )}
          <Button
            variant="contained"
            onClick={handleCloseEntityModal}
            sx={{ mt: 2, borderRadius: '20px', backgroundColor: '#007bff' }}
          >
            Fermer
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default BrevetDetailModal;
