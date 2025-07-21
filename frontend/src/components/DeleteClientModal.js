import React from 'react';
import T from '../components/T';
import { Modal, Button } from 'react-bootstrap';
import { API_BASE_URL } from '../config';

const DeleteClientModal = ({ show, handleClose, refreshClients, client }) => {
  const handleDelete = () => {
    fetch(`${API_BASE_URL}/api/clients/${client.id_client}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        refreshClients();
        handleClose();
      })
      .catch(error => {
        console.error('There was an error deleting the client!', error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title><T>Supprimer Client</T></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <T>Êtes-vous sûr de vouloir supprimer le client ?</T>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <T>Annuler</T>
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          <T>Supprimer</T>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteClientModal;
