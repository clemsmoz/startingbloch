import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CardContent, Typography, Container, Button, Avatar, Box, Paper } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AddContactModal from '../components/AddContactModal';
import DeleteContactModal from '../components/DeleteContactModal';
import EditContactModal from '../components/EditContactModal';
import ContactDetailModal from '../components/ContactDetailModal';
import logo from '../assets/startigbloch_transparent_corrected.png';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [searchParams] = useSearchParams();
  const cabinetId = searchParams.get('cabinet_id');
  const clientId = searchParams.get('client_id');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  const safe = (val) => val ?? '';

  useEffect(() => {
    if (cabinetId) {
      refreshContacts({ cabinet_id: cabinetId });
    } else if (clientId) {
      refreshContacts({ client_id: clientId });
    } else {
      console.error('Neither cabinet ID nor client ID is provided in query parameters.');
    }
  }, [cabinetId, clientId]);

  const refreshContacts = (contactIdentifier) => {
    let url = '';

    if (contactIdentifier.cabinet_id) {
      url = `${API_BASE_URL}/api/contacts/cabinets/${contactIdentifier.cabinet_id}`;
    } else if (contactIdentifier.client_id) {
      url = `${API_BASE_URL}/api/contacts/clients/${contactIdentifier.client_id}`;
    } else {
      console.error("Aucun identifiant (cabinet_id ou client_id) fourni !");
      return;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        // S'assurer que data.data est un tableau avant de l'affecter à contacts
        const contactsData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        console.log('Contacts récupérés:', contactsData);
        setContacts(contactsData);
      })
      .catch(error => {
        console.error('There was an error fetching the contacts!', error);
        // En cas d'erreur, définir contacts comme un tableau vide
        setContacts([]);
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

  const handleShowDetail = (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedContact(null);
  };

  const handleGoToContactDetailPage = (contact) => {
    if (contact && contact.id) {
      navigate(`/contacts/${contact.id}`);
    }
  };

  const user = typeof cacheService.get === "function"
    ? cacheService.get('user')
    : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);
  const canWrite = !!(user && (user.role === 'admin' || user.canWrite === true));

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

        {/* Boutons d'action */}
        <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
          {canWrite && (
            <Button variant="contained" color="primary" onClick={handleShowAddModal} startIcon={<FaPlus />}>
              Ajouter un contact
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate(-1)} 
            sx={{ fontWeight: 'bold', padding: '12px 20px', marginLeft: '16px' }}
          >
            Retour
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {contacts && contacts.length > 0 ? (
            contacts.map(contact => (
              <Paper
                key={safe(contact.id) || safe(contact.id_contact)}
                sx={{
                  padding: 3,
                  borderRadius: 3,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                  position: 'relative',
                  width: '100%',
                  maxWidth: 360,
                  margin: '0 auto',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {safe(contact.nom_contact).charAt(0)}{safe(contact.prenom_contact).charAt(0)}
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
                    {safe(contact.nom_contact)} {safe(contact.prenom_contact)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Téléphone :</strong> {safe(contact.telephone_contact)}<br />
                    <strong>Email :</strong> {safe(contact.email_contact)}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleShowDetail(contact)}
                    sx={{ mr: 1 }}
                  >
                    Détails
                  </Button>
                
                </Box>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" sx={{ width: '100%', textAlign: 'center', mt: 3 }}>
              Aucun contact trouvé
            </Typography>
          )}
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
        <ContactDetailModal
          open={showDetailModal}
          contact={selectedContact}
          onClose={handleCloseDetail}
        />
      </Container>
    </Box>
  );
};

export default ContactsPage;
