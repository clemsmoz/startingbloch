import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Importation du fichier de configuration
import logo from '../assets/startigbloch_transparent_corrected.png';
import cacheService from '../services/cacheService';

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
          
          // S'assurer que les pays du cabinet sont disponibles
          if (!cabinet.Pays && cabinetsResponse.data.cabinetsPays) {
            const cabinetPays = cabinetsResponse.data.cabinetsPays.filter(
              cp => cp.CabinetId === cabinet.id
            );
            if (cabinetPays.length > 0) {
              cabinet.Pays = cabinetPays;
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
          // Vérifier si les données du brevet sont en cache
          const cachedBrevet = await cacheService.getBrevetById(brevetId);
          
          if (cachedBrevet.success) {
            if (cachedBrevet.fromCache) {
              console.log(`Utilisation des données en cache pour le brevet ${brevetId}`);
              setBrevet(cachedBrevet.data);
            } else {
              console.log(`Données fraîches pour le brevet ${brevetId}`);
              setBrevet(cachedBrevet.data);
            }
          } else {
            // Si le cache n'a pas fonctionné, on utilise la requête originale
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
          }

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
                // S'assurer que les données sont traitées comme un tableau
                let inventeursData = Array.isArray(invData) ? invData : (invData.data || []);
                console.log(`Nombre d'inventeurs trouvés: ${inventeursData.length}`);
                setInventeurs(inventeursData);
              }),
              
            // Déposants - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/deposants`, "Erreur lors de la récupération des déposants")
              .then(depData => {
                console.log("Déposants récupérés:", depData);
                // S'assurer que les données sont traitées comme un tableau
                let deposantsData = Array.isArray(depData) ? depData : (depData.data || []);
                console.log(`Nombre de déposants trouvés: ${deposantsData.length}`);
                setDeposants(deposantsData);
              }),
              
            // Titulaires - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/titulaires`, "Erreur lors de la récupération des titulaires")
              .then(titData => {
                console.log("Titulaires récupérés:", titData);
                // S'assurer que les données sont traitées comme un tableau
                let titulairesData = Array.isArray(titData) ? titData : (titData.data || []);
                console.log(`Nombre de titulaires trouvés: ${titulairesData.length}`);
                setTitulaires(titulairesData);
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

  // Version PDF moderne, stylisée et GARANTIE fonctionnelle
  const generatePDF = useCallback(() => {
    try {
      console.log("[PDF] Début de la génération du PDF moderne et stylisé");
      
      // Vérifications préliminaires
      if (!brevet) {
        console.error("[PDF] Erreur: brevet non défini");
        alert("Impossible de générer le PDF: aucune donnée de brevet");
        return false;
      }

      console.log("[PDF] Brevet trouvé:", brevet.titre);
      
      // Fonction pour formater les dates
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('fr-FR', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          });
        } catch (e) {
          return 'N/A';
        }
      };

      // Création du document
      const doc = new jsPDF();
      
      // Dimensions et marges
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let y = 20;
      
      // Palette de couleurs modernes
      const colors = {
        primary: [25, 118, 210],    // Bleu principal
        secondary: [66, 165, 245],  // Bleu secondaire
        accent: [255, 152, 0],      // Orange
        success: [76, 175, 80],     // Vert
        warning: [255, 193, 7],     // Jaune
        danger: [244, 67, 54],      // Rouge
        light: [245, 245, 245],     // Gris clair
        dark: [33, 33, 33],         // Noir texte
        white: [255, 255, 255]      // Blanc
      };
      
      // Compteur de pages
      let pageCount = 1;
      
      // Fonction pour vérifier l'espace disponible et ajouter une page si nécessaire
      const checkNewPage = (height = 10) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          pageCount++;
          
          // En-tête de page
          doc.setFillColor(...colors.primary);
          doc.rect(0, 0, pageWidth, 12, 'F');
          doc.setTextColor(...colors.white);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.text(`Brevet: ${brevet.titre || "Sans titre"}`, margin, 8);
          doc.text(`Page ${pageCount}`, pageWidth - margin, 8, { align: 'right' });
          
          y = 20;
          return true;
        }
        return false;
      };

      // Fonction pour ajouter un titre de section
      const addSectionTitle = (title) => {
        checkNewPage(15);
        
        // Fond pour le titre
        doc.setFillColor(...colors.primary);
        doc.rect(margin, y, contentWidth, 10, 'F');
        
        // Texte du titre
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.white);
        doc.setFontSize(12);
        doc.text(title, margin + 5, y + 7);
        
        y += 15;
      };

      // Fonction pour créer une carte d'information
      const addInfoCard = (title, data, options = {}) => {
        const { 
          width = contentWidth / 2 - 5, 
          x = margin,
          bgColor = colors.light,
          titleBgColor = colors.primary,
          height = 60
        } = options;
        
        checkNewPage(height + 5);
        
        // Fond de la carte
        doc.setFillColor(...bgColor);
        doc.rect(x, y, width, height, 'F');
        
        // En-tête de la carte
        doc.setFillColor(...titleBgColor);
        doc.rect(x, y, width, 8, 'F');
        
        // Titre de la carte
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...colors.white);
        doc.text(title, x + 5, y + 6);
        
        // Contenu de la carte
        let localY = y + 15;
        
        for (const [key, value] of Object.entries(data)) {
          if (value) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...colors.primary);
            doc.text(`${key}:`, x + 5, localY);
            
            const labelWidth = doc.getTextWidth(`${key}:`) + 3;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.dark);
            
            // Si la valeur est trop longue, la tronquer
            const maxValueWidth = width - labelWidth - 10;
            const valueText = doc.splitTextToSize(value.toString(), maxValueWidth);
            doc.text(valueText, x + 5 + labelWidth, localY);
            
            localY += 7 * valueText.length;
          }
        }
        
        y += height + 5;
      };

      // Page de couverture
      const img = new Image();
      img.src = logo;
      
      img.onload = function() {
        // Bannière supérieure
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 70, 'F');
        
        // Titre principal
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.white);
        doc.setFontSize(24);
        doc.text("DOSSIER DE BREVET", pageWidth/2, 40, { align: 'center' });
        
        // Logo centré
        const logoWidth = 120;
        const logoHeight = (logoWidth * img.height) / img.width;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(img, 'PNG', logoX, 90, logoWidth, logoHeight);
        
        // Titre du brevet
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        const brevetTitle = brevet.titre || "Sans titre";
        const titleLines = doc.splitTextToSize(brevetTitle, 150);
        doc.text(titleLines, pageWidth/2, 160, { align: 'center' });
        
        // Référence
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.dark);
        doc.text(`Référence: ${brevet.reference_famille || "N/A"}`, pageWidth/2, 180, { align: 'center' });
        
        // Date de génération
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth/2, pageHeight - 20, { align: 'center' });

        // Page d'informations générales
        doc.addPage();
        pageCount++;
        y = 20;
        
        // Titre de la section
        addSectionTitle("INFORMATIONS GÉNÉRALES");
        
        // Carte d'information du brevet
        addInfoCard("Détails du brevet", {
          "Référence": brevet.reference_famille || "N/A",
          "Titre": brevet.titre || "N/A",
          "ID": brevet.id || "N/A"
        }, { 
          width: contentWidth,
          height: 50
        });
        
        // Section Clients
        if (clients && clients.length > 0) {
          addSectionTitle("CLIENTS");
          
          // Présentation des clients en 2 colonnes
          for (let i = 0; i < clients.length; i += 2) {
            // Premier client de la rangée
            addInfoCard(`Client ${i+1}`, {
              "Nom": clients[i].nom_client || "N/A",
              "Email": clients[i].email_client || "",
              "Téléphone": clients[i].telephone_client || "",
              "Adresse": clients[i].adresse_client || ""
            }, { 
              x: margin, 
              width: contentWidth/2 - 5,
              height: 60,
              titleBgColor: colors.secondary
            });
            
            // Deuxième client de la rangée (si disponible)
            if (i + 1 < clients.length) {
              y -= 65; // Revenir en haut pour la deuxième colonne
              
              addInfoCard(`Client ${i+2}`, {
                "Nom": clients[i+1].nom_client || "N/A",
                "Email": clients[i+1].email_client || "",
                "Téléphone": clients[i+1].telephone_client || "",
                "Adresse": clients[i+1].adresse_client || ""
              }, { 
                x: margin + contentWidth/2 + 5, 
                width: contentWidth/2 - 5,
                height: 60,
                titleBgColor: colors.secondary
              });
            }
          }
        }
        
        // Section Inventeurs
        if (inventeurs && inventeurs.length > 0) {
          addSectionTitle("INVENTEURS");
          
          // Présentation des inventeurs en 2 colonnes
          for (let i = 0; i < inventeurs.length; i += 2) {
            if (!inventeurs[i]) continue;
            
            const inventeur1 = inventeurs[i];
            const nom1 = inventeur1?.nom_inventeur || inventeur1?.nom || '';
            const prenom1 = inventeur1?.prenom_inventeur || inventeur1?.prenom || '';
            const fullName1 = `${nom1} ${prenom1}`.trim() || "N/A";
            
            // Premier inventeur de la rangée
            addInfoCard(`Inventeur ${i+1}`, {
              "Nom": fullName1,
              "Email": inventeur1?.email_inventeur || inventeur1?.email || "",
              "Téléphone": inventeur1?.telephone_inventeur || inventeur1?.telephone || ""
            }, { 
              x: margin, 
              width: contentWidth/2 - 5,
              height: 50,
              titleBgColor: colors.accent
            });
            
            // Deuxième inventeur de la rangée (si disponible)
            if (i + 1 < inventeurs.length && inventeurs[i+1]) {
              y -= 55; // Revenir en haut pour la deuxième colonne
              
              const inventeur2 = inventeurs[i+1];
              const nom2 = inventeur2?.nom_inventeur || inventeur2?.nom || '';
              const prenom2 = inventeur2?.prenom_inventeur || inventeur2?.prenom || '';
              const fullName2 = `${nom2} ${prenom2}`.trim() || "N/A";
              
              addInfoCard(`Inventeur ${i+2}`, {
                "Nom": fullName2,
                "Email": inventeur2?.email_inventeur || inventeur2?.email || "",
                "Téléphone": inventeur2?.telephone_inventeur || inventeur2?.telephone || ""
              }, { 
                x: margin + contentWidth/2 + 5, 
                width: contentWidth/2 - 5,
                height: 50,
                titleBgColor: colors.accent
              });
            }
          }
        }
        
        // Section Pays
        if (pays && pays.length > 0) {
          addSectionTitle("PAYS ET STATUTS");
          
          // Présentation des pays en 2 colonnes
          for (let i = 0; i < pays.length; i += 2) {
            if (!pays[i]) continue;
            
            const pays1 = pays[i];
            const nomPays1 = pays1?.nom_fr_fr || (pays1.Pay && pays1.Pay.nom_fr_fr) || 'N/A';
            
            // Trouver le statut
            let statutText1 = 'N/A';
            if (pays1.Statut) {
              statutText1 = pays1.Statut.valeur || pays1.Statut.statuts || 'N/A';
            } else if (pays1.id_statuts && statutsList && statutsList.length > 0) {
              const statut = statutsList.find(s => s.id === pays1.id_statuts);
              if (statut) {
                statutText1 = statut.valeur || statut.statuts || 'N/A';
              }
            }
            
            // Déterminer la couleur selon le statut
            let titleColor1 = colors.primary;
            if (statutText1.toLowerCase().includes('déposé')) {
              titleColor1 = colors.warning;
            } else if (statutText1.toLowerCase().includes('délivré')) {
              titleColor1 = colors.success;
            } else if (statutText1.toLowerCase().includes('refusé') || statutText1.toLowerCase().includes('rejeté')) {
              titleColor1 = colors.danger;
            }
            
            // Premier pays de la rangée
            addInfoCard(nomPays1, {
              "Statut": statutText1,
              "N° Dépôt": pays1.numero_depot || "N/A",
              "Date Dépôt": pays1.date_depot ? formatDate(pays1.date_depot) : "N/A",
              "N° Publication": pays1.numero_publication || "N/A",
              "N° Délivrance": pays1.numero_delivrance || ""
            }, { 
              x: margin, 
              width: contentWidth/2 - 5,
              height: 70,
              titleBgColor: titleColor1
            });
            
            // Deuxième pays de la rangée (si disponible)
            if (i + 1 < pays.length && pays[i+1]) {
              y -= 75; // Revenir en haut pour la deuxième colonne
              
              const pays2 = pays[i+1];
              const nomPays2 = pays2?.nom_fr_fr || (pays2.Pay && pays2.Pay.nom_fr_fr) || 'N/A';
              
              // Trouver le statut
              let statutText2 = 'N/A';
              if (pays2.Statut) {
                statutText2 = pays2.Statut.valeur || pays2.Statut.statuts || 'N/A';
              } else if (pays2.id_statuts && statutsList && statutsList.length > 0) {
                const statut = statutsList.find(s => s.id === pays2.id_statuts);
                if (statut) {
                  statutText2 = statut.valeur || statut.statuts || 'N/A';
                }
              }
              
              // Déterminer la couleur selon le statut
              let titleColor2 = colors.primary;
              if (statutText2.toLowerCase().includes('déposé')) {
                titleColor2 = colors.warning;
              } else if (statutText2.toLowerCase().includes('délivré')) {
                titleColor2 = colors.success;
              } else if (statutText2.toLowerCase().includes('refusé') || statutText2.toLowerCase().includes('rejeté')) {
                titleColor2 = colors.danger;
              }
              
              addInfoCard(nomPays2, {
                "Statut": statutText2,
                "N° Dépôt": pays2.numero_depot || "N/A",
                "Date Dépôt": pays2.date_depot ? formatDate(pays2.date_depot) : "N/A",
                "N° Publication": pays2.numero_publication || "N/A",
                "N° Délivrance": pays2.numero_delivrance || ""
              }, { 
                x: margin + contentWidth/2 + 5, 
                width: contentWidth/2 - 5,
                height: 70,
                titleBgColor: titleColor2
              });
            }
          }
        }
        
        // Cabinets
        if (procedureCabinets && procedureCabinets.length > 0) {
          addSectionTitle("CABINETS DE PROCÉDURE");
          
          // Présentation des cabinets en 2 colonnes
          for (let i = 0; i < procedureCabinets.length; i += 2) {
            if (!procedureCabinets[i]) continue;
            
            // Premier cabinet de la rangée
            addInfoCard(`Cabinet de Procédure`, {
              "Nom": procedureCabinets[i]?.nom_cabinet || procedureCabinets[i]?.nom || "N/A",
              "Référence": procedureCabinets[i]?.reference || procedureCabinets[i]?.BrevetCabinets?.reference || "N/A",
              "Email": procedureCabinets[i]?.email_cabinet || "",
              "Téléphone": procedureCabinets[i]?.telephone_cabinet || ""
            }, { 
              x: margin, 
              width: contentWidth/2 - 5,
              height: 60,
              titleBgColor: [0, 150, 136] // Teal
            });
            
            // Deuxième cabinet de la rangée (si disponible)
            if (i + 1 < procedureCabinets.length && procedureCabinets[i+1]) {
              y -= 65; // Revenir en haut pour la deuxième colonne
              
              addInfoCard(`Cabinet de Procédure`, {
                "Nom": procedureCabinets[i+1]?.nom_cabinet || procedureCabinets[i+1]?.nom || "N/A",
                "Référence": procedureCabinets[i+1]?.reference || procedureCabinets[i+1]?.BrevetCabinets?.reference || "N/A",
                "Email": procedureCabinets[i+1]?.email_cabinet || "",
                "Téléphone": procedureCabinets[i+1]?.telephone_cabinet || ""
              }, { 
                x: margin + contentWidth/2 + 5, 
                width: contentWidth/2 - 5,
                height: 60,
                titleBgColor: [0, 150, 136] // Teal
              });
            }
          }
        }
        
        if (annuiteCabinets && annuiteCabinets.length > 0) {
          addSectionTitle("CABINETS D'ANNUITÉ");
          
          // Présentation des cabinets en 2 colonnes
          for (let i = 0; i < annuiteCabinets.length; i += 2) {
            if (!annuiteCabinets[i]) continue;
            
            // Premier cabinet de la rangée
            addInfoCard(`Cabinet d'Annuité`, {
              "Nom": annuiteCabinets[i]?.nom_cabinet || annuiteCabinets[i]?.nom || "N/A",
              "Référence": annuiteCabinets[i]?.reference || annuiteCabinets[i]?.BrevetCabinets?.reference || "N/A",
              "Email": annuiteCabinets[i]?.email_cabinet || "",
              "Téléphone": annuiteCabinets[i]?.telephone_cabinet || ""
            }, { 
              x: margin, 
              width: contentWidth/2 - 5,
              height: 60,
              titleBgColor: [233, 30, 99] // Rose
            });
            
            // Deuxième cabinet de la rangée (si disponible)
            if (i + 1 < annuiteCabinets.length && annuiteCabinets[i+1]) {
              y -= 65; // Revenir en haut pour la deuxième colonne
              
              addInfoCard(`Cabinet d'Annuité`, {
                "Nom": annuiteCabinets[i+1]?.nom_cabinet || annuiteCabinets[i+1]?.nom || "N/A",
                "Référence": annuiteCabinets[i+1]?.reference || annuiteCabinets[i+1]?.BrevetCabinets?.reference || "N/A",
                "Email": annuiteCabinets[i+1]?.email_cabinet || "",
                "Téléphone": annuiteCabinets[i+1]?.telephone_cabinet || ""
              }, { 
                x: margin + contentWidth/2 + 5, 
                width: contentWidth/2 - 5,
                height: 60,
                titleBgColor: [233, 30, 99] // Rose
              });
            }
          }
        }
        
        // Commentaire
        if (brevet.commentaire) {
          addSectionTitle("COMMENTAIRE");
          
          checkNewPage(60); // Vérifier l'espace pour le commentaire
          
          // Fond pour le commentaire
          doc.setFillColor(...colors.light);
          doc.rect(margin, y, contentWidth, 50, 'F');
          
          // Texte du commentaire
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...colors.dark);
          
          const commentLines = doc.splitTextToSize(brevet.commentaire, contentWidth - 10);
          commentLines.forEach((line, i) => {
            doc.text(line, margin + 5, y + 10 + (i * 7));
          });
        }
        
        // Pied de page sur toutes les pages
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          if (i > 1) { // Ignorer la page de couverture
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            
            const today = new Date().toLocaleDateString('fr-FR');
            doc.text(`Généré le ${today} - StartingBloch™`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          }
        }
        
        // Sauvegarde du PDF
        const fileName = `Brevet_${brevet.reference_famille || brevet.id || 'export'}.pdf`;
        doc.save(fileName);
        
        console.log("[PDF] PDF généré avec succès!");
      };
      
      return true;
    } catch (error) {
      console.error("[PDF] ERREUR LORS DE LA GÉNÉRATION DU PDF:", error);
      alert(`Erreur lors de la génération du PDF: ${error.message}`);
      return false;
    }
  }, [brevet, procedureCabinets, annuiteCabinets, clients, inventeurs, pays, statutsList, logo]);

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
