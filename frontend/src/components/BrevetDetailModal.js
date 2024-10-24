// components/BrevetDetailModal.js

import React, { useState, useEffect } from 'react';
import { Modal as BootstrapModal, Button as BootstrapButton, Table, Container } from 'react-bootstrap';
import { Modal, Box, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Document, Page, pdfjs } from 'react-pdf';
import useBrevetData from '../hooks/useBrevetData';

// Configurer le worker pour react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const BrevetDetailModal = ({ show, handleClose, brevetId }) => {
  const {
    brevet,
    procedureCabinets,
    annuiteCabinets,
    contactsProcedure,
    contactsAnnuite,
    clients,
    inventeurs,
    deposants,
    titulaires,
    statut,
    pays,
    piecesJointes,// Ajoutez ici les pièces jointes
    generatePDF 

  } = useBrevetData(brevetId);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityType, setEntityType] = useState('');
  const [openEntityModal, setOpenEntityModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // État pour l'aperçu
  const [numPages, setNumPages] = useState(null); // Nombre de pages pour PDF
  const [textContent, setTextContent] = useState(''); // Contenu pour les fichiers texte

  const handleOpenEntityModal = (entity, type) => {
    setSelectedEntity(entity);
    setEntityType(type);
    setOpenEntityModal(true);
  };

  const handleCloseEntityModal = () => {
    setOpenEntityModal(false);
    setSelectedEntity(null);
    setEntityType('');
  };
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePreview = (pieceJointe) => {
    setShowPreview(pieceJointe); // Enregistre la pièce jointe pour la prévisualisation
  };

  useEffect(() => {
    if (showPreview && brevet.piece_jointe_type.includes('text')) {
      const filePath = `http://localhost:3100/brevets/${brevet.id_brevet}/piece-jointe`;
      fetch(filePath)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          if (brevet.piece_jointe_type === 'text/html') {
            return response.text(); // Pour text/html
          }
          return response.text(); // Pour text/plain
        })
        .then(data => setTextContent(data))
        .catch(err => console.error('Erreur lors du chargement du fichier texte:', err));
    }
  }, [showPreview, brevet]);

  if (!brevet) {
    return null;
  }

  // Fonction pour rendre l'aperçu en fonction du type de fichier
  const renderPreview = () => {
    const fileType = brevet.piece_jointe_type;
    const filePath = `http://localhost:3100/brevets/${brevet.id_brevet}/piece-jointe`;

    console.log("Rendering preview for type:", fileType);
    console.log("File path:", filePath);

    if (fileType.includes('pdf')) {
      return (
        <Document file={filePath} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(error) => console.error("Error loading PDF:", error)}>
          {numPages ? (
            Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))
          ) : (
            <Typography>Chargement du PDF...</Typography>
          )}
        </Document>
      );
    } else if (fileType.startsWith('image/')) {
      return <img src={filePath} alt="Aperçu" style={{ maxWidth: '100%', height: 'auto' }} onError={(e) => console.error("Error loading image:", e)} />;
    } else if (fileType.includes('text')) {
      return (
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxHeight: '400px', overflow: 'auto' }}>
          {textContent || 'Chargement...'}
        </pre>
      );
    } else {
      console.log("Type de fichier non supporté:", fileType);
      return <Typography variant="body2" color="textSecondary">Aperçu non disponible pour ce type de fichier.</Typography>;
    }
  };

  return (
    <>
      <BootstrapModal show={show} onHide={handleClose} fullscreen>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff', fontFamily: 'Roboto, sans-serif' }}>
            Détails du Brevet
            <button onClick={generatePDF}>Exporter en PDF</button>

          </BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body style={{ backgroundColor: '#f0f2f5', padding: '30px' }}>
          <Container fluid>
            <Table
              bordered
              hover
              responsive
              className="table-modern"
              style={{
                border: '2px solid #007bff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                width: '100%',
              }}
            >
              <thead
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                <tr>
                  <th>Informations Générales</th>
                  <th>Clients</th>
                  <th>Inventeurs</th>
                  <th>Déposants</th>
                  <th>Titulaires</th>
                  <th>Cabinets de Procédure</th>
                  <th>Cabinets d'Annuité</th>
                  <th>Pays</th>
                  <th>Commentaire et Pièce Jointe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Informations Générales */}
                  <td>
                    <div>
                      <strong>Référence Famille:</strong> {brevet.reference_famille || 'N/A'}
                    </div>
                    <div>
                      <strong>Titre:</strong> {brevet.titre || 'N/A'}
                    </div>
                    <div>
                      <strong>Statut:</strong> {statut ? statut.valeur : 'N/A'}
                    </div>
                    <div>
                      <strong>Date Dépôt:</strong>{' '}
                      {brevet.date_depot ? new Date(brevet.date_depot).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <strong>Date Délivrance:</strong>{' '}
                      {brevet.date_delivrance ? new Date(brevet.date_delivrance).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <strong>Numéro Délivrance:</strong> {brevet.numero_delivrance || 'N/A'}
                    </div>
                    <div>
                      <strong>Licence:</strong> {brevet.licence ? 'Oui' : 'Non'}
                    </div>
                  </td>

                  {/* Clients */}
                  <td>
                    {clients && clients.length > 0 ? (
                      clients.map((client, index) => (
                        <div
                          key={index}
                          className="text-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEntityModal(client, 'client');
                          }}
                        >
                          {client.nom_client} {client.prenom_client}
                          {index < clients.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun client associé</p>
                    )}
                  </td>

                  {/* Inventeurs */}
                  <td>
                    {inventeurs && inventeurs.length > 0 ? (
                      inventeurs.map((inventeur, index) => (
                        <div
                          key={index}
                          className="text-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEntityModal(inventeur, 'inventeur');
                          }}
                        >
                          {inventeur.nom} {inventeur.prenom}
                          {index < inventeurs.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun inventeur</p>
                    )}
                  </td>

                  {/* Déposants */}
                  <td>
                    {deposants && deposants.length > 0 ? (
                      deposants.map((deposant, index) => (
                        <div
                          key={index}
                          className="text-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEntityModal(deposant, 'deposant');
                          }}
                        >
                          {deposant.nom} {deposant.prenom}
                          {index < deposants.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun déposant</p>
                    )}
                  </td>

                  {/* Titulaires */}
                  <td>
                    {titulaires && titulaires.length > 0 ? (
                      titulaires.map((titulaire, index) => (
                        <div
                          key={index}
                          className="text-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEntityModal(titulaire, 'titulaire');
                          }}
                        >
                          {titulaire.nom} {titulaire.prenom}
                          {index < titulaires.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun titulaire</p>
                    )}
                  </td>

                  {/* Cabinets de Procédure */}
                  <td>
                    {procedureCabinets && procedureCabinets.length > 0 ? (
                      procedureCabinets.map((cabinet, index) => (
                        <div
                          key={index}
                          className="text-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEntityModal(cabinet, 'cabinet');
                          }}
                        >
                          {cabinet.nom_cabinet}
                          <div>
                            <strong>Contacts:</strong>
                          </div>
                          <ul>
                            {contactsProcedure
                              .filter((contact) => contact.id_cabinet === cabinet.id_cabinet)
                              .map((contact, idx) => (
                                <li
                                  key={idx}
                                  className="text-link"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEntityModal(contact, 'contact');
                                  }}
                                >
                                  {contact.nom} {contact.prenom}
                                </li>
                              ))}
                          </ul>
                          {index < procedureCabinets.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun cabinet de procédure</p>
                    )}
                  </td>

                  {/* Cabinets d'Annuité */}
                  <td>
                    {annuiteCabinets && annuiteCabinets.length > 0 ? (
                      annuiteCabinets.map((cabinet, index) => (
                        <div
                          key={index}
                          className="text-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEntityModal(cabinet, 'cabinet');
                          }}
                        >
                          {cabinet.nom_cabinet}
                          <div>
                            <strong>Contacts:</strong>
                          </div>
                          <ul>
                            {contactsAnnuite
                              .filter((contact) => contact.id_cabinet === cabinet.id_cabinet)
                              .map((contact, idx) => (
                                <li
                                  key={idx}
                                  className="text-link"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEntityModal(contact, 'contact');
                                  }}
                                >
                                  {contact.nom} {contact.prenom}
                                </li>
                              ))}
                          </ul>
                          {index < annuiteCabinets.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun cabinet d'annuité</p>
                    )}
                  </td>

                  {/* Pays */}
                  <td>
                    {pays && pays.length > 0 ? (
                      pays.map((p, index) => (
                        <div key={index}>
                          <strong>Pays:</strong> {p.nom_fr_fr}
                          <br />
                          <strong>Numéro de Dépôt:</strong> {p.numero_depot}
                          <br />
                          <strong>Numéro de Publication:</strong> {p.numero_publication}
                          {index < pays.length - 1 && <hr style={{ margin: '10px 0' }} />}
                        </div>
                      ))
                    ) : (
                      <p>Aucun pays trouvé</p>
                    )}
                  </td>

                 {/* Commentaire et Pièce Jointe */}
                 <td>
                    <div>
                      <strong>Commentaire:</strong> {brevet.commentaire || 'Aucun commentaire'}
                    </div>
                    {piecesJointes && piecesJointes.length > 0 ? (
                      piecesJointes.map((piece, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <h4 style={{ marginRight: '10px' }}>{piece.nom_fichier}</h4>
                          
                          {/* Bouton de téléchargement */}
                          <IconButton
                            href={`data:${piece.type_fichier};base64,${piece.donnees.toString('base64')}`}
                            download={piece.nom_fichier}
                            color="primary"
                            style={{ marginRight: '10px' }}
                          >
                            <DownloadIcon />
                          </IconButton>

                          {/* Bouton de prévisualisation */}
                          <IconButton
                            onClick={() => {
                              setShowPreview(piece); // Active la prévisualisation du fichier
                            }}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>

                        </div>
                      ))
                    ) : (
                      <p>Aucune pièce jointe disponible</p>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Container>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <BootstrapButton
            variant="primary"
            onClick={handleClose}
            style={{ backgroundColor: '#007bff', borderColor: '#007bff', borderRadius: '50px' }}
          >
            Fermer
          </BootstrapButton>
        </BootstrapModal.Footer>
      </BootstrapModal>


      

      {/* Modal pour les détails des entités (Clients, Inventeurs, etc.) */}
      <Modal
        open={openEntityModal}
        onClose={handleCloseEntityModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            position: 'relative',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: 24,
            borderRadius: 4,
            outline: 'none',
            textAlign: 'center',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseEntityModal}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#333' }}
          >
            <CloseIcon />
          </IconButton>
          {selectedEntity && (
            <div>
              <Typography
                variant="h5"
                gutterBottom
                style={{ fontWeight: 'bold', color: '#007bff', fontFamily: 'Roboto, sans-serif' }}
              >
                Information du {entityType.charAt(0).toUpperCase() + entityType.slice(1)} :{' '}
                {selectedEntity.nom || selectedEntity.nom_client} {selectedEntity.prenom || selectedEntity.prenom_client} {selectedEntity.nom_cabinet}
              </Typography>
              {selectedEntity.email && <Typography>Email: {selectedEntity.email}</Typography>}
              {selectedEntity.telephone && <Typography>Téléphone: {selectedEntity.telephone}</Typography>}
              {selectedEntity.adresse_client && <Typography>Adresse: {selectedEntity.adresse_client}</Typography>}
              {selectedEntity.reference && <Typography>Référence: {selectedEntity.reference}</Typography>}
            </div>
          )}
          <Button
            variant="contained"
            onClick={handleCloseEntityModal}
            sx={{ mt: 2, borderRadius: '20px', backgroundColor: '#007bff' }}
          >
            Fermer
          </Button>
        </Box>
      </Modal>

        {/* Modal de prévisualisation */}
        {showPreview && (
        <Modal open={Boolean(showPreview)} onClose={() => setShowPreview(false)}>
          <Box
            sx={{
              p: 4,
              bgcolor: 'background.paper',
              width: '80%',
              maxWidth: '600px',
              margin: 'auto',
              boxShadow: 24,
              borderRadius: 4,
              outline: 'none',
              textAlign: 'center',
            }}
          >
            <IconButton
              aria-label="close"
              onClick={() => setShowPreview(false)}
              sx={{ position: 'absolute', right: 8, top: 8, color: '#333' }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" gutterBottom>
              Aperçu de {showPreview?.nom_fichier || 'Inconnu'}
            </Typography>

            {/* Vérification de la présence de type de fichier avant l'affichage */}
            {showPreview?.type_fichier ? (
              showPreview.type_fichier.includes('pdf') ? (
                <Document
                  file={`data:${showPreview.type_fichier};base64,${showPreview.donnees.toString('base64')}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => console.error('Error loading PDF:', error)}
                >
                  {numPages
                    ? Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                      ))
                    : 'Chargement du PDF...'}
                </Document>
              ) : showPreview.type_fichier.startsWith('image/') ? (
                <img
                  src={`data:${showPreview.type_fichier};base64,${showPreview.donnees.toString('base64')}`}
                  alt="Aperçu"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Aperçu non disponible pour ce type de fichier.
                </Typography>
              )
            ) : (
              <Typography variant="body2" color="textSecondary">
                Type de fichier non disponible.
              </Typography>
            )}
          </Box>
        </Modal>
              )}

    </>
    
  );
};

export default BrevetDetailModal;
