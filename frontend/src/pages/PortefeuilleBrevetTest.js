import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Container, Form, Row, Col, Pagination } from 'react-bootstrap';
import { FaInfoCircle, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import des icônes
import useAllBrevetsData from '../hooks/hooksTest';
import '../css/BrevetList.css';  // Importation du fichier CSS

import axios from 'axios';
import Sidebar from '../components/Sidebar';
import AddBrevetModal from '../components/AddBrevetModal';
import BrevetDetailModal from '../components/BrevetDetailModal';
import EditBrevetModal from '../components/EditBrevetModal';

const BrevetsList = () => {
  const { brevets, selectedBrevetId, handleShowAddModal,
    handleCloseAddModal,
    handleCloseEditModal, showAddModal, showEditModal, handleDeleteBrevet, handleShowEditModal,
    refreshBrevets,
    isLoading, error } = useAllBrevetsData();

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('titre');
  const [references, setReferences] = useState([]);

  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInventeurModal, setShowInventeurModal] = useState(false);
  const [selectedInventeur, setSelectedInventeur] = useState(null);
  const [showDeposantModal, setShowDeposantModal] = useState(false);
  const [selectedDeposant, setSelectedDeposant] = useState(null);
  const [showTitulaireModal, setShowTitulaireModal] = useState(false);
  const [selectedTitulaire, setSelectedTitulaire] = useState(null);
  const [showCabinetModal, setShowCabinetModal] = useState(false);
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [expandedRows, setExpandedRows] = useState({}); // Gérer l'état d'expansion pour chaque tableau


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleShowClientModal = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleShowInventeurModal = (inventeur) => {
    setSelectedInventeur(inventeur);
    setShowInventeurModal(true);
  };

  const handleShowDeposantModal = (deposant) => {
    setSelectedDeposant(deposant);
    setShowDeposantModal(true);
  };

  const handleShowTitulaireModal = (titulaire) => {
    setSelectedTitulaire(titulaire);
    setShowTitulaireModal(true);
  };

  const handleShowCabinetModal = (cabinet) => {
    setSelectedCabinet(cabinet);
    setShowCabinetModal(true);
  };

  const handleShowContactModal = (contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleCloseClientModal = () => setShowClientModal(false);
  const handleCloseInventeurModal = () => setShowInventeurModal(false);
  const handleCloseDeposantModal = () => setShowDeposantModal(false);
  const handleCloseTitulaireModal = () => setShowTitulaireModal(false);
  const handleCloseCabinetModal = () => setShowCabinetModal(false);
  const handleCloseContactModal = () => setShowContactModal(false);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get('http://localhost:3100/api/reference');
        setReferences(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des références des cabinets', error);
      }
    };

    fetchReferences();
  }, []);


  const handleToggleExpand = (id_brevet) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [id_brevet]: !prevExpandedRows[id_brevet],
    }));
  };

 // Fonction utilitaire pour normaliser les espaces dans les chaînes
 const normalizeString = (str) => {
  if (typeof str === 'string') {
    return str.trim().toLowerCase();
  }
  return ''; // Retourne une chaîne vide si `str` est null ou n'est pas une chaîne
};

const normalizedSearchTerm = normalizeString(searchTerm);

