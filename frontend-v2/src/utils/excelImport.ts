// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: optional dependency - types may not be installed in the workspace
import * as XLSX from 'xlsx';
import { alpha2FromEnglishOrFrench } from './countries-map';
import { nameToAlpha2 } from './countryResolver';

export type ParsedDeposit = {
  refFamille?: string | null;
  titre?: string | null;
  numeroDepot?: string | null;
  numeroPublication?: string | null;
  numeroDelivrance?: string | null;
  dateDepot?: string | null; // ISO
  datePublication?: string | null;
  dateDelivrance?: string | null;
  statut?: string | null;
  countryAlpha2?: string | null;
  inventeurs?: string[];
  deposant?: string | null;
  client?: string | null;
  // Optional images extracted when using exceljs; contains image ids or identifiers
};

export type ParsedFamily = {
  referenceFamille: string | null;
  titre?: string | null;
  deposits: ParsedDeposit[];
};

function tryGetCell(row: any, keys: string[]) {
  for (const k of keys) {
    if (typeof row[k] !== 'undefined' && row[k] !== null && String(row[k]).toString().trim() !== '') return String(row[k]).trim();
  }
  return null;
}

function splitInventeursField(v: any): string[] {
  if (!v) return [];
  try {
    return String(v).split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean);
  } catch {
    // best-effort parsing: on error return empty array
    return [];
  }
}

// Simple date formatter: try to convert common formats (dd-mon-yy, dd-mon-yyyy, dd/mm/yyyy, yyyy-mm-dd) to ISO YYYY-MM-DD
function formatDateString(v: string | null): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  // already ISO-ish
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // replace common separators
  const cleaned = s.replace(/\u00A0/g, ' ').replace(/[,\.]/g, '-').replace(/\s+/g, ' ').trim();

  // months map (french + english short names)
  const months: Record<string, string> = {
    'janvier': '01','janv': '01','jan': '01','january':'01','february':'02','fevrier':'02','février':'02','fev':'02','fév':'02','feb':'02',
    'mar': '03','mars':'03','march':'03', 'avr':'04','avril':'04','april':'04','mai':'05','may':'05','jun':'06','juin':'06','june':'06',
    'jul':'07','juil':'07','juillet':'07','july':'07','aou':'08','août':'08','aout':'08','aug':'08','sep':'09','sept':'09','september':'09',
    'oct':'10','octobre':'10','october':'10','nov':'11','novembre':'11','november':'11','dec':'12','déc':'12','decembre':'12','december':'12'
  };

  // dd-mon-yy or dd-mon-yyyy with separators - or spaces
  const parts = cleaned.split(/[-\s\/]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    let day = parts[0];
    let month = parts[1].toLowerCase();
    let year = parts[2];

    // if month is textual, map it
    if (isNaN(Number(month))) {
      const key = month.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      if (months[key]) month = months[key];
      else {
        // maybe month is numeric but with suffix, try parse
        const mnum = parseInt(month, 10);
        if (!isNaN(mnum)) month = String(mnum).padStart(2, '0');
      }
    } else {
      month = String(Number(month)).padStart(2, '0');
    }

    // normalize day
    day = String(Number(day)).padStart(2, '0');

    // normalize year
    if (/^\d{2}$/.test(year)) {
      // assume 20xx for two-digit years
      year = '20' + year;
    } else if (/^\d{4}$/.test(year)) {
      // ok
    } else {
      // try extracting 4-digit year
      const y = year.match(/(\d{4})/);
      if (y) year = y[1];
      else return null;
    }

    return `${year}-${month}-${day}`;
  }

  // fallback: try dd/mm/yyyy
  const dm = cleaned.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{2,4})$/);
  if (dm) {
    let d = String(Number(dm[1])).padStart(2, '0');
    let m = String(Number(dm[2])).padStart(2, '0');
    let y = dm[3];
    if (/^\d{2}$/.test(y)) y = '20' + y;
    return `${y}-${m}-${d}`;
  }

  return null;
}

