import React from <T>react';
import T from '../components/T';
import { Card, Row, Col, Button, Form } from"react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';
import useBrevetFormModif from"../../hooks/useBrevetFormModif';  // Importer le hook

const CabinetsSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const {
    formData,
    handleDynamicChange,
    handleAddField,
    handleRemoveField,
    cabinets,
    contactsProcedure,
    contactsAnnuite,
    fetchContacts
  } = useBrevetFormModif(brevetId);

  return (
    <>
      <Card className="mb-3">
        <Card.Header><T>Cabinets de Procédure et Contacts</T></Card.Header>
        <Card.Body>
          {formData.cabinets_procedure.map((item, index) => (
            <Row key={index} className="mb-2">
              <Form.Group as={Col}>
                <Form.Control
                  as={<T>select</T>}
                  name="id_cabinet_procedure"value={item.id_cabinet_procedure}
                  onChange={(e) => {
                    handleDynamicChange(e, index, 'cabinets_procedure');
                    fetchContacts(e.target.value, 'procedure');
                  }}
                  className="me-2">
                  <option value=""><T>Sélectionner un cabinet</T></option>
                  {cabinets.procedure.map((cabinet) => (
                    <option key={cabinet.id_cabinet} value={cabinet.id_cabinet}>
                      {cabinet.nom_cabinet}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Control
                  type="text"name="reference"value={item.reference}
                  onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                  placeholder={<T><T>Référence</T></T>}
                  className="me-2"/>
              </Form.Group>
              <Form.Group as={Col} className=<T>d-flex align-items-center</T>>
                <Form.Check
                  type="checkbox"name="dernier_intervenant"checked={item.dernier_intervenant}
                  onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                  label={<T><T>Dernier Intervenant</T></T>}
                  className="me-2"/>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Control
                  as={<T>select</T>}
                  name="id_contact_procedure"value={item.id_contact_procedure}
                  onChange={(e) => handleDynamicChange(e, index, 'cabinets_procedure')}
                  className="me-2">
                  <option value=""><T>Sélectionner un contact</T></option>
                  {contactsProcedure.map((contact) => (
                    <option key={contact.id_contact} value={contact.id_contact}>
                      {contact.nom} {contact.prenom}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Col xs={<T>auto</T>}>
                <Button variant="danger"onClick={() => handleRemoveField(index, 'cabinets_procedure')}>
                  <FaMinus />
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="success"onClick={() => handleAddField('cabinets_procedure')}>
            <FaPlus /> Ajouter un cabinet de procédure
          </Button>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header><T>Cabinets d'Annuité et Contacts</T></Card.Header>
        <Card.Body>
          {formData.cabinets_annuite.map((item, index) => (
            <Row key={index} className="mb-2">
              <Form.Group as={Col}>
                <Form.Control
                  as={<T>select</T>}
                  name="id_cabinet_annuite"value={item.id_cabinet_annuite}
                  onChange={(e) => {
                    handleDynamicChange(e, index, 'cabinets_annuite');
                    fetchContacts(e.target.value, 'annuite');
                  }}
                  className="me-2">
                  <option value=""><T>Sélectionner un cabinet</T></option>
                  {cabinets.annuite.map((cabinet) => (
                    <option key={cabinet.id_cabinet} value={cabinet.id_cabinet}>
                      {cabinet.nom_cabinet}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Control
                  type="text"name="reference"value={item.reference}
                  onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                  placeholder={<T><T>Référence</T></T>}
                  className="me-2"/>
              </Form.Group>
              <Form.Group as={Col} className=<T>d-flex align-items-center</T>>
                <Form.Check
                  type="checkbox"name="dernier_intervenant"checked={item.dernier_intervenant}
                  onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                  label={<T><T>Dernier Intervenant</T></T>}
                  className="me-2"/>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Control
                  as={<T>select</T>}
                  name="id_contact_annuite"value={item.id_contact_annuite}
                  onChange={(e) => handleDynamicChange(e, index, 'cabinets_annuite')}
                  className="me-2">
                  <option value=""><T>Sélectionner un contact</T></option>
                  {contactsAnnuite.map((contact) => (
                    <option key={contact.id_contact} value={contact.id_contact}>
                      {contact.nom} {contact.prenom}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Col xs={<T>auto</T>}>
                <Button variant="danger"onClick={() => handleRemoveField(index, 'cabinets_annuite')}>
                  <FaMinus />
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="success"onClick={() => handleAddField('cabinets_annuite')}>
            <FaPlus /> Ajouter un cabinet d'annuité
          </Button>
        </Card.Body>
      </Card>
    </>
  );
};

export default CabinetsSection;
