import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CardContent, Avatar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import T from '../components/T';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AddContactModal from '../components/AddContactModal';
import EditContactModal from '../components/EditContactModal';
import DeleteContactModal from '../components/DeleteContactModal';
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
  const navigate = useNavigate();

  const safe = (val) => val ?? '';

  // Vérification des droits d'écriture
  const user = typeof cacheService?.get === "function" ? cacheService.get('user')
    : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);
  const canWrite = !!(user && (user.role === 'admin' || user.canWrite === true));

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

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ padding: '20px' }} maxWidth="xl">
        {/* Logo de l'entreprise */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>

        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
          <T>Gestion des Contacts</T>
        </Typography>

        <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
          {canWrite && (
            <Button variant="contained" color="primary" onClick={handleShowAddModal} startIcon={<FaPlus />}>
              <T>Ajouter un contact</T>
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate(-1)} 
            sx={{ ml: 2 }}
          >
            <T>Retour</T>
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {safe(contact.nom_contact).charAt(0)}{safe(contact.prenom_contact).charAt(0)}
                  </Avatar>
                  {canWrite && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FaEdit
                        style={{ cursor: 'pointer', color: '#3f51b5' }}
                        onClick={() => handleShowEditModal(contact)}
                      />
                      <FaTrash
                        style={{ cursor: 'pointer', color: '#f44336' }}
                        onClick={() => handleShowDeleteModal(contact)}
                      />
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {safe(contact.nom_contact)} {safe(contact.prenom_contact)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong><T>Téléphone :</T></strong> {safe(contact.telephone_contact)}<br />
                    <strong><T>Email :</T></strong> {safe(contact.email_contact)}<br />
                    <strong><T>Adresse :</T></strong> {safe(contact.adresse_contact)}<br />
                    <strong><T>Code Postal :</T></strong> {safe(contact.code_postal_contact)}<br />
                    <strong><T>Pays :</T></strong> {safe(contact.pays_contact)}
                  </Typography>
                </CardContent>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" sx={{ width: '100%', textAlign: 'center', mt: 3 }}>
              <T>Aucun contact trouvé.</T>
            </Typography>
          )}
        </Box>

        {/* Modaux */}
        <AddContactModal 
          show={showAddModal} 
          handleClose={handleCloseAddModal} 
          refreshContacts={refreshContacts} 
          cabinetId={cabinetId} 
          clientId={clientId} 
        />
        <EditContactModal 
          show={showEditModal} 
          handleClose={handleCloseEditModal} 
          contact={selectedContact} 
          refreshContacts={refreshContacts}
          cabinetId={cabinetId}
          clientId={clientId}
        />
        <DeleteContactModal 
          show={showDeleteModal} 
          handleClose={handleCloseDeleteModal} 
          contact={selectedContact} 
          refreshContacts={refreshContacts}
          cabinetId={cabinetId}
          clientId={clientId}
        />
      </Container>
    </Box>
  );
};

export default ContactsPage;
