import React from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from '../../hooks/useBrevetFormModif';  // Importer le hook

const PaysSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleDynamicChange, handleAddField, handleRemoveField, paysList } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header>Pays, Numéro de Dépôt et Numéro de Publication</Card.Header>
      <Card.Body>
        {formData.pays.map((item, index) => (
          <Row key={index} className="mb-2">
            <Form.Group as={Col}>
              <Form.Control
                as="select"
                name="id_pays"
                value={item.id_pays}
                onChange={(e) => handleDynamicChange(e, index, 'pays')}
                className="me-2"
              >
                <option value="">Sélectionner un pays</option>
                {paysList.map((paysItem) => (
                  <option key={paysItem.id_pays} value={paysItem.id_pays}>
                    {paysItem.nom_fr_fr}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"
                name="numero_depot"
                value={item.numero_depot}
                onChange={(e) => handleDynamicChange(e, index, 'pays')}
                placeholder="Numéro de dépôt"
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"
                name="numero_publication"
                value={item.numero_publication}
                onChange={(e) => handleDynamicChange(e, index, 'pays')}
                placeholder="Numéro de publication"
              />
            </Form.Group>
            <Col xs="auto">
              <Button variant="danger" onClick={() => handleRemoveField(index, 'pays')}>
                <FaMinus />
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="success" onClick={() => handleAddField('pays')}>
          <FaPlus /> Ajouter un pays
        </Button>
      </Card.Body>
    </Card>
  );
};

export default PaysSection;
