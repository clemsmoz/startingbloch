// Port of patman_converter_all.py (partial, faithful port for depot/publication/delivrance)
// Export: convert(raw: string, typeNum: string): string

function year4_from_2digits(yy: string): string {
  const y = parseInt(yy, 10);
  return (y >= 50) ? `19${yy}` : `20${yy}`;
}

function digits(s: string): string {
  return Array.from(s).filter(ch => /\d/.test(ch)).join('');
}

function tokens(s: string): string[] {
  // Ensure we break tokens when letters meet digits (e.g. 'US112345' -> 'US 112345')
  const withBoundaries = s.replace(/([A-Za-z])(?=\d)/g, '$1 ').replace(/(\d)(?=[A-Za-z])/g, '$1 ');
  return withBoundaries.trim().split(/[ \t\.\/,;:_-]+/).filter(Boolean);
}

function normalize_cc(s: string): string {
  return s.trim().toUpperCase();
}

// Depot rules
function depot_FR(raw: string): string | null {
  const s = normalize_cc(raw).replace(/\s+/g, '');
  let m = s.match(/^FR(\d{2})(\d{5})$/);
  if (!m) {
    m = normalize_cc(raw).match(/^FR\s*(\d{2})\s*(\d{5})$/);
    if (!m) return null;
  }
  const yy = m[1];
  const num = m[2];
  return `FR ${year4_from_2digits(yy)} 00 ${parseInt(num,10).toString().padStart(5,'0')}`;
}

function depot_EP(raw: string): string | null {
  const s = normalize_cc(raw);
  const s_compact = s.replace(/[ \t]/g, '');
  let m = s_compact.match(/^EP(\d{2})(\d{6})\.(\d)$/);
  if (!m) {
    const toks = tokens(s);
    if (toks.length >= 4 && toks[0] === 'EP' && /^\\d+$/.test(toks[1]) && toks[1].length===2 && /^\d+$/.test(toks[2]) && toks[2].length===6 && /^\d+$/.test(toks[3]) && toks[3].length===1) {
      return `EP ${year4_from_2digits(toks[1])} 0 ${toks[2]}${toks[3]}`;
    }
    return null;
  }
  const yy = m[1];
  const body = m[2];
  const check = m[3];
  return `EP ${year4_from_2digits(yy)} 0 ${body}${check}`;
}

function depot_PCT_or_WO(raw: string): string | null {
  const s = normalize_cc(raw);
  const s_compact = s.replace(/[ \t]/g, '').replace(/,/g,' ').replace(/\./g,' ');
  let m = s_compact.match(/^PCT\/([A-Z]{2})(\d{4})\/0(\d{5,6})$/);
  if (m) {
    const cc = m[1];
    const yyyy = m[2];
    const num = m[3];
    return `WO ${yyyy} ${cc} ${parseInt(num,10)}`;
  }
  const m2 = s.match(/^WO\s*(\d{4})\s*([A-Z]{2})\s*(\d{5,7})$/);
  if (m2) {
    const yyyy = m2[1];
    const cc = m2[2];
    const num = m2[3];
    return `WO ${yyyy} ${cc} ${parseInt(num,10)}`;
  }
  return null;
}

function depot_BR(raw: string): string | null {
  const toks = tokens(raw.toUpperCase());
  if (toks.length >= 5 && toks[0] === 'BR' && toks[1] === '11' && /^\d+$/.test(toks[2]) && /^\d+$/.test(toks[toks.length-1])) {
    return `BR ${toks[2]} 11 ${parseInt(toks[toks.length-1],10).toString().padStart(5,'0')}`;
  }
  return null;
}

function depot_generic_year_0_num(cc: string, raw: string): string | null {
  const toks = tokens(raw.toUpperCase());
  if (!toks) return null;
  if (toks.length===0) return null;
  if (toks[0] !== cc && cc) return null;
  let year: string | null = null;
  for (let i=1;i<toks.length;i++) {
    const t = toks[i];
    if (/^\d+$/.test(t) && t.length===4) { year = t; break; }
  }
  const nums = toks.slice(1).filter(t => /^\d+$/.test(t) && t !== year).join('');
  if (!nums) return null;
  if (year) return `${cc} ${year} 0 ${parseInt(nums,10)}`;
  return `${cc} ${parseInt(nums,10)}`;
}

