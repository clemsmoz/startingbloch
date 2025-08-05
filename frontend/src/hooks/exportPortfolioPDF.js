import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { getBrevetDataForExport } from "./getBrevetDataForExport";
import flags from "../flags";
import countryNameToIso from "../countryNameToIso.js";

const colors = {
  primary: "#1976d2",
  accent: "#0D47A1",
  light: "#F5F7FA",
  card: "#FFFFFF",
  cardAlt: "#F1F6FB",
  shadow: "#dde5ef",
  shadowDeep: "#b7c6db",
  success: "#43A047",
  warning: "#FFA726",
  danger: "#D32F2F",
  dark: "#212121",
  grey: "#BDBDBD",
  comment: "#F4F4F4",
  border: "#e0e5ec"
};

pdfMake.vfs = pdfFonts.vfs;

// ---------- UTILS ----------
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "N/A";
  }
}

function normalize(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/’/g, "'")
    .trim();
}

function statutColor(stat) {
  let color = colors.grey;
  if (!stat) return color;
  const s = stat.toLowerCase();
  if (s.includes("délivré")) color = colors.success;
  else if (s.includes("en cours") || s.includes("déposé")) color = colors.warning;
  else if (s.includes("déchu") || s.includes("retiré") || s.includes("refusé")) color = colors.danger;
  return color;
}

function getCountryIsoByName(name) {
  if (!name) return null;
  let str = name;
  if (typeof name === "object" && name !== null) {
    str = name.nom_fr_fr || name.nom_en || name.nom || "";
  }
  const n = normalize(str);
  return countryNameToIso[n] || null;
}

function getFlagImg(nom_fr_fr) {
  const code = getCountryIsoByName(nom_fr_fr);
  return code && flags[code] ? flags[code] : null;
}

// ---------- CARD ----------
function card(title, content, options = {}) {
  const {
    color = colors.primary,
    bg = colors.card,
    badge = null,
    alt = false,
    margin = [0, 0, 0, 18],
    noMarginTitle = false
  } = options;
  return {
    unbreakable: true,
    columns: [
      {
        width: 6,
        canvas: [{ type: "rect", x: 0, y: 0, w: 6, h: 70, color: color }],
        margin: [0, 0, 0, 0]
      },
      {
        width: "*",
        table: {
          widths: [badge ? 28 : 0, "*"],
          body: [[
            badge ? {
              stack: [
                { text: badge, color: "#fff", bold: true, fontSize: 10, alignment: "center" }
              ],
              fillColor: color,
              margin: [0, 6, 0, 0],
              borderRadius: 20,
              width: 20,
              height: 20,
            } : {},
            {
              stack: [
                {
                  text: title,
                  color,
                  bold: true,
                  fontSize: 15,
                  margin: noMarginTitle ? [0, 0, 0, 0] : [0, 0, 0, 8]
                },
                ...content
              ]
            }
          ]]
        },
        layout: {
          fillColor: () => bg,
          paddingTop: () => 14,
          paddingBottom: () => 18,
          paddingLeft: () => 18,
          paddingRight: () => 18,
          hLineColor: () => colors.shadowDeep,
          vLineColor: () => colors.shadowDeep,
          hLineWidth: () => 0,
          vLineWidth: () => 0,
        }
      }
    ],
    columnGap: 0,
    margin,
    style: "cardShadow"
  };
}

