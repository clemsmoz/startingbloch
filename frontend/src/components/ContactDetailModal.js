// Nouveau composant pour afficher le détail d'un contact

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  Stack,
  Paper,
  Grid,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';

const softBlue = "#e3eafc";
const softGrey = "#f7fafd";
const softBorder = "#e0e5ec";
const softPrimary = "#3a506b";
const softSecondary = "#5bc0be";
const softText = "#222b45";
const softSubtle = "#7b8794";

const iconStyle = { mr: 1, color: softSecondary };

const ContactDetailModal = ({ open, contact, onClose }) => {
  const [fullContact, setFullContact] = useState(null);

  useEffect(() => {
    if (contact && contact.id) {
      fetch(`/api/contacts/${contact.id}`)
        .then(res => res.json())
        .then(data => setFullContact(data))
        .catch(() => setFullContact(contact));
    } else {
      setFullContact(contact);
    }
  }, [contact]);

  if (!fullContact) return null;

  const emails = fullContact.emails || fullContact.ContactEmails || [];
  const phones = fullContact.phones || fullContact.ContactPhones || [];
  const roles = fullContact.roles || fullContact.ContactRoles || [];
  const client = fullContact.Client || fullContact.client;
  const cabinet = fullContact.Cabinet || fullContact.cabinet;

  let avatarIcon = <PersonIcon />;
  let avatarColor = softSecondary;
  let entityName = "";
  let entityLabel = "";
  let cabinetType = '';
  let entityFonction = '';
  if (client) {
    avatarIcon = <BusinessIcon />;
    avatarColor = softSecondary;
    entityName = client.nom_client || "";
    entityLabel = "Client";
    entityFonction = client.fonction || client.poste_contact || "";
  } else if (cabinet) {
    avatarIcon = <WorkIcon />;
    avatarColor = "#b5c9d6";
    entityName = cabinet.nom_cabinet || "";
    entityLabel = "Cabinet";
    cabinetType = cabinet.type
      ? (cabinet.type.toLowerCase() === 'annuite' ? 'Annuité' :
         cabinet.type.toLowerCase() === 'procedure' ? 'Procédure' :
         cabinet.type)
      : '';
    entityFonction = cabinet.fonction || cabinet.poste_contact || "";
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Fade in={open}>
        <Paper
          sx={{
            p: 0,
            borderRadius: 5,
            boxShadow: 10,
            bgcolor: softGrey,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${softBorder}`,
          }}
        >
          {/* Bandeau supérieur doux */}
          <Box sx={{
            height: 90,
            bgcolor: softBlue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Avatar sx={{
              bgcolor: avatarColor,
              width: 90,
              height: 90,
              border: '5px solid #fff',
              position: 'absolute',
              left: 32,
              top: 45,
              boxShadow: 2
            }}>
              {avatarIcon}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color={softPrimary} sx={{ letterSpacing: 1 }}>
              Détail du contact
            </Typography>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{ position: 'absolute', right: 16, top: 16, color: softSubtle }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 4, pt: 8 }}>
            <Grid container spacing={3}>
              {/* Colonne gauche : infos principales */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" color={softPrimary} sx={{ mb: 1 }}>
                  {fullContact.nom_contact} {fullContact.prenom_contact}
                </Typography>
                <Typography variant="subtitle1" color={softSubtle} sx={{ mb: 2 }}>
                 Fonction : {fullContact.poste_contact}
                </Typography>
                {/* Affichage de la fonction de l'entité si présente */}
                {entityFonction && (
                  <Typography variant="body2" color={softSubtle} sx={{ mb: 2 }}>
                    Fonction : {entityFonction}
                  </Typography>
                )}
                <Divider sx={{ my: 2, bgcolor: softBorder }} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: softPrimary }}>
                  <EmailIcon sx={iconStyle} /> Emails
                </Typography>
                <List dense>
                  {emails.length > 0 ? emails.map((e, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText primary={e.email || e} sx={{ color: softText }} />
                    </ListItem>
                  )) : <ListItem><ListItemText primary="Aucun" sx={{ color: softSubtle }} /></ListItem>}
                </List>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1, color: softPrimary }}>
                  <PhoneIcon sx={iconStyle} /> Téléphones
                </Typography>
                <List dense>
                  {phones.length > 0 ? phones.map((t, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText primary={t.phone || t} sx={{ color: softText }} />
                    </ListItem>
                  )) : <ListItem><ListItemText primary="Aucun" sx={{ color: softSubtle }} /></ListItem>}
                </List>
              </Grid>
              {/* Colonne droite : rôles et entité */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: softPrimary }}>
                  Rôles
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  {roles.length > 0 ? roles.map((r, i) => (
                    <Chip
                      key={i}
                      label={r.role || r}
                      icon={<PersonIcon sx={{ color: softSecondary }} />}
                      sx={{
                        mb: 1,
                        bgcolor: softBlue,
                        color: softPrimary,
                        border: `1px solid ${softBorder}`,
                        fontWeight: 500
                      }}
                    />
                  )) : (
                    <Chip label="Aucun rôle" sx={{ bgcolor: softGrey, color: softSubtle }} />
                  )}
                </Stack>
                <Divider sx={{ my: 2, bgcolor: softBorder }} />
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Tooltip title={client ? "Client associé" : cabinet ? "Cabinet associé" : ""}>
                    <Chip
                      icon={client ? <BusinessIcon /> : cabinet ? <WorkIcon /> : <PersonIcon />}
                      label={
                        client
                          ? entityName
                          : cabinet
                            ? (cabinetType
                                ? `${entityName} (${cabinetType})`
                                : entityName)
                            : "Aucune entité"
                      }
                      sx={{
                        fontWeight: 600,
                        fontSize: 15,
                        bgcolor: softBlue,
                        color: softPrimary,
                        border: `1px solid ${softBorder}`
                      }}
                    />
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Fade>
    </Dialog>
  );
};

export default ContactDetailModal;
