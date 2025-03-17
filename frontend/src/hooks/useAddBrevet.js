import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const useAddBrevet = (handleClose) => {
  const [formData, setFormData] = useState({
    reference_famille: '',
    titre: '',
    date_depot: '',
    numero_delivrance: '',
    date_delivrance: '',
    licence: false,
    // Exemple pour "pays" global (non utilisé ici directement)
    pays: [{
      id_pays: '',
      numero_depot: '',
      numero_publication: '',
      id_statuts: '',
      date_depot: '',
      numero_delivrance: '',
      date_delivrance: '',
      licence: false,
    }],
    // Pour chaque inventeur, ajout d'un sous-tableau "pays"
    inventeurs: [{
      nom_inventeur: '',
      prenom_inventeur: '',
      email_inventeur: '',
      telephone_inventeur: '',
      pays: [{ id_pays: '', licence: false }]
    }],
    // Pour titulaires
    titulaires: [{
      nom_titulaire: '',
      prenom_titulaire: '',
      email_titulaire: '',
      telephone_titulaire: '',
      part_pi: '',
      executant: false,
      client_correspondant: false,
      pays: [{ id_pays: '', licence: false }]
    }],
    // Pour déposants
    deposants: [{
      nom_deposant: '',
      prenom_deposant: '',
      email_deposant: '',
      telephone_deposant: '',
      pays: [{ id_pays: '', licence: false }]
    }],
    cabinets_procedure: [{
      id_cabinet: '',
      id_contact: '', // Utilisé pour le contact
      reference: '',
      dernier_intervenant: false,
      numero_depot: '',
      numero_publication: '',
      numero_delivrance: '',
      id_statuts: '',
      date_depot: '',
      date_delivrance: '',
      licence: false
    }],
    cabinets_annuite: [{
      id_cabinet: '',
      id_contact: '',
      reference: '',
      dernier_intervenant: false,
      numero_depot: '',
      numero_publication: '',
      numero_delivrance: '',
      id_statuts: '',
      date_depot: '',
      date_delivrance: '',
      licence: false
    }],
    commentaire: '',
    pieces_jointes: [],
    clients: [{
      id_client: ''
    }]
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
    // Clients
    fetch(`${API_BASE_URL}/api/clients`)
      .then(response => response.json())
      .then(data => {
        console.log('Clients récupérés :', data);
        setClientsList(data.data || []);
      })
      .catch(() => setError('Erreur lors de la récupération des clients'));

    // Statuts
    fetch(`${API_BASE_URL}/api/statuts`)
      .then(response => response.json())
      .then(data => {
        console.log('Statuts récupérés :', data);
        // Adapter le format des statuts pour correspondre à ce qu'attend le composant
        const formattedStatuts = (data.data || []).map(statut => ({
          id_statuts: statut.id,
          valeur: statut.statuts
        }));
        setStatuts(formattedStatuts);
      })
      .catch(() => setError('Erreur lors de la récupération des statuts'));

    // Pays
    fetch(`${API_BASE_URL}/api/pays`)
      .then(response => response.json())
      .then(data => {
        console.log('Pays récupérés :', data);
        setPaysList(data.data || []);
      })
      .catch(() => setError('Erreur lors de la récupération des pays'));

    // Cabinets
    fetch(`${API_BASE_URL}/api/cabinet`)
      .then(response => response.json())
      .then(data => {
        console.log('Cabinets récupérés (brut) :', data);
        const cabinetData = data.data ? data.data : data;
        if (Array.isArray(cabinetData)) {
          setCabinets({
            procedure: cabinetData.filter(cabinet => cabinet.type === 'procedure'),
            annuite: cabinetData.filter(cabinet => cabinet.type === 'annuite')
          });
        } else {
          const procedure = cabinetData.procedure || [];
          const annuite = cabinetData.annuite || [];
          setCabinets({
            procedure: Array.isArray(procedure) ? procedure : [],
            annuite: Array.isArray(annuite) ? annuite : []
          });
        }
      })
      .catch(() => setError('Erreur lors de la récupération des cabinets'));
  }, []);

  // Récupération des contacts associés à un cabinet selon le type
  const fetchContacts = (cabinetId, type) => {
    console.log(`Récupération des contacts pour le cabinet ${cabinetId} (type: ${type})`);
    fetch(`${API_BASE_URL}/api/contacts/cabinets/${cabinetId}`)
      .then(response => response.json())
      .then(data => {
        console.log(`Contacts récupérés pour cabinet ${cabinetId} :`, data);
        // Assurez-vous que contacts est toujours un tableau, même si data.data est undefined
        let contacts = [];
        if (Array.isArray(data)) {
          contacts = data;
        } else if (Array.isArray(data.data)) {
          contacts = data.data;
        }
        console.log(`Contacts formatés pour cabinet ${cabinetId} :`, contacts);
        if (type === 'procedure') {
          setContactsProcedure(contacts);
        } else {
          setContactsAnnuite(contacts);
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des contacts:', err);
        setError('Erreur lors de la récupération des contacts');
        // En cas d'erreur, définissez un tableau vide pour éviter les erreurs dans l'interface
        if (type === 'procedure') {
          setContactsProcedure([]);
        } else {
          setContactsAnnuite([]);
        }
      });
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
    // Conversion explicite pour certains champs numériques
    let newValue;
    
    if (type === 'checkbox') {
      newValue = checked ? 1 : 0;
    } else if (name === 'id_client' || name === 'id_cabinet' || name === 'id_contact' || name === 'id_statuts' || name === 'id_pays') {
      // S'assurer que ces IDs sont traités comme des nombres sauf s'ils sont vides
      newValue = value === '' ? '' : parseInt(value, 10) || ''; // Utilisation de parseInt avec fallback
    } else {
      newValue = value;
    }
    
    const updatedField = formData[field].map((item, idx) =>
      idx === index ? { ...item, [name]: newValue } : item
    );
    console.log(`Mise à jour du champ ${field} à l'index ${index}:`, updatedField);
    setFormData(prevData => ({
      ...prevData,
      [field]: updatedField
    }));
  };

  // Gestion des sous-champs "pays" dans les entités (inventeurs, titulaires, déposants)
  const handleDynamicChangeForSubField = (e, parentIndex, field, subIndex, subField) => {
    const { value, type, checked } = e.target;
    // Pour "id_pays", on convertit en chaîne
    let newValue;
    if (type === 'checkbox') {
      newValue = checked ? 1 : 0;
    } else if (subField === 'id_pays') {
      newValue = value.toString();
    } else {
      newValue = value;
    }
    const updatedParent = formData[field].map((item, idx) => {
      if (idx === parentIndex) {
        const updatedSubArray = item.pays.map((subItem, sIdx) =>
          sIdx === subIndex ? { ...subItem, [subField]: newValue } : subItem
        );
        return { ...item, pays: updatedSubArray };
      }
      return item;
    });
    setFormData(prevData => ({
      ...prevData,
      [field]: updatedParent
    }));
  };

  const handleAddSubField = (parentIndex, field, subField) => {
    const emptySubField = { id_pays: '', licence: false };
    const updatedParent = formData[field].map((item, idx) => {
      if (idx === parentIndex) {
        return { ...item, [subField]: item[subField] ? [...item[subField], emptySubField] : [emptySubField] };
      }
      return item;
    });
    setFormData(prevData => ({
      ...prevData,
      [field]: updatedParent
    }));
  };

  const handleRemoveSubField = (parentIndex, field, subIndex, subField) => {
    const updatedParent = formData[field].map((item, idx) => {
      if (idx === parentIndex) {
        return { ...item, [subField]: item[subField].filter((_, sIdx) => sIdx !== subIndex) };
      }
      return item;
    });
    setFormData(prevData => ({
      ...prevData,
      [field]: updatedParent
    }));
  };

  const handleAddField = (field) => {
    const emptyField = {
      pays: { id_pays: '', numero_depot: '', numero_publication: '', id_statuts: '', date_depot: '', numero_delivrance: '', date_delivrance: '', licence: false },
      inventeurs: { nom_inventeur: '', prenom_inventeur: '', email: '', telephone: '', pays: [{ id_pays: '', licence: false }] },
      titulaires: { nom_titulaire: '', prenom_titulaire: '', email: '', telephone: '', part_pi: '', executant: false, client_correspondant: false, pays: [{ id_pays: '', licence: false }] },
      deposants: { nom: '', prenom: '', email: '', telephone: '', pays: [{ id_pays: '', licence: false }] },
      cabinets_procedure: {
        id_cabinet: '',
        id_contact: '',
        reference: '',
        dernier_intervenant: false,
        numero_depot: '',
        numero_publication: '',
        numero_delivrance: '',
        id_statuts: '',
        date_depot: '',
        date_delivrance: '',
        licence: false
      },
      cabinets_annuite: {
        id_cabinet: '',
        id_contact: '',
        reference: '',
        dernier_intervenant: false,
        numero_depot: '',
        numero_publication: '',
        numero_delivrance: '',
        id_statuts: '',
        date_depot: '',
        date_delivrance: '',
        licence: false
      },
      clients: { id_client: '' }
    }[field];
    console.log(`Ajout d'un nouveau champ pour ${field}`);
    setFormData(prevData => ({
      ...prevData,
      [field]: [...prevData[field], emptyField]
    }));
  };

  const handleRemoveField = (index, field) => {
    console.log(`Suppression du champ ${field} à l'index ${index}`);
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

    if (formData.date_depot) {
      dataToSubmit.append('date_depot', new Date(formData.date_depot).toISOString().split('T')[0]);
    }
    if (formData.date_delivrance) {
      dataToSubmit.append('date_delivrance', new Date(formData.date_delivrance).toISOString().split('T')[0]);
    }

    formData.pays.forEach((pays, index) => {
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
      await fetch(`${API_BASE_URL}/api/brevets`, {
        method: 'POST',
        body: dataToSubmit,
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
    handleDynamicChangeForSubField,
    handleAddSubField,
     handleRemoveSubField,
    handleAddField,
    handleRemoveField,
    handleSubmit,
    fetchContacts,
    handleCloseConfirmationModal
  };
};

export default useAddBrevet;
