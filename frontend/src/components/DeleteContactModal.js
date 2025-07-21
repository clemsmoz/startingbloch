import React from 'react';
import T from '../components/T';
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
        <Modal.Title><T>Supprimer contact</T></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <T>Êtes-vous sûr de vouloir supprimer le contact ?</T>
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

export default DeleteContactModal;
