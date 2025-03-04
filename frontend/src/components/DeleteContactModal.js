import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { API_BASE_URL } from '../config';

const DeleteContactModal = ({ show, handleClose, refreshContacts, contact }) => {
  const handleDelete = () => {
    fetch(`${API_BASE_URL}/api/contacts/${contact.id_contact}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
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
