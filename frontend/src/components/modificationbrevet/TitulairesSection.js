import React from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from '../../hooks/useBrevetFormModif';  // Importer le hook

const TitulairesSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleDynamicChange, handleAddField, handleRemoveField } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header>Titulaires</Card.Header>
      <Card.Body>
        {formData.titulaires.map((item, index) => (
          <Row key={index} className="mb-2">
            <Form.Group as={Col}>
              <Form.Control
                type="text"
                name="nom_titulaire"
                value={item.nom_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder="Nom"
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"
                name="prenom_titulaire"
                value={item.prenom_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder="Prénom"
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="email"
                name="email_titulaire"
                value={item.email_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder="Email"
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"
                name="telephone_titulaire"
                value={item.telephone_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder="Téléphone"
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="number"
                name="part_pi"
                value={item.part_pi}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder="Part PI"
              />
            </Form.Group>
            <Form.Group as={Col} className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                name="executant"
                checked={item.executant}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                label="Exécutant"
              />
              <Form.Check
                type="checkbox"
                name="client_correspondant"
                checked={item.client_correspondant}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                label="Client Correspondant"
              />
            </Form.Group>
            <Col xs="auto">
              <Button variant="danger" onClick={() => handleRemoveField(index, 'titulaires')}>
                <FaMinus />
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="success" onClick={() => handleAddField('titulaires')}>
          <FaPlus /> Ajouter un titulaire
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TitulairesSection;
