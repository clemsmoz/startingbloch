import React from 'react';
import Sidebar from '../components/Sidebar';
import T from '../components/T';
import { useNavigate } from 'react-router-dom';
import { CardContent, Typography, Container, Button, Avatar, Box, Stack, Card, CardActions } from '@mui/material';
import { FaBuilding, FaUsers, FaFileContract } from 'react-icons/fa';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct

const HomePage = () => {
  const navigate = useNavigate();

  const cardData = [
    {
      title: "Portefeuille cabinets",
      description: "Accédez à votre portefeuille de cabinets.",
      icon: <FaBuilding size={40} color="primary"/>,
      navigateTo: '/cabinets',
    },
    {
      title: "Portefeuille clients", 
      description: "Accédez à votre portefeuille de clients.",
      icon: <FaUsers size={40} color="primary"/>,
      navigateTo: '/clients',
    },
    {
      title: "Portefeuille brevets",
      description: "Accédez à votre portefeuille de brevets.",
      icon: <FaFileContract size={40} color="primary"/>,
      navigateTo: '/portefeuille-brevet',
    },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container sx={{ flexGrow: 1, p: 4 }}>
        
        {/* Logo de l'entreprise */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: '250px' }} />
        </Box>
        
        <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4, textAlign: 'center' }}>
          <T>Accueil</T>
        </Typography>
        
        <Stack direction="row" justifyContent="space-between" spacing={4} sx={{ flexWrap: 'wrap' }}>
          {cardData.map((card, index) => (
            <Box key={index} sx={{ width: '30%', mb: 4 }}>
              <Card sx={{ height: '100%', borderRadius: '20px', boxShadow: 6, padding: 2, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mb: 2 }}>
                    {card.icon}
                  </Avatar>
                  <Typography variant="h4" color="primary" component="div" fontWeight="bold">
                    <T>{card.title}</T>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1, mt: 2 }}>
                    <T>{card.description}</T>
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button size="large" variant="contained" onClick={() => navigate(card.navigateTo)}>
                    <T>Accéder</T>
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
