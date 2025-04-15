import React, { useState } from 'react';
import { Drawer, IconButton, List, ListItem, ListItemText, ListItemIcon, Box } from '@mui/material';
import { FaBars, FaBuilding, FaUser, FaFileContract, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct
import { blue, blueGrey } from '@mui/material/colors';

const Sidebar = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const handleLogout = () => {
    navigate('/deconnection');
    // Logic for logout
  };

  return (
    <>
      <IconButton color="primary" onClick={toggleDrawer(true)} sx={{ fontSize: 32 }}>
        <FaBars />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 400, padding: 2 }}>
          {/* Logo de l'entreprise */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>

          <List>
            <ListItem button onClick={() => { navigate('/cabinets'); setOpen(false); }} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaBuilding size={40}  color="#1976D2" />
              </ListItemIcon>
              <ListItemText primary="Portefeuille de Cabinets" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
            </ListItem>
            <ListItem button onClick={() => { navigate('/clients'); setOpen(false); }} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaUser size={40} color="#1976D2" />
              </ListItemIcon>
              <ListItemText primary="Portefeuille Clients" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
            </ListItem>
            <ListItem button onClick={() => { navigate('/portefeuille-brevet'); setOpen(false); }} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaFileContract size={40}  color="#1976D2" />
              </ListItemIcon>
              <ListItemText primary="Portefeuille de Brevets" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
            </ListItem>
            {/* <ListItem button onClick={() => { navigate('/BrevetsList'); setOpen(false); }} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaFlask size={28} color="primary" />
              </ListItemIcon>
              <ListItemText primary="Portefeuille de Brevets TEST" primaryTypographyProps={{ fontSize: 20, color: 'primary.main' }} />
            </ListItem> */}
            <ListItem button onClick={() => { navigate('/home'); setOpen(false); }} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaHome size={40}  color="#1976D2" />
              </ListItemIcon>
              <ListItemText primary="Accueil" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
            </ListItem>
            <ListItem button onClick={handleLogout} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaSignOutAlt size={40}  color="#1976D2" />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
