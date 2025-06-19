// getBrevetDataForExport.js
import axios from 'axios';
import { API_BASE_URL } from '../config';

// UTILITAIRES
const safeArray = arr => Array.isArray(arr) ? arr : [];
const safeValue = v => v == null ? '' : v;

// Fonction asynchrone qui retourne EXACTEMENT les mêmes données que useBrevetData, mais SANS REACT
export async function getBrevetDataForExport(brevetId) {
  if (!brevetId) throw new Error("Aucun ID de brevet fourni");

  let brevet = null;
  let procedureCabinets = [];
  let annuiteCabinets = [];
  let contactsProcedure = [];
  let contactsAnnuite = [];
  let clients = [];
  let inventeurs = [];
  let deposants = [];
  let titulaires = [];
  let statut = null;
  let pays = [];
  let statutsList = [];

  // Utilitaire fetch API sécurisé
  async function fetchApi(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) return { data: [] };
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return { data: [] };
      return await response.json();
    } catch {
      return { data: [] };
    }
  }

  try {
    // 1. Récupérer les données du brevet (SANS /relations)
    const brevetResponse = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}`);
    brevet = brevetResponse.data.data || {};

    // 2. Clients, inventeurs, déposants, titulaires
    const [cli, inv, dep, tit] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/clients`),
      axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/inventeurs`),
      axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/deposants`),
      axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/titulaires`)
    ]);
    clients = safeArray(cli.data);
    inventeurs = safeArray(inv.data);
    deposants = safeArray(dep.data);
    titulaires = safeArray(tit.data);

    // 3. Cabinets & classification
    const cb = await axios.get(`${API_BASE_URL}/api/brevets/${brevetId}/cabinets`);
    const allC = safeArray(cb.data.data);
    procedureCabinets = allC.filter(c => (c.type || '').toLowerCase().includes('proced') || (c.BrevetCabinets?.type || '').toLowerCase().includes('proced'));
    annuiteCabinets = allC.filter(c => (c.type || '').toLowerCase().includes('annuit') || (c.BrevetCabinets?.type || '').toLowerCase().includes('annuit'));

    // 4. Contacts cabinets
    const procContactsRaw = await Promise.all(
      procedureCabinets.map(c =>
        fetchApi(`${API_BASE_URL}/api/contacts/cabinets/${c.id}`)
      )
    );
    contactsProcedure = safeArray(procContactsRaw.flatMap(r => safeArray(r.data)));

    const annContactsRaw = await Promise.all(
      annuiteCabinets.map(c =>
        fetchApi(`${API_BASE_URL}/api/contacts/cabinets/${c.id}`)
      )
    );
    contactsAnnuite = safeArray(annContactsRaw.flatMap(r => safeArray(r.data)));

    // 5. Pays
    const paysRes = await fetchApi(`${API_BASE_URL}/api/numeros_pays?id_brevet=${brevetId}`);
    pays = safeArray(paysRes.data);

    // 6. Statuts list
    const statutsRes = await fetchApi(`${API_BASE_URL}/api/statuts`);
    statutsList = safeArray(statutsRes.data);

    // (statut principal optionnel)
    statut = brevet.statut || null;
  } catch (error) {
    throw new Error('Erreur lors de la récupération complète du brevet : ' + (error.message || error));
  }

  // Retourne l’objet équivalent à celui du hook
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
  };
}