// ----------- MAIN EXPORT -----------
export async function exportBrevetsPDF(brevets, clientName, logo, exportLang = 'fr') {
  if (!brevets || brevets.length === 0) {
    window.alert("Aucun brevet à exporter !");
    return false;
  }

  // Dictionnaire de traductions pour les textes du PDF
  const translations = {
    fr: {
      portfolioTitle: "Portefeuille de brevets",
      reportGenerated: "Rapport généré le",
      summary: "Sommaire",
      client: "Client",
      inventor: "Inventeur",
      applicant: "Déposant",
      owner: "Titulaire",
      country: "Pays",
      status: "Statut",
      applicationNumber: "N° Dépôt",
      applicationDate: "Date Dépôt",
      publicationNumber: "N° Publication",
      publicationDate: "Date Publication",
      procedureCabinet: "Cabinet de Procédure",
      renewalCabinet: "Cabinet d'Annuité",
      reference: "Référence",
      email: "Email",
      telephone: "Téléphone",
      confidential: "Portefeuille de brevets | confidentiel",
      page: "Page"
    },
    en: {
      portfolioTitle: "Patent Portfolio",
      reportGenerated: "Report generated on",
      summary: "Summary",
      client: "Client",
      inventor: "Inventor",
      applicant: "Applicant",
      owner: "Owner",
      country: "Country",
      status: "Status",
      applicationNumber: "Application No.",
      applicationDate: "Application Date",
      publicationNumber: "Publication No.",
      publicationDate: "Publication Date",
      procedureCabinet: "Procedure Firm",
      renewalCabinet: "Renewal Firm",
      reference: "Reference",
      email: "Email",
      telephone: "Telephone",
      confidential: "Patent portfolio | confidential",
      page: "Page"
    },
    es: {
      portfolioTitle: "Cartera de Patentes",
      reportGenerated: "Informe generado el",
      summary: "Resumen",
      client: "Cliente",
      inventor: "Inventor",
      applicant: "Solicitante",
      owner: "Propietario",
      country: "País",
      status: "Estado",
      applicationNumber: "N° Solicitud",
      applicationDate: "Fecha Solicitud",
      publicationNumber: "N° Publicación",
      publicationDate: "Fecha Publicación",
      procedureCabinet: "Despacho de Procedimiento",
      renewalCabinet: "Despacho de Renovación",
      reference: "Referencia",
      email: "Email",
      telephone: "Teléfono",
      confidential: "Cartera de patentes | confidencial",
      page: "Página"
    },
    de: {
      portfolioTitle: "Patent-Portfolio",
      reportGenerated: "Bericht erstellt am",
      summary: "Zusammenfassung",
      client: "Kunde",
      inventor: "Erfinder",
      applicant: "Anmelder",
      owner: "Inhaber",
      country: "Land",
      status: "Status",
      applicationNumber: "Anmeldenr.",
      applicationDate: "Anmeldedatum",
      publicationNumber: "Veröffentlichungsnr.",
      publicationDate: "Veröffentlichungsdatum",
      procedureCabinet: "Verfahrenskanzlei",
      renewalCabinet: "Verlängerungskanzlei",
      reference: "Referenz",
      email: "E-Mail",
      telephone: "Telefon",
      confidential: "Patent-Portfolio | vertraulich",
      page: "Seite"
    },
    it: {
      portfolioTitle: "Portafoglio Brevetti",
      reportGenerated: "Rapporto generato il",
      summary: "Sommario",
      client: "Cliente",
      inventor: "Inventore",
      applicant: "Richiedente",
      owner: "Proprietario",
      country: "Paese",
      status: "Stato",
      applicationNumber: "N° Domanda",
      applicationDate: "Data Domanda",
      publicationNumber: "N° Pubblicazione",
      publicationDate: "Data Pubblicazione",
      procedureCabinet: "Studio di Procedura",
      renewalCabinet: "Studio di Rinnovo",
      reference: "Riferimento",
      email: "Email",
      telephone: "Telefono",
      confidential: "Portafoglio brevetti | riservato",
      page: "Pagina"
    },
    pt: {
      portfolioTitle: "Portfólio de Patentes",
      reportGenerated: "Relatório gerado em",
      summary: "Resumo",
      client: "Cliente",
      inventor: "Inventor",
      applicant: "Requerente",
      owner: "Proprietário",
      country: "País",
      status: "Estado",
      applicationNumber: "N° Pedido",
      applicationDate: "Data Pedido",
      publicationNumber: "N° Publicação",
      publicationDate: "Data Publicação",
      procedureCabinet: "Escritório de Procedimentos",
      renewalCabinet: "Escritório de Renovação",
      reference: "Referência",
      email: "Email",
      telephone: "Telefone",
      confidential: "Portfólio de patentes | confidencial",
      page: "Página"
    }
  };

  const t = translations[exportLang] || translations.fr;

  const detailedBrevets = [];
  let statutsList = [];
  for (const b of brevets) {
    const data = await getBrevetDataForExport(b.id_brevet || b.id);
    if (!statutsList.length) statutsList = data.statutsList || [];
    detailedBrevets.push(data);
  }

  // ---- PAGE DE GARDE ----
  const cover = [
    {
      canvas: [
        { type: 'rect', x: 0, y: 0, w: 595, h: 120, color: colors.primary }
      ],
      absolutePosition: { x: 0, y: 0 }
    },
    {
      image: logo,
      width: 300,
      alignment: 'center',
      margin: [0, 80, 0, 18],
    },
    {
      text: "Portefeuille de brevets",
      fontSize: 40,
      color: colors.primary,
      bold: true,
      alignment: "center",
      margin: [0, 25, 0, 0],
      decoration: "underline"
    },
    {
      text: clientName,
      fontSize: 30,
      bold: true,
      color: colors.dark,
      alignment: "center",
      margin: [0, 28, 0, 0]
    },
    {
      text: `Rapport généré le ${formatDate(new Date())}`,
      fontSize: 15,
      color: colors.grey,
      alignment: "center",
      margin: [0, 16, 0, 0]
    }
  ];

  // ---- SOMMAIRE ----
  const toc = [];
  let pageNumber = 2;
  for (let idx = 0; idx < detailedBrevets.length; idx++) {
    const d = detailedBrevets[idx];
    const brevet = d.brevet || {};
    const titreBrevet = brevet.titre || `Brevet #${idx + 1}`;
    const refFamille = brevet.reference_famille ? `[${brevet.reference_famille}] ` : '';
    const pageTitle = `${refFamille}${titreBrevet}`;
    toc.push({
      columns: [
        {
          canvas: [{
            type: 'rect', x: 0, y: 0, w: 7, h: 25, color: idx % 2 ? colors.primary : colors.accent
          }],
          width: 7,
        },
        {
          text: `${idx + 1}. ${pageTitle}`,
          style: "tocItem",
          linkToDestination: `brevet_${idx + 1}`,
          margin: [12, 0, 0, 0],
          width: "*"
        },
        {
          text: `p. ${pageNumber}`,
          alignment: 'right',
          width: 40,
          color: colors.accent,
          fontSize: 15
        }
      ],
      columnGap: 5,
      margin: [0, 0, 0, 8],
      border: [false, false, false, true]
    });
    pageNumber++;
  }

  // ---- SECTIONS BREVETS ----
  const brevetSections = [];
  for (let idx = 0; idx < detailedBrevets.length; idx++) {
    const d = detailedBrevets[idx];
    const brevet = d.brevet || {};
    const titreBrevet = brevet.titre || `Brevet #${idx + 1}`;
    const refFamille = brevet.reference_famille ? `[${brevet.reference_famille}] ` : '';
    const pageTitle = `${refFamille}${titreBrevet}`;
    const alt = idx % 2 === 1;

    // BANNIÈRE + TITRE (avec id pour lien)
    brevetSections.push({
      text: pageTitle,
      style: "brevetTitle",
      fontSize: 20,
      color: alt ? colors.primary : colors.accent,
      bold: true,
      margin: [0, 10, 0, 12],
      pageBreak: 'before',
      id: `brevet_${idx + 1}`
    });
    brevetSections.push({
      canvas: [{ type: 'rect', x: 0, y: 0, w: 500, h: 6, color: alt ? colors.primary : colors.accent }],
      margin: [0, 0, 0, 16]
    });

    // CLIENTS (2 colonnes si >3)
    if (d.clients?.length > 0) {
      let cols = [];
      for (let i = 0; i < d.clients.length; i++) {
        cols.push(card(
          `Client`,
          [
            { text: `${d.clients[i].nom_client || ""}`, fontSize: 11, margin: [0, 0, 0, 1] },
            d.clients[i].email_client ? { text: `Email : ${d.clients[i].email_client}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            d.clients[i].telephone_client ? { text: `Téléphone : ${d.clients[i].telephone_client}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            d.clients[i].adresse_client ? { text: `Adresse : ${d.clients[i].adresse_client}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
          ].filter(Boolean),
          { color: colors.accent, badge: `${i + 1}`, bg: colors.cardAlt }
        ));
      }
      brevetSections.push({
        columns: cols.length > 3 ? [cols.slice(0, Math.ceil(cols.length / 2)), cols.slice(Math.ceil(cols.length / 2))] : cols,
        columnGap: 18,
        margin: [0, 0, 0, 10]
      });
    }

    // INVENTEURS
    if (d.inventeurs?.length > 0) {
      let cols = [];
      for (let i = 0; i < d.inventeurs.length; i++) {
        cols.push(card(
          `Inventeur`,
          [
            { text: `${d.inventeurs[i].nom_inventeur || d.inventeurs[i].nom || ""} ${d.inventeurs[i].prenom_inventeur || d.inventeurs[i].prenom || ""}`.trim(), fontSize: 11, margin: [0, 0, 0, 1] },
            d.inventeurs[i].email_inventeur ? { text: `Email : ${d.inventeurs[i].email_inventeur}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            d.inventeurs[i].telephone_inventeur ? { text: `Téléphone : ${d.inventeurs[i].telephone_inventeur}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
          ].filter(Boolean),
          { color: colors.primary, badge: `${i + 1}`, bg: alt ? colors.cardAlt : colors.card }
        ));
      }
      brevetSections.push({
        columns: cols.length > 3 ? [cols.slice(0, Math.ceil(cols.length / 2)), cols.slice(Math.ceil(cols.length / 2))] : cols,
        columnGap: 18,
        margin: [0, 0, 0, 10]
      });
    }

    // DÉPOSANTS
    if (d.deposants?.length > 0) {
      let cols = [];
      for (let i = 0; i < d.deposants.length; i++) {
        cols.push(card(
          `Déposant`,
          [
            { text: `${d.deposants[i].nom_deposant || d.deposants[i].nom || ""}`, fontSize: 11, margin: [0, 0, 0, 1] },
            d.deposants[i].email_deposant ? { text: `Email : ${d.deposants[i].email_deposant}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            d.deposants[i].telephone_deposant ? { text: `Téléphone : ${d.deposants[i].telephone_deposant}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
          ].filter(Boolean),
          { color: colors.primary, badge: `${i + 1}`, bg: colors.cardAlt }
        ));
      }
      brevetSections.push({
        columns: cols.length > 3 ? [cols.slice(0, Math.ceil(cols.length / 2)), cols.slice(Math.ceil(cols.length / 2))] : cols,
        columnGap: 18,
        margin: [0, 0, 0, 10]
      });
    }

    // TITULAIRES
    if (d.titulaires?.length > 0) {
      let cols = [];
      for (let i = 0; i < d.titulaires.length; i++) {
        cols.push(card(
          `Titulaire`,
          [
            { text: `${d.titulaires[i].nom_titulaire || d.titulaires[i].nom || ""}`, fontSize: 11, margin: [0, 0, 0, 1] },
            d.titulaires[i].email_titulaire ? { text: `Email : ${d.titulaires[i].email_titulaire}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            d.titulaires[i].telephone_titulaire ? { text: `Téléphone : ${d.titulaires[i].telephone_titulaire}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
          ].filter(Boolean),
          { color: colors.primary, badge: `${i + 1}`, bg: alt ? colors.cardAlt : colors.card }
        ));
      }
      brevetSections.push({
        columns: cols.length > 3 ? [cols.slice(0, Math.ceil(cols.length / 2)), cols.slice(Math.ceil(cols.length / 2))] : cols,
        columnGap: 18,
        margin: [0, 0, 0, 10]
      });
    }

    // PAYS + STATUTS + N°/Date publication (TABLEAU stylé)
    if (d.pays?.length > 0) {
      const paysTable = [
        [
          { text: "", border: [false, false, false, false], width: 38, noWrap: false },
          { text: "Pays", style: "tableHeader", width: "*", color: colors.primary, noWrap: false },
          { text: "Statut", style: "tableHeader", width: 72, color: colors.primary, noWrap: false },
          { text: "N° Dépôt", style: "tableHeader", width: 75, color: colors.primary, noWrap: false },
          { text: "Date Dépôt", style: "tableHeader", width: 78, color: colors.primary, noWrap: false },
          { text: "N° Publication", style: "tableHeader", width: 90, color: colors.primary, noWrap: false },
          { text: "Date Publication", style: "tableHeader", width: 90, color: colors.primary, noWrap: false }
        ]
      ];

      for (const p of d.pays) {
        let statut = p.Statut?.valeur || p.Statut?.statuts;
        if (!statut && p.id_statuts && statutsList.length)
          statut = (statutsList.find(x => x.id === p.id_statuts)?.valeur) || '';
        const color = statutColor(statut);

        let nomPays =
          p.nom_fr_fr ||
          (p.Pay && p.Pay.nom_fr_fr) ||
          p.nom_en ||
          (p.Pay && p.Pay.nom_en) ||
          p.nom || "";

        const flagImg = getFlagImg(nomPays);

        paysTable.push([
          flagImg
            ? {
                image: flagImg,
                width: 32,
                height: 22,
                margin: [0, 1, 0, 1],
                border: [false, false, false, false]
              }
            : { text: "", width: 32, border: [false, false, false, false] },
          { text: `${nomPays}`, fontSize: 12, bold: true, color, border: [false, false, false, false], noWrap: false },
          statut
            ? { text: statut, fontSize: 11, color, bold: true, alignment: "center", border: [false, false, false, false], noWrap: false }
            : { text: "", border: [false, false, false, false], noWrap: false },
          p.numero_depot
            ? { text: `${p.numero_depot}`, fontSize: 11, border: [false, false, false, false], noWrap: false }
            : { text: "", border: [false, false, false, false], noWrap: false },
          p.date_depot
            ? { text: `${formatDate(p.date_depot)}`, fontSize: 11, border: [false, false, false, false], noWrap: false }
            : { text: "", border: [false, false, false, false], noWrap: false },
          p.numero_publication
            ? { text: `${p.numero_publication}`, fontSize: 11, border: [false, false, false, false], noWrap: false }
            : { text: "", border: [false, false, false, false], noWrap: false },
          p.date_publication
            ? { text: `${formatDate(p.date_publication)}`, fontSize: 11, border: [false, false, false, false], noWrap: false }
            : { text: "", border: [false, false, false, false], noWrap: false }
        ]);
      }

      brevetSections.push({
        table: { widths: [38, "*", 72, 75, 78, 90, 90], body: paysTable },
        layout: {
          fillColor: (row) => (row === 0 ? colors.cardAlt : (row % 2 === 1 ? "#fff" : colors.cardAlt)),
          hLineWidth: (i) => (i === 1 ? 1 : 0),
          vLineWidth: () => 0,
          hLineColor: () => colors.border
        },
        margin: [0, 0, 0, 16]
      });
    }

    // CABINETS
    if (d.procedureCabinets?.length > 0) {
      d.procedureCabinets.forEach((cab, i) => brevetSections.push(
        card(
          `Cabinet de Procédure`,
          [
            { text: `${cab.nom_cabinet || cab.nom || ""}`, fontSize: 11, margin: [0, 0, 0, 1] },
            cab.reference ? { text: `Référence : ${cab.reference}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            cab.email_cabinet ? { text: `Email : ${cab.email_cabinet}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            cab.telephone_cabinet ? { text: `Téléphone : ${cab.telephone_cabinet}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
          ].filter(Boolean),
          { color: colors.accent, badge: i + 1, bg: colors.card }
        )
      ));
    }

    if (d.annuiteCabinets?.length > 0) {
      d.annuiteCabinets.forEach((cab, i) => brevetSections.push(
        card(
          `Cabinet d'Annuité`,
          [
            { text: `${cab.nom_cabinet || cab.nom || ""}`, fontSize: 11, margin: [0, 0, 0, 1] },
            cab.reference ? { text: `Référence : ${cab.reference}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            cab.email_cabinet ? { text: `Email : ${cab.email_cabinet}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
            cab.telephone_cabinet ? { text: `Téléphone : ${cab.telephone_cabinet}`, fontSize: 11, margin: [0, 0, 0, 1] } : "",
          ].filter(Boolean),
          { color: colors.primary, badge: i + 1, bg: colors.cardAlt }
        )
      ));
    }

    // COMMENTAIRE EN ENCADRÉ
    if (brevet.commentaire) {
      brevetSections.push({
        table: {
          widths: [0, "*"],
          body: [[
            {},
            {
              text: brevet.commentaire,
              fontSize: 12,
              color: colors.dark,
              italics: true,
              fillColor: colors.comment,
              margin: [4, 2, 0, 2],
            }
          ]]
        },
        layout: {
          fillColor: () => colors.comment,
          hLineWidth: () => 0,
          vLineWidth: () => 0,
        },
        margin: [0, 8, 0, 12]
      });
    }
  }

  // --- DOC DEFINITION ---
  const docDefinition = {
    pageMargins: [42, 62, 42, 65],
    // Header dynamique : pas sur la première page
    header: function(currentPage, pageCount, pageSize) {
      if (currentPage === 1) return '';
      return [
        {
          columns: [
            logo ? { image: logo, width: 50, margin: [10, 0, 0, 0], alignment: "left" } : {},
            {
              stack: [
                { text: "Portefeuille de brevets", style: "headerTitle", margin: [0, 0, 0, 0] },
                { text: clientName, style: "headerSubTitle", margin: [0, 0, 0, 0] }
              ],
              alignment: "center",
              width: "*"
            },
            logo ? { image: logo, width: 50, margin: [0, 0, 10, 0], alignment: "right" } : {}
          ],
          columnGap: 4,
          margin: [0, 8, 0, 0]
        }
      ];
    },
    footer: (currentPage, pageCount) => ({
      margin: [36, 8, 36, 0],
      columns: [
        {
          text: `Page ${currentPage} / ${pageCount}`,
          alignment: "right",
          color: colors.grey,
          fontSize: 12,
        },
        {
          text: "Portefeuille de brevets | confidentiel",
          alignment: "center",
          fontSize: 12,
          color: "#c0c0c0",
          margin: [0, 0, 0, 0]
        }
      ]
    }),
    styles: {
      title: { fontSize: 38, bold: true, color: colors.primary, margin: [0, 22, 0, 10], alignment: 'center', letterSpacing: 0.5 },
      tocItem: { fontSize: 16, color: colors.accent, bold: true },
      brevetTitle: { fontSize: 28, bold: true, color: colors.primary, margin: [0, 0, 0, 8] },
      tableHeader: { bold: true, fontSize: 13, fillColor: colors.cardAlt, alignment: "center", margin: [0, 2, 0, 2] },
      headerTitle: { fontSize: 18, bold: true, color: colors.primary, alignment: 'center' },
      headerSubTitle: { fontSize: 11, color: colors.accent, alignment: 'center', italics: true }
    },
    content: [
      { stack: cover, margin: [0, 0, 0, 0], pageBreak: "after" },
      { text: "Sommaire", style: "title", color: colors.primary, margin: [0, 5, 0, 18] },
      ...toc,
      { text: "", pageBreak: "after" },
      ...brevetSections
    ]
  };

  pdfMake.createPdf(docDefinition).download(`Portefeuille_brevets_${clientName.replace(/\s+/g, "_")}.pdf`);
  return true;
}
