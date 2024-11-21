import { useState, useEffect } from 'react';
import axios from 'axios';

const useAddBrevet = (handleClose) => {
  const [formData, setFormData] = useState({
    reference_famille: '',
    titre: '',
    date_depot: '',
    numero_delivrance: '',
    date_delivrance: '',
    licence: false,
    pays: [{ id_pays: '', numero_depot: '', numero_publication: '', id_statuts: '',date_depot: '', numero_delivrance: '', date_delivrance: '', licence: false, }],
    inventeurs: [{ nom: '', prenom: '', email: '', telephone: '' }],
    titulaires: [{ nom: '', prenom: '', email: '', telephone: '', part_pi: '', executant: false, client_correspondant: false }],
    deposants: [{ nom: '', prenom: '', email: '', telephone: '' }],
    cabinets_procedure: [{ id_cabinet: '', reference: '', dernier_intervenant: false }],
    cabinets_annuite: [{ id_cabinet: '', reference: '', dernier_intervenant: false }],
    commentaire: '',
    pieces_jointes: [],
    clients: [{ id_client: '' }]
  });

  const [clientsList, setClientsList] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [paysList, setPaysList] = useState([]);
  const [cabinets, setCabinets] = useState({ procedure: [], annuite: [] });
  const [contactsProcedure, setContactsProcedure] = useState([]);
  const [contactsAnnuite, setContactsAnnuite] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3100/clients')
      .then(response => setClientsList(response.data.data || []))
      .catch(() => setError('Erreur lors de la récupération des clients'));

    axios.get('http://localhost:3100/statuts')
      .then(response => setStatuts(response.data.data || []))
      .catch(() => setError('Erreur lors de la récupération des statuts'));

    axios.get('http://localhost:3100/pays')
      .then(response => setPaysList(response.data.data || []))
      .catch(() => setError('Erreur lors de la récupération des pays'));

    axios.get('http://localhost:3100/cabinet')
      .then(response => {
        const { procedure, annuite } = response.data;
        setCabinets({
          procedure: Array.isArray(procedure) ? procedure : [],
          annuite: Array.isArray(annuite) ? annuite : []
        });
      })
      .catch(() => setError('Erreur lors de la récupération des cabinets'));
  }, []);

  const fetchContacts = (cabinetId, type) => {
    axios.get(`http://localhost:3100/contacts/cabinets/${cabinetId}`)
      .then(response => {
        if (type === 'procedure') {
          setContactsProcedure(response.data.data || []);
        } else {
          setContactsAnnuite(response.data.data || []);
        }
      })
      .catch(() => setError('Erreur lors de la récupération des contacts'));
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name.startsWith('pieces_jointes')) {
      const filesArray = Array.from(files);
      setFormData(prevData => ({
        ...prevData,
        pieces_jointes: [...prevData.pieces_jointes, ...filesArray]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDynamicChange = (e, index, field) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    console.log(`Field: ${field}, Index: ${index}, Name: ${name}, New Value: ${newValue}`); // Log pour débogage

    const updatedField = formData[field].map((item, idx) => (
      idx === index ? { ...item, [name]: newValue } : item
    ));

    console.log('Updated Field:', updatedField); // Log pour vérifier le champ mis à jour

    setFormData(prevData => ({
      ...prevData,
      [field]: updatedField
    }));
  };

  const handleAddField = (field) => {
    const emptyField = {
      pays: { id_pays: '', numero_depot: '', numero_publication: '', id_statuts: '',date_depot: '', numero_delivrance: '',date_delivrance: '', licence: false, },
      inventeurs: { nom: '', prenom: '', email: '', telephone: '' },
      titulaires: { nom: '', prenom: '', email: '', telephone: '', part_pi: '', executant: false, client_correspondant: false },
      deposants: { nom: '', prenom: '', email: '', telephone: '' },
      cabinets_procedure: { id_cabinet: '', reference: '', dernier_intervenant: false },
      cabinets_annuite: { id_cabinet: '', reference: '', dernier_intervenant: false },
      clients: { id_client: '' }
    }[field];

    setFormData(prevData => ({
      ...prevData,
      [field]: [...prevData[field], emptyField]
    }));
  };

  const handleRemoveField = (index, field) => {
    const newDynamicFields = formData[field].filter((_, idx) => idx !== index);
    setFormData(prevData => ({
      ...prevData,
      [field]: newDynamicFields
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const dataToSubmit = new FormData();
  
    dataToSubmit.append('reference_famille', formData.reference_famille);
    dataToSubmit.append('titre', formData.titre);
    dataToSubmit.append('commentaire', formData.commentaire);
  
    // Formatage des dates avant d'ajouter
    if (formData.date_depot) {
      dataToSubmit.append('date_depot', new Date(formData.date_depot).toISOString().split('T')[0]);
    }
    if (formData.date_delivrance) {
      dataToSubmit.append('date_delivrance', new Date(formData.date_delivrance).toISOString().split('T')[0]);
    }
  
    // Vérification des pays pour id_statuts
    formData.pays.forEach((pays, index) => {
      console.log(`Pays ${index}:`, pays);
      if (!pays.id_statuts) {
        console.warn(`id_statuts pour le pays ${index} est null ou vide.`);
      }
  
      // Formatage des dates pour chaque pays
      if (pays.date_depot) {
        pays.date_depot = new Date(pays.date_depot).toISOString().split('T')[0];
      }
      if (pays.date_delivrance) {
        pays.date_delivrance = new Date(pays.date_delivrance).toISOString().split('T')[0];
      }
    });
  
    dataToSubmit.append('pays', JSON.stringify(formData.pays));
    dataToSubmit.append('inventeurs', JSON.stringify(formData.inventeurs));
    dataToSubmit.append('titulaires', JSON.stringify(formData.titulaires));
    dataToSubmit.append('deposants', JSON.stringify(formData.deposants));
    dataToSubmit.append('cabinets_procedure', JSON.stringify(formData.cabinets_procedure));
    dataToSubmit.append('cabinets_annuite', JSON.stringify(formData.cabinets_annuite));
    dataToSubmit.append('clients', JSON.stringify(formData.clients));
  
    if (formData.pieces_jointes && formData.pieces_jointes.length > 0) {
      formData.pieces_jointes.forEach((file, index) => {
        dataToSubmit.append(`pieces_jointes[${index}][nom_fichier]`, file.name);
        dataToSubmit.append(`pieces_jointes[${index}][type_fichier]`, file.type);
        dataToSubmit.append(`pieces_jointes[${index}][donnees]`, file);
      });
    }
  
    try {
      await axios.post('http://localhost:3100/brevets', dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setConfirmationMessage('Le brevet a été ajouté avec succès.');
      setIsError(false);
    } catch (err) {
      setConfirmationMessage("Une erreur est survenue lors de l'ajout du brevet.");
      setIsError(true);
      console.error('Erreur lors de la création du brevet:', err);
    } finally {
      setLoading(false);
      setConfirmationModal(true);
    }
  };
  

  const handleCloseConfirmationModal = () => {
    setConfirmationModal(false);
    if (!isError) {
      handleClose();
    }
  };

  return {
    formData,
    setFormData,
    clientsList,
    statuts,
    paysList,
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    message,
    error,
    loading,
    confirmationModal,
    confirmationMessage,
    isError,
    handleChange,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    handleSubmit,
    fetchContacts,
    handleCloseConfirmationModal
  };
};

export default useAddBrevet;
