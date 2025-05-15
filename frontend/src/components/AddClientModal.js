import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../config';
import axios from 'axios';

const AddClientModal = ({ show, handleClose, refreshClients }) => {
  const [formData, setFormData] = useState({
    nom_client: '',
    reference_client: '',
    adresse_client: '',
    code_postal: '',
    pays_client: '',
    email_client: '',
    telephone_client: ''
  });

  const [loading, setLoading] = useState(false);  // Pour gérer l'état de chargement
  const [error, setError] = useState(null);       // Pour gérer les erreurs

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Activation de l'état de chargement
    setError(null);    // Réinitialisation des erreurs

    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Client créé avec succès:', data);
      refreshClients();
      handleClose();
    } catch (err) {
      console.error('Erreur lors de la création du client:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);  // Désactivation de l'état de chargement
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter nouveau client</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}  {/* Affichage de l'erreur */}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formClientName" className="mt-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              name="nom_client"
              value={formData.nom_client}
              onChange={handleChange}
              
            />
          </Form.Group>
          <Form.Group controlId="formClientReference" className="mt-3">
            <Form.Label>Référence</Form.Label>
            <Form.Control
              type="text"
              name="reference_client"
              value={formData.reference_client}
              onChange={handleChange}
              
            />
          </Form.Group>
          <Form.Group controlId="formClientAdresse" className="mt-3">
            <Form.Label>Adresse</Form.Label>
            <Form.Control
              type="text"
              name="adresse_client"
              value={formData.adresse_client}
              onChange={handleChange}
              
            />
          </Form.Group>
          <Form.Group controlId="formClientCodePostal" className="mt-3">
            <Form.Label>Code Postal</Form.Label>
            <Form.Control
              type="text"
              name="code_postal"
              value={formData.code_postal}
              onChange={handleChange}
              
            />
          </Form.Group>
          <Form.Group controlId="formClientPays" className="mt-3">
            <Form.Label>Pays</Form.Label>
            <Form.Control
              type="text"
              name="pays_client"
              value={formData.pays_client}
              onChange={handleChange}
              
            />
          </Form.Group>
          <Form.Group controlId="formClientEmail" className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email_client"
              value={formData.email_client}
              onChange={handleChange}
    
            />
          </Form.Group>
          <Form.Group controlId="formClientTelephone" className="mt-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control
              type="text"
              name="telephone_client"
              value={formData.telephone_client}
              onChange={handleChange}
              
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter client'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddClientModal;
