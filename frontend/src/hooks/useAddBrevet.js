import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const useAddBrevet = (handleClose) => {
  // Structure initiale des données - standardisée et simplifiée
  const initialFormData = {
    reference_famille: '',
    titre: '',
    commentaire: '',
    numeros_pays: [{ 
      id_pays: '', 
      numero_depot: '', 
      numero_publication: '', 
      id_statuts: '', 
      date_depot: '', 
      date_delivrance: '', 
      numero_delivrance: '', 
      licence: false 
    }],
    inventeurs: [{ 
      nom_inventeur: '', 
      prenom_inventeur: '', 
      email_inventeur: '', 
      telephone_inventeur: '', 
      pays_associes: [] 
    }],
    deposants: [{ 
      nom_deposant: '', 
      prenom_deposant: '', 
      email_deposant: '', 
      telephone_deposant: '', 
      pays_associes: []
    }],
    titulaires: [{ 
      nom_titulaire: '', 
      prenom_titulaire: '', 
      email_titulaire: '', 
      telephone_titulaire: '',
      part_pi: '', 
      executant: false, 
      client_correspondant: false, 
      pays_associes: [] 
    }],
    cabinets_procedure: [{ 
      id_cabinet: '', 
      id_contact: '', 
      reference: '', 
      dernier_intervenant: false, 
      pays_associes: [] 
    }],
    cabinets_annuite: [{ 
      id_cabinet: '', 
      id_contact: '', 
      reference: '', 
      dernier_intervenant: false, 
      pays_associes: [] 
    }],
    clients: [{ id_client: '' }],
    pieces_jointes: []
  };

  // États
  const [formData, setFormData] = useState(initialFormData);
  const [clientsList, setClientsList] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [paysList, setPaysList] = useState([]);
  const [cabinets, setCabinets] = useState({ procedure: [], annuite: [] });
  const [contactsProcedure, setContactsProcedure] = useState([]);
  const [contactsAnnuite, setContactsAnnuite] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Pays sélectionnés pour les cabinets
  const selectedPays = formData.numeros_pays
    .filter(item => item && item.id_pays)
    .map(item => {
      const pays = paysList.find(p => p && p.id_pays === item.id_pays);
      return {
        id_pays: item.id_pays,
        nom_fr_fr: pays?.nom_fr_fr || `Pays ID: ${item.id_pays}`
      };
    });

  // Chargement initial des données de référence
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Chargement des clients
        const clientsResponse = await fetch(`${API_BASE_URL}/api/clients`);
        const clientsData = await clientsResponse.json();
        setClientsList(clientsData.data || []);

        // Chargement des statuts
        const statutsResponse = await fetch(`${API_BASE_URL}/api/statuts`);
        const statutsData = await statutsResponse.json();
        const formattedStatuts = (statutsData.data || []).map(statut => ({
          id_statuts: String(statut.id),
          valeur: statut.statuts
        }));
        setStatuts(formattedStatuts);

        // Chargement des pays
        const paysResponse = await fetch(`${API_BASE_URL}/api/pays`);
        const paysData = await paysResponse.json();
        // Conversion explicite de tous les ID en chaînes
        const formattedPays = (paysData.data || []).map(pays => ({
          ...pays,
          id_pays: String(pays.id_pays || pays.id)  // S'assure que l'ID est une chaîne
        }));
        setPaysList(formattedPays);

        // Chargement des cabinets
        const cabinetsResponse = await fetch(`${API_BASE_URL}/api/cabinet`);
        const cabinetsData = await cabinetsResponse.json();
        const cabinetsList = cabinetsData.data || cabinetsData || [];
        
        // Formatage des cabinets avec IDs en chaînes
        const formattedCabinets = cabinetsList.map(cabinet => ({
          ...cabinet,
          id: String(cabinet.id)
        }));
        
        setCabinets({
          procedure: formattedCabinets.filter(cabinet => cabinet.type === 'procedure'),
          annuite: formattedCabinets.filter(cabinet => cabinet.type === 'annuite')
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données de référence:", err);
        setError("Erreur lors du chargement des données de référence");
      }
    };

    fetchReferenceData();
  }, []);

  // Fonctions de gestion de formulaire simplifiées et uniformisées

  // Gestion des champs simples au niveau racine
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'pieces_jointes' && files) {
      setFormData(prev => ({
        ...prev,
        pieces_jointes: [...prev.pieces_jointes, ...Array.from(files)]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Gestion des fichiers
  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      pieces_jointes: prev.pieces_jointes.filter((_, idx) => idx !== index)
    }));
  };

  // NOUVELLE APPROCHE: Une seule fonction générique pour mettre à jour n'importe quelle partie du formulaire
  const updateFormData = (path, value) => {
    console.log(`Mise à jour du chemin: ${path} avec la valeur:`, value);
    
    // Fonction récursive pour mettre à jour une valeur imbriquée
    const updateNestedValue = (obj, pathArray, val) => {
      const [key, ...rest] = pathArray;
      
      if (rest.length === 0) {
        // Dernier niveau, on met à jour la valeur
        return { ...obj, [key]: val };
      }
      
      const nextKey = rest[0];
      
      // Si le prochain élément est un indice de tableau
      if (!isNaN(nextKey)) {
        // On s'assure que l'objet actuel a une propriété qui est un tableau
        const targetArray = Array.isArray(obj[key]) ? [...obj[key]] : [];
        
        // On met à jour l'élément spécifique dans le tableau
        targetArray[nextKey] = updateNestedValue(
          targetArray[nextKey] || {}, 
          rest.slice(1), 
          val
        );
        
        return { ...obj, [key]: targetArray };
      }
      
      // Si c'est une propriété objet
      return {
        ...obj,
        [key]: updateNestedValue(obj[key] || {}, rest, val)
      };
    };
    
    // Décompose le chemin en parties (ex: "inventeurs.0.pays.1.id_pays" => ["inventeurs", "0", "pays", "1", "id_pays"])
    const pathParts = path.split('.');
    
    // Met à jour l'état avec la nouvelle valeur
    setFormData(prevState => updateNestedValue(prevState, pathParts, value));
  };

  // Gestion des ajouts et suppressions d'éléments dans les tableaux
  // Gestion des ajouts d'éléments dans les tableaux - version corrigée pour gérer les chemins imbriqués
  const addArrayItem = (arrayPath, template = {}) => {
    setFormData(prevState => {
      // Traitement spécial pour les pays des inventeurs, titulaires et déposants
      // Ces cas spécifiques sont traités différemment car ce sont des tableaux imbriqués
      if (arrayPath.includes('.pays')) {
        const [entityType, entityIndex, subFieldName] = arrayPath.split('.');
        const entity = prevState[entityType][entityIndex];
        
        // Si pays n'existe pas ou n'est pas un tableau, initialiser comme tableau vide
        const currentPays = Array.isArray(entity.pays) ? entity.pays : [];
        const updatedPays = [...currentPays, template];
        
        // Mise à jour de l'entité spécifique avec la nouvelle liste de pays
        const updatedEntities = prevState[entityType].map((item, idx) => 
          idx === parseInt(entityIndex) ? { ...item, pays: updatedPays } : item
        );
        
        // Retourner l'état mis à jour
        return {
          ...prevState,
          [entityType]: updatedEntities
        };
      }

      // Pour les autres types d'éléments (code original)
      try {
        const pathParts = arrayPath.split('.');
        let currentObj = prevState;
        let isValid = true;
        
        // Vérifier que le chemin est valide jusqu'au tableau cible
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (currentObj[part] === undefined) {
            isValid = false;
            break;
          }
          currentObj = currentObj[part];
        }
        
        // Si le chemin n'est pas valide, retourner l'état actuel sans modifications
        if (!isValid) {
          console.error(`Le chemin ${arrayPath} est invalide`);
          return prevState;
        }
        
        const finalPart = pathParts[pathParts.length - 1];
        
        // Vérifier que le dernier élément du chemin est bien un tableau
        if (!Array.isArray(currentObj[finalPart])) {
          console.error(`Le chemin ${arrayPath} ne mène pas à un tableau`);
          return prevState;
        }
        
        // Créer une version mise à jour de l'objet complet
        const result = { ...prevState };
        let pointer = result;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          pointer[part] = { ...pointer[part] };
          pointer = pointer[part];
        }
        
        // Ajouter le nouvel élément au tableau cible
        pointer[finalPart] = [...pointer[finalPart], template];
        
        return result;
      } catch (err) {
        console.error(`Erreur lors de l'ajout d'un élément au chemin ${arrayPath}:`, err);
        return prevState;
      }
    });
  };

  // Gestion des suppressions d'éléments dans les tableaux - version corrigée pour gérer les chemins imbriqués
  const removeArrayItem = (arrayPath, index) => {
    setFormData(prevState => {
      // Traitement spécial pour les pays des inventeurs, titulaires et déposants
      if (arrayPath.includes('.pays')) {
        const [entityType, entityIndex, subFieldName] = arrayPath.split('.');
        const entity = prevState[entityType][entityIndex];
        
        // Si pays n'existe pas ou n'est pas un tableau, retourner l'état actuel
        if (!Array.isArray(entity.pays)) {
          console.error(`La propriété pays de ${entityType}[${entityIndex}] n'est pas un tableau`);
          return prevState;
        }
        
        // Filtrer pour retirer l'élément correspondant à l'index
        const updatedPays = entity.pays.filter((_, idx) => idx !== index);
        
        // Mise à jour de l'entité spécifique avec la nouvelle liste de pays
        const updatedEntities = prevState[entityType].map((item, idx) => 
          idx === parseInt(entityIndex) ? { ...item, pays: updatedPays } : item
        );
        
        // Retourner l'état mis à jour
        return {
          ...prevState,
          [entityType]: updatedEntities
        };
      }

      // Pour les autres types d'éléments (même approche avec des corrections)
      try {
        // ...existing code pour removeArrayItem...
        const pathParts = arrayPath.split('.');
        let currentObj = prevState;
        let isValid = true;
        
        // Vérifier que le chemin est valide jusqu'au tableau cible
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          if (currentObj[part] === undefined) {
            isValid = false;
            break;
          }
          currentObj = currentObj[part];
        }
        
        // Si le chemin n'est pas valide, retourner l'état actuel sans modifications
        if (!isValid || !Array.isArray(currentObj)) {
          console.error(`Le chemin ${arrayPath} est invalide ou ne mène pas à un tableau`);
          return prevState;
        }
        
        // Créer une version mise à jour de l'objet complet
        const result = { ...prevState };
        let pointer = result;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          pointer[part] = { ...pointer[part] };
          pointer = pointer[part];
        }
        
        const finalPart = pathParts[pathParts.length - 1];
        // Filtrer pour retirer l'élément correspondant à l'index
        pointer[finalPart] = pointer[finalPart].filter((_, idx) => idx !== index);
        
        return result;
      } catch (err) {
        console.error(`Erreur lors de la suppression d'un élément au chemin ${arrayPath}:`, err);
        return prevState;
      }
    });
  };

  // Récupération des contacts par cabinet
  const fetchContacts = async (cabinetId, type) => {
    if (!cabinetId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/cabinets/${cabinetId}`);
      const data = await response.json();
      
      let contacts = [];
      if (Array.isArray(data)) {
        contacts = data;
      } else if (Array.isArray(data.data)) {
        contacts = data.data;
      }
      
      // Formatage des contacts avec IDs en chaînes
      const formattedContacts = contacts.map(contact => ({
        ...contact,
        id: String(contact.id)
      }));
      
      if (type === 'procedure') {
        setContactsProcedure(formattedContacts);
      } else {
        setContactsAnnuite(formattedContacts);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des contacts:', err);
      if (type === 'procedure') {
        setContactsProcedure([]);
      } else {
        setContactsAnnuite([]);
      }
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = new FormData();
    
    // Ajout des propriétés principales
    dataToSubmit.append('reference_famille', formData.reference_famille);
    dataToSubmit.append('titre', formData.titre);
    dataToSubmit.append('commentaire', formData.commentaire || '');
    
    // Fonction pour formater les dates
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toISOString().split('T')[0];
      } catch (e) {
        console.warn(`Erreur de formatage de date: ${dateString}`, e);
        return '';
      }
    };
    
    // Formatage des données avec traitement des dates
    const formatDataWithDates = (items) => {
      return items.map(item => {
        const formattedItem = { ...item };
        if (formattedItem.date_depot) {
          formattedItem.date_depot = formatDate(formattedItem.date_depot);
        }
        if (formattedItem.date_delivrance) {
          formattedItem.date_delivrance = formatDate(formattedItem.date_delivrance);
        }
        return formattedItem;
      });
    };
    
    // Conversion et ajout des données complexes
    const formattedInventeurs = formData.inventeurs.map(inventeur => ({
      ...inventeur,
      // Créer une structure compatible avec l'API
      pays: inventeur.pays_associes?.map(id_pays => ({ id_pays, licence: false })) || []
    }));

    const formattedDeposants = formData.deposants.map(deposant => ({
      ...deposant,
      // Créer une structure compatible avec l'API
      pays: deposant.pays_associes?.map(id_pays => ({ id_pays, licence: false })) || []
    }));

    const formattedTitulaires = formData.titulaires.map(titulaire => ({
      ...titulaire,
      // Créer une structure compatible avec l'API
      pays: titulaire.pays_associes?.map(id_pays => ({ id_pays, licence: false })) || []
    }));

    // Mise à jour des données à soumettre
    dataToSubmit.append('numeros_pays', JSON.stringify(formatDataWithDates(formData.numeros_pays)));
    dataToSubmit.append('inventeurs', JSON.stringify(formattedInventeurs));
    dataToSubmit.append('deposants', JSON.stringify(formattedDeposants));
    dataToSubmit.append('titulaires', JSON.stringify(formattedTitulaires));
    
    // Adapter les données des cabinets pour l'API si nécessaire
    const formattedCabinetsProcedure = formData.cabinets_procedure.map(cabinet => ({
      ...cabinet,
      // On garde la compatibilité avec l'API si elle attend toujours id_pays_associe
      id_pays_associe: cabinet.pays_associes && cabinet.pays_associes.length > 0 ? 
                      cabinet.pays_associes.join(',') : '',
    }));

    const formattedCabinetsAnnuite = formData.cabinets_annuite.map(cabinet => ({
      ...cabinet,
      id_pays_associe: cabinet.pays_associes && cabinet.pays_associes.length > 0 ? 
                      cabinet.pays_associes.join(',') : '',
    }));
    
    // Mise à jour de l'appel dataToSubmit avec les nouveaux formats
    dataToSubmit.append('cabinets_procedure', JSON.stringify(formattedCabinetsProcedure));
    dataToSubmit.append('cabinets_annuite', JSON.stringify(formattedCabinetsAnnuite));
    
    dataToSubmit.append('clients', JSON.stringify(formData.clients));
    
    // Ajout des pièces jointes
    if (formData.pieces_jointes.length > 0) {
      formData.pieces_jointes.forEach((file, index) => {
        dataToSubmit.append(`pieces_jointes[${index}][nom_fichier]`, file.name);
        dataToSubmit.append(`pieces_jointes[${index}][type_fichier]`, file.type);
        dataToSubmit.append(`pieces_jointes[${index}][donnees]`, file);
      });
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/brevets`, {
        method: 'POST',
        body: dataToSubmit,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Brevet ajouté avec succès:', result);
      setConfirmationMessage('Le brevet a été ajouté avec succès.');
      setIsError(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du brevet:", err);
      setConfirmationMessage("Une erreur est survenue lors de l'ajout du brevet.");
      setIsError(true);
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
    clientsList,
    statuts,
    paysList,
    selectedPays,
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    loading,
    error,
    confirmationModal,
    confirmationMessage,
    isError,
    setFormData,  // Pour les mises à jour directes si nécessaire
    
    // Nouvelles fonctions simplifiées
    updateFormData,  // Fonction principale pour mettre à jour n'importe quel champ
    addArrayItem,    // Ajouter un élément à un tableau
    removeArrayItem, // Supprimer un élément d'un tableau
    handleChange,    // Pour les champs simples du niveau racine
    handleRemoveFile,// Pour supprimer un fichier
    fetchContacts,   // Pour charger les contacts
    handleSubmit,
    handleCloseConfirmationModal
  };
};

export default useAddBrevet;
