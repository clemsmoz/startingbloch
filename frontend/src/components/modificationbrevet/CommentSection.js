import React from <T>react';
import T from '../components/T';
import { Card, Form } from 'react-bootstrap';
import useBrevetFormModif from ';../../hooks/useBrevetFormModif';  // Importer le hook

const CommentSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleChange, setFormData } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header><T>Commentaire et Pièce Jointe</T></Card.Header>
      <Card.Body>
        <Form.Group controlId="formCommentaire"className="mb-3">
          <Form.Label><T>Commentaire</T></Form.Label>
          <Form.Control
            as={<T>textarea</T>}
            name="commentaire"value={formData.commentaire}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formPieceJointe"className="mb-3">
          <Form.Label><T>Pièce Jointe</T></Form.Label>
          <Form.Control
            type="file"name="piece_jointe"onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                piece_jointe: e.target.files[0]
              }))
            }
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default CommentSection;
