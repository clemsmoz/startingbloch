import React from <T>react';
import T from '../components/T';
import { Card, Row, Col, Form } from 'react-bootstrap';
import useBrevetFormModif from ';../../hooks/useBrevetFormModif';  // Importer le hook

const GeneralInfo = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleChange, clients, statuts } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header><T>Informations Générales</T></Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formReferenceFamille">
            <Form.Label><T>Référence Famille</T></Form.Label>
            <Form.Control
              type="text"name="reference_famille"value={formData.reference_famille}
              onChange={handleChange} required />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formTitre">
            <Form.Label><T>Titre</T></Form.Label>
            <Form.Control
              type="text"name="titre"value={formData.titre}
              onChange={handleChange} required />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formDateDepot">
            <Form.Label><T>Date Dépôt</T></Form.Label>
            <Form.Control
              type="date"name="date_depot"value={formData.date_depot}
              onChange={handleChange} required />
          </Form.Group>
          <Form.Group as={Col} controlId="formNumeroDelivrance">
            <Form.Label><T>Numéro Délivrance</T></Form.Label>
            <Form.Control
              type="text"name="numero_delivrance"value={formData.numero_delivrance}
              onChange={handleChange} required />
          </Form.Group>
          <Form.Group as={Col} controlId="formDateDelivrance">
            <Form.Label><T>Date Délivrance</T></Form.Label>
            <Form.Control
              type="date"name="date_delivrance"value={formData.date_delivrance}
              onChange={handleChange} required />
          </Form.Group>
        </Row>
        <Form.Group controlId="formLicence"className="mb-3">
          <Form.Check
            type="checkbox"label={<T><T>Licence</T></T>}
            name="licence"checked={formData.licence}
            onChange={handleChange}
          />
        </Form.Group>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formStatut">
            <Form.Label><T>Statut</T></Form.Label>
            <Form.Control
              as={<T>select</T>}
              name="id_statuts"value={formData.id_statuts}
              onChange={handleChange}
            >
              <option value=""><T>Sélectionner un statut</T></option>
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
