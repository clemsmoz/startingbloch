import React from <T>react';
import T from '../components/T';
import { Card, Row, Col, Button, Form } from"react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from"../../hooks/useBrevetFormModif';  // Importez votre hook ici

const ClientSection = ({ brevetId }) => {
  // Appeler le hook directement dans le composant
  const { formData, handleDynamicChange, handleAddField, handleRemoveField, clients } = useBrevetFormModif(brevetId);

  console.log('Clients récupérés dans ClientSection:', clients);
  console.log('FormData.clients:', formData.clients);

  return (
    <Card className="mb-3">
      <Card.Header><T>Clients</T></Card.Header>
      <Card.Body>
        {formData.clients && formData.clients.length > 0 ? (
          formData.clients.map((client, index) => (
            <Row key={index} className="mb-2">
              <Form.Group as={Col}>
                <Form.Control
                  as={<T>select</T>}
                  name="id_client"value={client.id_client || ''}
                  onChange={(e) => handleDynamicChange(e, index, 'clients')}
                >
                  <option value=""><T>Sélectionner un client</T></option>
                  {clients && clients.length > 0 && clients.map(clientOption => (
                    <option key={clientOption.id_client} value={clientOption.id_client}>
                      {clientOption.nom_client}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Col xs={<T>auto</T>}>
                <Button variant="danger"onClick={() => handleRemoveField(index, 'clients')}>
                  <FaMinus /> Retirer
                </Button>
              </Col>
            </Row>
          ))
        ) : (
          <p><T>Aucun client ajouté.</T></p>
        )}
        <Button variant="success"onClick={() => handleAddField('clients')}>
          <FaPlus /> Ajouter un client
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ClientSection;
