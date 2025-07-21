import React from <T>react';
import T from '../components/T';
import { Card, Row, Col, Button, Form } from"react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from"../../hooks/useBrevetFormModif';  // Importer le hook

const InventorsSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleDynamicChange, handleAddField, handleRemoveField } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header><T>Inventeurs</T></Card.Header>
      <Card.Body>
        {formData.inventeurs.map((item, index) => (
          <Row key={index} className="mb-2">
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="nom_inventeur"value={item.nom_inventeur}
                onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                placeholder={<T><T>Nom</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="prenom_inventeur"value={item.prenom_inventeur}
                onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                placeholder={<T><T>Prénom</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="email"name="email_inventeur"value={item.email_inventeur}
                onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                placeholder={<T><T>Email</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="telephone_inventeur"value={item.telephone_inventeur}
                onChange={(e) => handleDynamicChange(e, index, 'inventeurs')}
                placeholder={<T><T>Téléphone</T></T>}
              />
            </Form.Group>
            <Col xs={<T>auto</T>}>
              <Button variant="danger"onClick={() => handleRemoveField(index, 'inventeurs')}>
                <FaMinus />
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="success"onClick={() => handleAddField('inventeurs')}>
          <FaPlus /> Ajouter un inventeur
        </Button>
      </Card.Body>
    </Card>
  );
};

export default InventorsSection;
