import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const useAddBrevet = (handleClose) => {
  const [formData, setFormData] = useState({
    reference_famille: '',
    titre: '',
    date_depot: '',
    numero_delivrance: '',
    date_delivrance: '',
    licence: false,
    // Nouvelle section pour les informations de dépôt
    informations_depot: [{
      id_pays: '',
      numero_depot: '',
      numero_publication: '',
      numero_delivrance: '',
      id_statuts: '',
      date_depot: '',
      date_publication: '',
      date_delivrance: '',
      licence: false,
    }],
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
      pays: [{ id_pays: '' }] // Modification pour permettre plusieurs pays
    }],
    cabinets_annuite: [{
      id_cabinet: '',
      id_contact: '',
      reference: '',
      dernier_intervenant: false,
      pays: [{ id_pays: '' }] // Modification pour permettre plusieurs pays
    }],
    commentaire: '',
    clients: [{
      id_client: ''
    }]
  });

  // Nouvel état pour suivre les pays sélectionnés dans les informations de dépôt
  const [associatedCountries, setAssociatedCountries] = useState([]);

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

  // Effet pour mettre à jour la liste des pays associés lorsque informations_depot change
  useEffect(() => {
    // Extraire les pays sélectionnés dans les informations de dépôt
    const selectedCountries = formData.informations_depot
      .map(info => info.id_pays)
      .filter(id => id !== '' && id !== undefined);
    
    // Mettre à jour la liste des pays associés
    const uniqueCountries = [...new Set(selectedCountries)];
    if (uniqueCountries.length > 0) {
      const countriesData = uniqueCountries.map(id => {
        const country = paysList.find(p => p.id === parseInt(id) || p.id === id);
        return country || { id: id, nom_fr_fr: "Pays inconnu" };
      });
      setAssociatedCountries(countriesData);
    } else {
      setAssociatedCountries([]);
    }
  }, [formData.informations_depot, paysList]);

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
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      informations_depot: { id_pays: '', numero_depot: '', numero_publication: '', numero_delivrance: '', id_statuts: '', date_depot: '', date_publication: '', date_delivrance: '', licence: false },
      inventeurs: { nom_inventeur: '', prenom_inventeur: '', email_inventeur: '', telephone_inventeur: '', pays: [{ id_pays: '', licence: false }] },
      titulaires: { nom_titulaire: '', prenom_titulaire: '', email_titulaire: '', telephone_titulaire: '', part_pi: '', executant: false, client_correspondant: false, pays: [{ id_pays: '', licence: false }] },
      deposants: { nom_deposant: '', prenom_deposant: '', email_deposant: '', telephone_deposant: '', pays: [{ id_pays: '', licence: false }] },
      cabinets_procedure: {
        id_cabinet: '',
        id_contact: '',
        reference: '',
        dernier_intervenant: false,
        pays: [{ id_pays: '' }] // Modification pour permettre plusieurs pays
      },
      cabinets_annuite: {
        id_cabinet: '',
        id_contact: '',
        reference: '',
        dernier_intervenant: false,
        pays: [{ id_pays: '' }] // Modification pour permettre plusieurs pays
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

    try {
      console.log("Préparation de l'envoi des données...");
      
      // Vérification des données obligatoires
      if (!formData.reference_famille || !formData.titre) {
        throw new Error("La référence et le titre du brevet sont obligatoires");
      }
      
      // Préparation des données pour l'envoi - sans FormData car pas de fichiers
      const dataToSend = {
        reference_famille: formData.reference_famille,
        titre: formData.titre,
        commentaire: formData.commentaire || '',
        clients: formData.clients || [],
        informations_depot: formData.informations_depot || [],
        inventeurs: formData.inventeurs || [],
        titulaires: formData.titulaires || [],
        deposants: formData.deposants || [],
        cabinets_procedure: formData.cabinets_procedure || [],
        cabinets_annuite: formData.cabinets_annuite || []
      };
      
      // Log des données avant envoi
      console.log("=== DONNÉES À ENVOYER ===", dataToSend);
      
      // Configuration et envoi avec axios
      console.log("Envoi de la requête...");
      
      const response = await axios({
        method: 'post',
        url: `${API_BASE_URL}/api/brevets`,
        data: dataToSend,
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 secondes
      });
      
      console.log('Réponse du serveur:', response.data);
      
      setConfirmationMessage('Le brevet a été ajouté avec succès.');
      setIsError(false);
      setConfirmationModal(true);
    } catch (err) {
      console.error("=== ERREUR DANS USEADDBREVET ===");
      
      let errorMessage = "Une erreur est survenue lors de l'ajout du brevet";
      
      if (err.response) {
        console.error('Réponse d\'erreur du serveur:', err.response);
        console.error('Status:', err.response.status);
        console.error('Headers:', err.response.headers);
        console.error('Data:', err.response.data);
        
        errorMessage += `: ${err.response.status} - ${err.response.data?.error || err.response.data?.details || err.message}`;
      } else if (err.request) {
        console.error('Erreur de requête (pas de réponse):', err.request);
        errorMessage += ": Pas de réponse du serveur";
      } else {
        console.error('Erreur:', err.message);
        errorMessage += `: ${err.message}`;
      }
      
      setConfirmationMessage(errorMessage);
      setIsError(true);
      setConfirmationModal(true);
    } finally {
      setLoading(false);
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
    associatedCountries,
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
