import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'; // Importation du fichier de configuration

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
      // Récupérer les données du brevet avec relations
      fetch(`${API_BASE_URL}/api/brevets/${brevetId}/with-relations`)
        .then(response => response.json())
        .then(data => {
          const brevetData = data.data;
          console.log("Données complètes du brevet récupérées:", brevetData);
          
          // Construire un objet de formulaire à partir des données récupérées
          const formattedData = {
            reference_famille: brevetData.reference_famille || '',
            titre: brevetData.titre || '',
            date_depot: brevetData.date_depot ? new Date(brevetData.date_depot).toISOString().split('T')[0] : '',
            numero_delivrance: brevetData.numero_delivrance || '',
            date_delivrance: brevetData.date_delivrance ? new Date(brevetData.date_delivrance).toISOString().split('T')[0] : '',
            licence: brevetData.licence || false,
            id_statut: brevetData.id_statut || '',
            
            // Traitement des données de pays
            pays: Array.isArray(brevetData.NumeroPays) && brevetData.NumeroPays.length 
              ? brevetData.NumeroPays.map(p => ({
                  id_pays: p.id_pays || '',
                  numero_depot: p.numero_depot || '',
                  numero_publication: p.numero_publication || '',
                  id_statuts: p.id_statuts || '',
                  date_depot: p.date_depot ? new Date(p.date_depot).toISOString().split('T')[0] : '',
                  date_delivrance: p.date_delivrance ? new Date(p.date_delivrance).toISOString().split('T')[0] : '',
                  numero_delivrance: p.numero_delivrance || '',
                  licence: p.licence || false
                }))
              : [{ id_pays: '', numero_depot: '', numero_publication: '' }],
              
            // Traitement des inventeurs
            inventeurs: Array.isArray(brevetData.Inventeurs) && brevetData.Inventeurs.length
              ? brevetData.Inventeurs.map(i => ({
                  nom_inventeur: i.nom_inventeur || '',
                  prenom_inventeur: i.prenom_inventeur || '',
                  email_inventeur: i.email_inventeur || '',
                  telephone_inventeur: i.telephone_inventeur || ''
                }))
              : [{ nom_inventeur: '', prenom_inventeur: '', email_inventeur: '', telephone_inventeur: '' }],
              
            // Traitement des titulaires
            titulaires: Array.isArray(brevetData.Titulaires) && brevetData.Titulaires.length
              ? brevetData.Titulaires.map(t => ({
                  nom_titulaire: t.nom_titulaire || '',
                  prenom_titulaire: t.prenom_titulaire || '',
                  email_titulaire: t.email_titulaire || '',
                  telephone_titulaire: t.telephone_titulaire || '',
                  part_pi: t.part_pi || '',
                  executant: t.executant || false,
                  client_correspondant: t.client_correspondant || false
                }))
              : [{ nom_titulaire: '', prenom_titulaire: '', email_titulaire: '', telephone_titulaire: '', part_pi: '', executant: false, client_correspondant: false }],
                
            // Traitement des déposants
            deposants: Array.isArray(brevetData.Deposants) && brevetData.Deposants.length
              ? brevetData.Deposants.map(d => ({
                  nom_deposant: d.nom_deposant || '',
                  prenom_deposant: d.prenom_deposant || '',
                  email_deposant: d.email_deposant || '',
                  telephone_deposant: d.telephone_deposant || ''
                }))
              : [{ nom_deposant: '', prenom_deposant: '', email_deposant: '', telephone_deposant: '' }],
                
            // Traitement des cabinets de procédure
            cabinets_procedure: Array.isArray(brevetData.Cabinets) 
              ? brevetData.Cabinets
                .filter(c => c.BrevetCabinets && c.BrevetCabinets.type === 'procedure')
                .map(c => ({
                  id_cabinet_procedure: c.id || '',
                  reference: c.BrevetCabinets?.reference || '',
                  dernier_intervenant: c.BrevetCabinets?.dernier_intervenant || false,
                  id_contact_procedure: c.BrevetCabinets?.contact_id || ''
                }))
              : [{ id_cabinet_procedure: '', reference: '', dernier_intervenant: false, id_contact_procedure: '' }],
                
            // Traitement des cabinets d'annuité
            cabinets_annuite: Array.isArray(brevetData.Cabinets)
              ? brevetData.Cabinets
                .filter(c => c.BrevetCabinets && c.BrevetCabinets.type === 'annuite')
                .map(c => ({
                  id_cabinet_annuite: c.id || '',
                  reference: c.BrevetCabinets?.reference || '',
                  dernier_intervenant: c.BrevetCabinets?.dernier_intervenant || false,
                  id_contact_annuite: c.BrevetCabinets?.contact_id || ''
                }))
              : [{ id_cabinet_annuite: '', reference: '', dernier_intervenant: false, id_contact_annuite: '' }],
                
            commentaire: brevetData.commentaire || '',
            piece_jointe: null,
            clients: Array.isArray(brevetData.Clients) && brevetData.Clients.length
              ? brevetData.Clients.map(c => ({ id_client: c.id || '' }))
              : [{ id_client: '' }]
          };
          
          console.log("Données formatées pour le formulaire:", formattedData);
          setFormData(formattedData);
        })
        .catch(error => console.error('Erreur lors du chargement des données du brevet:', error));
    }

    // Récupération des données de référence (clients, statuts, pays, cabinets)
    fetch(`${API_BASE_URL}/api/clients`)
      .then(response => response.json())
      .then(data => setClients(data.data || []))
      .catch(error => console.error('Erreur lors de la récupération des clients:', error));

    fetch(`${API_BASE_URL}/api/statuts`)
      .then(response => response.json())
      .then(data => setStatuts(data.data || []))
      .catch(error => console.error('Erreur lors de la récupération des statuts:', error));

    fetch(`${API_BASE_URL}/api/pays`)
      .then(response => response.json())
      .then(data => setPaysList(data.data || []))
      .catch(error => console.error('Erreur lors de la récupération des pays:', error));

    fetch(`${API_BASE_URL}/api/cabinets`)
      .then(response => response.json())
      .then(data => {
        setCabinets({
          procedure: data.procedure || [],
          annuite: data.annuite || []
        });
      })
      .catch(error => console.error('Erreur lors de la récupération des cabinets:', error));
  }, [brevetId, API_BASE_URL]);

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

    fetch(`${API_BASE_URL}/api/brevets/${brevetId}`, {
      method: 'PUT',
      body: dataToSubmit,
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
