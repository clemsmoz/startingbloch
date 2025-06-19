import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Importation du fichier de configuration
import logo from '../assets/startigbloch_transparent_corrected.png';
import cacheService from '../services/cacheService';

// utilitaires
const safeArray = arr => Array.isArray(arr) ? arr : [];
const safeValue = v => v == null ? '' : v;

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
      const master = brevetResponse.data.data || {};
      setBrevet(master);
  
      console.log("Données du brevet chargées:", master);
  
      // Charger les données spécifiques pour chaque type d'entité liée
      const [cli, inv, dep, tit] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/clients`),
        axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/inventeurs`),
        axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/deposants`),
        axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/titulaires`)
      ]);
      setClients(safeArray(cli.data));
      setInventeurs(safeArray(inv.data));
      setDeposants(safeArray(dep.data));
      setTitulaires(safeArray(tit.data));
  
      // Récupérer tous les cabinets associés au brevet et leurs relations
      const cb = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/cabinets`);
      const allC = safeArray(cb.data.data);
      const proc = allC.filter(c => (c.type || '').toLowerCase().includes('proced'));
      const ann = allC.filter(c => (c.type || '').toLowerCase().includes('annuit'));
      setProcedureCabinets(proc);
      setAnnuiteCabinets(ann);
  
      // Récupérer les contacts pour les cabinets
      setContactsProcedure(await Promise.all(proc.map(c => fetchApi(`${API_BASE_URL}/api/contacts/cabinets/${c.id}`))) 
        .then(arr => safeArray(arr.flatMap(r => safeArray(r.data)))));
      setContactsAnnuite(await Promise.all(ann.map(c => fetchApi(`${API_BASE_URL}/api/contacts/cabinets/${c.id}`))) 
        .then(arr => safeArray(arr.flatMap(r => safeArray(r.data)))));
  
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
                setStatutsList(safeArray(statutsData.data));
                return safeArray(statutsData.data);
              }),
            
            // Clients - utiliser la route dédiée
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/clients`, "Erreur lors de la récupération des clients")
              .then(clientsData => {
                console.log("Clients récupérés:", clientsData);
                setClients(safeArray(clientsData));
              }),
            
            // Inventeurs - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/inventeurs`, "Erreur lors de la récupération des inventeurs")
              .then(invData => {
                console.log("Inventeurs récupérés:", invData);
                // S'assurer que les données sont traitées comme un tableau
                let inventeursData = safeArray(invData);
                console.log(`Nombre d'inventeurs trouvés: ${inventeursData.length}`);
                setInventeurs(inventeursData);
              }),
              
            // Déposants - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/deposants`, "Erreur lors de la récupération des déposants")
              .then(depData => {
                console.log("Déposants récupérés:", depData);
                // S'assurer que les données sont traitées comme un tableau
                let deposantsData = safeArray(depData);
                console.log(`Nombre de déposants trouvés: ${deposantsData.length}`);
                setDeposants(deposantsData);
              }),
              
            // Titulaires - nouvelle route API
            fetchApi(`${API_BASE_URL}/api/brevets/${brevetId}/titulaires`, "Erreur lors de la récupération des titulaires")
              .then(titData => {
                console.log("Titulaires récupérés:", titData);
                // S'assurer que les données sont traitées comme un tableau
                let titulairesData = safeArray(titData);
                console.log(`Nombre de titulaires trouvés: ${titulairesData.length}`);
                setTitulaires(titulairesData);
              }),
            
            // Pays - utiliser la route existante
            fetchApi(`${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`, "Erreur lors de la récupération des pays")
              .then(paysData => {
                setPays(safeArray(paysData.data));
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
                      .map(c => safeArray(c))
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
                      .map(c => safeArray(c))
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
const generatePDF = useCallback(async () => {
  try {
    if (!brevet) {
      alert("Impossible de générer le PDF: aucune donnée de brevet");
      return false;
    }

    // Utilitaire pour charger l'image de manière asynchrone
    function loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = src;
        if (img.complete) {
          resolve(img);
        } else {
          img.onload = () => resolve(img);
          img.onerror = reject;
        }
      });
    }

    // Formatage de date
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

    const doc = new jsPDF();

    // Mise en page
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;
    let pageCount = 1;

    // Palette de couleurs
    const colors = {
      primary:   [25, 118, 210],
      secondary: [25, 118, 210],
      accent:    [25, 118, 210],
      light:     [245, 245, 245],
      dark:      [33,  33,  33],
      white:     [255, 255, 255],
      warning:   [255, 193, 7],
      success:   [76, 175, 80],
      danger:    [244, 67, 54]
    };

    // FONCTIONS UTILES

    const addHeader = () => {
      const headerHeight = 20;
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.text(`Brevet: ${brevet.titre || "Sans titre"}`, margin, 13);
      doc.text(`Page ${pageCount}`, pageWidth - margin, 13, { align: 'right' });
    };

    const addFooter = () => {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString('fr-FR');
      doc.text(`Généré le ${today} - StartingBloch™`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    const addPage = () => {
      doc.addPage();
      pageCount++;
      addHeader();
      y = 28;
    };

    const checkNewPage = (height = 10) => {
      if (y + height > pageHeight - margin) {
        addPage();
        return true;
      }
      return false;
    };

    const addSectionTitle = (title) => {
      const minSectionHeight = 60;
      if (y + minSectionHeight > pageHeight - margin) {
        addPage();
      }
      doc.setFillColor(...colors.light);
      doc.rect(margin, y, contentWidth, 14, 'F');
      doc.setFillColor(...colors.primary);
      doc.rect(margin, y, 4, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...colors.primary);
      doc.text(title.toUpperCase(), margin + 8, y + 10);
      y += 18;
    };

    const addInfoCard = (title, data, options = {}) => {
      const {
        width = contentWidth/2 - 5,
        x = margin,
        height = 60,
        titleBgColor = colors.primary
      } = options;
      checkNewPage(height + 8);
      doc.setFillColor(0, 0, 0, 0.1);
      doc.roundedRect(x + 2, y + 2, width, height, 3, 3, 'F');
      doc.setFillColor(...colors.white);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      doc.setFillColor(...titleBgColor);
      doc.rect(x, y, width, 8, 'F');
      doc.setFont('helvetica','bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.white);
      doc.text(title, x + 5, y + 6);
      let localY = y + 14;
      doc.setFont('helvetica','normal');
      doc.setFontSize(9);
      for (const [key, val] of Object.entries(data)) {
        if (!val) continue;
        doc.setTextColor(...colors.primary);
        doc.text(`${key}:`, x + 5, localY);
        const lw = doc.getTextWidth(`${key}:`) + 4;
        doc.setTextColor(...colors.dark);
        const lines = doc.splitTextToSize(val.toString(), width - lw - 6);
        doc.text(lines, x + 5 + lw, localY);
        localY += 7 * lines.length;
      }
      y += height + 8;
    };

    // ------- PAGE DE COUVERTURE -------
    const img = await loadImage(logo);

    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 70, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.white);
    doc.setFontSize(24);
    doc.text("DOSSIER DE BREVET", pageWidth/2, 40, { align: 'center' });

    const logoWidth = 120;
    const logoHeight = (logoWidth * img.height) / img.width;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(img, 'PNG', logoX, 90, logoWidth, logoHeight);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    const brevetTitle = brevet.titre || "Sans titre";
    const titleLines = doc.splitTextToSize(brevetTitle, 150);
    doc.text(titleLines, pageWidth/2, 160, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.dark);
    doc.text(`Référence: ${brevet.reference_famille || "N/A"}`, pageWidth/2, 180, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth/2, pageHeight - 20, { align: 'center' });

    // ---- NOUVELLE PAGE ----
    addPage();

    // ------- CONTENU UNIQUEMENT UNE FOIS -------
    addSectionTitle("INFORMATIONS GÉNÉRALES");
    addInfoCard("Détails du brevet", {
      "Référence": brevet.reference_famille || "N/A",
      "Titre": brevet.titre || "N/A",
      "ID": brevet.id || "N/A"
    }, { width: contentWidth, height: 50 });

    if (clients && clients.length > 0) {
      addSectionTitle("CLIENTS");
      for (let i = 0; i < clients.length; i += 2) {
        addInfoCard(`Client ${i+1}`, {
          "Nom": clients[i].nom_client || "N/A",
          "Email": clients[i].email_client || "",
          "Téléphone": clients[i].telephone_client || "",
          "Adresse": clients[i].adresse_client || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 60, titleBgColor: colors.secondary });
        if (i + 1 < clients.length) {
          y -= 65;
          addInfoCard(`Client ${i+2}`, {
            "Nom": clients[i+1].nom_client || "N/A",
            "Email": clients[i+1].email_client || "",
            "Téléphone": clients[i+1].telephone_client || "",
            "Adresse": clients[i+1].adresse_client || ""
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 60, titleBgColor: colors.secondary });
        }
      }
    }

    if (inventeurs && inventeurs.length > 0) {
      addSectionTitle("INVENTEURS");
      for (let i = 0; i < inventeurs.length; i += 2) {
        if (!inventeurs[i]) continue;
        const inventeur1 = inventeurs[i];
        const nom1 = inventeur1?.nom_inventeur || inventeur1?.nom || '';
        const prenom1 = inventeur1?.prenom_inventeur || inventeur1?.prenom || '';
        const fullName1 = `${nom1} ${prenom1}`.trim() || "N/A";
        addInfoCard(`Inventeur ${i+1}`, {
          "Nom": fullName1,
          "Email": inventeur1?.email_inventeur || inventeur1?.email || "",
          "Téléphone": inventeur1?.telephone_inventeur || inventeur1?.telephone || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 50, titleBgColor: colors.accent });
        if (i + 1 < inventeurs.length && inventeurs[i+1]) {
          y -= 55;
          const inventeur2 = inventeurs[i+1];
          const nom2 = inventeur2?.nom_inventeur || inventeur2?.nom || '';
          const prenom2 = inventeur2?.prenom_inventeur || inventeur2?.prenom || '';
          const fullName2 = `${nom2} ${prenom2}`.trim() || "N/A";
          addInfoCard(`Inventeur ${i+2}`, {
            "Nom": fullName2,
            "Email": inventeur2?.email_inventeur || inventeur2?.email || "",
            "Téléphone": inventeur2?.telephone_inventeur || inventeur2?.telephone || ""
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 50, titleBgColor: colors.accent });
        }
      }
    }

    if (deposants && deposants.length > 0) {
      addSectionTitle("Déposants");
      for (let i = 0; i < deposants.length; i += 2) {
        addInfoCard(`Déposant ${i+1}`, {
          "Nom": deposants[i]?.nom_deposant || deposants[i]?.nom || "N/A",
          "Email": deposants[i]?.email_deposant || "",
          "Téléphone": deposants[i]?.telephone_deposant || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 50, titleBgColor: colors.primary });
        if (i + 1 < deposants.length) {
          y -= 55;
          addInfoCard(`Déposant ${i+2}`, {
            "Nom": deposants[i+1]?.nom_deposant || deposants[i+1]?.nom || "N/A",
            "Email": deposants[i+1]?.email_deposant || "",
            "Téléphone": deposants[i+1]?.telephone_deposant || ""
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 50, titleBgColor: colors.primary });
        }
      }
    }

    if (titulaires && titulaires.length > 0) {
      addSectionTitle("TITULAIRES");
      for (let i = 0; i < titulaires.length; i += 2) {
        addInfoCard(`Titulaire ${i+1}`, {
          "Nom": titulaires[i]?.nom_titulaire || titulaires[i]?.nom || "N/A",
          "Email": titulaires[i]?.email_titulaire || "",
          "Téléphone": titulaires[i]?.telephone_titulaire || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 50, titleBgColor: colors.secondary });
        if (i + 1 < titulaires.length) {
          y -= 55;
          addInfoCard(`Titulaire ${i+2}`, {
            "Nom": titulaires[i+1]?.nom_titulaire || titulaires[i+1]?.nom || "N/A",
            "Email": titulaires[i+1]?.email_titulaire || "",
            "Téléphone": titulaires[i+1]?.telephone_titulaire || ""
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 50, titleBgColor: colors.secondary });
        }
      }
    }

    if (pays && pays.length > 0) {
      addSectionTitle("PAYS ET STATUTS");
      for (let i = 0; i < pays.length; i += 2) {
        if (!pays[i]) continue;
        const pays1 = pays[i];
        const nomPays1 = pays1?.nom_fr_fr || (pays1.Pay && pays1.Pay.nom_fr_fr) || 'N/A';
        let statutText1 = 'N/A';
        if (pays1.Statut) {
          statutText1 = pays1.Statut.valeur || pays1.Statut.statuts || 'N/A';
        } else if (pays1.id_statuts && statutsList && statutsList.length > 0) {
          const statut = statutsList.find(s => s.id === pays1.id_statuts);
          if (statut) {
            statutText1 = statut.valeur || statut.statuts || 'N/A';
          }
        }
        let titleColor1 = colors.primary;
        if (statutText1.toLowerCase().includes('déposé')) {
          titleColor1 = colors.warning;
        } else if (statutText1.toLowerCase().includes('délivré')) {
          titleColor1 = colors.success;
        } else if (statutText1.toLowerCase().includes('refusé') || statutText1.toLowerCase().includes('rejeté')) {
          titleColor1 = colors.danger;
        }
        addInfoCard(nomPays1, {
          "Statut": statutText1,
          "N° Dépôt": pays1.numero_depot || "N/A",
          "Date Dépôt": pays1.date_depot ? formatDate(pays1.date_depot) : "N/A",
          "N° Publication": pays1.numero_publication || "N/A",
          "N° Délivrance": pays1.numero_delivrance || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 70, titleBgColor: titleColor1 });
        if (i + 1 < pays.length && pays[i+1]) {
          y -= 75;
          const pays2 = pays[i+1];
          const nomPays2 = pays2?.nom_fr_fr || (pays2.Pay && pays2.Pay.nom_fr_fr) || 'N/A';
          let statutText2 = 'N/A';
          if (pays2.Statut) {
            statutText2 = pays2.Statut.valeur || pays2.Statut.statuts || 'N/A';
          } else if (pays2.id_statuts && statutsList && statutsList.length > 0) {
            const statut = statutsList.find(s => s.id === pays2.id_statuts);
            if (statut) {
              statutText2 = statut.valeur || statut.statuts || 'N/A';
            }
          }
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
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 70, titleBgColor: titleColor2 });
        }
      }
    }

    if (procedureCabinets && procedureCabinets.length > 0) {
      addSectionTitle("CABINETS DE PROCÉDURE");
      for (let i = 0; i < procedureCabinets.length; i += 2) {
        if (!procedureCabinets[i]) continue;
        addInfoCard(`Cabinet de Procédure`, {
          "Nom": procedureCabinets[i]?.nom_cabinet || procedureCabinets[i]?.nom || "N/A",
          "Référence": procedureCabinets[i]?.reference || procedureCabinets[i]?.BrevetCabinets?.reference || "N/A",
          "Email": procedureCabinets[i]?.email_cabinet || "",
          "Téléphone": procedureCabinets[i]?.telephone_cabinet || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 60, titleBgColor: [0, 150, 136] });
        if (i + 1 < procedureCabinets.length && procedureCabinets[i+1]) {
          y -= 65;
          addInfoCard(`Cabinet de Procédure`, {
            "Nom": procedureCabinets[i+1]?.nom_cabinet || procedureCabinets[i+1]?.nom || "N/A",
            "Référence": procedureCabinets[i+1]?.reference || procedureCabinets[i+1]?.BrevetCabinets?.reference || "N/A",
            "Email": procedureCabinets[i+1]?.email_cabinet || "",
            "Téléphone": procedureCabinets[i+1]?.telephone_cabinet || ""
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 60, titleBgColor: [0, 150, 136] });
        }
      }
    }

    if (annuiteCabinets && annuiteCabinets.length > 0) {
      addSectionTitle("CABINETS D'ANNUITÉ");
      for (let i = 0; i < annuiteCabinets.length; i += 2) {
        if (!annuiteCabinets[i]) continue;
        addInfoCard(`Cabinet d'Annuité`, {
          "Nom": annuiteCabinets[i]?.nom_cabinet || annuiteCabinets[i]?.nom || "N/A",
          "Référence": annuiteCabinets[i]?.reference || annuiteCabinets[i]?.BrevetCabinets?.reference || "N/A",
          "Email": annuiteCabinets[i]?.email_cabinet || "",
          "Téléphone": annuiteCabinets[i]?.telephone_cabinet || ""
        }, { x: margin, width: contentWidth/2 - 5, height: 60, titleBgColor: [233, 30, 99] });
        if (i + 1 < annuiteCabinets.length && annuiteCabinets[i+1]) {
          y -= 65;
          addInfoCard(`Cabinet d'Annuité`, {
            "Nom": annuiteCabinets[i+1]?.nom_cabinet || annuiteCabinets[i+1]?.nom || "N/A",
            "Référence": annuiteCabinets[i+1]?.reference || annuiteCabinets[i+1]?.BrevetCabinets?.reference || "N/A",
            "Email": annuiteCabinets[i+1]?.email_cabinet || "",
            "Téléphone": annuiteCabinets[i+1]?.telephone_cabinet || ""
          }, { x: margin + contentWidth/2 + 5, width: contentWidth/2 - 5, height: 60, titleBgColor: [233, 30, 99] });
        }
      }
    }

    if (brevet.commentaire) {
      addSectionTitle("COMMENTAIRE");
      checkNewPage(60);
      doc.setFillColor(...colors.light);
      doc.rect(margin, y, contentWidth, 50, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      const commentLines = doc.splitTextToSize(brevet.commentaire, contentWidth - 10);
      commentLines.forEach((line, i) => {
        doc.text(line, margin + 5, y + 10 + (i * 7));
      });
    }

    // ----- AJOUT DU PIED DE PAGE (hors page 1) -----
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter();
    }

    // ENREGISTREMENT
    const fileName = `Brevet_${brevet.reference_famille || brevet.id || 'export'}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    alert(`Erreur lors de la génération du PDF: ${error.message}`);
    return false;
  }
}, [brevet, procedureCabinets, annuiteCabinets, clients, inventeurs, deposants, titulaires, pays, statutsList, logo]);

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
    pays: safeArray(pays),
    statut,
    statutsList: safeArray(statutsList),
    loading,
    error,
    generatePDF,
  };
};

export default useBrevetData;
