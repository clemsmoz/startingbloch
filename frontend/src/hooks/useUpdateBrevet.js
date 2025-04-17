import { useEffect } from 'react';
import { API_BASE_URL } from '../config';
import useAddBrevet from '../hooks/useAddBrevet';
import useBrevetData from '../hooks/useBrevetData';
// utilitaire
const safeArray = arr => Array.isArray(arr) ? arr : [];

const useUpdateBrevet = (brevetId, handleClose) => {
  const {
    brevet,
    procedureCabinets,
    annuiteCabinets,
    contactsProcedure,
    contactsAnnuite,
    clients,
    inventeurs,
    deposants,
    titulaires,
    pays,
    piecesJointes,
  } = useBrevetData(brevetId);

  const { formData, setFormData, setLoading, setError, setConfirmationMessage, setIsError, setConfirmationModal, ...rest } 
        = useAddBrevet(handleClose);

  useEffect(() => {
    if (brevet) {
      const fd = {
        ...brevet,
        date_depot: brevet.date_depot?.split('T')[0] || '',
        date_delivrance: brevet.date_delivrance?.split('T')[0] || '',
        clients: safeArray(clients),
        inventeurs: safeArray(inventeurs),
        deposants: safeArray(deposants),
        titulaires: safeArray(titulaires),
        pays: safeArray(pays),
        pieces_jointes: safeArray(piecesJointes),
        cabinets_procedure: safeArray(procedureCabinets),
        cabinets_annuite: safeArray(annuiteCabinets),
      };
      setFormData(fd);
    }
  }, [brevet, clients, inventeurs, deposants, titulaires, pays, piecesJointes, procedureCabinets, annuiteCabinets]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = new FormData();
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        dataToSubmit.append(key, JSON.stringify(formData[key]));
      } else {
        dataToSubmit.append(key, formData[key]);
      }
    });

    try {
      await fetch(`${API_BASE_URL}/api/brevets/${brevetId}`, {
        method: 'PUT',
        body: dataToSubmit,
      });
      setConfirmationMessage('Le brevet a été modifié avec succès.');
      setIsError(false);
    } catch (err) {
      setConfirmationMessage("Une erreur est survenue lors de la modification du brevet.");
      setIsError(true);
      console.error('Erreur lors de la modification du brevet:', err);
    } finally {
      setLoading(false);
      setConfirmationModal(true);
    }
  };

  return {
    formData,
    // ...existing return...
    ...rest,
    handleUpdateSubmit: rest.handleUpdateSubmit
  };
};

export default useUpdateBrevet;
