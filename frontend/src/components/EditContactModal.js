import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { API_BASE_URL } from '../config';
import T from './T';
import useTranslation from '../hooks/useTranslation';

const EditContactModal = ({ show, handleClose, refreshContacts, contact }) => {
  const { alert } = useTranslation();
  const [formData, setFormData] = useState({
    nom_contact: '',
    prenom_contact: '',
    telephone_contact: '',
    email_contact: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        nom_contact: contact.nom_contact || '',
        prenom_contact: contact.prenom_contact || '',
        telephone_contact: contact.telephone_contact || '',
        email_contact: contact.email_contact || ''
      });
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/contacts/${contact.id_contact}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        alert('CONTACT_UPDATED', 'Contact mis à jour avec succès');
        refreshContacts();
        handleClose();
      })
      .catch(error => {
        console.error('There was an error updating the contact!', error);
        alert('UPDATE_ERROR', 'Erreur lors de la mise à jour du contact');
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title><T>Modifier contact</T></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formContactName" className="mt-3">
            <Form.Label><T>Nom</T></Form.Label>
            <Form.Control
              type="text"
              name="nom_contact"
              value={formData.nom_contact}
              onChange={handleChange}
              placeholder="Entrez le nom"
            />
          </Form.Group>
          <Form.Group controlId="formContactPrenom" className="mt-3">
            <Form.Label><T>Prénom</T></Form.Label>
            <Form.Control
              type="text"
              name="prenom_contact"
              value={formData.prenom_contact}
              onChange={handleChange}
              placeholder="Entrez le prénom"
            />
          </Form.Group>
          <Form.Group controlId="formContactTelephone" className="mt-3">
            <Form.Label><T>Téléphone</T></Form.Label>
            <Form.Control
              type="text"
              name="telephone_contact"
              value={formData.telephone_contact}
              onChange={handleChange}
              placeholder="Entrez le numéro de téléphone"
            />
          </Form.Group>
          <Form.Group controlId="formContactEmail" className="mt-3">
            <Form.Label><T>Email</T></Form.Label>
            <Form.Control
              type="email"
              name="email_contact"
              value={formData.email_contact}
              onChange={handleChange}
              placeholder="Entrez l'adresse email"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            <T>Sauvegarder les changements</T>
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditContactModal;
