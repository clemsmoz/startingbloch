import React from 'react';
import {
  Modal,
  TextField,
  Button,
  Card,
  Box,
  Stack,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import useAddBrevet from '../hooks/useAddBrevet';

const AddBrevetModal = ({ show, handleClose }) => {
  const {
    formData,
    clientsList,
    statuts,
    paysList,
    associatedCountries, // Ajout du nouvel état
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    loading,
    handleChange,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    handleSubmit,
    fetchContacts,
    // Fonctions pour gérer les sous-champs "pays"
    handleDynamicChangeForSubField,
    handleAddSubField,
    handleRemoveSubField,
    isError,
    confirmationModal,
    confirmationMessage,
    handleCloseConfirmationModal
  } = useAddBrevet(handleClose);

  // Fonction d'aide pour déterminer quels pays afficher
  const getCountriesForSelection = () => {
    // Si des pays ont été sélectionnés dans les informations de dépôt, on les utilise
    // Sinon, on affiche tous les pays disponibles
    return associatedCountries.length > 0 ? associatedCountries : paysList;
  };

  return (
    <>
      <Modal open={show} onClose={handleClose}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Card
            sx={{
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '80%',
              p: 4,
              position: 'relative',
            }}
          >
            {/* Bouton de fermeture */}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'gray',
              }}
            >
              <CloseIcon sx={{ fontSize: 30 }} />
            </IconButton>
            <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
              Ajouter un nouveau brevet
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Clients */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Clients</Typography>
                {formData.clients.map((client, index) => (
                  <Stack direction="row" spacing={2} key={index} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Client</InputLabel>
                      <Select
                        value={client.id_client || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'clients')}
                        name="id_client"
                        required
                      >
                        <MenuItem value="">Sélectionner un client</MenuItem>
                        {clientsList.map((clientOption) => (
                          <MenuItem key={clientOption.id} value={clientOption.id}>
                            {clientOption.nom_client}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'clients')}
                      sx={{ height: '56px' }}
                    >
                      <FaMinus />
                    </Button>
                  </Stack>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('clients')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un client
                </Button>
              </Card>

              {/* Informations Générales */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Informations Générales</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Référence Famille"
                    name="reference_famille"
                    value={formData.reference_famille}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                  />
                </Stack>
              </Card>

              {/* Nouvelle section : Informations de dépôt */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Informations de dépôt</Typography>
                {formData.informations_depot.map((info, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    {/* Pays et numéro de dépôt */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Pays</InputLabel>
                        <Select
                          value={typeof info?.id_pays !== 'undefined' ? String(info.id_pays) : ''}
                          onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                          name="id_pays"
                          required
                        >
                          <MenuItem value="">Sélectionner un pays</MenuItem>
                          {paysList.map((paysItem) => (
                            <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                              {paysItem.nom_fr_fr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Numéro de dépôt"
                        name="numero_depot"
                        value={info.numero_depot || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                      />
                    </Stack>
                    
                    {/* Numéros de publication et délivrance */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Numéro de publication"
                        name="numero_publication"
                        value={info.numero_publication || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                      />
                      <TextField
                        fullWidth
                        label="Numéro de délivrance"
                        name="numero_delivrance"
                        value={info.numero_delivrance || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                      />
                    </Stack>
                    
                    {/* Dates */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <TextField
                        type="date"
                        label="Date de dépôt"
                        name="date_depot"
                        value={info.date_depot || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        type="date"
                        label="Date de publication"
                        name="date_publication"
                        value={info.date_publication || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        type="date"
                        label="Date de délivrance"
                        name="date_delivrance"
                        value={info.date_delivrance || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Stack>
                    
                    {/* Statut et licence */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <FormControl fullWidth>
                        <InputLabel>Statut</InputLabel>
                        <Select
                          value={info.id_statuts || ''}
                          onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                          name="id_statuts"
                        >
                          <MenuItem value="">Sélectionner un statut</MenuItem>
                          {statuts.map((statut) => (
                            <MenuItem key={statut.id_statuts} value={statut.id_statuts}>
                              {statut.valeur}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(info?.licence)}
                            onChange={(e) => handleDynamicChange(e, index, 'informations_depot')}
                            name="licence"
                          />
                        }
                        label="Licence"
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveField(index, 'informations_depot')}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('informations_depot')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter des informations de dépôt
                </Button>
              </Card>

              {/* Inventeurs */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Inventeurs</Typography>
                {formData.inventeurs.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label="Nom"
                        name="nom_inventeur"
                        value={item.nom_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="prenom_inventeur"
                        value={item.prenom_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email_inventeur"
                        type="email"
                        value={item.email_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <TextField
                        fullWidth
                        label="Téléphone"
                        name="telephone_inventeur"
                        type="tel"
                        value={item.telephone_inventeur || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveField(index, 'inventeurs')}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    {/* Sous-section Pays et Licence pour l'inventeur */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Pays et Licence</Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel>Pays</InputLabel>
                          <Select
                            // Utilisation de String() pour forcer la conversion en chaîne, même si p.id_pays existe
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'inventeurs', pIndex, 'id_pays')
                            }
                            name="id_pays"
                            required
                          >
                            <MenuItem value="">Sélectionner un pays</MenuItem>
                            {/* Utiliser les pays associés ou tous les pays si aucun n'est associé */}
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(p?.licence)}
                              onChange={(e) =>
                                handleDynamicChangeForSubField(e, index, 'inventeurs', pIndex, 'licence')
                              }
                              name="licence"
                            />
                          }
                          label="Licence"
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'inventeurs', pIndex, 'pays')}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'inventeurs', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> Ajouter un pays
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('inventeurs')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un inventeur
                </Button>
              </Card>

              {/* Déposants */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Déposants</Typography>
                {formData.deposants.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label="Nom"
                        name="nom_deposant"
                        value={item.nom_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="prenom_deposant"
                        value={item.prenom_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email_deposant"
                        type="email"
                        value={item.email_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <TextField
                        fullWidth
                        label="Téléphone"
                        name="telephone_deposant"
                        type="tel"
                        value={item.telephone_deposant || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveField(index, 'deposants')}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    {/* Sous-section Pays et Licence pour le déposant */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Pays et Licence</Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel>Pays</InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'deposants', pIndex, 'id_pays')
                            }
                            name="id_pays"
                            required
                          >
                            <MenuItem value="">Sélectionner un pays</MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(p?.licence)}
                              onChange={(e) =>
                                handleDynamicChangeForSubField(e, index, 'deposants', pIndex, 'licence')
                              }
                              name="licence"
                            />
                          }
                          label="Licence"
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'deposants', pIndex, 'pays')}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'deposants', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> Ajouter un pays
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('deposants')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un déposant
                </Button>
              </Card>

              {/* Titulaires */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Titulaires</Typography>
                {formData.titulaires.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        label="Nom"
                        name="nom_titulaire"
                        value={item.nom_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="prenom_titulaire"
                        value={item.prenom_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email_titulaire"
                        type="email"
                        value={item.email_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <TextField
                        fullWidth
                        label="Téléphone"
                        name="telephone_titulaire"
                        type="tel"
                        value={item.telephone_titulaire || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.executant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                            name="executant"
                          />
                        }
                        label="Exécutant"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.client_correspondant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                            name="client_correspondant"
                          />
                        }
                        label="Client Correspondant"
                      />
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveField(index, 'titulaires')}
                        sx={{ height: '56px' }}
                      >
                        <FaMinus />
                      </Button>
                    </Stack>
                    {/* Sous-section Pays et Licence pour le titulaire */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Pays et Licence</Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel>Pays</InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'titulaires', pIndex, 'id_pays')
                            }
                            name="id_pays"
                            required
                          >
                            <MenuItem value="">Sélectionner un pays</MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(p?.licence)}
                              onChange={(e) =>
                                handleDynamicChangeForSubField(e, index, 'titulaires', pIndex, 'licence')
                              }
                              name="licence"
                            />
                          }
                          label="Licence"
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'titulaires', pIndex, 'pays')}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'titulaires', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> Ajouter un pays
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('titulaires')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un titulaire
                </Button>
              </Card>

              {/* Cabinets de Procédure et Contacts - Version modifiée avec multiple pays */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Cabinets de Procédure et Contacts</Typography>
                {formData.cabinets_procedure.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    {/* Cabinet et Référence */}
                    <Stack direction="row" spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Cabinet</InputLabel>
                        <Select
                          value={item.id_cabinet || ''}
                          onChange={(e) => {
                            handleDynamicChange(e, index, 'cabinets_procedure');
                            fetchContacts(e.target.value, 'procedure');
                          }}
                          name="id_cabinet"
                          required
                        >
                          <MenuItem value="">Sélectionner un cabinet</MenuItem>
                          {(cabinets?.procedure || []).map((cabinet) => (
                            <MenuItem key={cabinet.id} value={cabinet.id}>
                              {cabinet.nom_cabinet}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Référence"
                        name="reference"
                        value={item.reference || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                        required
                      />
                    </Stack>

                    {/* Dernier Intervenant et Contact */}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.dernier_intervenant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                            name="dernier_intervenant"
                          />
                        }
                        label="Dernier Intervenant"
                      />
                      <FormControl fullWidth>
                        <InputLabel>Contact</InputLabel>
                        <Select
                          value={item.id_contact || ''}
                          onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                          name="id_contact"
                        >
                          <MenuItem value="">Sélectionner un contact</MenuItem>
                          {Array.isArray(contactsProcedure) && contactsProcedure.map((contact) => (
                            <MenuItem key={contact.id} value={contact.id}>
                              {contact.nom_contact} {contact.prenom_contact}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Pays - Version avec multiples pays */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Pays</Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel>Pays</InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'cabinets_procedure', pIndex, 'id_pays')
                            }
                            name="id_pays"
                            required
                          >
                            <MenuItem value="">Sélectionner un pays</MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'cabinets_procedure', pIndex, 'pays')}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'cabinets_procedure', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> Ajouter un pays
                    </Button>

                    {/* Bouton pour supprimer le cabinet entier */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'cabinets_procedure')}
                      sx={{ mt: 2, width: '100%' }}
                    >
                      <FaMinus /> Supprimer ce cabinet
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('cabinets_procedure')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un cabinet de procédure
                </Button>
              </Card>

              {/* Cabinets d'Annuité et Contacts - Version modifiée avec multiple pays */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Cabinets d'Annuité et Contacts</Typography>
                {formData.cabinets_annuite.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                    {/* Cabinet et Référence */}
                    <Stack direction="row" spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Cabinet</InputLabel>
                        <Select
                          value={item.id_cabinet || ''}
                          onChange={(e) => {
                            handleDynamicChange(e, index, 'cabinets_annuite');
                            fetchContacts(e.target.value, 'annuite');
                          }}
                          name="id_cabinet"
                          required
                        >
                          <MenuItem value="">Sélectionner un cabinet</MenuItem>
                          {(cabinets?.annuite || []).map((cabinet) => (
                            <MenuItem key={cabinet.id} value={cabinet.id}>
                              {cabinet.nom_cabinet}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Référence"
                        name="reference"
                        value={item.reference || ''}
                        onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                        required
                      />
                    </Stack>

                    {/* Dernier Intervenant et Contact */}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.dernier_intervenant || false}
                            onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                            name="dernier_intervenant"
                          />
                        }
                        label="Dernier Intervenant"
                      />
                      <FormControl fullWidth>
                        <InputLabel>Contact</InputLabel>
                        <Select
                          value={item.id_contact || ''}
                          onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                          name="id_contact"
                        >
                          <MenuItem value="">Sélectionner un contact</MenuItem>
                          {Array.isArray(contactsAnnuite) && contactsAnnuite.map((contact) => (
                            <MenuItem key={contact.id} value={contact.id}>
                              {contact.nom_contact} {contact.prenom_contact}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    {/* Pays - Version avec multiples pays */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Pays</Typography>
                    {(item.pays || []).map((p, pIndex) => (
                      <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                          <InputLabel>Pays</InputLabel>
                          <Select
                            value={typeof p?.id_pays !== 'undefined' ? String(p.id_pays) : ''}
                            onChange={(e) =>
                              handleDynamicChangeForSubField(e, index, 'cabinets_annuite', pIndex, 'id_pays')
                            }
                            name="id_pays"
                            required
                          >
                            <MenuItem value="">Sélectionner un pays</MenuItem>
                            {getCountriesForSelection().map((paysItem) => (
                              <MenuItem key={paysItem.id} value={String(paysItem.id)}>
                                {paysItem.nom_fr_fr}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveSubField(index, 'cabinets_annuite', pIndex, 'pays')}
                          sx={{ height: '56px' }}
                        >
                          <FaMinus />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddSubField(index, 'cabinets_annuite', 'pays')}
                      sx={{ mt: 1 }}
                    >
                      <FaPlus /> Ajouter un pays
                    </Button>

                    {/* Bouton pour supprimer le cabinet entier */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveField(index, 'cabinets_annuite')}
                      sx={{ mt: 2, width: '100%' }}
                    >
                      <FaMinus /> Supprimer ce cabinet
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddField('cabinets_annuite')}
                  sx={{ mt: 2 }}
                >
                  <FaPlus /> Ajouter un cabinet d'annuité
                </Button>
              </Card>

              {/* Commentaire uniquement */}
              <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h5">Commentaire</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Commentaire"
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Stack>
              </Card>

              {/* Bouton de soumission */}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                disabled={loading}
                onClick={(e) => {
                  // Validation stricte avant soumission
                  if (!formData.reference_famille || !formData.titre) {
                    e.preventDefault();
                    alert('Erreur: La référence et le titre du brevet sont obligatoires.');
                    return false;
                  }
                }}
                startIcon={loading ? <CircularProgress size={20} /> : <FaSave />}
              >
                {loading ? 'En cours...' : 'Ajouter'}
              </Button>
            </form>
          </Card>
        </Box>
      </Modal>

      {/* Modal de confirmation */}
      <Modal open={confirmationModal} onClose={handleCloseConfirmationModal}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Card sx={{ p: 4, width: '400px' }}>
            <Typography variant="h5">{isError ? 'Erreur' : 'Succès'}</Typography>
            <Typography variant="body1" sx={{ my: 2 }}>
              {confirmationMessage}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleCloseConfirmationModal} fullWidth>
              OK
            </Button>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default AddBrevetModal;
