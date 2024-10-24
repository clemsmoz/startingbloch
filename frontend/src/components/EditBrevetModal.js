import React, { useEffect } from 'react';
import { Modal, Button, TextField, MenuItem, Typography, Box, Card, CardHeader, CardContent, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { FaUser, FaBuilding, FaListAlt, FaFileAlt } from 'react-icons/fa';
import DeleteIcon from '@mui/icons-material/Delete';
import useBrevetData from '../hooks/useBrevetData';
import useBrevetFormModif from '../hooks/useBrevetFormModif';
import ClientSection from './modificationbrevet/ClientSection';
import InventorsSection from './modificationbrevet/InventorsSection';
import DeposantsSection from './modificationbrevet/DeposantsSection';
import TitulairesSection from './modificationbrevet/TitulairesSection';
import CabinetsSection from './modificationbrevet/CabinetsSection';
import PaysSection from './modificationbrevet/PaysSection';
import CommentSection from './modificationbrevet/CommentSection';

const EditBrevetModal = ({ show, handleClose, brevetId }) => {
  const {
    brevet,
    procedureCabinets,
    annuiteCabinets,
    contactsAnnuite,
    contactsProcedure,
    pays,
    clients,
    inventeurs,
    deposants,
    titulaires,
    statut,
    statutsList,
    handleDeleteClient,
    handleDeleteInventeur,
    handleDeleteDeposant,
    handleDeleteTitulaire,
    handleDeleteProcedureCabinet,
    handleDeleteAnnuiteCabinet,
    handleDeletePays
  } = useBrevetData(brevetId);

  const { formData, setFormData, handleChange, handleSubmit } = useBrevetFormModif(brevetId, brevet, handleClose);

  useEffect(() => {
    if (brevet) {
      setFormData({
        reference_famille: brevet?.reference_famille || '',  // Valeur par défaut vide si null
        titre: brevet?.titre || '',  // Valeur par défaut vide si null
        id_statut: brevet?.id_statut || '',  // Valeur par défaut vide si null
        date_depot: brevet?.date_depot ? new Date(brevet.date_depot).toISOString().split('T')[0] : '',  // Valeur par défaut vide si null
        date_delivrance: brevet?.date_delivrance ? new Date(brevet.date_delivrance).toISOString().split('T')[0] : '',  // Valeur par défaut vide si null
        numero_delivrance: brevet?.numero_delivrance || '',  // Valeur par défaut vide si null
        licence: brevet?.licence ? 'Oui' : 'Non',  // Valeur par défaut "Non"
        commentaire: brevet?.commentaire || '',  // Valeur par défaut vide si null
        piece_jointe: brevet?.piece_jointe || '',  // Valeur par défaut vide si null
        clients: clients || [],  // Tableau vide par défaut
        inventeurs: inventeurs || [],  // Tableau vide par défaut
        titulaires: titulaires || [],  // Tableau vide par défaut
        deposants: deposants || [],  // Tableau vide par défaut
        cabinets_procedure: procedureCabinets || [],  // Tableau vide par défaut
        cabinets_annuite: annuiteCabinets || [],  // Tableau vide par défaut
        contactsProcedure: contactsProcedure || [],  // Tableau vide par défaut
        contactsAnnuite: contactsAnnuite || [],  // Tableau vide par défaut
        pays: pays || [],  // Tableau vide par défaut
      });
    }
  }, [brevet, clients, inventeurs, titulaires, deposants, procedureCabinets, annuiteCabinets, contactsProcedure, contactsAnnuite, pays, setFormData]);

  // Ajout de vérification pour éviter des erreurs d'accès à des propriétés nulles
  if (!brevet) {
    return null; // Si brevet est null, on ne rend rien (évite les erreurs)
  }

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={{ padding: 4, backgroundColor: '#fff', maxWidth: '1500px', maxHeight: '90vh', margin: 'auto', mt: 5, borderRadius: 2, overflowY: 'auto' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Modifications du Brevet
        </Typography>

        {/* Clients Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Clients" />
          <CardContent>
            {clients.length > 0 ? (
              clients.map((client, index) => (
                <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography>{client.nom_client}</Typography>
                  <IconButton onClick={() => handleDeleteClient(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography>Aucun client associé</Typography>
            )}
          </CardContent>
        </Card>

        <ClientSection />

        {/* Informations Générales */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Informations Générales" />
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Référence Famille"
                name="reference_famille"
                value={formData.reference_famille}
                onChange={(e) => handleChange(e, 'reference_famille')}
              />
              <TextField
                label="Titre"
                name="titre"
                value={formData.titre}
                onChange={(e) => handleChange(e, 'titre')}
              />
              <TextField
                select
                label="Statut"
                name="id_statut"
                value={formData.id_statut}
                onChange={(e) => handleChange(e, 'id_statut')}
              >
                <MenuItem value={statut ? statut.id_statuts : ''}>
                  {statut ? statut.valeur : 'N/A'}
                </MenuItem>
                {statutsList && statutsList.map((st) => (
                  <MenuItem key={st.id_statuts} value={st.id_statuts}>
                    {st.valeur}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date Dépôt"
                type="date"
                name="date_depot"
                value={formData.date_depot}
                onChange={(e) => handleChange(e, 'date_depot')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date Délivrance"
                type="date"
                name="date_delivrance"
                value={formData.date_delivrance}
                onChange={(e) => handleChange(e, 'date_delivrance')}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Numéro Délivrance"
                name="numero_delivrance"
                value={formData.numero_delivrance}
                onChange={(e) => handleChange(e, 'numero_delivrance')}
              />
              <TextField
                select
                label="Licence"
                name="licence"
                value={formData.licence}
                onChange={(e) => handleChange(e, 'licence')}
              >
                <MenuItem value="Oui">Oui</MenuItem>
                <MenuItem value="Non">Non</MenuItem>
              </TextField>
            </Box>
          </CardContent>
        </Card>

        {/* Inventeurs Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Inventeurs" avatar={<FaUser />} />
          <CardContent>
            {inventeurs.length > 0 ? (
              inventeurs.map((inventeur, index) => (
                <Box key={index} mb={2} borderBottom={1} borderColor="divider" pb={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      {inventeur.nom} {inventeur.prenom}
                    </Typography>
                    <IconButton onClick={() => handleDeleteInventeur(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField fullWidth label="Email" type="email" defaultValue={inventeur.email} sx={{ mt: 1 }} />
                  <TextField fullWidth label="Téléphone" defaultValue={inventeur.telephone} sx={{ mt: 1 }} />
                </Box>
              ))
            ) : (
              <Typography>Aucun inventeur</Typography>
            )}
          </CardContent>
        </Card>

        <InventorsSection />

        {/* Déposants Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Déposants" avatar={<FaBuilding />} />
          <CardContent>
            {deposants.length > 0 ? (
              deposants.map((deposant, index) => (
                <Box key={index} mb={2} borderBottom={1} borderColor="divider" pb={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      {deposant.nom} {deposant.prenom}
                    </Typography>
                    <IconButton onClick={() => handleDeleteDeposant(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField fullWidth label="Email" type="email" defaultValue={deposant.email} sx={{ mt: 1 }} />
                  <TextField fullWidth label="Téléphone" defaultValue={deposant.telephone} sx={{ mt: 1 }} />
                </Box>
              ))
            ) : (
              <Typography>Aucun déposant</Typography>
            )}
          </CardContent>
        </Card>

        <DeposantsSection />

        {/* Titulaires Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Titulaires" avatar={<FaListAlt />} />
          <CardContent>
            {titulaires.length > 0 ? (
              titulaires.map((titulaire, index) => (
                <Box key={index} mb={2} borderBottom={1} borderColor="divider" pb={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      {titulaire.nom} {titulaire.prenom}
                    </Typography>
                    <IconButton onClick={() => handleDeleteTitulaire(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField fullWidth label="Email" type="email" defaultValue={titulaire.email} sx={{ mt: 1 }} />
                  <TextField fullWidth label="Téléphone" defaultValue={titulaire.telephone} sx={{ mt: 1 }} />
                  <Box mt={1}>
                    <FormControlLabel
                      control={<Checkbox checked={titulaire.executant} />}
                      label="Exécutant"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={titulaire.client_correspondant} />}
                      label="Client Correspondant"
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>Aucun titulaire</Typography>
            )}
          </CardContent>
        </Card>

        <TitulairesSection />

        {/* Cabinets de Procédure Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Cabinets de Procédure" avatar={<FaFileAlt />} />
          <CardContent>
            {procedureCabinets.length > 0 ? (
              procedureCabinets.map((cabinet, index) => (
                <Box key={index} mb={2} borderBottom={1} borderColor="divider" pb={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">{cabinet.nom_cabinet}</Typography>
                    <IconButton onClick={() => handleDeleteProcedureCabinet(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField fullWidth label="Référence" defaultValue={cabinet.reference} sx={{ mt: 1 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cabinet.dernier_intervenant}
                        onChange={(e) => handleChange(e, `procedureCabinets[${index}].dernier_intervenant`)}
                      />
                    }
                    label="Dernier Intervenant"
                  />
                  <Box mt={1}>
                    {contactsProcedure
                      .filter(contact => contact.id_cabinet === cabinet.id_cabinet)
                      .map((contact, idx) => (
                        <Box key={idx} mb={1}>
                          <Typography variant="body2">
                            Contact: {contact.nom} {contact.prenom}
                          </Typography>
                          <Typography variant="body2">Email: {contact.email}</Typography>
                          <Typography variant="body2">Téléphone: {contact.telephone}</Typography>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>Aucun cabinet de procédure</Typography>
            )}
          </CardContent>
        </Card>

        {/* Cabinets d'Annuite Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Cabinets d'Annuite" avatar={<FaFileAlt />} />
          <CardContent>
            {annuiteCabinets.length > 0 ? (
              annuiteCabinets.map((cabinet, index) => (
                <Box key={index} mb={2} borderBottom={1} borderColor="divider" pb={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">{cabinet.nom_cabinet}</Typography>
                    <IconButton onClick={() => handleDeleteAnnuiteCabinet(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField fullWidth label="Référence" defaultValue={cabinet.reference} sx={{ mt: 1 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cabinet.dernier_intervenant}
                        onChange={(e) => handleChange(e, `annuiteCabinets[${index}].dernier_intervenant`)}
                      />
                    }
                    label="Dernier Intervenant"
                  />
                  <Box mt={1}>
                    {contactsAnnuite
                      .filter(contact => contact.id_cabinet === cabinet.id_cabinet)
                      .map((contact, idx) => (
                        <Box key={idx} mb={1}>
                          <Typography variant="body2">
                            Contact: {contact.nom} {contact.prenom}
                          </Typography>
                          <Typography variant="body2">Email: {contact.email}</Typography>
                          <Typography variant="body2">Téléphone: {contact.telephone}</Typography>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>Aucun cabinet d'annuité</Typography>
            )}
          </CardContent>
        </Card>

        <CabinetsSection />

        {/* Pays Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Pays" />
          <CardContent>
            {pays.length > 0 ? (
              pays.map((p, index) => (
                <Box key={index} mb={2} borderBottom={1} borderColor="divider" pb={2}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">Pays: {p.nom_fr_fr}</Typography>
                    <IconButton onClick={() => handleDeletePays(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField fullWidth label="Numéro de Dépôt" defaultValue={p.numero_depot} sx={{ mt: 1 }} />
                  <TextField fullWidth label="Numéro de Publication" defaultValue={p.numero_publication} sx={{ mt: 1 }} />
                </Box>
              ))
            ) : (
              <Typography>Aucun pays associé</Typography>
            )}
          </CardContent>
        </Card>

        <PaysSection />

        {/* Commentaire Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Commentaire et Pièce Jointe" avatar={<FaFileAlt />} />
          <CardContent>
            <TextField
              label="Commentaire"
              multiline
              rows={4}
              defaultValue={brevet.commentaire}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Pièce Jointe"
              defaultValue={brevet.piece_jointe}
              fullWidth
            />
          </CardContent>
        </Card>

        <CommentSection />

        {/* Boutons d'action */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} variant="outlined" sx={{ mr: 2 }}>
            Fermer
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Enregistrer
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditBrevetModal;
