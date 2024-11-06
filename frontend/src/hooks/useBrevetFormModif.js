import { useState, useEffect } from 'react';
import axios from 'axios';

const useBrevetFormModif = (brevetId, brevet, handleClose, refreshBrevets) => {
  const [formData, setFormData] = useState({
    reference_famille: '',
    titre: '',
    date_depot: '',
    numero_delivrance: '',
    date_delivrance: '',
    licence: false,
    id_statut: '',
    pays: [{ id_pays: '', numero_depot: '', numero_publication: '' }],
    inventeurs: [{ nom_inventeur: '', prenom_inventeur: '', email_inventeur: '', telephone_inventeur: '' }],
    titulaires: [{ nom_titulaire: '', prenom_titulaire: '', email_titulaire: '', telephone_titulaire: '', part_pi: '', executant: false, client_correspondant: false }],
    deposants: [{ nom_deposant: '', prenom_deposant: '', email_deposant: '', telephone_deposant: '' }],
    cabinets_procedure: [{ id_cabinet_procedure: '', reference: '', dernier_intervenant: false, id_contact_procedure: '' }],
    cabinets_annuite: [{ id_cabinet_annuite: '', reference: '', dernier_intervenant: false, id_contact_annuite: '' }],
    commentaire: '',
    piece_jointe: null,
    clients: [{ id_client: '' }]
  });

  const [clients, setClients] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [paysList, setPaysList] = useState([]);
  const [cabinets, setCabinets] = useState({ procedure: [], annuite: [] });
 

  useEffect(() => {
    if (brevetId) {
      axios.get(`http://localhost:3100/brevets/${brevetId}`)
        .then(response => {
          const brevetData = response.data.data;
          setFormData({
            reference_famille: brevetData.reference_famille || '',
            titre: brevetData.titre || '',
            date_depot: brevetData.date_depot ? new Date(brevetData.date_depot).toISOString().split('T')[0] : '',
            numero_delivrance: brevetData.numero_delivrance || '',
            date_delivrance: brevetData.date_delivrance ? new Date(brevetData.date_delivrance).toISOString().split('T')[0] : '',
            licence: brevetData.licence || false,
            id_statut: brevetData.id_statut || '',
            pays: Array.isArray(brevetData.pays) && brevetData.pays.length ? brevetData.pays : [{ id_pays: '', numero_depot: '', numero_publication: '' }],
            inventeurs: brevetData.inventeurs || [{ nom_inventeur: '', prenom_inventeur: '', email_inventeur: '', telephone_inventeur: '' }],
            titulaires: brevetData.titulaires || [{ nom_titulaire: '', prenom_titulaire: '', email_titulaire: '', telephone_titulaire: '', part_pi: '', executant: false, client_correspondant: false }],
            deposants: brevetData.deposants || [{ nom_deposant: '', prenom_deposant: '', email_deposant: '', telephone_deposant: '' }],
            cabinets_procedure: brevetData.cabinets_procedure || [{ id_cabinet_procedure: '', reference: '', dernier_intervenant: false, id_contact_procedure: '' }],
            cabinets_annuite: brevetData.cabinets_annuite || [{ id_cabinet_annuite: '', reference: '', dernier_intervenant: false, id_contact_annuite: '' }],
            commentaire: brevetData.commentaire || '',
            piece_jointe: null,
            clients: brevetData.clients || [{ id_client: '' }]
          });
        })
        .catch(error => console.error('Erreur lors du chargement des données du brevet:', error));
    }

    axios.get('http://localhost:3100/clients')
      .then(response => setClients(response.data.data || []))
      .catch(error => console.error('Erreur lors de la récupération des clients:', error));

    axios.get('http://localhost:3100/statuts')
      .then(response => setStatuts(response.data.data || []))
      .catch(error => console.error('Erreur lors de la récupération des statuts:', error));

    axios.get('http://localhost:3100/pays')
      .then(response => setPaysList(response.data.data || []))
      .catch(error => console.error('Erreur lors de la récupération des pays:', error));

    axios.get('http://localhost:3100/cabinets')
      .then(response => {
        setCabinets({
          procedure: response.data.procedure || [],
          annuite: response.data.annuite || []
        });
      })
      .catch(error => console.error('Erreur lors de la récupération des cabinets:', error));
  }, [brevetId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDynamicChange = (e, index, field) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    if (Array.isArray(formData[field])) {
      const updatedFields = formData[field].map((item, idx) => (
        idx === index ? { ...item, [name]: newValue } : item
      ));

      setFormData(prevData => ({
        ...prevData,
        [field]: updatedFields
      }));
    }
  };

  const handleAddField = (field) => {
    const emptyField = {
      pays: { id_pays: '', numero_depot: '', numero_publication: '' },
      inventeurs: { nom_inventeur: '', prenom_inventeur: '', email_inventeur: '', telephone_inventeur: '' },
      titulaires: { nom_titulaire: '', prenom_titulaire: '', email_titulaire: '', telephone_titulaire: '', part_pi: '', executant: false, client_correspondant: false },
      deposants: { nom_deposant: '', prenom_deposant: '', email_deposant: '', telephone_deposant: '' },
      cabinets_procedure: { id_cabinet_procedure: '', reference: '', dernier_intervenant: false, id_contact_procedure: '' },
      cabinets_annuite: { id_cabinet_annuite: '', reference: '', dernier_intervenant: false, id_contact_annuite: '' }
    }[field];

    if (Array.isArray(formData[field])) {
      setFormData(prevData => ({
        ...prevData,
        [field]: [...prevData[field], emptyField]
      }));
    }
  };

  const handleRemoveField = (index, field) => {
    if (Array.isArray(formData[field])) {
      const updatedFields = formData[field].filter((_, idx) => idx !== index);
      setFormData(prevData => ({
        ...prevData,
        [field]: updatedFields
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSubmit = new FormData();
    dataToSubmit.append('reference_famille', formData.reference_famille);
    dataToSubmit.append('titre', formData.titre);
    dataToSubmit.append('date_depot', formData.date_depot);
    dataToSubmit.append('numero_delivrance', formData.numero_delivrance);
    dataToSubmit.append('date_delivrance', formData.date_delivrance);
    dataToSubmit.append('licence', formData.licence ? 1 : 0);
    dataToSubmit.append('id_statut', formData.id_statut);
    dataToSubmit.append('commentaire', formData.commentaire);
    dataToSubmit.append('clients', JSON.stringify(formData.clients));
    dataToSubmit.append('pays', JSON.stringify(formData.pays));
    dataToSubmit.append('inventeurs', JSON.stringify(formData.inventeurs));
    dataToSubmit.append('titulaires', JSON.stringify(formData.titulaires));
    dataToSubmit.append('deposants', JSON.stringify(formData.deposants));
    dataToSubmit.append('cabinets_procedure', JSON.stringify(formData.cabinets_procedure));
    dataToSubmit.append('cabinets_annuite', JSON.stringify(formData.cabinets_annuite));

    if (formData.piece_jointe) {
      dataToSubmit.append('piece_jointe', formData.piece_jointe);
    }

    axios.put(`http://localhost:3100/brevets/${brevetId}`, dataToSubmit, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        refreshBrevets();
        handleClose();
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour du brevet:', error);
      });
  };

  return {
    formData,
    setFormData,
    clients,
    statuts,
    paysList,
    cabinets,
    handleChange,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    handleSubmit
  };
};

export default useBrevetFormModif;
