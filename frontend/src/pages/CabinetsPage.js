import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CardContent, Typography, Container, Button, Avatar, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaPlus } from 'react-icons/fa';
import AddCabinetModal from '../components/AddCabinetModal';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct

const CabinetsPage = () => {
  const [annuiteCabinets, setAnnuiteCabinets] = useState([]);
  const [procedureCabinets, setProcedureCabinets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // State to manage filter
  const navigate = useNavigate();

  useEffect(() => {
    refreshCabinets();
  }, []);

  const refreshCabinets = () => {
    axios.get('http://localhost:3100/cabinet')
      .then(response => {
        setAnnuiteCabinets(response.data.annuite || []);
        setProcedureCabinets(response.data.procedure || []);
      })
      .catch(error => {
        console.error('There was an error fetching the cabinets!', error);
      });
  };

  const handleCardClick = (id) => {
    navigate(`/contacts?cabinet_id=${id}`);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const filteredCabinets = () => {
    if (filter === 'annuite') return annuiteCabinets;
    if (filter === 'procedure') return procedureCabinets;
    return [...annuiteCabinets, ...procedureCabinets];
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ padding: '20px' }} maxWidth="xl">
        {/* Logo de l'entreprise */}
        <Box sx={{ mb: 4, textAlign: 'center', width: '100%' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
            Gestion des Cabinets
          </Typography>
          <Button variant="contained" color="primary" onClick={handleShowModal} startIcon={<FaPlus />}>
            Ajouter un nouveau Cabinet
          </Button>
        </Box>
        <Box display="flex" gap={2} sx={{ mb: 4 }}>
          <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>
            Tous
          </Button>
          <Button variant={filter === 'annuite' ? 'contained' : 'outlined'} onClick={() => setFilter('annuite')}>
            Cabinets Annuité
          </Button>
          <Button variant={filter === 'procedure' ? 'contained' : 'outlined'} onClick={() => setFilter('procedure')}>
            Cabinets Procédure
          </Button>
        </Box>

        {filter === 'all' || filter === 'annuite' ? (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
              Cabinets Annuité
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {annuiteCabinets.map(cabinet => (
                <Box
                  key={cabinet.id_cabinet}
                  component={Paper}
                  elevation={6}
                  onClick={() => handleCardClick(cabinet.id_cabinet)}
                  sx={{
                    width: 300,
                    padding: 3,
                    borderRadius: 3,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      {cabinet.nom_cabinet.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {cabinet.nom_cabinet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Référence: {cabinet.reference_cabinet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {cabinet.email_cabinet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Téléphone: {cabinet.telephone_cabinet}
                      </Typography>
                      {/* Liste des pays */}
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  {(cabinet.pays || []).map((pays, index) => (
                    <li key={index} style={{ fontSize: '0.9rem', color: '#555' }}>
                      {pays}
                    </li>
                  ))}
                </ul>
                    </Box>
                  </CardContent>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        {filter === 'all' || filter === 'procedure' ? (
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
              Cabinets Procédure
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {procedureCabinets.map(cabinet => (
                <Box
                  key={cabinet.id_cabinet}
                  component={Paper}
                  elevation={6}
                  onClick={() => handleCardClick(cabinet.id_cabinet)}
                  sx={{
                    width: 300,
                    padding: 3,
                    borderRadius: 3,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.05)', cursor: 'pointer' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {cabinet.nom_cabinet.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {cabinet.nom_cabinet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Référence: {cabinet.reference_cabinet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {cabinet.email_cabinet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Téléphone: {cabinet.telephone_cabinet}
                      </Typography>
                     {/* Liste des pays */}
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  {(cabinet.pays || []).map((pays, index) => (
                    <li key={index} style={{ fontSize: '0.9rem', color: '#555' }}>
                      {pays}
                    </li>
                  ))}
                </ul>
                    </Box>
                  </CardContent>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        <AddCabinetModal show={showModal} handleClose={handleCloseModal} refreshCabinets={refreshCabinets} />
      </Container>
    </Box>
  );
};

export default CabinetsPage;
