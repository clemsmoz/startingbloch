const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.resolve('..', '..', 'ciloa_dump.json');
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const sheet = data[Object.keys(data)[0]] || [];

const isEmptyValue = (v) => {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.toString().trim() === '';
  if (typeof v === 'number') return Number.isNaN(v) || v === 0;
  return false;
};
const isPlaceholderPublication = (s) => {
  if (!s) return false;
  const low = s.toLowerCase().trim();
  return low === '-' || low === 'n/a' || low === 'na' || low === '--' || low === 'aucun';
};
const getPublicationForKey = (raw) => {
  if (isEmptyValue(raw)) return '';
  const str = String(raw).trim();
  if (str === '') return '';
  if (isPlaceholderPublication(str)) return '';
  if (!/[A-Za-z0-9]/.test(str)) return '';
  return str.toUpperCase().replace(/\s+/g, '');
};

const extractCountryAndDepot = (cell) => {
  if (!cell) return { country: '', depot: '' };
  const cleaned = String(cell).replace(/\t/g, ' ').trim();
  const parts = cleaned.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
  const country = parts[0] || '';
  const depot = parts[1] || '';
  return { country: country.toUpperCase().replace(/\s+/g,' '), depot: depot.toUpperCase().replace(/\s+/g,'') };
};

const keys = new Map();
const duplicates = [];

sheet.forEach((row, idx) => {
  const paysCell = row['Pays\n(Numéro de dépôt)'] || row['Pays\n(Numéro de dépôt)'] || row['Pays (Numéro de dépôt)'] || row['Pays'] || '';
  const pubRaw = row['Numéro de publication'] ?? row['Numéro de publication'] ?? null;
  const { country, depot } = extractCountryAndDepot(paysCell);
  const pubKey = getPublicationForKey(pubRaw);
  const key = `${country}||${depot}||${pubKey}`;
  if (keys.has(key)) {
    duplicates.push({ index: idx + 1, key, row });
  } else {
    keys.set(key, { index: idx + 1, key, row });
  }
});

console.log('Total rows:', sheet.length);
console.log('Unique keys:', keys.size);
console.log('Duplicates found:', duplicates.length);
if (duplicates.length > 0) {
  console.log('Some duplicate examples:');
  duplicates.slice(0, 10).forEach(d => {
    console.log('- row', d.index, 'key=', d.key, 'Pays cell=', d.row['Pays\n(Numéro de dépôt)'], 'NumPub=', d.row['Numéro de publication']);
  });
}
else {
  console.log('No duplicates detected by the key rules');
}
