import React, { useState } from 'react';
import { saveAs } from 'file-saver';

import { Drawer, IconButton, List, ListItem, ListItemText, ListItemIcon, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import { FaBars, FaBuilding, FaUser, FaFileContract, FaHome, FaSignOutAlt, FaUsersCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/startigbloch_transparent_corrected.png'; // Assurez-vous que le chemin du logo est correct
import { blue, blueGrey } from '@mui/material/colors';
import cacheService from '../services/cacheService'; // Ajout pour récupérer l'utilisateur connecté

const Sidebar = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Récupère l'utilisateur connecté (depuis le cache/localStorage)
  const user = typeof cacheService.get === "function"
    ? cacheService.get('user')
    : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);

  const isAdmin = user && user.role === 'admin';

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const handleLogout = () => {
    navigate('/deconnection');
    // Logic for logout
  };

  // Nouveaux états pour la modale de téléchargement
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Fonction pour télécharger la base de données (admin uniquement)
  const handleDownloadDb = async () => {
    if (!isAdmin) return;
    setShowDownloadModal(true);
  };

  // Fonction appelée lors de la confirmation dans la modale
  const confirmDownloadDb = async () => {
    setShowDownloadModal(false);
    try {
      const user = typeof cacheService.get === "function"
        ? cacheService.get('user')
        : (typeof window !== "undefined" && window.localStorage
            ? JSON.parse(window.localStorage.getItem('user') || 'null')
            : null);

      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors du téléchargement de la base.");
        return;
      }
      // Récupère le blob et déclenche le téléchargement
      const blob = await response.blob();

      // Demande à l'utilisateur où enregistrer le fichier (si possible)
      let fileName = 'database.sqlite';
      // Pour Electron ou navigateurs supportant showSaveFilePicker
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'Fichier SQLite', accept: { 'application/octet-stream': ['.sqlite'] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setDownloadSuccess(true);
          return;
        } catch (e) {
          // Si l'utilisateur annule, ne rien faire
          return;
        }
      } else {
        // Fallback classique navigateur
        saveAs(blob, fileName);
        setDownloadSuccess(true);
      }
    } catch (e) {
      alert("Erreur lors du téléchargement de la base : " + (e.message || e));
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={toggleDrawer(true)} sx={{ fontSize: 32 }}>
        <FaBars />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 400, padding: 2 }}>
          {/* Logo de l'entreprise */}
          <Box sx={{ mb: 1.5, textAlign: 'center' }}>
            <img src={logo} alt="Logo de l'entreprise" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
          {/* Affichage du nom et prénom de l'utilisateur connecté */}
          {user && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Bienvenue {user.prenom_user || ''} {user.nom_user || ''}
              </Typography>
            </Box>
          )}
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
            {isAdmin && (
              <ListItem button onClick={() => { navigate('/user-management'); setOpen(false); }} sx={{ padding: 3 }}>
                <ListItemIcon>
                  <FaUsersCog size={40} color="#1976D2" />
                </ListItemIcon>
                <ListItemText primary="Gestion des utilisateurs" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
              </ListItem>
            )}
            {isAdmin && (
              <ListItem button onClick={handleDownloadDb} sx={{ padding: 3 }}>
                <ListItemIcon>
                  <FaFileContract size={40} color="#1976D2" />
                </ListItemIcon>
                <ListItemText primary="Télécharger la base SQLite" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
              </ListItem>
            )}
            <ListItem button onClick={handleLogout} sx={{ padding: 3 }}>
              <ListItemIcon>
                <FaSignOutAlt size={40}  color="#1976D2" />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontSize: 20, color: 'primary.main', fontWeight:"bold" }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Modale de confirmation de téléchargement */}
      <Dialog open={showDownloadModal} onClose={() => setShowDownloadModal(false)}>
        <DialogTitle>Choisir le dossier de téléchargement</DialogTitle>
        <DialogContent>
          <Typography>
            Le fichier <b>database.sqlite</b> va être téléchargé.<br />
            Cliquez sur "Télécharger" pour choisir le dossier de destination.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowDownloadModal(false)} color="secondary">
            Annuler
          </MuiButton>
          <MuiButton onClick={confirmDownloadDb} color="primary" variant="contained">
            Télécharger
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Message de succès */}
      <Dialog open={downloadSuccess} onClose={() => setDownloadSuccess(false)}>
        <DialogTitle>Téléchargement terminé</DialogTitle>
        <DialogContent>
          <Typography>
            La base de données a bien été téléchargée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDownloadSuccess(false)} color="primary" autoFocus>
            OK
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
