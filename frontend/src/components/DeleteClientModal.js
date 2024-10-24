import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const DeleteClientModal = ({ show, handleClose, refreshClients, client }) => {
  const handleDelete = () => {
    axios.delete(`http://localhost:3100/clients/${client.id_client}`)
      .then(() => {
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
        <Modal.Title>Supprimer Client</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        êtes-vous sur de vouloir supprimer le client ?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Suprimmer 
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteClientModal;
