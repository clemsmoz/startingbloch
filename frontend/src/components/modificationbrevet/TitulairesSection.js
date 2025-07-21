import React from <T>react';
import T from '../components/T';
import { Card, Row, Col, Button, Form } from"react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from"../../hooks/useBrevetFormModif';  // Importer le hook

const TitulairesSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleDynamicChange, handleAddField, handleRemoveField } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header><T>Titulaires</T></Card.Header>
      <Card.Body>
        {formData.titulaires.map((item, index) => (
          <Row key={index} className="mb-2">
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="nom_titulaire"value={item.nom_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder={<T><T>Nom</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="prenom_titulaire"value={item.prenom_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder={<T><T>Prénom</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="email"name="email_titulaire"value={item.email_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder={<T><T>Email</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="text"name="telephone_titulaire"value={item.telephone_titulaire}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder={<T><T>Téléphone</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Control
                type="number"name="part_pi"value={item.part_pi}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                placeholder={<T><T>Part PI</T></T>}
              />
            </Form.Group>
            <Form.Group as={Col} className=<T>d-flex align-items-center</T>>
              <Form.Check
                type="checkbox"name="executant"checked={item.executant}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                label={<T><T>Exécutant</T></T>}
              />
              <Form.Check
                type="checkbox"name="client_correspondant"checked={item.client_correspondant}
                onChange={(e) => handleDynamicChange(e, index, 'titulaires')}
                label={<T><T>Client Correspondant</T></T>}
              />
            </Form.Group>
            <Col xs={<T>auto</T>}>
              <Button variant="danger"onClick={() => handleRemoveField(index, 'titulaires')}>
                <FaMinus />
              </Button>
            </Col>
          </Row>
        ))}
        <Button variant="success"onClick={() => handleAddField('titulaires')}>
          <FaPlus /> Ajouter un titulaire
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TitulairesSection;
