import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Paper, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Checkbox, FormControlLabel, Select, MenuItem, Tooltip, Chip, Avatar
} from '@mui/material';
import { FaEdit, FaTrash, FaLock, FaUnlock, FaPlus, FaSync } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';
import cacheService from '../services/cacheService';

const defaultForm = {
  nom_user: '',
  prenom_user: '',
  email_user: '',
  password: '',
  role: 'user',
  canRead: true,
  canWrite: false,
  isBlocked: false,
};

const roleColors = {
  admin: 'primary',
  user: 'default'
};

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [pwdUserId, setPwdUserId] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérifie que seul l'admin accède à la page
  useEffect(() => {
    const user = typeof cacheService.get === "function"
      ? cacheService.get('user')
      : (typeof window !== "undefined" && window.localStorage
        ? JSON.parse(window.localStorage.getItem('user') || 'null')
        : null);
    if (!user || user.role !== 'admin') {
      window.location.href = '/home';
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/users`);
    const data = await res.json();
    setUsers(Array.isArray(data.data) ? data.data : []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenForm = (user = null) => {
    if (user) {
      setForm({
        nom_user: user.nom_user || '',
        prenom_user: user.prenom_user || '',
        email_user: user.email_user || '',
        password: '',
        role: user.role || 'user',
        canRead: !!user.canRead,
        canWrite: !!user.canWrite,
        isBlocked: !!user.isBlocked,
      });
      setEditId(user.id);
    } else {
      setForm(defaultForm);
      setEditId(null);
    }
    setShowForm(true);
  };

  // Correction : rafraîchir la liste aussi lors de la fermeture manuelle de la modale
  const handleCloseForm = () => {
    setShowForm(false);
    setForm(defaultForm);
    setEditId(null);
    setTimeout(() => {
      fetchUsers();
    }, 300);
    console.log('[AdminUserManagementPage] handleCloseForm: setShowForm(false) appelé');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Remplace handleSubmit par cette version pour forcer la fermeture de la modale
  // Correction : rafraîchir la liste APRÈS la fermeture de la modale, mais aussi lors de la fermeture manuelle
  const handleSubmit = async () => {
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_BASE_URL}/api/users/${editId}` : `${API_BASE_URL}/api/users`;
    const body = { ...form };
    if (!editId && !body.password) {
      alert('Le mot de passe est requis à la création.');
      return;
    }
    if (editId && !body.password) delete body.password;
    body.canRead = !!body.canRead;
    body.canWrite = !!body.canWrite;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setShowForm(false);
        setForm(defaultForm);
        setEditId(null);
        setTimeout(() => {
          fetchUsers();
        }, 300);
      } else {
        let errorMsg = 'Erreur lors de la sauvegarde';
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) errorMsg = errorData.error;
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        alert(errorMsg);
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  };

  const handleBlockToggle = async (user) => {
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/users/${user.id}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !user.isBlocked })
    });
    fetchUsers();
    setLoading(false);
  };

  const handleDelete = async (user) => {
    if (!window.confirm('Supprimer ce compte ?')) return;
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/users/${user.id}`, { method: 'DELETE' });
    fetchUsers();
    setLoading(false);
  };

  const handleOpenPwdDialog = (user) => {
    setPwdUserId(user.id);
    setNewPwd('');
    setShowPwdDialog(true);
  };

  const handleResetPwd = async () => {
    if (!newPwd) return;
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/users/${pwdUserId}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPwd })
    });
    setShowPwdDialog(false);
    setLoading(false);
    alert('Mot de passe réinitialisé.');
  };

  const filteredUsers = users.filter(u =>
    (u.nom_user || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.prenom_user || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email_user || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
          Gestion des utilisateurs
        </Typography>
        <Box display="flex" alignItems="center" mb={3}>
          <TextField
            label="Rechercher"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ mr: 2, width: 300 }}
          />
          <Button variant="contained" color="primary" startIcon={<FaPlus />} onClick={() => handleOpenForm()}>
            Créer un utilisateur
          </Button>
          <Button variant="outlined" color="primary" startIcon={<FaSync />} sx={{ ml: 2 }} onClick={fetchUsers}>
            Rafraîchir
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prénom</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rôle</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Lecture</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Écriture</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow
                  key={user.id}
                  sx={{
                    backgroundColor: user.isBlocked ? '#ffeaea' : 'white',
                    '&:hover': { backgroundColor: '#f0f7ff' }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: user.role === 'admin' ? 'primary.main' : 'grey.400', mr: 1 }}>
                        {user.prenom_user?.[0]?.toUpperCase() || user.nom_user?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Typography fontWeight="bold">{user.nom_user}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.prenom_user}</TableCell>
                  <TableCell>
                    <Tooltip title={user.email_user}>
                      <Typography sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email_user}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      color={roleColors[user.role] || 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={!!user.canRead} disabled color="success" />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={!!user.canWrite} disabled color="primary" />
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Chip label="Bloqué" color="error" size="small" />
                    ) : (
                      <Chip label="Actif" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton color="primary" onClick={() => handleOpenForm(user)}>
                        <FaEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.isBlocked ? "Débloquer" : "Bloquer"}>
                      <IconButton color={user.isBlocked ? "success" : "warning"} onClick={() => handleBlockToggle(user)}>
                        {user.isBlocked ? <FaUnlock /> : <FaLock />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton color="error" onClick={() => handleDelete(user)}>
                        <FaTrash />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Réinitialiser le mot de passe">
                      <IconButton color="secondary" onClick={() => handleOpenPwdDialog(user)}>
                        <FaSync />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">Aucun utilisateur trouvé.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog création/modification */}
        <Dialog open={showForm} onClose={handleCloseForm} maxWidth="xs" fullWidth>
          {console.log('[AdminUserManagementPage] Dialog: showForm =', showForm)}
          <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {editId ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Nom"
              name="nom_user"
              value={form.nom_user}
              onChange={handleFormChange}
              fullWidth sx={{ mb: 2 }}
            />
            <TextField
              label="Prénom"
              name="prenom_user"
              value={form.prenom_user}
              onChange={handleFormChange}
              fullWidth sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email_user"
              value={form.email_user}
              onChange={handleFormChange}
              fullWidth sx={{ mb: 2 }}
            />
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              value={form.password}
              onChange={handleFormChange}
              fullWidth sx={{ mb: 2 }}
              autoComplete="new-password"
              placeholder={editId ? "Laisser vide pour ne pas changer" : ""}
            />
            <Select
              label="Rôle"
              name="role"
              value={form.role}
              onChange={handleFormChange}
              fullWidth sx={{ mb: 2 }}
            >
              <MenuItem value="user">Utilisateur</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </Select>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.canRead}
                  onChange={handleFormChange}
                  name="canRead"
                  color="success"
                />
              }
              label="Droit de lecture"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.canWrite}
                  onChange={handleFormChange}
                  name="canWrite"
                  color="primary"
                />
              }
              label="Droit d'écriture"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isBlocked}
                  onChange={handleFormChange}
                  name="isBlocked"
                  color="error"
                />
              }
              label="Bloqué"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Annuler</Button>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
              {editId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog réinitialisation mot de passe */}
        <Dialog open={showPwdDialog} onClose={() => setShowPwdDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogContent>
            <TextField
              label="Nouveau mot de passe"
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPwdDialog(false)}>Annuler</Button>
            <Button variant="contained" color="primary" onClick={handleResetPwd} disabled={loading || !newPwd}>
              Réinitialiser
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminUserManagementPage;
