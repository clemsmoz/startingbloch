import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  Avatar,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaEdit, FaTrash, FaPlus, FaLock, FaUnlock, FaUserShield } from 'react-icons/fa';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
  transition: 'box-shadow 0.3s',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.18)',
  },
  marginBottom: theme.spacing(3),
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: 22,
}));

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nom_user: '',
    prenom_user: '',
    email_user: '',
    password: '',
    role: 'user',
    canRead: true,
    canWrite: false,
    isBlocked: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/users`);
    const data = await res.json();
    setUsers(Array.isArray(data.data) ? data.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Ouvre le formulaire pour création ou édition
  const handleOpenForm = (user = null) => {
    if (user) {
      setEditId(user.id);
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
    } else {
      setEditId(null);
      setForm({
        nom_user: '',
        prenom_user: '',
        email_user: '',
        password: '',
        role: 'user',
        canRead: true,
        canWrite: false,
        isBlocked: false,
      });
    }
    setShowForm(true);
    setShowPassword(false);
  };

  // Ferme le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({
      nom_user: '',
      prenom_user: '',
      email_user: '',
      password: '',
      role: 'user',
      canRead: true,
      canWrite: false,
      isBlocked: false,
    });
    setShowPassword(false);
  };

  // Gère la modification des champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Création ou modification d'un utilisateur
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

    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      setLoading(false);

      if (res.ok) {
        handleCloseForm();
        fetchUsers();
      } else {
        const errorText = await res.text();
        alert('Erreur lors de la sauvegarde\n' + errorText);
      }
    } catch (e) {
      setLoading(false);
      alert('Erreur réseau');
    }
  };

  // Suppression d'un utilisateur
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE' });
    setLoading(false);
    fetchUsers();
  };

  // Blocage/déblocage d'un utilisateur
  const handleBlockToggle = async (user) => {
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/users/${user.id}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !user.isBlocked }),
    });
    setLoading(false);
    fetchUsers();
  };

  // Affichage stylisé
  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
            Gestion des utilisateurs
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Créez, modifiez, bloquez ou supprimez les comptes utilisateurs de la plateforme.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaPlus />}
            onClick={() => handleOpenForm()}
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)'
            }}
          >
            Ajouter un utilisateur
          </Button>
        </Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={48} color="primary" />
          </Box>
        )}
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <StyledPaper>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UserAvatar>
                    {user.prenom_user?.charAt(0) || ''}
                    {user.nom_user?.charAt(0) || ''}
                  </UserAvatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {user.prenom_user} {user.nom_user}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email_user}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title={user.role === 'admin' ? "Administrateur" : "Utilisateur"}>
                    <Chip
                      icon={<FaUserShield size={18} />}
                      label={user.role === 'admin' ? "Admin" : "User"}
                      color={user.role === 'admin' ? "primary" : "default"}
                      size="small"
                      sx={{ ml: 1, fontWeight: 600 }}
                    />
                  </Tooltip>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label={user.canRead ? "Lecture" : "Aucune lecture"}
                    color={user.canRead ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={user.canWrite ? "Écriture" : "Lecture seule"}
                    color={user.canWrite ? "primary" : "default"}
                    size="small"
                  />
                  <Chip
                    label={user.isBlocked ? "Bloqué" : "Actif"}
                    color={user.isBlocked ? "error" : "success"}
                    size="small"
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                {/* Affichage de la dernière connexion */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dernière connexion&nbsp;:{" "}
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), "dd/MM/yyyy HH:mm", { locale: fr })
                      : "Jamais"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title={user.isBlocked ? "Débloquer" : "Bloquer"}>
                    <IconButton color={user.isBlocked ? "success" : "warning"} onClick={() => handleBlockToggle(user)}>
                      {user.isBlocked ? <FaUnlock /> : <FaLock />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton color="primary" onClick={() => handleOpenForm(user)}>
                      <FaEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => handleDelete(user.id)}>
                      <FaTrash />
                    </IconButton>
                  </Tooltip>
                </Box>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>

        {/* Formulaire utilisateur (création/modification) */}
        <Dialog open={showForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
            {editId ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom"
                  name="nom_user"
                  value={form.nom_user}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom"
                  name="prenom_user"
                  value={form.prenom_user}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email_user"
                  value={form.email_user}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={editId ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  sx={{ mb: 2 }}
                  required={!editId}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          onClick={() => setShowPassword(v => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rôle</InputLabel>
                  <Select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    label="Rôle"
                  >
                    <MenuItem value="user">Utilisateur</MenuItem>
                    <MenuItem value="admin">Administrateur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.canRead}
                        onChange={handleChange}
                        name="canRead"
                        color="primary"
                      />
                    }
                    label="Lecture"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.canWrite}
                        onChange={handleChange}
                        name="canWrite"
                        color="primary"
                      />
                    }
                    label="Écriture"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isBlocked}
                        onChange={handleChange}
                        name="isBlocked"
                        color="error"
                      />
                    }
                    label="Bloqué"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm} color="secondary" variant="outlined">
              Annuler
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {editId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminUserManagementPage;
