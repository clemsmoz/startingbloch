import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Button, Modal, Card, CardContent, CardActions, Avatar, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import EditClientModal from '../components/EditClientModal';
import DeleteClientModal from '../components/DeleteClientModal';
import AddClientModal from '../components/AddClientModal';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct


const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshClients();
  }, []);

  const refreshClients = () => {
    axios.get('http://localhost:3100/clients')
      .then(response => {
        setClients(response.data.data);
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
    navigate(`/brevets/client/${clientId}`);
  };

  const handleViewContacts = (clientId, event) => {
    event.stopPropagation();
    navigate(`/contacts?client_id=${clientId}`);
  };

  return (
    <Box sx={{ display: 'flex',  bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ padding: '20px', marginLeft: '0px' }} maxWidth="xl">
           {/* Logo de l'entreprise */}
           <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>
        
      <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
      Portefeuille Clients
        </Typography>
        <Button variant="contained" color="primary" onClick={handleShowAddModal} sx={{ mb: 4, textTransform: 'uppercase', fontWeight: 'bold' }}>
          Ajouter un nouveau client
        </Button>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {clients.map(client => (
            <Paper
              key={client.id_client}
              elevation={6}
              onClick={() => handleClientClick(client.id_client)}
              sx={{
                width: 300,
                padding: 3,
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
  {client.nom_client ? client.nom_client.charAt(0) : ''}
  {client.prenom_client ? client.prenom_client.charAt(0) : ''}
</Avatar>

                <Box>
                  <FaEdit
                    className="text-primary mx-2"
                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#3f51b5' }}
                    onClick={(event) => handleShowEditModal(client, event)}
                  />
                  <FaTrash
                    className="text-danger mx-2"
                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#f44336' }}
                    onClick={(event) => handleShowDeleteModal(client, event)}
                  />
                </Box>
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" sx={{ mt: 2 }}>
                  {client.nom_client}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Référence :</strong> {client.reference_client}<br />
                  <strong>Adresse :</strong> {client.adresse_client}<br />
                  <strong>Code Postal :</strong> {client.code_postal}<br />
                  <strong>Email :</strong> {client.email_client}<br />
                  <strong>Téléphone :</strong> {client.telephone_client}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button variant="outlined" color="primary" onClick={(event) => handleViewContacts(client.id_client, event)}>
                  Voir Contacts
                </Button>
              </CardActions>
            </Paper>
          ))}
        </Box>
        <EditClientModal
          show={showEditModal}
          handleClose={handleCloseEditModal}
          refreshClients={refreshClients}
          client={selectedClient}
        />
        <DeleteClientModal
          show={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          refreshClients={refreshClients}
          client={selectedClient}
        />
        <AddClientModal
          show={showAddModal}
          handleClose={handleCloseAddModal}
          refreshClients={refreshClients}
        />
      </Container>
    </Box>
  );
};

export default ClientsPage;