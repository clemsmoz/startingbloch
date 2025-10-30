import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(frLocale as any);
countries.registerLocale(enLocale as any);

export function nameToAlpha2(name?: string | null): string | null {
  if (!name) return null;
  const s = String(name).trim();
  if (!s) return null;
  // Try as alpha2 or alpha3 directly
  const up = s.toUpperCase();
  if (/^[A-Z]{2}$/.test(up)) return up;
  if (/^[A-Z]{3}$/.test(up)) {
    const fromAlpha3 = countries.alpha3ToAlpha2(up);
    if (fromAlpha3) return fromAlpha3;
  }
  // Try exact match in english and french
  const byEn = countries.getAlpha2Code(s, 'en');
  if (byEn) return byEn;
  const byFr = countries.getAlpha2Code(s, 'fr');
  if (byFr) return byFr;
  // Try normalized lookup: strip accents and lowercase
  const normalized = s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const enNames = countries.getNames('en');
  const frNames = countries.getNames('fr');
  for (const [code, label] of Object.entries(enNames)) {
    if (String(label).toLowerCase() === normalized) return code;
  }
  for (const [code, label] of Object.entries(frNames)) {
    if (String(label).toLowerCase() === normalized) return code;
  }
  return null;
}

export function alpha2ToDisplay(alpha2?: string | null, locale = 'fr'): string | null {
  if (!alpha2) return null;
  try {
    const code = String(alpha2).toUpperCase();
    const names = countries.getNames(locale as any) as Record<string, string>;
    return names[code] ?? null;
  } catch {
    return null;
  }
}

export default { nameToAlpha2, alpha2ToDisplay };
