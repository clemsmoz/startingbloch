import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import useBrevetFormModif from '../../hooks/useBrevetFormModif';  // Importer le hook

const GeneralInfo = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleChange, clients, statuts } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header>Informations Générales</Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formReferenceFamille">
            <Form.Label>Référence Famille</Form.Label>
            <Form.Control
              type="text"
              name="reference_famille"
              value={formData.reference_famille}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formTitre">
            <Form.Label>Titre</Form.Label>
            <Form.Control
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formDateDepot">
            <Form.Label>Date Dépôt</Form.Label>
            <Form.Control
              type="date"
              name="date_depot"
              value={formData.date_depot}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formNumeroDelivrance">
            <Form.Label>Numéro Délivrance</Form.Label>
            <Form.Control
              type="text"
              name="numero_delivrance"
              value={formData.numero_delivrance}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formDateDelivrance">
            <Form.Label>Date Délivrance</Form.Label>
            <Form.Control
              type="date"
              name="date_delivrance"
              value={formData.date_delivrance}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        <Form.Group controlId="formLicence" className="mb-3">
          <Form.Check
            type="checkbox"
            label="Licence"
            name="licence"
            checked={formData.licence}
            onChange={handleChange}
          />
        </Form.Group>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formStatut">
            <Form.Label>Statut</Form.Label>
            <Form.Control
              as="select"
              name="id_statuts"
              value={formData.id_statuts}
              onChange={handleChange}
            >
              <option value="">Sélectionner un statut</option>
              {statuts.map((statut) => (
                <option key={statut.id_statuts} value={statut.id_statuts}>
                  {statut.valeur}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GeneralInfo;
