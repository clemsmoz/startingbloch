import { useEffect } from 'react';
import axios from 'axios';
import useAddBrevet from '../hooks/useAddBrevet';
import useBrevetData from '../hooks/useBrevetData';

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

  const {
    formData,
    setFormData,
    clientsList,
    statuts,
    paysList,
    cabinets,
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
    handleSubmit: handleAddSubmit,
    setLoading,
    setError,
    setConfirmationMessage,
    setIsError,
    setConfirmationModal,
    fetchContacts,
    handleCloseConfirmationModal,
  } = useAddBrevet(handleClose);

  useEffect(() => {
    if (brevet) {
      // Convertir les dates au format "yyyy-MM-dd"
      const formattedDateDepot = brevet.date_depot ? new Date(brevet.date_depot).toISOString().split('T')[0] : '';
      const formattedDateDelivrance = brevet.date_delivrance ? new Date(brevet.date_delivrance).toISOString().split('T')[0] : '';

      setFormData({
        ...brevet,
        date_depot: formattedDateDepot,
        date_delivrance: formattedDateDelivrance,
        clients: clients || [],
        inventeurs: inventeurs || [],
        deposants: deposants || [],
        titulaires: titulaires || [],
        pays: pays || [],
        pieces_jointes: piecesJointes || [],
        cabinets_procedure: procedureCabinets || [],
        cabinets_annuite: annuiteCabinets || [],
      });
    }
  }, [
    brevet,
    clients,
    inventeurs,
    deposants,
    titulaires,
    pays,
    piecesJointes,
    procedureCabinets,
    annuiteCabinets,
    setFormData,
  ]);

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
      await axios.put(`http://localhost:3100/brevets/${brevetId}`, dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    handleUpdateSubmit,
    fetchContacts,
    handleCloseConfirmationModal,
  };
};

export default useUpdateBrevet;
