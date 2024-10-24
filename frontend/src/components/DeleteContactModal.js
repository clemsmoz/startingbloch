import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const DeleteContactModal = ({ show, handleClose, refreshContacts, contact }) => {
  const handleDelete = () => {
    axios.delete(`http://localhost:3100/contacts/${contact.id_contact}`)
      .then(() => {
        refreshContacts();
        handleClose();
      })
      .catch(error => {
        console.error('There was an error deleting the contact!', error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Supprimer contact</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      êtes-vous sur de vouloir supprimer le contact ? 
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Annuler</Button>
        <Button variant="danger" onClick={handleDelete}>Suprimmer</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteContactModal;