function depot_US(raw: string): string | null {
  const s = raw.toUpperCase();
  const toks = tokens(s);
  if (toks.length >= 4 && toks[0] === 'US' && toks[1].length===2 && /^\d+$/.test(toks[1])) {
    const yy = toks[1];
    const body = toks.slice(2).filter(t=>/^\d+$/.test(t)).join('');
    if (body.length >= 6) return `US ${year4_from_2digits(yy)} 0 ${body}`;
  }
  return null;
}

function depot_IN(raw: string): string | null {
  const toks = tokens(raw.toUpperCase());
  if (toks.length === 4 && toks[0] === 'IN' && /^\d+$/.test(toks[1]) && /^[A-Z]+$/.test(toks[2]) && /^\d+$/.test(toks[3])) {
    const left = toks[1], code = toks[2], right = toks[3];
    const year = (right.length===4) ? right : ((left.length===4)? left : null);
    const num = (year === right) ? left : right;
    if (year) return `IN ${year} ${code} ${num}`;
  }
  return null;
}

// Publication / Grant helpers
function simple_pub_or_grant(cc_expected: string | null, raw: string): string | null {
  const s = raw.toUpperCase().trim();
  const toks = tokens(s);
  if (!toks || toks.length === 0) return null;
  const cc = (/^[A-Z]+$/.test(toks[0]) && (toks[0].length===1 || toks[0].length===2)) ? toks[0] : (cc_expected || null);
  let num = toks.filter(t => /^\d+$/.test(t)).join('');
  if (!num) num = digits(s);
  if (cc && num) return `${cc} ${parseInt(num,10)}`;
  return null;
}

function pub_KR(raw: string): string | null {
  const s = raw.toUpperCase();
  if (s.indexOf('KR') === -1) return null;
  const num = digits(s);
  if (num.length >= 8) return `KR ${num}`;
  return null;
}

const DEPOSIT_RULES: { [k: string]: Array<(raw: string)=> string | null> } = {
  'FR': [depot_FR],
  'EP': [depot_EP],
  'PCT': [depot_PCT_or_WO],
  'WO': [depot_PCT_or_WO],
  'BR': [depot_BR],
  'US': [depot_US],
  'IN': [depot_IN],
};

const GENERIC_DEPOSIT_CCS = ['JP','MX','IL','CL','AU','EA','CN','CA','HK','NZ','KR'];

export function convert_deposit(raw: string): string {
  const s = raw.trim();
  const toks = tokens(s.toUpperCase());
  const cc = toks && toks.length ? toks[0] : '';
  if (cc in DEPOSIT_RULES) {
    for (const rule of DEPOSIT_RULES[cc]) {
      const out = rule(s);
      if (out) return out.replace(/\s+/g, '');
    }
  }
  if (s.toUpperCase().startsWith('PCT/')) {
    const out = depot_PCT_or_WO(s);
    if (out) return out.replace(/\s+/g, '');
  }
  if (GENERIC_DEPOSIT_CCS.includes(cc)) {
    const out = depot_generic_year_0_num(cc, s);
    if (out) return out.replace(/\s+/g, '');
  }
  const fallback = depot_generic_year_0_num(cc || '', s) || s.replace(/[ \t\.\/,;:_-]+/g,' ');
  return fallback.replace(/\s+/g, '');
}

export function convert_publication(raw: string): string {
  const s = raw.trim();
  const outKR = pub_KR(s);
  if (outKR) return outKR.replace(/\s+/g,'');
  const toks = tokens(s.toUpperCase());
  const cc = (toks && toks.length && /^[A-Z]+$/.test(toks[0]) && toks[0].length<=2) ? toks[0] : null;
  const out = simple_pub_or_grant(cc, s);
  if (out) return out.replace(/\s+/g,'');
  return s.replace(/[ \t\.\/,;:_-]+/g,' ').replace(/\s+/g,'');
}

export function convert_delivrance(raw: string): string {
  return convert_publication(raw).replace(/\s+/g,'');
}

export function convert(raw: string, typeNum: string): string {
  const normalized = raw.replace(/\s+/g, ''); // ignore spaces in input
  const t = typeNum.toLowerCase();
  if (['depot','dépôt','deposit'].includes(t)) return convert_deposit(normalized);
  if (['publication','pub'].includes(t)) return convert_publication(normalized);
  if (['delivrance','délivrance','grant'].includes(t)) return convert_delivrance(normalized);
  throw new Error('Type inconnu. Utilisez: depot | publication | delivrance');
}

export default { convert };