export function parseExcelFile(file: File): Promise<ParsedFamily[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
  reader.onload = async (e) => {
      try {
        console.info('[ExcelImport] reader.onload for file:', file.name);
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        // Prefer sheet named 'Synthèse des Statuts' or first sheet
        const sheetName = workbook.SheetNames.find((n: string) => n.toLowerCase().includes('synth')) ?? workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        // Use SheetJS (xlsx) to read rows only. We do not use embedded images for dedup.
        const raw = XLSX.utils.sheet_to_json(ws, { defval: null }) as any[];

        // Log detected columns and a small sample of raw rows to help mapping
        try {
          const colsSet = new Set<string>();
          const rawSample = (raw as any[]).slice(0, 20);
          for (const r of rawSample) {
            const keys = Object.keys(r || {});
            for (const k of keys) colsSet.add(String(k));
          }
          const cols = Array.from(colsSet);
          console.info('[ExcelImport] detected columns (sample up to 20 rows):', cols);
          console.info('[ExcelImport] sample raw rows (up to 10):', JSON.stringify((raw as any[]).slice(0, 10), null, 2));
        } catch {
          console.info('[ExcelImport] unable to log sample rows/columns');
        }

        const familiesMap: Map<string, ParsedFamily> = new Map();

        // Use the shared simple formatter `formatDateString` defined above.

  let lastReference: string | null = null;
  let lastDateDepot: string | null = null;
  // Note: we intentionally do NOT propagate lastNumPub to subsequent rows —
  // if the Excel cell for 'numeroPublication' is empty, we must keep it empty/null.
  let lastStatut: string | null = null;
        raw.forEach((row: any) => {
          // Heuristics: possible column names
          const refRaw = tryGetCell(row, ['ref_famille', 'Reference Famille', 'Référence famille', 'RefFamille', 'REF_FAMILLE', 'Ref']) ?? null;
          // If ref is empty, reuse last seen non-empty reference (many Excel exports put family ref only on first row)
          const ref = refRaw ?? lastReference ?? null;
          if (refRaw) lastReference = refRaw;
          const titre = tryGetCell(row, ['titre', 'Titre', 'title']) ?? null;
          const numPubRaw = tryGetCell(row, ['numero_publication', 'Numéro de publication', 'Numéro Publication', 'Numéro de Publication', 'NumeroPublication', 'Numero Publication', 'publication', 'Publication']) ?? null;
          // Do NOT reuse previous row's publication when current cell is empty.
          const numPub = numPubRaw ?? null;
          let numDep = tryGetCell(row, ['numero_depot', 'NumeroDepot', 'Numero Dépôt', 'depot']) ?? null;
          const statutRaw = tryGetCell(row, ['statut', 'Statut', 'Status']) ?? null;
          const statut = statutRaw ?? lastStatut ?? null;
          if (statutRaw) lastStatut = statutRaw;
          const dateDepRaw = tryGetCell(row, ['date_depot', 'DateDepot', 'Date Dépôt', 'Date de dépôt', 'Date de Depot', 'date']) ?? null;
          // If date is empty in this row, reuse last seen date (propagate)
          const dateDep = dateDepRaw ?? lastDateDepot ?? null;
          if (dateDepRaw) lastDateDepot = dateDepRaw;
          const datePub = tryGetCell(row, ['date_publication', 'DatePublication', 'Date Publication']) ?? null;
          const numDel = tryGetCell(row, ['numero_delivrance', 'NumeroDelivrance', 'Numero Délivrance']) ?? null;
          const inventeurs = tryGetCell(row, ['inventeurs', 'Inventeurs', 'Inventor']) ?? null;
          const deposant = tryGetCell(row, ['deposant', 'Deposant', 'Filer']) ?? null;
          const client = tryGetCell(row, ['client', 'Client']) ?? null;
          // Some exports combine country and deposit number in one cell like "France\nFR20200004576" or "PCT\nWO2021FR50778"
          const paysCombined = tryGetCell(row, ['Pays\n(Numéro de dépôt)', 'Pays (Numéro de dépôt)', 'Pays', 'Country']) ?? null;
          let depNumFromPays: string | null = null;
          if (paysCombined) {
            const parts = String(paysCombined).split(/\r?\n/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2) depNumFromPays = parts[1] ?? null;
          }
          // If numero de depot not present in its own column, try to use the one from paysCombined
          if (!numDep && depNumFromPays) {
            numDep = depNumFromPays.replace(/\s+/g, '') || null;
          }
          // Derive alpha2 from the deposit number prefix when possible
          let alpha2FromPays: string | null = null;
          if (depNumFromPays) {
            const exec = /^([A-Za-z]{2})/.exec(depNumFromPays.replace(/\s+/g, ''));
            if (exec) alpha2FromPays = exec[1].toUpperCase();
          }

          // Determine alpha2 for this row.
          // Special rule: when the deposit number indicates EP (European publications),
          // the country prefix is not reliable — use the country name (which can be in English)
          // to resolve the ISO alpha2.
          let alpha2: string | null = null;
          // build a candidate string from available deposit/publication cells
          const depotCandidate = String((numDep ?? depNumFromPays ?? numPub ?? '')).trim();
          const depotPrefixMatch = /^([A-Za-z]{2})/.exec(depotCandidate);
          const depotPrefix = depotPrefixMatch ? depotPrefixMatch[1].toUpperCase() : null;

          if (depotPrefix === 'EP') {
            // try to extract the country name from the paysCombined first line (e.g. "Europe\nEP2009...")
            let countryName: string | null = null;
            if (paysCombined) {
              const parts = String(paysCombined).split(/\r?\n/).map(p => p.trim()).filter(Boolean);
              if (parts.length >= 1) countryName = parts[0];
            }
            if (countryName) {
              // first try the custom EN->FR mapping helper, then fallback to iso lib
              const cand = alpha2FromEnglishOrFrench(countryName) ?? nameToAlpha2(countryName);
              if (cand) alpha2 = cand;
              else if (alpha2FromPays) alpha2 = alpha2FromPays; // last-resort fallback
            } else {
              if (alpha2FromPays) alpha2 = alpha2FromPays;
            }
          } else {
            // default behavior: try publication prefix then paysCombined-derived code
            if (numPub && typeof numPub === 'string') {
              const exec = /^([A-Za-z]{2})/.exec(numPub);
              if (exec) alpha2 = exec[1].toUpperCase();
            }
            if (!alpha2 && alpha2FromPays) alpha2 = alpha2FromPays;
          }

          const reference = ref ?? '__no_ref__';
          if (!familiesMap.has(reference)) {
            familiesMap.set(reference, { referenceFamille: ref ?? null, titre: titre ?? null, deposits: [] });
          }

          const fam = familiesMap.get(reference)!;
          // parse dateDepot into ISO
          const parsedDateIso = formatDateString(dateDep ?? null);
          if (dateDep && !parsedDateIso) {
            console.info('[ExcelImport] unable to parse date:', dateDep, 'for reference', reference);
          }
          const statutClean = statut ? String(statut).trim() : null;
          fam.deposits.push({
            refFamille: ref ?? null,
            titre: titre ?? null,
            numeroDepot: numDep ?? null,
            numeroPublication: numPub ?? null,
            numeroDelivrance: numDel ?? null,
            dateDepot: parsedDateIso ?? null,
            datePublication: datePub ?? null,
            dateDelivrance: null,
            statut: statutClean ?? null,
            countryAlpha2: alpha2,
            inventeurs: splitInventeursField(inventeurs),
            deposant: deposant ?? null,
            client: client ?? null,
            // images removed: import only uses textual fields for deduplication
          });
        });

        const result = Array.from(familiesMap.values());
        console.info(`[ExcelImport] parsed ${result.length} families, total deposits: ${result.reduce((acc, f) => acc + (f.deposits?.length||0), 0)}`);
        try {
          for (const f of result) {
            console.info('[ExcelImport] family summary:', {
              referenceFamille: f.referenceFamille,
              titre: f.titre,
              depositsCount: f.deposits?.length ?? 0,
              sampleDeposits: (f.deposits ?? []).slice(0, 3)
            });
          }
        } catch {
          // ignore logging errors
        }
        resolve(result);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsArrayBuffer(file);
  });
}
