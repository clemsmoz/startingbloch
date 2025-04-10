import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';
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
      
      // Ajout d'un timeout de 10 secondes pour éviter les requêtes bloquées indéfiniment
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Réponse HTTP non OK: ${response.status} pour ${url}`);
        // Ne pas lever d'erreur, mais retourner des données vides pour continuer
        return { data: [] };
      }
      
      // Vérifier d'abord le Content-Type pour éviter les erreurs de parsing JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`La réponse n'est pas du JSON: ${contentType} pour ${url}`);
        // Retourner un objet avec des données vides plutôt que de tenter de parser du HTML ou autre
        return { data: [] };
      }
      
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        console.error(`Erreur lors du parsing JSON pour ${url}:`, parseError);
        return { data: [] };
      }
    } catch (error) {
      // Gestion des erreurs d'abort
      if (error.name === 'AbortError') {
        console.warn(`La requête a dépassé le délai d'attente: ${url}`);
      } else {
        console.error(`${errorMessage}:`, error);
      }
      
      // Ne pas définir d'erreur globale pour permettre l'affichage partiel des données
      return { data: [] };
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!brevetId) {
      console.log("useBrevetData: Aucun ID de brevet fourni");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      // Charger les données du brevet avec toutes ses relations
      const brevetResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/relations`);
      setBrevet(brevetResponse.data.data);
  
      console.log("Données du brevet chargées:", brevetResponse.data.data);
  
      // Charger les données spécifiques pour chaque type d'entité liée
      const clientsResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/clients`);
      setClients(clientsResponse.data || []);
  
      const invResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/inventeurs`);
      setInventeurs(invResponse.data || []);
  
      const depResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/deposants`);
      setDeposants(depResponse.data || []);
  
      const titResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/titulaires`);
      setTitulaires(titResponse.data || []);
  
      // Récupérer tous les cabinets associés au brevet et leurs relations
      const cabinetsResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/cabinets`);
      
      // Log détaillé pour déboguer les relations avec les cabinets
      console.log("Données cabinets brutes:", cabinetsResponse.data);
      
      // Stocker tous les cabinets
      if (cabinetsResponse.data.data && Array.isArray(cabinetsResponse.data.data)) {
        const allCabinets = cabinetsResponse.data.data;
        
        // Amélioration du tri entre cabinets procédure et annuité
        const procedureCabs = [];
        const annuiteCabs = [];
        
        allCabinets.forEach(cabinet => {
          // Vérifier si c'est un cabinet d'annuité ou de procédure
          let isAnnuite = false;
          let isProcedure = false;
          
          // Vérifier le type du cabinet lui-même
          if (cabinet.type) {
            const cabinetType = cabinet.type.toLowerCase();
            isAnnuite = cabinetType === 'annuite' || cabinetType.includes('annuit');
            isProcedure = cabinetType === 'procedure' || cabinetType.includes('proced');
          }
          
          // Vérifier également dans la relation BrevetCabinets
          if (cabinet.BrevetCabinets && cabinet.BrevetCabinets.type) {
            const relationType = cabinet.BrevetCabinets.type.toLowerCase();
            if (relationType === 'annuite' || relationType.includes('annuit')) {
              isAnnuite = true;
            } else if (relationType === 'procedure' || relationType.includes('proced')) {
              isProcedure = true;
            }
          }
          
          // Classer le cabinet selon son type
          if (isAnnuite) {
            annuiteCabs.push(cabinet);
          }
          if (isProcedure) {
            procedureCabs.push(cabinet);
          }
          
          // Si aucun type n'est trouvé, regarder le dernier recours - la relation directe
          if (!isAnnuite && !isProcedure && brevetResponse.data.data?.BrevetCabinets) {
            const matchingRelation = brevetResponse.data.data.BrevetCabinets.find(
              rel => rel.CabinetId === cabinet.id
            );
            
            if (matchingRelation && matchingRelation.type) {
              const relType = matchingRelation.type.toLowerCase();
              if (relType === 'annuite' || relType.includes('annuit')) {
                annuiteCabs.push({...cabinet, BrevetCabinets: matchingRelation});
              } else if (relType === 'procedure' || relType.includes('proced')) {
                procedureCabs.push({...cabinet, BrevetCabinets: matchingRelation});
              }
            }
          }
        });
        
        console.log(`Cabinets triés: ${procedureCabs.length} procédure, ${annuiteCabs.length} annuité`);
        setProcedureCabinets(procedureCabs);
        setAnnuiteCabinets(annuiteCabs);
      } else {
        console.warn("Format de réponse des cabinets inattendu:", cabinetsResponse.data);
        setProcedureCabinets([]);
        setAnnuiteCabinets([]);
      }
  
      // ...existing code...
    } catch (error) {
      console.error('Erreur lors du chargement des données du brevet:', error);
      setError(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [brevetId]);

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
            // Statuts - utiliser la nouvelle route API
            fetchApi(`${API_BASE_URL}/api/statuts`, "Erreur lors de la récupération des statuts")
              .then(statutsData => {
                setStatutsList(statutsData.data || []);
                return statutsData.data || [];
              }),
            
            // Clients - utiliser la route dédiée
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/clients`, "Erreur lors de la récupération des clients")
              .then(clientsData => {
                console.log("Clients récupérés:", clientsData);
                setClients(Array.isArray(clientsData) ? clientsData : (clientsData.data || []));
              }),
            
            // Inventeurs - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/inventeurs`, "Erreur lors de la récupération des inventeurs")
              .then(invData => {
                console.log("Inventeurs récupérés:", invData);
                setInventeurs(Array.isArray(invData) ? invData : (invData.data || []));
              }),
              
            // Déposants - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/deposants`, "Erreur lors de la récupération des déposants")
              .then(depData => {
                console.log("Déposants récupérés:", depData);
                setDeposants(Array.isArray(depData) ? depData : (depData.data || []));
              }),
              
            // Titulaires - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/titulaires`, "Erreur lors de la récupération des titulaires")
              .then(titData => {
                console.log("Titulaires récupérés:", titData);
                setTitulaires(Array.isArray(titData) ? titData : (titData.data || []));
              }),
            
            // Pays - utiliser la route existante
            fetchApi(`${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`, "Erreur lors de la récupération des pays")
              .then(paysData => {
                setPays(paysData.data || []);
              }),
              
            // Cabinets - nouvelle route API 
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/cabinets`, "Erreur lors de la récupération des cabinets")
              .then(cabinetsData => {
                if (!cabinetsData) {
                  setProcedureCabinets([]);
                  setAnnuiteCabinets([]);
                  return;
                }
                
                console.log("Données cabinets reçues:", cabinetsData);
                
                let procCabs = [];
                let annuiteCabs = [];
                
                // Vérifier si cabinetsData a une structure avec des arrays 'procedure' et 'annuite'
                if (cabinetsData.procedure && Array.isArray(cabinetsData.procedure)) {
                  procCabs = cabinetsData.procedure;
                  setProcedureCabinets(cabinetsData.procedure);
                  console.log("Cabinets procédure:", cabinetsData.procedure.length);
                } 
                
                if (cabinetsData.annuite && Array.isArray(cabinetsData.annuite)) {
                  annuiteCabs = cabinetsData.annuite;
                  setAnnuiteCabinets(cabinetsData.annuite);
                  console.log("Cabinets annuité:", cabinetsData.annuite.length);
                }
                
                // Si aucune donnée n'est disponible dans les formats ci-dessus, essayons de filtrer les données nous-mêmes
                if ((!procCabs.length || !annuiteCabs.length) && cabinetsData.data && Array.isArray(cabinetsData.data)) {
                  const procedureCabs = cabinetsData.data.filter(cab => 
                    (cab.type === 'procedure' || cab.BrevetCabinets?.type === 'procedure'));
                  const annuiteCabs = cabinetsData.data.filter(cab => 
                    (cab.type === 'annuite' || cab.BrevetCabinets?.type === 'annuite'));
                  
                  if (procedureCabs.length > 0 && !procCabs.length) {
                    procCabs = procedureCabs;
                    setProcedureCabinets(procedureCabs);
                  }
                    
                  if (annuiteCabs.length > 0 && !annuiteCabs.length) {
                    annuiteCabs = annuiteCabs;
                    setAnnuiteCabinets(annuiteCabs);
                  }
                  
                  console.log("Classification manuelle - Procédure:", procedureCabs.length, "Annuité:", annuiteCabs.length);
                }
                
                // Récupérer les contacts pour les cabinets immédiatement après avoir identifié les cabinets
                return { procCabs, annuiteCabs };
              })
              .then(async ({ procCabs, annuiteCabs }) => {
                console.log("Récupération des contacts pour les cabinets - Procédure:", procCabs?.length, "Annuité:", annuiteCabs?.length);
                
                // Récupération des contacts pour les cabinets de procédure
                if (procCabs && procCabs.length > 0) {
                  const contactPromises = procCabs.map(cabinet => 
                    fetchApi(`${API_BASE_URL}/api/contacts/cabinets/${cabinet.id}`, 
                            `Erreur lors de la récupération des contacts pour le cabinet ${cabinet.id}`)
                  );
                  
                  try {
                    const contacts = await Promise.all(contactPromises);
                    const allContacts = contacts
                      .filter(c => c && (c.data || Array.isArray(c)))
                      .map(c => Array.isArray(c) ? c : c.data)
                      .flat();
                    
                    console.log(`Contacts procédure trouvés: ${allContacts.length}`);
                    setContactsProcedure(allContacts);
                  } catch (error) {
                    console.error("Erreur lors de la récupération des contacts de procédure:", error);
                    setContactsProcedure([]);
                  }
                }
                
                // Récupération des contacts pour les cabinets d'annuité
                if (annuiteCabs && annuiteCabs.length > 0) {
                  const contactPromises = annuiteCabs.map(cabinet => 
                    fetchApi(`${API_BASE_URL}/api/contacts/cabinets/${cabinet.id}`, 
                            `Erreur lors de la récupération des contacts pour le cabinet ${cabinet.id}`)
                  );
                  
                  try {
                    const contacts = await Promise.all(contactPromises);
                    const allContacts = contacts
                      .filter(c => c && (c.data || Array.isArray(c)))
                      .map(c => Array.isArray(c) ? c : c.data)
                      .flat();
                    
                    console.log(`Contacts annuité trouvés: ${allContacts.length}`);
                    setContactsAnnuite(allContacts);
                  } catch (error) {
                    console.error("Erreur lors de la récupération des contacts d'annuité:", error);
                    setContactsAnnuite([]);
                  }
                }
              })
              .catch((error) => {
                console.error("Erreur détaillée lors de la récupération des cabinets:", error);
                setProcedureCabinets([]);
                setAnnuiteCabinets([]);
              }),
          ];
          
          // Attendre que toutes les requêtes principales soient terminées
          await Promise.allSettled(fetchPromises);

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
