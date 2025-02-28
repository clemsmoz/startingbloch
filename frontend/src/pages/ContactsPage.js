import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CardContent, Typography, Container, Button, IconButton, Avatar, Box, Paper } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { FaEdit, FaTrash } from 'react-icons/fa';
import AddContactModal from '../components/AddContactModal';
import DeleteContactModal from '../components/DeleteContactModal';
import EditContactModal from '../components/EditContactModal';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct
import { API_BASE_URL } from '../config';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [searchParams] = useSearchParams();
  const cabinetId = searchParams.get('cabinet_id');
  const clientId = searchParams.get('client_id');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (cabinetId) {
      refreshContacts('cabinet', cabinetId);
    } else if (clientId) {
      refreshContacts('client', clientId);
    } else {
      console.error('Neither cabinet ID nor client ID is provided in query parameters.');
    }
  }, [cabinetId, clientId]);

  const refreshContacts = (type, id) => {
    const url = type === 'cabinet'
      ? `${API_BASE_URL}/contacts/cabinets/${id}`
      : `${API_BASE_URL}/contacts/clients/${id}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setContacts(data.data);
      })
      .catch(error => {
        console.error('There was an error fetching the contacts!', error);
      });
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleShowDeleteModal = (contact) => {
    setSelectedContact(contact);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleShowEditModal = (contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ padding: '20px' }} maxWidth="xl">
           {/* Logo de l'entreprise */}
           <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>
        
        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
          Contacts
        </Typography>
        
        {/* Alignement des boutons avec espace entre eux */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate(-1)} 
            sx={{ fontWeight: 'bold', padding: '12px 20px' }} // Augmentation de la taille
          >
            Retour
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleShowAddModal} 
            sx={{ fontWeight: 'bold', padding: '12px 20px' }} // Augmentation de la taille
          >
            Ajouter un nouveau Contact
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {contacts.map(contact => (
            <Box
              key={contact.id_contact}
              component={Paper}
              elevation={6}
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
                  {contact.nom.charAt(0)}{contact.prenom.charAt(0)}
                </Avatar>
                <Box>
                  <FaEdit
                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#3f51b5' }}
                    onClick={() => handleShowEditModal(contact)}
                  />
                  <FaTrash
                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#f44336', marginLeft: '1rem' }}
                    onClick={() => handleShowDeleteModal(contact)}
                  />
                </Box>
              </Box>
              <CardContent sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {contact.nom} {contact.prenom}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Téléphone :</strong> {contact.telephone}<br />
                  <strong>Email :</strong> {contact.email}
                </Typography>
              </CardContent>
            </Box>
          ))}
        </Box>
        <AddContactModal 
          show={showAddModal} 
          handleClose={handleCloseAddModal} 
          refreshContacts={refreshContacts} 
          cabinetId={cabinetId} 
          clientId={clientId} 
        />
        <DeleteContactModal 
          show={showDeleteModal} 
          handleClose={handleCloseDeleteModal} 
          refreshContacts={refreshContacts} 
          contact={selectedContact} 
        />
        <EditContactModal 
          show={showEditModal} 
          handleClose={handleCloseEditModal} 
          refreshContacts={refreshContacts} 
          contact={selectedContact} 
        />
      </Container>
    </Box>
  );
};

export default ContactsPage;
