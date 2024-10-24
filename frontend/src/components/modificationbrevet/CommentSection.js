import React from 'react';
import { Card, Form } from 'react-bootstrap';
import useBrevetFormModif from '../../hooks/useBrevetFormModif';  // Importer le hook

const CommentSection = ({ brevetId }) => {
  // Appel du hook directement dans le composant
  const { formData, handleChange, setFormData } = useBrevetFormModif(brevetId);

  return (
    <Card className="mb-3">
      <Card.Header>Commentaire et Pièce Jointe</Card.Header>
      <Card.Body>
        <Form.Group controlId="formCommentaire" className="mb-3">
          <Form.Label>Commentaire</Form.Label>
          <Form.Control
            as="textarea"
            name="commentaire"
            value={formData.commentaire}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formPieceJointe" className="mb-3">
          <Form.Label>Pièce Jointe</Form.Label>
          <Form.Control
            type="file"
            name="piece_jointe"
            onChange={(e) =>
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
