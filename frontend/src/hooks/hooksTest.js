import { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';

const useAllBrevetsData = () => {
  const [brevets, setBrevets] = useState([]);
  const [statutsList, setStatutsList] = useState([]);
  const [selectedBrevetId, setSelectedBrevetId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // Récupérer tous les brevets
//   const fetchBrevets = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get('http://localhost:3100/brevets');
//       setBrevets(response.data.data);
//       setError(null);
//     } catch (error) {
//       setError('Erreur lors de la récupération des brevets');
//     } finally {
//       setLoading(false);
//     }
//   };

  const addBrevet = async (brevetData) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3100/api/brevets', brevetData);
    //   fetchBrevets(); // Refresh the list after adding
      setError(null);
    } catch (error) {
      setError('Erreur lors de l\'ajout du brevet');
    } finally {
      setLoading(false);
    }
  };

  // Modifier un brevet
  const updateBrevet = async (brevetId, brevetData) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:3100/brevets/${brevetId}`, brevetData);
    //   fetchBrevets(); // Refresh the list after editing
      setError(null);
    } catch (error) {
      setError('Erreur lors de la modification du brevet');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un brevet
  const deleteBrevet = async (brevetId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3100/brevets/${brevetId}`);
    //   fetchBrevets(); // Refresh the list after deletion
      setError(null);
    } catch (error) {
      setError('Erreur lors de la suppression du brevet');
    } finally {
      setLoading(false);
    }
};
  // Fonction de gestion de suppression avec confirmation
  const handleDeleteBrevet = (brevetId, event) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce brevet ?")) {
      deleteBrevet(brevetId);
    }
  };


  // Gestion des modals
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  


  const handleShowEditModal = (brevetId, event) => {
    setSelectedBrevetId(brevetId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);


  useEffect(() => {
    const fetchAllBrevetsIds = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer tous les brevets et extraire les IDs
        console.log('Fetching all brevets...');
        const brevetsResponse = await axios.get('http://localhost:3100/brevets');
        const brevetsData = brevetsResponse.data.data || [];
        const brevetIds = brevetsData.map(brevet => brevet.id_brevet);
        console.log('Brevets IDs fetched:', brevetIds);

        // Récupérer les données pour chaque brevet
        const updatedBrevets = await Promise.all(brevetIds.map(async (brevetId) => {
          console.log(`Fetching data for brevet ID: ${brevetId}`);

          const fetchBrevetData = async (brevetId) => {
            try {
              // Récupérer les données du brevet
              const brevetResponse = await axios.get(`http://localhost:3100/brevets/${brevetId}`);
              const brevetData = brevetResponse.data.data;

              // Récupérer les clients associés au brevet
              const clientsResponse = await axios.get(`http://localhost:3100/brevets/${brevetId}/clients`);
              brevetData.clients = clientsResponse.data.data || [];

              // Récupérer tous les statuts et trouver celui correspondant
              const statutsResponse = await axios.get(`http://localhost:3100/statuts`);
              const allStatuts = statutsResponse.data.data;
              setStatutsList(allStatuts);
              const matchingStatut = allStatuts.find(st => st.id_statuts === brevetData.id_statuts);
              brevetData.statut = matchingStatut;

              // Récupérer les données connexes (Inventeurs, Déposants, Titulaires, etc.)
              if (brevetData.inventeurs && brevetData.inventeurs.length > 0) {
                const inventeurIds = brevetData.inventeurs.map(inv => inv.id_inventeur);
                const inventeursResponse = await axios.get(`http://localhost:3100/inventeur`, {
                  params: { id_inventeurs: inventeurIds },
                  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
                });
                brevetData.inventeurs = inventeursResponse.data.data || [];
              } else {
                brevetData.inventeurs = [];
              }

              if (brevetData.deposants && brevetData.deposants.length > 0) {
                const deposantIds = brevetData.deposants.map(dep => dep.id_deposant);
                const deposantsResponse = await axios.get(`http://localhost:3100/deposant`, {
                  params: { id_deposants: deposantIds }
                });
                brevetData.deposants = deposantsResponse.data.data || [];
              } else {
                brevetData.deposants = [];
              }

              if (brevetData.titulaires && brevetData.titulaires.length > 0) {
                const titulaireIds = brevetData.titulaires.map(tit => tit.id_titulaire);
                const titulairesResponse = await axios.get(`http://localhost:3100/titulaire`, {
                  params: { id_titulaires: titulaireIds }
                });
                brevetData.titulaires = titulairesResponse.data.data || [];
              } else {
                brevetData.titulaires = [];
              }

              // Récupérer les pays associés
              const paysResponse = await axios.get(`http://localhost:3100/numeros_pays`, {
                params: { id_brevet: brevetId }
              });
              brevetData.pays = paysResponse.data.data || [];

              // Récupérer les cabinets
              const cabinetsResponse = await axios.get(`http://localhost:3100/cabinets`, {
                params: { id_brevet: brevetId }
              });
              const cabinetDetailsPromises = cabinetsResponse.data.data.map(cabinet =>
                axios.get(`http://localhost:3100/cabinet/${cabinet.id_cabinet}`)
              );
              const cabinetsDetails = await Promise.all(cabinetDetailsPromises);
              const completeCabinetsData = cabinetsDetails.map(res => res.data.data);

              const procedureCabinetsData = completeCabinetsData.filter(cabinet => cabinet.type === 'procedure');
              const annuiteCabinetsData = completeCabinetsData.filter(cabinet => cabinet.type === 'annuite');

              brevetData.procedureCabinets = procedureCabinetsData;
              brevetData.annuiteCabinets = annuiteCabinetsData;

              // Récupérer les contacts des cabinets
              const contactsProcedurePromises = procedureCabinetsData.map(cabinet =>
                axios.get(`http://localhost:3100/contacts/cabinets/${cabinet.id_cabinet}`)
              );
              const contactsProcedureResults = await Promise.all(contactsProcedurePromises);
              brevetData.contactsProcedure = contactsProcedureResults.flatMap(result => result.data.data || []);

              const contactsAnnuitePromises = annuiteCabinetsData.map(cabinet =>
                axios.get(`http://localhost:3100/contacts/cabinets/${cabinet.id_cabinet}`)
              );
              const contactsAnnuiteResults = await Promise.all(contactsAnnuitePromises);
              brevetData.contactsAnnuite = contactsAnnuiteResults.flatMap(result => result.data.data || []);

              return brevetData;
            } catch (error) {
              console.error('Erreur lors de la récupération des données:', error);
              return null;
            }
          };

          return await fetchBrevetData(brevetId);
        }));

        console.log('Updated brevets:', updatedBrevets);
        setBrevets(updatedBrevets.filter(brevet => brevet !== null));
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBrevetsIds();
  }, []);

  return {
    brevets,
    statutsList,
    isLoading,
    error,
    selectedBrevetId,
    showAddModal,
    showEditModal,
    setSelectedBrevetId,
    addBrevet,
    updateBrevet,
    deleteBrevet,
    handleDeleteBrevet, // Ajout de la fonction handleDeleteBrevet
    handleShowAddModal,
    handleCloseAddModal,
    handleShowEditModal,
    handleCloseEditModal,


  };
};

export default useAllBrevetsData;