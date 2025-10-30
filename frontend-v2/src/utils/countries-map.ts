import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import frLocale from 'i18n-iso-countries/langs/fr.json';

countries.registerLocale(enLocale as any);
countries.registerLocale(frLocale as any);

const enNames = countries.getNames('en') as Record<string, string>;
const frNames = countries.getNames('fr') as Record<string, string>;

export const BY_CODE: Record<string, { en: string; fr: string; alpha2: string; alpha3: string | null; numeric: string | null }> = {};
for (const alpha2 of Object.keys(enNames)) {
  const en = enNames[alpha2];
  const fr = frNames[alpha2] || en;
  const alpha3 = countries.alpha2ToAlpha3(alpha2) || null;
  const numeric = countries.alpha2ToNumeric(alpha2) || null;
  BY_CODE[alpha2] = { en, fr, alpha2, alpha3, numeric };
}

export const EN_TO_FR: Record<string, string> = {};
export const FR_TO_EN: Record<string, string> = {};
for (const code of Object.keys(BY_CODE)) {
  const { en, fr } = BY_CODE[code];
  EN_TO_FR[en] = fr;
  FR_TO_EN[fr] = en;
}

// Manual exceptions: normalize some common English variants that don't match i18n names
// Map 'United Kingdom' and common variants to 'GB' and French 'Royaume-Uni'
const manualEnToA2: Record<string, string> = {
  'united-kingdom': 'GB',
  'united kingdom': 'GB',
  'uk': 'GB',
  'great britain': 'GB',
  'britain': 'GB',
  'england': 'GB'
};

for (const k of Object.keys(manualEnToA2)) {
  const a2 = manualEnToA2[k];
  // ensure EN_TO_FR contains an entry for the english key -> french label
  try {
    const frLabel = BY_CODE[a2]?.fr ?? BY_CODE[a2]?.en ?? null;
    if (frLabel) EN_TO_FR[k] = frLabel;
  } catch {
    // ignore
  }
}

export function alpha2FromEnglishOrFrench(name?: string | null): string | null {
  if (!name) return null;
  const raw = String(name).trim();
  if (!raw) return null;
  // Try direct match by french labels
  const lower = raw.toLowerCase();
  for (const a2 of Object.keys(BY_CODE)) {
    if ((BY_CODE[a2].fr || '').toLowerCase() === lower) return a2;
    if ((BY_CODE[a2].en || '').toLowerCase() === lower) return a2;
  }
  // Try translate english -> french using EN_TO_FR (case-insensitive)
  const foundEn = Object.keys(EN_TO_FR).find(k => k.toLowerCase() === raw.toLowerCase());
  if (foundEn) {
    const fr = EN_TO_FR[foundEn];
    for (const a2 of Object.keys(BY_CODE)) if ((BY_CODE[a2].fr || '').toLowerCase() === fr.toLowerCase()) return a2;
  }
  return null;
}

export default { BY_CODE, EN_TO_FR, FR_TO_EN, alpha2FromEnglishOrFrench };
