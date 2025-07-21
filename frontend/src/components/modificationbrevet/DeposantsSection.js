import React from <T>react';
import T from '../components/T';
import { Card, Row, Col, Button, Form } from"react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from"../../hooks/useBrevetFormModif';  // Importer le hook

const DeposantsSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleDynamicChange, handleAddField, handleRemoveField } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header><T>Déposants</T></Card.Header>
      <Card.Body>
        {formData.deposants.map((item, index) => (
          <Row key={index} className="mb-2">
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="nom_deposant"value={item.nom_deposant}
                onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                placeholder={<T><T>Nom</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="prenom_deposant"value={item.prenom_deposant}
                onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                placeholder={<T><T>Prénom</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="email"name="email_deposant"value={item.email_deposant}
                onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                placeholder={<T><T>Email</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="telephone_deposant"value={item.telephone_deposant}
                onChange={(e) => handleDynamicChange(e, index, 'deposants')}
                placeholder={<T><T>Téléphone</T></T>}
              />
            </Form.Group>
            <Col xs={<T>auto</T>}>
              <Button variant="danger"onClick={() => handleRemoveField(index, 'deposants')}>
                <FaMinus />
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="success"onClick={() => handleAddField('deposants')}>
          <FaPlus /> Ajouter un déposant
        </Button>
      </Card.Body>
    </Card>
  );
};

export default DeposantsSection;
