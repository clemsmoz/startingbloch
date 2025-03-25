import { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction sécurisée pour effectuer des requêtes API avec timeout
  const fetchApi = useCallback(async (url, errorMessage = "Erreur lors de la récupération des données") => {
    try {
      console.log(`Tentative de récupération de données depuis: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Réponse HTTP non OK: ${response.status} pour ${url}`);
        // Ne pas lever d'erreur, mais retourner des données vides pour continuer
        return { data: [] };
      }
      
      // Vérifier d'abord le Content-Type pour éviter les erreurs de parsing JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`La réponse n'est pas du JSON: ${contentType} pour ${url}`);
        return { data: [] };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      // Ne pas définir d'erreur globale pour permettre l'affichage partiel des données
      return { data: [] };
    }
  }, []);

  useEffect(() => {
    // Éviter les appels inutiles si brevetId est null
    if (!brevetId) {
      console.log("Aucun ID de brevet fourni à useBrevetData");
      setBrevet(null);
      setLoading(false);
      return;
    }
    
    if (brevetId) {
      console.log('Fetching brevet data for brevetId:', brevetId, typeof brevetId);
      setLoading(true);
      setError(null); // Réinitialiser les erreurs

      const fetchBrevetData = async () => {
        try {
          // Récupération des données du brevet
          const brevetData = await fetchApi(
            `${API_BASE_URL}/api/brevets/${brevetId}`,
            "Erreur lors de la récupération du brevet"
          );
          
          // Si on ne peut pas récupérer les données principales du brevet, on arrête tout
          if (!brevetData || !brevetData.data) {
            setError("Impossible de récupérer les informations du brevet");
            setLoading(false);
            return;
          }
          
          setBrevet(brevetData.data);

          // Récupérer les autres données en parallèle pour améliorer les performances
          const fetchPromises = [
            // Statuts
            fetchApi(`${API_BASE_URL}/api/statuts`, "Erreur lors de la récupération des statuts")
              .then(statutsData => {
                setStatutsList(statutsData.data || []);
                return statutsData.data || [];
              }),
            
            // Clients - gestion spéciale des erreurs 500
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/clients`, "Erreur lors de la récupération des clients")
              .then(clientsData => {
                setClients(clientsData.data || []);
              })
              .catch(() => {
                console.log("Échec de la récupération des clients, utilisation d'un tableau vide");
                setClients([]);
              }),
            
            // Pays - gestion spéciale des erreurs de format
            fetchApi(`${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`, "Erreur lors de la récupération des pays")
              .then(paysData => {
                setPays(paysData.data || []);
              })
              .catch(() => {
                console.log("Échec de la récupération des pays, utilisation d'un tableau vide");
                setPays([]);
              }),
          ];
          
          // Attendre que toutes les requêtes principales soient terminées
          await Promise.allSettled(fetchPromises);

          // Récupérer les données supplémentaires uniquement si disponibles
          if (brevetData.data.inventeurs && brevetData.data.inventeurs.length > 0) {
            try {
              const inventeurIds = brevetData.data.inventeurs.map(inv => inv.id_inventeur);
              const inventeursData = await fetchApi(
                `${API_BASE_URL}/api/inventeur?id_inventeurs=${inventeurIds.join('&id_inventeurs=')}`,
                "Erreur lors de la récupération des inventeurs"
              );
              setInventeurs(inventeursData.data || []);
            } catch (err) {
              console.log("Échec de la récupération des inventeurs", err);
              setInventeurs([]);
            }
          }

          // Récupération des déposants
          if (brevetData.data && brevetData.data.deposants && brevetData.data.deposants.length > 0) {
            const deposantIds = brevetData.data.deposants.map(dep => dep.id_deposant);
            const deposantsData = await fetchApi(
              `${API_BASE_URL}/api/deposant?id_deposants=${deposantIds.join('&id_deposants=')}`,
              "Erreur lors de la récupération des déposants"
            );
            setDeposants(deposantsData.data || []);
          }

          // Récupération des titulaires
          if (brevetData.data && brevetData.data.titulaires && brevetData.data.titulaires.length > 0) {
            const titulaireIds = brevetData.data.titulaires.map(tit => tit.id_titulaire);
            const titulairesData = await fetchApi(
              `${API_BASE_URL}/api/titulaire?id_titulaires=${titulaireIds.join('&id_titulaires=')}`,
              "Erreur lors de la récupération des titulaires"
            );
            setTitulaires(titulairesData.data || []);
          }

          // Récupération des pays
          const paysData = await fetchApi(
            `${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`,
            "Erreur lors de la récupération des pays"
          );
          setPays(paysData.data || []);

          // Récupération des cabinets
          const cabinetsData = await fetchApi(
            `${API_BASE_URL}/api/cabinets?id_brevet=${brevetId}`,
            "Erreur lors de la récupération des cabinets"
          );
          
          if (cabinetsData.data && cabinetsData.data.length > 0) {
            const cabinetDetailsPromises = cabinetsData.data.map(cabinet =>
              fetchApi(
                `${API_BASE_URL}/cabinet/${cabinet.id_cabinet}`,
                `Erreur lors de la récupération du cabinet ${cabinet.id_cabinet}`
              )
            );
            
            const cabinetsDetails = await Promise.all(cabinetDetailsPromises);
            const completeCabinetsData = cabinetsDetails
              .filter(res => res && res.data)
              .map(res => res.data);

            const procedureCabinetsData = completeCabinetsData.filter(cabinet => cabinet && cabinet.type === 'procedure');
            const annuiteCabinetsData = completeCabinetsData.filter(cabinet => cabinet && cabinet.type === 'annuite');

            setProcedureCabinets(procedureCabinetsData);
            setAnnuiteCabinets(annuiteCabinetsData);

            // Récupération des contacts des cabinets de procédure
            if (procedureCabinetsData.length > 0) {
              const contactsProcedurePromises = procedureCabinetsData.map(cabinet =>
                fetchApi(
                  `${API_BASE_URL}/api/contacts/cabinets/${cabinet.id_cabinet}`,
                  `Erreur lors de la récupération des contacts du cabinet ${cabinet.id_cabinet}`
                )
              );
              const contactsProcedureResults = await Promise.all(contactsProcedurePromises);
              setContactsProcedure(contactsProcedureResults.flatMap(result => result.data || []));
            }

            // Récupération des contacts des cabinets d'annuité
            if (annuiteCabinetsData.length > 0) {
              const contactsAnnuitePromises = annuiteCabinetsData.map(cabinet =>
                fetchApi(
                  `${API_BASE_URL}/api/contacts/cabinets/${cabinet.id_cabinet}`,
                  `Erreur lors de la récupération des contacts du cabinet ${cabinet.id_cabinet}`
                )
              );
              const contactsAnnuiteResults = await Promise.all(contactsAnnuitePromises);
              setContactsAnnuite(contactsAnnuiteResults.flatMap(result => result.data || []));
            }
          }

          setError(null);
        } catch (error) {
          console.error('Erreur globale lors de la récupération des données:', error);
          // Ne pas définir d'erreur globale pour permettre l'affichage partiel
        } finally {
          setLoading(false);
        }
      };

      fetchBrevetData();
    } else {
      console.error('Aucun ID de brevet fourni à useBrevetData');
      setLoading(false);
    }
  }, [brevetId, fetchApi, API_BASE_URL]);

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
    loading,
    error,
    generatePDF,
  };
};

export default useBrevetData;
