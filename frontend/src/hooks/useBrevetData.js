import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { API_BASE_URL } from '../config'; // Importation du fichier de configuration
import logo from '../assets/startigbloch_transparent_corrected.png';

const useBrevetData = (brevetId) => {
  const [brevet, setBrevet] = useState(null);
  const [procedureCabinets, setProcedureCabinets] = useState([]);
  const [annuiteCabinets, setAnnuiteCabinets] = useState([]);
  const [contactsProcedure, setContactsProcedure] = useState([]);
  const [contactsAnnuite, setContactsAnnuite] = useState([]);
  const [clients, setClients] = useState([]);
  const [inventeurs, setInventeurs] = useState([]);
  const [deposants, setDeposants] = useState([]);
  const [titulaires, setTitulaires] = useState([]);
  const [statut, setStatut] = useState(null);
  const [pays, setPays] = useState([]);
  const [statutsList, setStatutsList] = useState([]);
  const [piecesJointes, setPiecesJointes] = useState([]);

  useEffect(() => {
    if (brevetId) {
      console.log('Fetching brevet data for brevetId:', brevetId);

      const fetchBrevetData = async () => {
        try {
          const brevetResponse = await fetch(`${API_BASE_URL}/api/brevets/${brevetId}`);
          const brevetData = await brevetResponse.json();
          setBrevet(brevetData.data);

          const clientsResponse = await fetch(`${API_BASE_URL}/api/brevets/${brevetId}/clients`);
          const clientsData = await clientsResponse.json();
          setClients(clientsData.data || []);

          const statutsResponse = await fetch(`${API_BASE_URL}/api/statuts`);
          const statutsData = await statutsResponse.json();
          const allStatuts = statutsData.data;
          setStatutsList(allStatuts);

          if (brevetData.data.numero_pays && brevetData.data.numero_pays.length > 0) {
            const paysResponse = await fetch(`${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`);
            const paysData = await paysResponse.json();
            const paysWithStatut = paysData.data.map((paysItem) => {
              const matchingStatut = allStatuts.find(st => st.id_statuts === paysItem.id_statuts);
              return {
                ...paysItem,
                statut: matchingStatut ? matchingStatut.valeur : 'N/A',
              };
            });
            setPays(paysWithStatut);
          } else {
            console.warn('Aucun numero_pays trouvé dans brevetData');
          }

          if (brevetData.data.inventeurs && brevetData.data.inventeurs.length > 0) {
            const inventeurIds = brevetData.data.inventeurs.map(inv => inv.id_inventeur);
            const inventeursResponse = await fetch(`${API_BASE_URL}/api/inventeur?id_inventeurs=${inventeurIds.join('&id_inventeurs=')}`);
            const inventeursData = await inventeursResponse.json();
            setInventeurs(inventeursData.data || []);
          } else {
            setInventeurs([]);
          }

          if (brevetData.data.deposants && brevetData.data.deposants.length > 0) {
            const deposantIds = brevetData.data.deposants.map(dep => dep.id_deposant);
            const deposantsResponse = await fetch(`${API_BASE_URL}/api/deposant?id_deposants=${deposantIds.join('&id_deposants=')}`);
            const deposantsData = await deposantsResponse.json();
            setDeposants(deposantsData.data || []);
          } else {
            setDeposants([]);
          }

          if (brevetData.data.titulaires && brevetData.data.titulaires.length > 0) {
            const titulaireIds = brevetData.data.titulaires.map(tit => tit.id_titulaire);
            const titulairesResponse = await fetch(`${API_BASE_URL}/api/titulaire?id_titulaires=${titulaireIds.join('&id_titulaires=')}`);
            const titulairesData = await titulairesResponse.json();
            setTitulaires(titulairesData.data || []);
          } else {
            setTitulaires([]);
          }

          const paysResponse = await fetch(`${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`);
          const paysData = await paysResponse.json();
          setPays(paysData.data || []);

          const cabinetsResponse = await fetch(`${API_BASE_URL}/api/cabinets?id_brevet=${brevetId}`);
          const cabinetsData = await cabinetsResponse.json();
          const cabinetDetailsPromises = cabinetsData.data.map(cabinet =>
            fetch(`${API_BASE_URL}/cabinet/${cabinet.id_cabinet}`).then(res => res.json())
          );
          const cabinetsDetails = await Promise.all(cabinetDetailsPromises);
          const completeCabinetsData = cabinetsDetails.map(res => res.data);

          const procedureCabinetsData = completeCabinetsData.filter(cabinet => cabinet.type === 'procedure');
          const annuiteCabinetsData = completeCabinetsData.filter(cabinet => cabinet.type === 'annuite');

          setProcedureCabinets(procedureCabinetsData);
          setAnnuiteCabinets(annuiteCabinetsData);

          const contactsProcedurePromises = procedureCabinetsData.map(cabinet =>
            fetch(`${API_BASE_URL}/api/contacts/cabinets/${cabinet.id_cabinet}`).then(res => res.json())
          );
          const contactsProcedureResults = await Promise.all(contactsProcedurePromises);
          setContactsProcedure(contactsProcedureResults.flatMap(result => result.data || []));

          const contactsAnnuitePromises = annuiteCabinetsData.map(cabinet =>
            fetch(`${API_BASE_URL}/api/contacts/cabinets/${cabinet.id_cabinet}`).then(res => res.json())
          );
          const contactsAnnuiteResults = await Promise.all(contactsAnnuitePromises);
          setContactsAnnuite(contactsAnnuiteResults.flatMap(result => result.data || []));
          
          
          const piecesJointesResponse = await fetch(`${API_BASE_URL}/api/brevets/${brevetId}/piece-jointe`);
          const piecesData = await piecesJointesResponse.json();
          setPiecesJointes(piecesData.data);
          
          
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
        }
      };

      fetchBrevetData();
    }
  }, [brevetId]);


  // Fonction pour générer un PDF
// Fonction pour générer un PDF
const generatePDF = () => {
  const doc = new jsPDF();
  let yOffset = 20; // Initialiser à 20 pour laisser de l'espace pour le titre

  // Fonction pour vérifier si une nouvelle page est nécessaire
  const checkPageOverflow = (additionalSpace = 0) => {
    if (yOffset + additionalSpace > 280) { // Limite avant d'ajouter une nouvelle page
      doc.addPage();
      yOffset = 10; // Réinitialiser yOffset pour la nouvelle page
    }
  };

  // Fonction pour dessiner une ligne de séparation
  const drawSeparator = () => {
    checkPageOverflow(15); // Vérifier l'espace avant d'ajouter la ligne
    doc.setDrawColor(173, 216, 230); // Bleu clair
    doc.setLineWidth(0.5);
    doc.line(20, yOffset, 190, yOffset); // Tracer une ligne horizontale
    yOffset += 10; // Ajouter un espace après la ligne
  };

  // Couleurs et styles pour les titres
  const setSectionTitleStyle = () => {
    doc.setTextColor(30, 144, 255); // Bleu pour les titres
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
  };

  const setTextStyle = () => {
    doc.setTextColor(0, 0, 0); // Noir pour le texte normal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  const img = new Image();
  img.src = logo; // Le logo doit être spécifié correctement
  img.onload = () => {
    doc.addImage(img, 'PNG', 55, 10, 100, 30); // Centré à 55 pour un format A4
    yOffset = 50; // Ajuster l'espace après le logo

    // Centrer le titre sous le logo
    setSectionTitleStyle();
    doc.text(`Détails du Brevet: ${brevet.titre}`, 105, yOffset, { align: 'center' });
    yOffset += 15;

    // Informations générales du brevet
    if (brevet) {
      setSectionTitleStyle();
      doc.text('Informations Générales:', 20, yOffset);
      yOffset += 10;
      setTextStyle();
      doc.text(`Référence Famille: ${brevet.reference_famille}`, 30, yOffset);
      yOffset += 5;
      doc.text(`Titre: ${brevet.titre}`, 30, yOffset);
      
      yOffset += 10;
      checkPageOverflow(15);
    }

    // Clients
    if (clients && clients.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Clients:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      clients.forEach((client) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${client.nom_client}`, 30, yOffset);
        yOffset += 5;

        if (client.adresse_client) {
          doc.text(`Adresse: ${client.adresse_client}`, 30, yOffset);
          yOffset += 5;
        }

        if (client.code_postal) {
          doc.text(`Code Postal: ${client.code_postal}`, 30, yOffset);
          yOffset += 5;
        }

        if (client.pays_client) {
          doc.text(`Pays: ${client.pays_client}`, 30, yOffset);
          yOffset += 5;
        }

        if (client.telephone_client) {
          doc.text(`Téléphone: ${client.telephone_client}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Inventeurs
    if (inventeurs && inventeurs.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Inventeurs:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      inventeurs.forEach((inventeur) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${inventeur.nom} ${inventeur.prenom}`, 30, yOffset);
        yOffset += 5;
        if (inventeur.email) {
          doc.text(`Email: ${inventeur.email}`, 30, yOffset);
          yOffset += 5;
        }
        if (inventeur.telephone) {
          doc.text(`Téléphone: ${inventeur.telephone}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Déposants
    if (deposants && deposants.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Déposants:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      deposants.forEach((deposant) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${deposant.nom} ${deposant.prenom}`, 30, yOffset);
        yOffset += 5;
        if (deposant.email) {
          doc.text(`Email: ${deposant.email}`, 30, yOffset);
          yOffset += 5;
        }
        if (deposant.telephone) {
          doc.text(`Téléphone: ${deposant.telephone}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Titulaires
    if (titulaires && titulaires.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Titulaires:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      titulaires.forEach((titulaire) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${titulaire.nom} ${titulaire.prenom}`, 30, yOffset);
        yOffset += 5;
        if (titulaire.email) {
          doc.text(`Email: ${titulaire.email}`, 30, yOffset);
          yOffset += 5;
        }
        if (titulaire.telephone) {
          doc.text(`Téléphone: ${titulaire.telephone}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Pays et Statut
    if (pays && pays.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Pays et Statut:', 20, yOffset);
      yOffset += 10;
      setTextStyle();
    
      pays.forEach((paysItem) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${paysItem.nom_fr_fr}`, 30, yOffset);
        yOffset += 5;
        if (paysItem.numero_publication) {
          doc.text(`Numéro de Publication: ${paysItem.numero_publication}`, 30, yOffset);
          yOffset += 5;
        }
        if (paysItem.numero_depot) {
          doc.text(`Numéro de Dépôt: ${paysItem.numero_depot}`, 30, yOffset);
          yOffset += 5;
        }
        doc.text(`Date de Dépôt: ${new Date(paysItem.date_depot).toLocaleDateString()}`, 30, yOffset);
      yOffset += 5;
      doc.text(`Numéro de Délivrance: ${paysItem.numero_delivrance || 'N/A'}`, 30, yOffset);
      
        const matchingStatut = statutsList.find(st => st.id_statuts === paysItem.id_statuts);
        doc.text(`Statut: ${matchingStatut ? matchingStatut.valeur : 'N/A'}`, 30, yOffset);
        yOffset += 10;
      });
    }

    // Cabinets de procédure
    if (procedureCabinets && procedureCabinets.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Cabinets de procédure:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      procedureCabinets.forEach((cabinet) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${cabinet.nom_cabinet}`, 30, yOffset);
        yOffset += 5;
        if (cabinet.reference) {
          doc.text(`Référence: ${cabinet.reference}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Contacts de procédure
    if (contactsProcedure && contactsProcedure.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Contacts de procédure:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      contactsProcedure.forEach((contact) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${contact.nom} ${contact.prenom}`, 30, yOffset);
        yOffset += 5;
        if (contact.fonction) {
          doc.text(`Fonction: ${contact.fonction}`, 30, yOffset);
          yOffset += 5;
        }
        if (contact.email) {
          doc.text(`Email: ${contact.email}`, 30, yOffset);
          yOffset += 5;
        }
        if (contact.telephone) {
          doc.text(`Téléphone: ${contact.telephone}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Cabinets d'annuité
    if (annuiteCabinets && annuiteCabinets.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text("Cabinets d'annuité:", 20, yOffset);
      yOffset += 10;
      setTextStyle();

      annuiteCabinets.forEach((cabinet) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${cabinet.nom_cabinet}`, 30, yOffset);
        yOffset += 5;
        if (cabinet.reference) {
          doc.text(`Référence: ${cabinet.reference}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }

    // Contacts d'annuité
    if (contactsAnnuite && contactsAnnuite.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text("Contacts d'annuité:", 20, yOffset);
      yOffset += 10;
      setTextStyle();

      contactsAnnuite.forEach((contact) => {
        checkPageOverflow(20); // Vérifiez avant d'ajouter
        doc.text(`Nom: ${contact.nom} ${contact.prenom}`, 30, yOffset);
        yOffset += 5;
        if (contact.fonction) {
          doc.text(`Fonction: ${contact.fonction}`, 30, yOffset);
          yOffset += 5;
        }
        if (contact.email) {
          doc.text(`Email: ${contact.email}`, 30, yOffset);
          yOffset += 5;
        }
        if (contact.telephone) {
          doc.text(`Téléphone: ${contact.telephone}`, 30, yOffset);
          yOffset += 10;
        }
      });
    }
    
    // Commentaires
    if (brevet.commentaire) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Commentaire:', 20, yOffset);
      yOffset += 10;
      setTextStyle();
      doc.text(brevet.commentaire || 'Aucun commentaire', 30, yOffset);
      yOffset += 10;
      checkPageOverflow(10);
    }

    // Pièces jointes
    if (piecesJointes && piecesJointes.length > 0) {
      drawSeparator();
      setSectionTitleStyle();
      doc.text('Pièces jointes:', 20, yOffset);
      yOffset += 10;
      setTextStyle();

      piecesJointes.forEach((piece) => {
        checkPageOverflow(10); // Vérifiez avant d'ajouter
        doc.text(`- ${piece.nom_fichier}`, 20, yOffset);
        yOffset += 5;
      });
    }

    // Sauvegarde du fichier PDF
    doc.save(`brevet_${brevet.titre}.pdf`);
  };
};


  return {
    brevet,
    procedureCabinets,
    annuiteCabinets,
    contactsProcedure,
    contactsAnnuite,
    clients,
    inventeurs,
    deposants,
    titulaires,
    pays,
    statut,
    statutsList,
    piecesJointes,
    generatePDF, // Exporter la fonction generatePDF
  };
};

export default useBrevetData;
