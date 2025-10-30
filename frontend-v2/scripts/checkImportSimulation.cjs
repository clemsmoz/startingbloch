// Simulate parseExcelFile behavior (no browser FileReader) and check dedupe rules
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const file = process.argv[2] || path.resolve('..', '..', 'ciloa.xlsx');
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(1);
}
const wb = XLSX.readFile(file, { cellDates: true });
const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('synth')) || wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const raw = XLSX.utils.sheet_to_json(ws, { defval: null });

const tryGetCell = (row, keys) => {
  for (const k of keys) {
    if (typeof row[k] !== 'undefined' && row[k] !== null && String(row[k]).toString().trim() !== '') return String(row[k]).trim();
  }
  return null;
};

// extract same way as parseExcelFile
const extractCountryAndDepot = (paysCombined) => {
  if (!paysCombined) return { country: '', depot: '' };
  const parts = String(paysCombined).replace(/\t/g,' ').split(/\r?\n/).map(p=>p.trim()).filter(Boolean);
  return { country: parts[0]||'', depot: parts[1]||'' };
};

const getPublicationForKey = (raw) => {
  if (raw === null || raw === undefined) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const low = s.toLowerCase();
  if (['-','n/a','na','--','aucun'].includes(low)) return '';
  if (!/[A-Za-z0-9]/.test(s)) return '';
  return s.toUpperCase().replace(/\s+/g,'');
};

const keys = new Map();
const duplicates = [];
for (let i=0;i<raw.length;i++){
  const row = raw[i];
  const paysCell = tryGetCell(row, ['Pays\n(Numéro de dépôt)', 'Pays (Numéro de dépôt)', 'Pays', 'Country']) || '';
  const { country, depot } = extractCountryAndDepot(paysCell);
  const pubRaw = tryGetCell(row, ['numero_publication','Numéro de publication','Numéro Publication','publication','Publication']) || null;
  const pubKey = getPublicationForKey(pubRaw);
  const key = `${country.toUpperCase()}||${(depot||'').toUpperCase().replace(/\s+/g,'')}||${pubKey}`;
  if (keys.has(key)) duplicates.push({ index: i+1, key, row });
  else keys.set(key, { index: i+1, key, row });
}

console.log('Total rows:', raw.length);
console.log('Unique keys:', keys.size);
console.log('Duplicates found:', duplicates.length);
if (duplicates.length) {
  console.log('Example duplicates:');
  duplicates.slice(0,10).forEach(d=>{
    console.log(d.index, d.key, d.row['Pays\n(Numéro de dépôt)'], d.row['Numéro de publication']);
  });
}
