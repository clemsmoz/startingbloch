import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, CardContent, Avatar, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import T from '../components/T';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AddClientModal from '../components/AddClientModal';
import EditClientModal from '../components/EditClientModal';
import DeleteClientModal from '../components/DeleteClientModal';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  const safe = (val) => val ?? '';

  // Vérification des droits d'écriture
  const user = typeof cacheService?.get === "function" 
    ? cacheService.get('user')
    : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);
  const canWrite = !!user && (user.role === 'admin' || user.permissions?.includes('write'));

  useEffect(() => {
    refreshClients();
  }, []);

  const refreshClients = () => {
    fetch(`${API_BASE_URL}/api/clients`)
      .then(response => response.json())
      .then(data => {
        setClients(data.data || []);
      })
      .catch(error => {
        console.error('There was an error fetching the clients!', error);
      });
  };

  const handleShowEditModal = (client, event) => {
    event.stopPropagation();
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleShowDeleteModal = (client, event) => {
    event.stopPropagation();
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleClientClick = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ padding: '20px', marginLeft: '0px' }} maxWidth="xl">
        {/* Logo de l'entreprise */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" color="primary">
            <T>Gestion des Clients</T>
          </Typography>
          {canWrite && (
            <Button variant="contained" color="primary" onClick={handleShowAddModal} startIcon={<FaPlus />}>
              <T>Ajouter un nouveau Client</T>
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={safe(client.id)}>
              <Paper
                elevation={6}
                onClick={() => handleClientClick(client.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '20px',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    {safe(client.nom_client).charAt(0)}
                  </Avatar>
                  
                  <Typography variant="h6" component="div" fontWeight="bold">
                    {safe(client.nom_client)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <T>Référence</T>: {safe(client.reference_client)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <T>Adresse</T>: {safe(client.adresse_client)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <T>Pays</T>: {safe(client.pays_client)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <T>Email</T>: {safe(client.email_client)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <T>Téléphone</T>: {safe(client.telephone_client)}
                  </Typography>

                  {canWrite && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                      <FaEdit
                        style={{ cursor: 'pointer', color: '#3f51b5' }}
                        onClick={(event) => handleShowEditModal(client, event)}
                      />
                      <FaTrash
                        style={{ cursor: 'pointer', color: '#f44336', marginLeft: '8px' }}
                        onClick={(event) => handleShowDeleteModal(client, event)}
                      />
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Modaux */}
        {canWrite && (
          <>
            <AddClientModal
              show={showAddModal}
              handleClose={handleCloseAddModal}
              refreshClients={refreshClients}
            />
            <EditClientModal
              show={showEditModal}
              handleClose={handleCloseEditModal}
              client={selectedClient}
              refreshClients={refreshClients}
            />
            <DeleteClientModal
              show={showDeleteModal}
              handleClose={handleCloseDeleteModal}
              client={selectedClient}
              refreshClients={refreshClients}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default ClientsPage;
