import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const EditContactModal = ({ show, handleClose, refreshContacts, contact }) => {
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
    axios.put(`http://localhost:3100/contacts/${contact.id_contact}`, formData)
      .then(() => {
        refreshContacts();
        handleClose();
      })
      .catch(error => {
        console.error('There was an error updating the contact!', error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier contact</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formContactName" className="mt-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              name="nom_contact"
              value={formData.nom_contact}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formContactPrenom" className="mt-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              name="prenom_contact"
              value={formData.prenom_contact}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formContactTelephone" className="mt-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control
              type="text"
              name="telephone_contact"
              value={formData.telephone_contact}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formContactEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email_contact"
              value={formData.email_contact}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">Sauvarder changement</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditContactModal;
