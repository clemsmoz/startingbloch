import React, { useState, useEffect } from 'react';
import T from '../components/T';
import { Modal, Button, Form } from 'react-bootstrap';
import { API_BASE_URL } from '../config';

const EditClientModal = ({ show, handleClose, refreshClients, client }) => {
  const [formData, setFormData] = useState({
    nom_client: "",
    reference_client: '',
    adresse_client: '',
    code_postal: '',
    email_client: '',
    telephone_client: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nom_client: client.nom_client || '',
        reference_client: client.reference_client || '',
        adresse_client: client.adresse_client || '',
        code_postal: client.code_postal || '',
        email_client: client.email_client || '',
        telephone_client: client.telephone_client || ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/clients/${client.id_client}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        refreshClients();
        handleClose();
      })
      .catch(error => {
        console.error('There was an error updating the client!', error);
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title><T>Modifier client</T></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formClientName" className="mt-3">
            <Form.Label><T>Nom</T></Form.Label>
            <Form.Control
              type="text" 
              name="nom_client" 
              value={formData.nom_client}
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formClientReference" className="mt-3">
            <Form.Label><T>Référence</T></Form.Label>
            <Form.Control
              type="text" 
              name="reference_client" 
              value={formData.reference_client}
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formClientAdresse" className="mt-3">
            <Form.Label><T>Adresse</T></Form.Label>
            <Form.Control
              type="text" 
              name="adresse_client" 
              value={formData.adresse_client}
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formClientCodePostal" className="mt-3">
            <Form.Label><T>Code Postal</T></Form.Label>
            <Form.Control
              type="text" 
              name="code_postal" 
              value={formData.code_postal}
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formClientEmail" className="mt-3">
            <Form.Label><T>Email</T></Form.Label>
            <Form.Control
              type="email" 
              name="email_client" 
              value={formData.email_client}
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          <Form.Group controlId="formClientTelephone" className="mt-3">
            <Form.Label><T>Téléphone</T></Form.Label>
            <Form.Control
              type="text" 
              name="telephone_client" 
              value={formData.telephone_client}
              onChange={handleChange} 
              required 
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            <T>Sauvegarder changement</T>
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditClientModal;
