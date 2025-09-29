// Simple English -> French country name lookup to help resolve country names from Excel
export const englishToFrench: Record<string, string> = {
  'united kingdom': 'Royaume-Uni',
  'great britain': 'Royaume-Uni',
  'uk': 'Royaume-Uni',
  'england': 'Royaume-Uni',
  'germany': 'Allemagne',
  'deutschland': 'Allemagne',
  'spain': 'Espagne',
  'netherlands': 'Pays-Bas',
  'holland': 'Pays-Bas',
  'united states': 'États-Unis',
  'usa': 'États-Unis',
  'us': 'États-Unis',
  'switzerland': 'Suisse',
  'sweden': 'Suède',
  'norway': 'Norvège',
  'denmark': 'Danemark',
  'finland': 'Finlande',
  'ireland': 'Irlande',
  'portugal': 'Portugal',
  'greece': 'Grèce',
  'austria': 'Autriche',
  'italy': 'Italie',
  'poland': 'Pologne',
  'hungary': 'Hongrie',
  'czechia': 'République tchèque',
  'czech republic': 'République tchèque',
  'slovakia': 'Slovaquie',
  'slovenia': 'Slovénie',
  'croatia': 'Croatie',
  'romania': 'Roumanie',
  'bulgaria': 'Bulgarie',
  'serbia': 'Serbie',
  'turkey': 'Turquie',
  'japan': 'Japon',
  'china': 'Chine',
  'india': 'Inde',
  'brazil': 'Brésil',
  'russia': 'Russie',
  'korea': 'Corée',
  'south korea': 'Corée du Sud',
  'north korea': 'Corée du Nord',
  'belgium': 'Belgique',
  'luxembourg': 'Luxembourg',
  'israel': 'Israël',
  'egypt': 'Égypte'
};

export function normalizeName(s?: string | null) {
  if (!s) return '';
  return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

export function translateToFrenchIfKnown(name?: string | null): string | null {
  if (!name) return null;
  const n = normalizeName(name);
  if (englishToFrench[n]) return englishToFrench[n];
  return null;
}

export default { englishToFrench, normalizeName, translateToFrenchIfKnown };
