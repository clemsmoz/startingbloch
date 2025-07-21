import React from 'react';
import {
  Dialog,
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
import CloseIcon from '@mui/icons-material/Close';
import { FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import T from '../components/T';
import useBrevetFormModif from '../hooks/useBrevetFormModif';

const EditBrevetModal = ({ show, brevetId, handleClose }) => {
  const {
    formData,
    clients,
    statuts,
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    loading,
    handleChange,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    handleSubmit: handleUpdateSubmit,
    fetchContacts,
    handleDynamicChangeForSubField,
    handleAddSubField,
    handleRemoveSubField,
    getCountriesForSelection
  } = useBrevetFormModif(brevetId, handleClose);

  return (
    <Dialog open={show} onClose={handleClose} fullWidth maxWidth="xl">
      <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Card sx={{ maxHeight: '80%', p: 4, position: 'relative' }}>
          <IconButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, display: 'flex' }}>
            <CloseIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 4 }}>
            <T>Modifier le brevet</T>
          </Typography>
          <form onSubmit={handleUpdateSubmit}>
            {/* Clients */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Clients</T></Typography>
              {(formData.clients||[]).map((client,index)=>(
                <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mt:2 }}>
                  <FormControl fullWidth>
                    <InputLabel><T>Client</T></InputLabel>
                    <Select value={client.id_client||''} name="id_client" onChange={e=>handleDynamicChange(e,index,'clients')}>
                      <MenuItem value=""><T>Sélectionner un client</T></MenuItem>
                      {clients.map(opt => (
                        <MenuItem key={opt.id_client || opt.id} value={opt.id_client || opt.id}>
                          {opt.nom_client || opt.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button variant="contained" color="error"onClick={()=>handleRemoveField(index,'clients')} sx={{ height:'56px' }}><FaMinus/></Button>
                </Stack>
              ))}
              <Button variant="contained" color="primary"onClick={()=>handleAddField('clients')} sx={{ mt:2 }}><FaPlus/><T>Ajouter un client</T></Button>
            </Card>

            {/* Informations Générales */}
            <Card sx={{ mb:3,p:2 }}>
              <Typography variant="h5"><T>Informations Générales</T></Typography>
              <Stack spacing={2} sx={{ mt:2 }}>
                <TextField fullWidth label={<T><T>Référence Famille</T></T>} name="reference_famille" value={formData.reference_famille} onChange={handleChange}/>
                <TextField fullWidth label={<T><T>Titre</T></T>} name="titre" value={formData.titre} onChange={handleChange}/>
              </Stack>
            </Card>

            {/* Informations de dépôt */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Informations de dépôt</T></Typography>
              {(formData.infos_depot || []).map((info, index) => (
                <Box key={index} sx={{ mb: 2, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                  {/* Pays + Numéro de dépôt */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel><T>Pays</T></InputLabel>
                      <Select
                        name="id_pays" value={String(info.id_pays || '')}
                        onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                      >
                        <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                        {getCountriesForSelection().map(p => (
                          <MenuItem key={p.id_pays || p.id} value={String(p.id_pays || p.id)}>
                            {p.nom_fr_fr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label={<T><T>Numéro de dépôt</T></T>}
                      name="numero_depot" value={info.numero_depot || ''}
                      onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                    />
                  </Stack>

                  {/* Numéros de publication & délivrance */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label={<T><T>Numéro de publication</T></T>}
                      name="numero_publication" value={info.numero_publication || ''}
                      onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                    />
                    <TextField
                      fullWidth
                      label={<T><T>Numéro de délivrance</T></T>}
                      name="numero_delivrance" value={info.numero_delivrance || ''}
                      onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                    />
                  </Stack>

                  {/* Dates */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      type="date" label={<T><T>Date de dépôt</T></T>}
                      name="date_depot" value={info.date_depot || ''}
                      onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      type="date" label={<T><T>Date de publication</T></T>}
                      name="date_publication" value={info.date_publication || ''}
                      onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      type="date" label={<T><T>Date de délivrance</T></T>}
                      name="date_delivrance" value={info.date_delivrance || ''}
                      onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>

                  {/* Statut global + Licence */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl fullWidth>
                      <InputLabel><T>Statut</T></InputLabel>
                      <Select
                        name="id_statuts" value={info.id_statuts || ''}
                        onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                      >
                        <MenuItem value=""><T>Sélectionner un statut</T></MenuItem>
                        {statuts.map(s => (
                          <MenuItem key={s.id_statuts} value={s.id_statuts}>
                            {s.valeur}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="licence" checked={Boolean(info.licence)}
                          onChange={e => handleDynamicChange(e, index, 'infos_depot')}
                        />
                      }
                      label={<T><T>Licence</T></T>}
                    />
                    <Button color="error" onClick={() => handleRemoveField(index, 'infos_depot')}>
                      <FaMinus />
                    </Button>
                  </Stack>
                </Box>
              ))}
              <Button variant="contained" color="primary"onClick={() => handleAddField('infos_depot')}>
                <FaPlus /> Ajouter info dépôt
              </Button>
            </Card>

            {/* Inventeurs */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Inventeurs</T></Typography>
              {(formData.inventeurs || []).map((item, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                  <TextField
                    fullWidth label={<T><T>Nom</T></T>} name="nom_inventeur" value={item.nom_inventeur} onChange={e => handleDynamicChange(e, idx, 'inventeurs')}
                  />
                  <TextField
                    fullWidth label={<T><T>Prénom</T></T>} name="prenom_inventeur" value={item.prenom_inventeur} onChange={e => handleDynamicChange(e, idx, 'inventeurs')}
                  />
                  <TextField
                    fullWidth label={<T><T>Email</T></T>} name="email_inventeur" type="email"value={item.email_inventeur} onChange={e => handleDynamicChange(e, idx, 'inventeurs')}
                  />
                  <TextField
                    fullWidth label={<T><T>Téléphone</T></T>} name="telephone_inventeur" type="tel"value={item.telephone_inventeur} onChange={e => handleDynamicChange(e, idx, 'inventeurs')}
                  />
                  <Button color="error" onClick={() => handleRemoveField(idx, 'inventeurs')}><FaMinus/></Button>
                </Stack>
              ))}
              <Button onClick={() => handleAddField('inventeurs')} sx={{ mt: 2 }}><FaPlus/><T>Ajouter un inventeur</T></Button>
            </Card>

            {/* Déposants */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Déposants</T></Typography>
              {(formData.deposants || []).map((item, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                  <TextField
                    fullWidth label={<T><T>Nom</T></T>} name="nom_deposant" value={item.nom_deposant} onChange={e => handleDynamicChange(e, idx, 'deposants')}
                  />
                  <TextField
                    fullWidth label={<T><T>Prénom</T></T>} name="prenom_deposant" value={item.prenom_deposant} onChange={e => handleDynamicChange(e, idx, 'deposants')}
                  />
                  <TextField
                    fullWidth label={<T><T>Email</T></T>} name="email_deposant" type="email"value={item.email_deposant} onChange={e => handleDynamicChange(e, idx, 'deposants')}
                  />
                  <TextField
                    fullWidth label={<T><T>Téléphone</T></T>} name="telephone_deposant" type="tel"value={item.telephone_deposant} onChange={e => handleDynamicChange(e, idx, 'deposants')}
                  />
                  <Button color="error" onClick={() => handleRemoveField(idx, 'deposants')}><FaMinus/></Button>
                </Stack>
              ))}
              <Button onClick={() => handleAddField('deposants')} sx={{ mt: 2 }}><FaPlus/><T>Ajouter un déposant</T></Button>
            </Card>

            {/* Titulaires */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Titulaires</T></Typography>
              {(formData.titulaires || []).map((item, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                  <TextField
                    fullWidth label={<T><T>Nom</T></T>} name="nom_titulaire" value={item.nom_titulaire} onChange={e => handleDynamicChange(e, idx, 'titulaires')}
                  />
                  <TextField
                    fullWidth label={<T><T>Prénom</T></T>} name="prenom_titulaire" value={item.prenom_titulaire} onChange={e => handleDynamicChange(e, idx, 'titulaires')}
                  />
                  <TextField
                    fullWidth label={<T><T>Email</T></T>} name="email_titulaire" type="email"value={item.email_titulaire} onChange={e => handleDynamicChange(e, idx, 'titulaires')}
                  />
                  <TextField
                    fullWidth label={<T><T>Téléphone</T></T>} name="telephone_titulaire" type="tel"value={item.telephone_titulaire} onChange={e => handleDynamicChange(e, idx, 'titulaires')}
                  />
                  <FormControlLabel control={
                    <Checkbox name="executant" checked={item.executant || false}
                      onChange={e => handleDynamicChange(e, idx, 'titulaires')} />
                  } label={<T><T>Exécutant</T></T>} />
                  <FormControlLabel control={
                    <Checkbox name="client_correspondant" checked={item.client_correspondant || false}
                      onChange={e => handleDynamicChange(e, idx, 'titulaires')} />
                  } label={<T><T>Client Correspondant</T></T>} />
                  <Button color="error" onClick={() => handleRemoveField(idx, 'titulaires')}><FaMinus/></Button>
                </Stack>
              ))}
              <Button onClick={() => handleAddField('titulaires')} sx={{ mt: 2 }}><FaPlus/><T>Ajouter un titulaire</T></Button>
            </Card>

            {/* Cabinets de Procédure */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Cabinets de Procédure et Contacts</T></Typography>
              {(formData.cabinets_procedure || []).map((item, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl fullWidth>
                      <InputLabel><T>Cabinet</T></InputLabel>
                      <Select name="id_cabinet" value={item.id_cabinet||''}
                        onChange={e => { handleDynamicChange(e, idx, 'cabinets_procedure'); fetchContacts(e.target.value, 'procedure'); }}>
                        <MenuItem value=""><T>Sélectionner</T></MenuItem>
                        {cabinets.procedure.map(c => (
                          <MenuItem key={c.id} value={c.id}>{c.nom_cabinet}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField fullWidth label={<T><T>Référence</T></T>} name="reference" value={item.reference||''} onChange={e=>handleDynamicChange(e, idx, 'cabinets_procedure')} />
                    <FormControlLabel control={
                      <Checkbox name="dernier_intervenant" checked={item.dernier_intervenant||false}
                        onChange={e=>handleDynamicChange(e, idx, 'cabinets_procedure')} />
                    } label={<T><T>Dernier Intervenant</T></T>} />
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel><T>Contact</T></InputLabel>
                      <Select name="id_contact" value={item.id_contact||''}
                        onChange={e=>handleDynamicChange(e, idx, 'cabinets_procedure')}>
                        <MenuItem value=""><T>Sélectionner un contact</T></MenuItem>
                        {contactsProcedure.map(c => (
                          <MenuItem key={c.id_contact || c.id} value={c.id_contact || c.id}>
                            {(c.nom_contact || c.nom) + ' ' + (c.prenom_contact || c.prenom)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button color="error" onClick={() => handleRemoveField(idx, 'cabinets_procedure')}><FaMinus/></Button>
                  </Stack>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays associés</T></Typography>
                  {(item.pays || []).map((p, pIndex) => (
                    <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel><T>Pays</T></InputLabel>
                        <Select
                          name="id_pays" value={String(p.id_pays || '')}
                          onChange={e => handleDynamicChangeForSubField(e, idx, 'cabinets_procedure', 'pays', pIndex)}
                        >
                          <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                          {getCountriesForSelection().map(cp => (
                            <MenuItem key={cp.id_pays || cp.id} value={String(cp.id_pays || cp.id)}>
                              {cp.nom_fr_fr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button color="error" onClick={() => handleRemoveSubField(idx, 'cabinets_procedure', 'pays', pIndex)}><FaMinus/></Button>
                    </Stack>
                  ))}
                  <Button onClick={() => handleAddSubField(idx, 'cabinets_procedure', 'pays')} sx={{ mt: 1 }}><FaPlus/><T>Ajouter un pays</T></Button>
                </Box>
              ))}
              <Button onClick={() => handleAddField('cabinets_procedure')} sx={{ mt: 2 }}><FaPlus/><T>Ajouter cabinet proc.</T></Button>
            </Card>

            {/* Cabinets d'Annuité */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Cabinets d'Annuité et Contacts</T></Typography>
              {(formData.cabinets_annuite || []).map((item, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl fullWidth>
                      <InputLabel><T>Cabinet</T></InputLabel>
                      <Select name="id_cabinet" value={item.id_cabinet||''}
                        onChange={e => { handleDynamicChange(e, idx, 'cabinets_annuite'); fetchContacts(e.target.value, 'annuite'); }}>
                        <MenuItem value=""><T>Sélectionner</T></MenuItem>
                        {cabinets.annuite.map(c => (
                          <MenuItem key={c.id} value={c.id}>{c.nom_cabinet}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField fullWidth label={<T><T>Référence</T></T>} name="reference" value={item.reference||''} onChange={e=>handleDynamicChange(e, idx, 'cabinets_annuite')} />
                    <FormControlLabel control={
                      <Checkbox name="dernier_intervenant" checked={item.dernier_intervenant||false}
                        onChange={e=>handleDynamicChange(e, idx, 'cabinets_annuite')} />
                    } label={<T><T>Dernier Intervenant</T></T>} />
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel><T>Contact</T></InputLabel>
                      <Select name="id_contact" value={item.id_contact||''}
                        onChange={e=>handleDynamicChange(e, idx, 'cabinets_annuite')}>
                        <MenuItem value=""><T>Sélectionner un contact</T></MenuItem>
                        {contactsAnnuite.map(c => (
                          <MenuItem key={c.id_contact || c.id} value={c.id_contact || c.id}>
                            {(c.nom_contact || c.nom) + ' ' + (c.prenom_contact || c.prenom)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button color="error" onClick={() => handleRemoveField(idx, 'cabinets_annuite')}><FaMinus/></Button>
                  </Stack>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}><T>Pays associés</T></Typography>
                  {(item.pays || []).map((p, pIndex) => (
                    <Stack key={pIndex} direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                      <FormControl fullWidth>
                        <InputLabel><T>Pays</T></InputLabel>
                        <Select
                          name="id_pays" value={String(p.id_pays || '')}
                          onChange={e => handleDynamicChangeForSubField(e, idx, 'cabinets_annuite', 'pays', pIndex)}
                        >
                          <MenuItem value=""><T>Sélectionner un pays</T></MenuItem>
                          {getCountriesForSelection().map(cp => (
                            <MenuItem key={cp.id_pays || cp.id} value={String(cp.id_pays || cp.id)}>
                              {cp.nom_fr_fr}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button color="error" onClick={() => handleRemoveSubField(idx, 'cabinets_annuite', 'pays', pIndex)}><FaMinus/></Button>
                    </Stack>
                  ))}
                  <Button onClick={() => handleAddSubField(idx, 'cabinets_annuite', 'pays')} sx={{ mt: 1 }}><FaPlus/><T>Ajouter un pays</T></Button>
                </Box>
              ))}
              <Button onClick={() => handleAddField('cabinets_annuite')} sx={{ mt: 2 }}><FaPlus/><T>Ajouter cabinet annuité</T></Button>
            </Card>

            {/* Commentaire */}
            <Card sx={{ mb: 3, p: 2 }}>
              <Typography variant="h5"><T>Commentaire</T></Typography>
              <TextField
                fullWidth multiline rows={4}
                name="commentaire" value={formData.commentaire||''}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </Card>

            {/* Bouton de soumission */}
            <Button variant="contained" color="primary"type="submit"fullWidth disabled={loading}
              startIcon={loading ? <CircularProgress size={20}/> : <FaSave/>}>
              {loading ? 'En cours...' : 'Modifier'}
            </Button>
          </form>
        </Card>
      </Box>
    </Dialog>
  );
};

export default EditBrevetModal;
