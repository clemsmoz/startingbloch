import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar';
import T from '../components/T';

const AdminStatutsPage = () => {
  const [statuts, setStatuts] = useState([]);
  const [newStatut, setNewStatut] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [editStatut, setEditStatut] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Charger la liste des statuts
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/statuts`)
      .then(res => res.json())
      .then(data => setStatuts(Array.isArray(data.data) ? data.data : []));
  }, []);

  // Ajouter un nouveau statut
  const handleAddStatut = async () => {
    if (!newStatut.trim()) return;
    const res = await fetch(`${API_BASE_URL}/api/statuts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuts: newStatut, description: newDescription })
    });
    if (res.ok) {
      const data = await res.json();
      setStatuts(prev => [...prev, data]);
      setNewStatut('');
      setNewDescription('');
    }
  };

  // Supprimer un statut
  const handleDeleteStatut = async (id) => {
    if (!window.confirm('<T>Êtes-vous sûr de vouloir supprimer ce statut ?</T>')) return;
    await fetch(`${API_BASE_URL}/api/statuts/${id}`, { method: 'DELETE' });
    setStatuts(prev => prev.filter(s => s.id !== id));
  };

  // Ouvrir la modale d'édition
  const handleEditClick = (statut) => {
    setEditId(statut.id);
    setEditStatut(statut.statuts);
    setEditDescription(statut.description || '');
    setShowEditDialog(true);
  };

  // Sauvegarder la modification
  const handleEditSave = async () => {
    await fetch(`${API_BASE_URL}/api/statuts/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuts: editStatut, description: editDescription })
    });
    setStatuts(prev =>
      prev.map(s =>
        s.id === editId ? { ...s, statuts: editStatut, description: editDescription } : s
      )
    );
    setShowEditDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
          <Typography variant="h4"fontWeight="bold"color="primary"sx={{ mb: 4 }}><T>Gestion des statuts</T></Typography>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6"sx={{ mb: 2 }}><T>Ajouter un nouveau statut</T></Typography>
            <TextField
              label={<T><T>Nom du statut</T></T>}
              value={newStatut}
              onChange={e => setNewStatut(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label={<T><T>Description</T></T>}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"color="primary"startIcon={<Add />}
              onClick={handleAddStatut}
              disabled={!newStatut.trim()}
            ><T><T>Ajouter</T></T></Button>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6"sx={{ mb: 2 }}><T>Liste des statuts</T></Typography>
            <List>
              {statuts.map((statut) => (
                <ListItem
                  key={statut.id}
                  secondaryAction={
                    <>
                      <IconButton edge="end"color="primary"onClick={() => handleEditClick(statut)}>
                        <Edit />
                      </IconButton>
                      <IconButton edge="end"color="error"onClick={() => handleDeleteStatut(statut.id)}>
                        <Delete />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={"{statut.statuts}"}
                    secondary={"{statut.description}"}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          {/* Dialog d'édition */}
          <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
            <DialogTitle><T>Modifier le statut</T></DialogTitle>
            <DialogContent>
              <TextField
                label={<T><T>Nom du statut</T></T>}
                value={editStatut}
                onChange={e => setEditStatut(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label={<T><T>Description</T></T>}
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowEditDialog(false)}><T><T>Annuler</T></T></Button>
              <Button variant="contained"onClick={handleEditSave}><T>Enregistrer</T></Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminStatutsPage;