const filteredBrevets = brevets.filter((brevet) => {
  if (searchFilter === 'titre') {
    return normalizeString(brevet.titre)?.includes(normalizedSearchTerm);
  } else if (searchFilter === 'reference_famille') {
    return normalizeString(brevet.reference_famille)?.includes(normalizedSearchTerm);
  } else if (searchFilter === 'reference_cabinet') {
    const matchingReferences = references.filter((ref) =>
      normalizeString(ref.reference)?.includes(normalizedSearchTerm)
    );
    return matchingReferences.some((ref) => ref.id_brevet === brevet.id_brevet);
  } else if (searchFilter === 'client') {
    return brevet.clients?.some((client) => normalizeString(client.nom_client)?.includes(normalizedSearchTerm));
  } else if (searchFilter === 'cabinet') {
    return brevet.annuiteCabinets?.some((cabinet) =>
      normalizeString(cabinet.nom_cabinet)?.includes(normalizedSearchTerm)
    ) || brevet.procedureCabinets?.some((cabinet) =>
      normalizeString(cabinet.nom_cabinet)?.includes(normalizedSearchTerm)
    );
  } else if (searchFilter === 'pays') {
    return brevet.pays?.some((p) => normalizeString(p.nom_fr_fr)?.includes(normalizedSearchTerm));
  }
  return true;
});

  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrevets = filteredBrevets.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (e) => setItemsPerPage(parseInt(e.target.value));

  const totalPages = Math.ceil(filteredBrevets.length / itemsPerPage);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      <div>
        <Sidebar />
        <div className="brevets-list-container">
          <h1>Portefeuille Brevet</h1>
          <Container fluid>
            <Row className="mb-4">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="custom-input"
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  as="select"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="custom-select"
                >
                  <option value="titre">Titre</option>
                  <option value="reference_famille">Référence Famille</option>
                  <option value="reference_cabinet">Référence Cabinet</option>
                  <option value="client">Client</option>
                  <option value="cabinet">Cabinet</option>
                  <option value="pays">Pays</option>
                
                </Form.Control>
              </Col>
              <Col md={1}>
                <Form.Control
                  as="select"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="custom-select"
                >
                  <option value={5}>5 lignes</option>
                  <option value={10}>10 lignes</option>
                  <option value={20}>20 lignes</option>
                </Form.Control>
              </Col>
            </Row>

            <Button variant="primary" onClick={handleShowAddModal} className="mb-4">
              Ajouter un brevet
            </Button>
            <Pagination className="justify-content-center">
              {[...Array(totalPages).keys()].map(number => (
                <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                  {number + 1}
                </Pagination.Item>
              ))}
            </Pagination>
            {currentBrevets.map((brevet, index) => (
              <div key={index} className="brevet-details-container">
                <h4 className="custom-header">{brevet.reference_famille}</h4>
                <div
                  className="custom-table-container"
                  style={{
                    maxHeight: expandedRows[brevet.id_brevet] ? 'none' : '300px',
                  }}
                >
                  <Table bordered hover responsive className="custom-table">
                    <thead>
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
                        <th>Action</th>

                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/* Informations Générales */}
                        <td>
                          <div><strong>Référence Famille:</strong> {brevet.reference_famille || 'N/A'}</div>
                          <div><strong>Titre:</strong> {brevet.titre || 'N/A'}</div>
                          <div><strong>Statut:</strong> {brevet.statut ? brevet.statut.valeur : 'N/A'}</div>
                          <div><strong>Date Dépôt:</strong> {brevet.date_depot ? new Date(brevet.date_depot).toLocaleDateString() : 'N/A'}</div>
                          <div><strong>Date Délivrance:</strong> {brevet.date_delivrance ? new Date(brevet.date_delivrance).toLocaleDateString() : 'N/A'}</div>
                          <div><strong>Numéro Délivrance:</strong> {brevet.numero_delivrance || 'N/A'}</div>
                          <div><strong>Licence:</strong> {brevet.licence ? 'Oui' : 'Non'}</div>
                        </td>

                        {/* Clients */}
                        <td>
                          {brevet.clients && brevet.clients.length > 0 ? brevet.clients.map((client, idx) => (
                            <div key={idx}>
                              <strong
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => handleShowClientModal(client)}
                              >
                                Client n°{idx + 1}: {client.nom_client}
                              </strong>
                              <br /><br />
                            </div>
                          )) : <p>Aucun client associé</p>}
                        </td>


                        {/* Inventeurs */}
                        <td>
                          {brevet.inventeurs && brevet.inventeurs.length > 0 ? brevet.inventeurs.map((inventeur, idx) => (
                            <div key={idx}>
                              <strong
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => handleShowInventeurModal(inventeur)}
                              >
                                Inventeur n°{idx + 1}: {inventeur.nom} {inventeur.prenom}
                              </strong>
                              <br /><br />
                            </div>
                          )) : <p>Aucun inventeur</p>}
                        </td>

                        {/* Déposants */}
                        <td>
                          {brevet.deposants && brevet.deposants.length > 0 ? brevet.deposants.map((deposant, idx) => (
                            <div key={idx}>
                              <strong
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => handleShowDeposantModal(deposant)}
                              >
                               Déposant n°{idx + 1}: {deposant.nom} {deposant.prenom}
                              </strong>
                              <br /><br />
                            </div>
                          )) : <p>Aucun déposant</p>}
                        </td>

                        {/* Titulaires */}
                        <td>
                          {brevet.titulaires && brevet.titulaires.length > 0 ? brevet.titulaires.map((titulaire, idx) => (
                            <div key={idx}>
                              <strong
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => handleShowTitulaireModal(titulaire)}
                              >
                               Titulaire n°{idx + 1}: {titulaire.nom} {titulaire.prenom}
                              </strong>
                              <br /><br />
                            </div>
                          )) : <p>Aucun titulaire</p>}
                        </td>

                        {/* Cabinets de Procédure */}
                        <td>
                          {brevet.procedureCabinets && brevet.procedureCabinets.length > 0 ? brevet.procedureCabinets.map((cabinet, idx) => (
                            <div key={idx}>
                              <strong
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => handleShowCabinetModal(cabinet)}
                              >
                               Cabinet n°{idx + 1}: {cabinet.nom_cabinet}
                              </strong>
                              <br /><br />
                              <ul>
                                {brevet.contactsProcedure.filter(contact => contact.id_cabinet === cabinet.id_cabinet).map((contact, idc) => (
                                  <li key={idc}>
                                    <strong
                                      style={{ cursor: 'pointer', color: 'blue' }}
                                      onClick={() => handleShowContactModal(contact)}
                                    >
                                      Contact n°{idx + 1}: {contact.nom} {contact.prenom}
                                    </strong>
                                  </li>
                                ))}
                              </ul>
                              <br />
                            </div>
                          )) : <p>Aucun cabinet de procédure</p>}
                        </td>

                        {/* Cabinets d'Annuité */}
                        <td>
                          {brevet.annuiteCabinets && brevet.annuiteCabinets.length > 0 ? brevet.annuiteCabinets.map((cabinet, idx) => (
                            <div key={idx}>
                              <strong
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => handleShowCabinetModal(cabinet)}
                              >
                               Cabinet n°{idx + 1}: {cabinet.nom_cabinet}
                              </strong>
                              <br /><br />
                              <ul>
                                {brevet.contactsAnnuite.filter(contact => contact.id_cabinet === cabinet.id_cabinet).map((contact, idc) => (
                                  <li key={idc}>
                                    <strong
                                      style={{ cursor: 'pointer', color: 'blue' }}
                                      onClick={() => handleShowContactModal(contact)}
                                    >
                                     Contact n°{idx + 1}: {contact.nom} {contact.prenom}
                                    </strong>
                                  </li>
                                ))}
                              </ul>
                              <br />
                            </div>
                          )) : <p>Aucun cabinet d'annuité</p>}
                        </td>

                        {/* Pays */}
                        <td>
                          {brevet.pays && brevet.pays.length > 0 ? brevet.pays.map((p, idx) => (
                            <div key={idx}>
                              <strong>Pays n°{idx + 1}:</strong> {p.nom_fr_fr}
                              <br /><br />
                              <strong>Numéro de Dépôt:</strong>  {p.numero_depot}
                              <br /><br />
                              <strong>Numéro de Publication:</strong> {p.numero_publication}
                              <br />
                              {idx < brevet.pays.length - 1 && (
                                <>
                                  <hr />
                                </>
                              )}
                            </div>
                          )) : <div>Pas d'information sur les pays</div>}
                        </td>


                        {/* Commentaire et Pièce Jointe */}
                        <td>
                          <div><strong>Commentaire:</strong> {brevet.commentaire || 'Aucun commentaire'}</div>
                          <div><strong>Pièce Jointe:</strong> {brevet.piece_jointe || 'Aucune pièce jointe'}</div>
                        </td>
                        <td>
                          <Button variant="warning" onClick={() => handleShowEditModal(brevet.id_brevet)} className="me-2">
                            <FaEdit /> Modifier
                          </Button>
                          <Button variant="danger" onClick={() => handleDeleteBrevet(brevet.id_brevet)}>
                            <FaTrash /> Supprimer
                          </Button>
                          <Button variant="link" onClick={() => handleToggleExpand(brevet.id_brevet)}>
                            {expandedRows[brevet.id_brevet] ? <FaChevronUp /> : <FaChevronDown />}
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            ))}

            <Pagination className="justify-content-center">
              {[...Array(totalPages).keys()].map(number => (
                <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                  {number + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Container>
          <Button
            variant="primary"
            style={{ position: 'fixed', bottom: '20px', right: '20px' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ⬆️
          </Button>
        </div>
      </div>

      <AddBrevetModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        refreshBrevets={refreshBrevets}
      />

      {/* Modal d'édition */}
      {selectedBrevetId && (
        <EditBrevetModal
          show={showEditModal}
          handleClose={handleCloseEditModal}
          brevetId={selectedBrevetId}
        />
      )}
      {/* Modals pour clients, inventeurs, etc. */}

      {/* Modal du Cabinet */}
      <Modal show={showCabinetModal} onHide={handleCloseCabinetModal}>
        <Modal.Header closeButton>
          <Modal.Title>Informations du Cabinet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCabinet && (
            <div>
              <h5>{selectedCabinet.nom_cabinet}</h5>
              <p>Référence: {selectedCabinet.reference}</p>
              <p>Dernier Intervenant: {selectedCabinet.dernier_intervenant ? "Oui" : "Non"}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCabinetModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal du Contact */}
      <Modal show={showContactModal} onHide={handleCloseContactModal}>
        <Modal.Header closeButton>
          <Modal.Title>Informations du Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContact && (
            <div>
              <h5>{selectedContact.nom} {selectedContact.prenom}</h5>
              <p>Email: {selectedContact.email}</p>
              <p>Téléphone: {selectedContact.telephone}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseContactModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal du Client */}
      <Modal show={showClientModal} onHide={handleCloseClientModal}>
        <Modal.Header closeButton>
          <Modal.Title>Informations du Client </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <div>
              <h5>{selectedClient.nom_client}</h5>
              <p>Adresse: {selectedClient.adresse_client}</p>
              <p>Email: {selectedClient.email_client}</p>
              <p>Téléphone: {selectedClient.telephone_client}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseClientModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de l'Inventeur */}
      <Modal show={showInventeurModal} onHide={handleCloseInventeurModal}>
        <Modal.Header closeButton>
          <Modal.Title>Informations de l'Inventeur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInventeur && (
            <div>
              <h5>{selectedInventeur.nom} {selectedInventeur.prenom}</h5>
              <p>Email: {selectedInventeur.email}</p>
              <p>Téléphone: {selectedInventeur.telephone}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseInventeurModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal du Déposant */}
      <Modal show={showDeposantModal} onHide={handleCloseDeposantModal}>
        <Modal.Header closeButton>
          <Modal.Title>Informations du Déposant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDeposant && (
            <div>
              <h5>{selectedDeposant.nom} {selectedDeposant.prenom}</h5>
              <p>Email: {selectedDeposant.email}</p>
              <p>Téléphone: {selectedDeposant.telephone}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeposantModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal du Titulaire */}
      <Modal show={showTitulaireModal} onHide={handleCloseTitulaireModal}>
        <Modal.Header closeButton>
          <Modal.Title>Informations du Titulaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTitulaire && (
            <div>
              <h5>{selectedTitulaire.nom} {selectedTitulaire.prenom}</h5>
              <p>Email: {selectedTitulaire.email}</p>
              <p>Téléphone: {selectedTitulaire.telephone}</p>
              <p>{selectedTitulaire.executant ? "Exécutant" : ""}</p>
              <p>{selectedTitulaire.client_correspondant ? "Client Correspondant" : ""}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTitulaireModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>



  );
};

export default BrevetsList;


// import React, { useState, useEffect } from 'react';
// import { Table, Input, Select, Button, Pagination, Modal, Row, Col } from 'antd';
// import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
// import '../css/BrevetList.css'; // Assure-toi d'avoir une feuille de style séparée pour les modifications CSS

// import useAllBrevetsData from '../hooks/hooksTest';
// import axios from 'axios';
// import Sidebar from '../components/Sidebar';

// const { Option } = Select;

// const BrevetsList = () => {
//   const {
//     brevets,
//     selectedBrevetId,
//     handleShowAddModal,
//     handleCloseAddModal,
//     handleCloseEditModal,
//     showAddModal,
//     showEditModal,
//     handleDeleteBrevet,
//     handleShowEditModal,
//     refreshBrevets,
//     isLoading,
//     error,
//   } = useAllBrevetsData();

//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchFilter, setSearchFilter] = useState('titre');
//   const [references, setReferences] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);

//   const [showClientModal, setShowClientModal] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);

//   const [showInventeurModal, setShowInventeurModal] = useState(false);
//   const [selectedInventeur, setSelectedInventeur] = useState(null);

//   const [showDeposantModal, setShowDeposantModal] = useState(false);
//   const [selectedDeposant, setSelectedDeposant] = useState(null);

//   const [showTitulaireModal, setShowTitulaireModal] = useState(false);
//   const [selectedTitulaire, setSelectedTitulaire] = useState(null);

//   const [showCabinetModal, setShowCabinetModal] = useState(false);
//   const [selectedCabinet, setSelectedCabinet] = useState(null);

//   const [showContactModal, setShowContactModal] = useState(false);
//   const [selectedContact, setSelectedContact] = useState(null);

//   const [expandedRows, setExpandedRows] = useState({});

//   const handleToggleExpand = (id_brevet) => {
//     setExpandedRows((prevExpandedRows) => ({
//       ...prevExpandedRows,
//       [id_brevet]: !prevExpandedRows[id_brevet],
//     }));
//   };

//   const handleShowClientModal = (client) => {
//     setSelectedClient(client);
//     setShowClientModal(true);
//   };

//   const handleShowInventeurModal = (inventeur) => {
//     setSelectedInventeur(inventeur);
//     setShowInventeurModal(true);
//   };

//   const handleShowDeposantModal = (deposant) => {
//     setSelectedDeposant(deposant);
//     setShowDeposantModal(true);
//   };

//   const handleShowTitulaireModal = (titulaire) => {
//     setSelectedTitulaire(titulaire);
//     setShowTitulaireModal(true);
//   };

//   const handleShowCabinetModal = (cabinet) => {
//     setSelectedCabinet(cabinet);
//     setShowCabinetModal(true);
//   };

//   const handleShowContactModal = (contact) => {
//     setSelectedContact(contact);
//     setShowContactModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowClientModal(false);
//     setShowInventeurModal(false);
//     setShowDeposantModal(false);
//     setShowTitulaireModal(false);
//     setShowCabinetModal(false);
//     setShowContactModal(false);
//   };

//   useEffect(() => {
//     const fetchReferences = async () => {
//       try {
//         const response = await axios.get('http://localhost:3100/reference');
//         setReferences(response.data.data);
//       } catch (error) {
//         console.error('Erreur lors de la récupération des références des cabinets', error);
//       }
//     };

//     fetchReferences();
//   }, []);

//   const normalizeString = (str) => str.trim().toLowerCase();
//   const normalizedSearchTerm = normalizeString(searchTerm);

//   const filteredBrevets = brevets.filter((brevet) => {
//     if (searchFilter === 'titre') {
//       return normalizeString(brevet.titre)?.includes(normalizedSearchTerm);
//     } else if (searchFilter === 'reference_famille') {
//       return normalizeString(brevet.reference_famille)?.includes(normalizedSearchTerm);
//     } else if (searchFilter === 'reference_cabinet') {
//       const matchingReferences = references.filter((ref) =>
//         normalizeString(ref.reference)?.includes(normalizedSearchTerm)
//       );
//       return matchingReferences.some((ref) => ref.id_brevet === brevet.id_brevet);
//     } else if (searchFilter === 'client') {
//       return brevet.clients?.some((client) => normalizeString(client.nom_client)?.includes(normalizedSearchTerm));
//     } else if (searchFilter === 'cabinet') {
//       return brevet.annuiteCabinets?.some((cabinet) =>
//         normalizeString(cabinet.nom_cabinet)?.includes(normalizedSearchTerm)
//       ) || brevet.procedureCabinets?.some((cabinet) =>
//         normalizeString(cabinet.nom_cabinet)?.includes(normalizedSearchTerm)
//       );
//     } else if (searchFilter === 'pays') {
//       return brevet.pays?.some((p) => normalizeString(p.nom_fr_fr)?.includes(normalizedSearchTerm));
//     }
//     return true;
//   });


//   const columns = [
//     {
//       title: 'Informations Générales',
//       dataIndex: 'general',
//       key: 'general',
//       render: (_, brevet) => (
//         <div>
//           <div><strong>Référence Famille:</strong> {brevet.reference_famille || 'N/A'}</div>
//           <div><strong>Titre:</strong> {brevet.titre || 'N/A'}</div>
//           <div><strong>Statut:</strong> {brevet.statut ? brevet.statut.valeur : 'N/A'}</div>
//           <div><strong>Date Dépôt:</strong> {brevet.date_depot ? new Date(brevet.date_depot).toLocaleDateString() : 'N/A'}</div>
//           <div><strong>Date Délivrance:</strong> {brevet.date_delivrance ? new Date(brevet.date_delivrance).toLocaleDateString() : 'N/A'}</div>
//           <div><strong>Numéro Délivrance:</strong> {brevet.numero_delivrance || 'N/A'}</div>
//           <div><strong>Licence:</strong> {brevet.licence ? 'Oui' : 'Non'}</div>
//         </div>
//       )
//     },
//     {
//       title: 'Clients',
//       dataIndex: 'clients',
//       key: 'clients',
//       render: (_, brevet) => (
//         brevet.clients && brevet.clients.length > 0 ? brevet.clients.map((client, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowClientModal(client)}>
//               Client n°{idx + 1}: {client.nom_client}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun client associé</p>
//       )
//     },
//     {
//       title: 'Inventeurs',
//       dataIndex: 'inventeurs',
//       key: 'inventeurs',
//       render: (_, brevet) => (
//         brevet.inventeurs && brevet.inventeurs.length > 0 ? brevet.inventeurs.map((inventeur, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowInventeurModal(inventeur)}>
//               Inventeur n°{idx + 1}: {inventeur.nom} {inventeur.prenom}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun inventeur</p>
//       )
//     },
//     {
//       title: 'Déposants',
//       dataIndex: 'deposants',
//       key: 'deposants',
//       render: (_, brevet) => (
//         brevet.deposants && brevet.deposants.length > 0 ? brevet.deposants.map((deposant, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowDeposantModal(deposant)}>
//               Déposant n°{idx + 1}: {deposant.nom} {deposant.prenom}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun déposant</p>
//       )
//     },
//     {
//       title: 'Titulaires',
//       dataIndex: 'titulaires',
//       key: 'titulaires',
//       render: (_, brevet) => (
//         brevet.titulaires && brevet.titulaires.length > 0 ? brevet.titulaires.map((titulaire, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowTitulaireModal(titulaire)}>
//               Titulaire n°{idx + 1}: {titulaire.nom} {titulaire.prenom}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun titulaire</p>
//       )
//     },
//     {
//       title: 'Cabinets de Procédure',
//       dataIndex: 'procedureCabinets',
//       key: 'procedureCabinets',
//       render: (_, brevet) => (
//         brevet.procedureCabinets && brevet.procedureCabinets.length > 0 ? brevet.procedureCabinets.map((cabinet, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowCabinetModal(cabinet)}>
//               Cabinet n°{idx + 1}: {cabinet.nom_cabinet}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun cabinet de procédure</p>
//       )
//     },
//     {
//       title: 'Cabinets d\'Annuité',
//       dataIndex: 'annuiteCabinets',
//       key: 'annuiteCabinets',
//       render: (_, brevet) => (
//         brevet.annuiteCabinets && brevet.annuiteCabinets.length > 0 ? brevet.annuiteCabinets.map((cabinet, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowCabinetModal(cabinet)}>
//               Cabinet n°{idx + 1}: {cabinet.nom_cabinet}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun cabinet d'annuité</p>
//       )
//     },
//     {
//       title: 'Pays',
//       dataIndex: 'pays',
//       key: 'pays',
//       render: (_, brevet) => (
//         brevet.pays && brevet.pays.length > 0 ? brevet.pays.map((p, idx) => (
//           <div key={idx}>
//             <strong>Pays n°{idx + 1}:</strong> {p.nom_fr_fr}
//             <br /><br />
//             <strong>Numéro de Dépôt:</strong>  {p.numero_depot}
//             <br /><br />
//             <strong>Numéro de Publication:</strong> {p.numero_publication}
//             <br />
//             {idx < brevet.pays.length - 1 && <hr />}
//           </div>
//         )) : <div>Pas d'information sur les pays</div>
//       )
//     },
//     {
//       title: 'Contacts',
//       dataIndex: 'contacts',
//       key: 'contacts',
//       render: (_, brevet) => (
//         brevet.contacts && brevet.contacts.length > 0 ? brevet.contacts.map((contact, idx) => (
//           <div key={idx}>
//             <strong style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowContactModal(contact)}>
//               Contact n°{idx + 1}: {contact.nom} {contact.prenom}
//             </strong>
//             <br /><br />
//           </div>
//         )) : <p>Aucun contact associé</p>
//       )
//     },
//     {
//       title: 'Commentaire et Pièce Jointe',
//       dataIndex: 'commentaire',
//       key: 'commentaire',
//       render: (_, brevet) => (
//         <div>
//           <div><strong>Commentaire:</strong> {brevet.commentaire || 'Aucun commentaire'}</div>
//           <div><strong>Pièce Jointe:</strong> {brevet.piece_jointe || 'Aucune pièce jointe'}</div>
//         </div>
//       )
//     },
//     {
//       title: 'Actions',
//       key: 'action',
//       render: (_, brevet) => (
//         <>
//           <Button
//             icon={<EditOutlined />}
//             onClick={() => handleShowEditModal(brevet.id_brevet)}
//             style={{ marginRight: 8 }}
//           >
//             Modifier
//           </Button>
//           <Button
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDeleteBrevet(brevet.id_brevet)}
//             style={{ marginRight: 8 }}
//           >
//             Supprimer
//           </Button>
//           <Button
//             type="link"
//             icon={expandedRows[brevet.id_brevet] ? <UpOutlined /> : <DownOutlined />}
//             onClick={() => handleToggleExpand(brevet.id_brevet)}
//           >
//             {expandedRows[brevet.id_brevet] ? 'Réduire' : 'Voir plus'}
//           </Button>
//         </>
//       )
//     }
//   ];

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentBrevets = filteredBrevets.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredBrevets.length / itemsPerPage);

//   return (
//     <>
//       <Sidebar />
//       <div className="brevets-list-container">
//         <h1>Portefeuille Brevet</h1>
//         <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
//           <Col span={6}>
//             <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//           </Col>
//           <Col span={4}>
//             <Select value={searchFilter} onChange={(value) => setSearchFilter(value)} style={{ width: '100%' }}>
//               <Option value="titre">Titre</Option>
//               <Option value="reference_famille">Référence Famille</Option>
//               <Option value="reference_cabinet">Référence Cabinet</Option>
//               <Option value="client">Client</Option>
//               <Option value="cabinet">Cabinet</Option>
//               <Option value="pays">Pays</Option>
//             </Select>
//           </Col>
//           <Col span={3}>
//             <Select value={itemsPerPage} onChange={(value) => setItemsPerPage(value)} style={{ width: '100%' }}>
//               <Option value={5}>5 lignes</Option>
//               <Option value={10}>10 lignes</Option>
//               <Option value={20}>20 lignes</Option>
//             </Select>
//           </Col>
//           <Col span={4}>
//             <Button type="primary" icon={<PlusOutlined />} onClick={handleShowAddModal}>
//               Ajouter un brevet
//             </Button>
//           </Col>
//         </Row>
//         <style jsx>{`
//         .collapsed-row {
//           max-height: 200px;
//           overflow: hidden;
//           transition: max-height 0.3s ease-in-out;
//         }
//         .expanded-row {
//           max-height: none;
//           overflow: visible;
//           transition: max-height 0.3s ease-in-out;
//         }
//         .ant-table-tbody > tr > td {
//           border-bottom: none;
//         }
//       `}</style>
//           <Table
//           dataSource={currentBrevets}
//           columns={columns}
//           pagination={false}
//           rowKey="id_brevet"
//           rowClassName={(record) => expandedRows[record.id_brevet] ? 'expanded-row' : 'collapsed-row'}
//           expandable={{
//             expandedRowRender: (brevet) => (
//               <div style={{ maxHeight: expandedRows[brevet.id_brevet] ? 'none' : '200px', overflow: 'hidden', transition: 'max-height 0.3s ease-out' }}>
//                 <div><strong>Pays:</strong> {brevet.pays && brevet.pays.map(p => `${p.nom_fr_fr} (${p.numero_depot})`).join(', ')}</div>
//               </div>
//             ),
//             rowExpandable: () => true,
//           }}
//         />
//         <Pagination
//           current={currentPage}
//           total={totalPages * itemsPerPage}
//           pageSize={itemsPerPage}
//           onChange={(page) => setCurrentPage(page)}
//           style={{ marginTop: '16px', textAlign: 'center' }}
//         />

//         {/* Modals for details */}
//         <Modal title="Informations du Client" visible={showClientModal} onCancel={handleCloseModal} footer={null}>
//           {selectedClient && (
//             <div>
//               <h5>{selectedClient.nom_client}</h5>
//               <p>Adresse: {selectedClient.adresse_client}</p>
//               <p>Email: {selectedClient.email_client}</p>
//               <p>Téléphone: {selectedClient.telephone_client}</p>
//             </div>
//           )}
//         </Modal>

//         <Modal title="Informations de l'Inventeur" visible={showInventeurModal} onCancel={handleCloseModal} footer={null}>
//           {selectedInventeur && (
//             <div>
//               <h5>{selectedInventeur.nom} {selectedInventeur.prenom}</h5>
//               <p>Email: {selectedInventeur.email}</p>
//               <p>Téléphone: {selectedInventeur.telephone}</p>
//             </div>
//           )}
//         </Modal>

//         <Modal title="Informations du Déposant" visible={showDeposantModal} onCancel={handleCloseModal} footer={null}>
//           {selectedDeposant && (
//             <div>
//               <h5>{selectedDeposant.nom} {selectedDeposant.prenom}</h5>
//               <p>Email: {selectedDeposant.email}</p>
//               <p>Téléphone: {selectedDeposant.telephone}</p>
//             </div>
//           )}
//         </Modal>

//         <Modal title="Informations du Titulaire" visible={showTitulaireModal} onCancel={handleCloseModal} footer={null}>
//           {selectedTitulaire && (
//             <div>
//               <h5>{selectedTitulaire.nom} {selectedTitulaire.prenom}</h5>
//               <p>Email: {selectedTitulaire.email}</p>
//               <p>Téléphone: {selectedTitulaire.telephone}</p>
//             </div>
//           )}
//         </Modal>

//         <Modal title="Informations du Cabinet" visible={showCabinetModal} onCancel={handleCloseModal} footer={null}>
//           {selectedCabinet && (
//             <div>
//               <h5>{selectedCabinet.nom_cabinet}</h5>
//               <p>Référence: {selectedCabinet.reference}</p>
//               <p>Dernier Intervenant: {selectedCabinet.dernier_intervenant ? 'Oui' : 'Non'}</p>
//             </div>
//           )}
//         </Modal>

//         <Modal title="Informations du Contact" visible={showContactModal} onCancel={handleCloseModal} footer={null}>
//           {selectedContact && (
//             <div>
//               <h5>{selectedContact.nom} {selectedContact.prenom}</h5>
//               <p>Email: {selectedContact.email}</p>
//               <p>Téléphone: {selectedContact.telephone}</p>
//             </div>
//           )}
//         </Modal>
//       </div>
//     </>
//   );
// };

// export default BrevetsList;
