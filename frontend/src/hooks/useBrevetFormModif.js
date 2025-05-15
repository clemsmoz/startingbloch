import { useState, useEffect } from 'react';
import useBrevetData from './useBrevetData';
import { API_BASE_URL } from '../config';

const safeArray = arr => Array.isArray(arr) ? arr : [];
const safeStr = v => (v == null ? '' : String(v));

const useBrevetFormModif = (brevetId, handleClose, refreshBrevets) => {
  // 1) données brutes + loading/error
  const {
    brevet,
    clients,
    inventeurs,
    deposants,
    titulaires,
    pays,
    procedureCabinets,
    annuiteCabinets,
    contactsProcedure,
    contactsAnnuite,
    statutsList,
    loading,
    error
  } = useBrevetData(brevetId);

  // 2) state du formulaire
  const [formData, setFormData] = useState({
    reference_famille: '',
    titre: '',
    date_depot: '',
    numero_delivrance: '',
    date_delivrance: '',
    licence: false,
    id_statut: '',
    clients: [],
    infos_depot: [],
    inventeurs: [],
    deposants: [],
    titulaires: [],
    cabinets_procedure: [],
    cabinets_annuite: [],
    commentaire: ''


  });

  // 3) mapping dès que les données sont chargées
  useEffect(() => {
    if (!brevet) return;
    setFormData({
      reference_famille: safeStr(brevet.reference_famille),
      titre: safeStr(brevet.titre),
      date_depot: safeStr(brevet.date_depot).split('T')[0],
      numero_delivrance: safeStr(brevet.numero_delivrance),
      date_delivrance: safeStr(brevet.date_delivrance).split('T')[0],
      licence: Boolean(brevet.licence),
      id_statut: safeStr(brevet.id_statut),
      clients: safeArray(clients).map(c=>({ id_client: safeStr(c.id_client||c.id) })),
      infos_depot: safeArray(pays).map(p=>({
        id_pays: safeStr(p.id_pays||p.Pay?.id),
        numero_depot: safeStr(p.numero_depot),
        numero_publication: safeStr(p.numero_publication),
        date_depot: safeStr(p.date_depot).split('T')[0],
        date_publication: safeStr(p.date_publication).split('T')[0],
        date_delivrance: safeStr(p.date_delivrance).split('T')[0],
        id_statuts: safeStr(p.id_statuts),
        licence: Boolean(p.licence)
      })),
      inventeurs: safeArray(inventeurs).map(i=>({
        nom_inventeur: safeStr(i.nom_inventeur||i.nom),
        prenom_inventeur: safeStr(i.prenom_inventeur||i.prenom),
        email_inventeur: safeStr(i.email_inventeur||i.email),
        telephone_inventeur: safeStr(i.telephone_inventeur||i.telephone)
      })),
      deposants: safeArray(deposants).map(d=>({
        nom_deposant: safeStr(d.nom_deposant||d.nom),
        prenom_deposant: safeStr(d.prenom_deposant||d.prenom),
        email_deposant: safeStr(d.email_deposant||d.email),
        telephone_deposant: safeStr(d.telephone_deposant||d.telephone)
      })),
      titulaires: safeArray(titulaires).map(t=>({
        nom_titulaire: safeStr(t.nom_titulaire||t.nom),
        prenom_titulaire: safeStr(t.prenom_titulaire||t.prenom),
        email_titulaire: safeStr(t.email_titulaire||t.email),
        telephone_titulaire: safeStr(t.telephone_titulaire||t.telephone),
        executant: Boolean(t.executant),
        client_correspondant: Boolean(t.client_correspondant)
      })),
      cabinets_procedure: safeArray(procedureCabinets).map(c=>({
        id_cabinet: safeStr(c.id),
        reference: safeStr(c.reference),
        dernier_intervenant: Boolean(c.dernier_intervenant),
        id_contact: safeStr(c.contact_id),
        pays: []
      })),
      cabinets_annuite: safeArray(annuiteCabinets).map(c=>({
        id_cabinet: safeStr(c.id),
        reference: safeStr(c.reference),
        dernier_intervenant: Boolean(c.dernier_intervenant),
        id_contact: safeStr(c.contact_id),
        pays: []
      })),
      commentaire: safeStr(brevet.commentaire)
    });
  }, [brevet, clients, inventeurs, deposants, titulaires, pays, procedureCabinets, annuiteCabinets]);

  // 4) handlers
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(fd=>({
      ...fd,
      [name]: type==='checkbox' ? checked : value
    }));
  };

  const handleDynamicChange = (e, idx, field) => {
    const { name, value, type, checked } = e.target;
    setFormData(fd=>({
      ...fd,
      [field]: fd[field].map((it,i)=> i===idx
        ? { ...it, [name]: type==='checkbox'? checked: value }
        : it
      )
    }));
  };

  const handleDynamicChangeForSubField = (e, idx, field, subIdx, subField) => {
    const { value, checked, type, name } = e.target;
    setFormData(fd=>({
      ...fd,
      [field]: fd[field].map((it,i)=> i===idx
        ? { ...it, [subField]: it[subField].map((sub,j)=> j===subIdx
            ? { ...sub, [name]: type==='checkbox'? checked: value }
            : sub
          )
        }
        : it
      )
    }));
  };

  const handleAddField = field => {
    const empty = {
      clients: { id_client: '' },
      infos_depot: { id_pays:'',numero_depot:'',numero_publication:'',date_depot:'',date_publication:'',date_delivrance:'',id_statuts:'',licence:false },
      inventeurs: { nom_inventeur:'',prenom_inventeur:'',email_inventeur:'',telephone_inventeur:'' },
      deposants: { nom_deposant:'',prenom_deposant:'',email_deposant:'',telephone_deposant:'' },
      titulaires: { nom_titulaire:'',prenom_titulaire:'',email_titulaire:'',telephone_titulaire:'',executant:false,client_correspondant:false },
      cabinets_procedure: { id_cabinet:'',reference:'',dernier_intervenant:false,id_contact:'',pays:[] },
      cabinets_annuite: { id_cabinet:'',reference:'',dernier_intervenant:false,id_contact:'',pays:[] }
    }[field];
    setFormData(fd=>({
      ...fd,
      [field]: [...fd[field], empty]
    }));
  };

  const handleRemoveField = (idx, field) => {
    setFormData(fd=>({
      ...fd,
      [field]: fd[field].filter((_,i)=>i!==idx)
    }));
  };

  const handleAddSubField = (idx, field, subField) => {
    setFormData(fd=>({
      ...fd,
      [field]: fd[field].map((it,i)=> i===idx
        ? { ...it, [subField]: [...(it[subField]||[]), { id_pays:'', licence:false }] }
        : it
      )
    }));
  };

  const handleRemoveSubField = (idx, field, subIdx, subField) => {
    setFormData(fd=>({
      ...fd,
      [field]: fd[field].map((it,i)=> i===idx
        ? { ...it, [subField]: it[subField].filter((_,j)=>j!==subIdx) }
        : it
      )
    }));
  };

  const fetchContactsHandler = (cabId, type) => {
    // attribut aux state internes si besoin…
    // ou réexposer le fetch pour le composant
  };

  const getCountriesForSelection = () =>
    safeArray(formData.infos_depot).map(x=>x.id_pays)
      .length ? formData.infos_depot.map(x=>x.id_pays) : safeArray(pays).map(p=>p.id_pays);

  const handleSubmit = e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k,v])=>{
      if (Array.isArray(v)|| typeof v==='object') fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    fetch(`${API_BASE_URL}/api/brevets/${brevetId}`, { method:'PUT', body: fd })
      .then(()=> { refreshBrevets?.(); handleClose(); })
      .catch(console.error);
  };

  return {
    formData,
    loading,
    error,
    clients,
    statuts: statutsList,
    paysList: pays,
    cabinets: { procedure: procedureCabinets, annuite: annuiteCabinets },
    contactsProcedure,
    contactsAnnuite,
    handleChange,
    handleDynamicChange,
    handleDynamicChangeForSubField,
    handleAddField,
    handleRemoveField,
    handleAddSubField,
    handleRemoveSubField,
    fetchContacts: fetchContactsHandler,
    getCountriesForSelection,
    handleSubmit
  };
};

export default useBrevetFormModif;
