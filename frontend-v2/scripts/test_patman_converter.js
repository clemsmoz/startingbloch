// Simple test runner for patmanConverter
// Usage: node scripts/test_patman_converter.js
// If using TypeScript directly, run with ts-node: npx ts-node src/utils/patmanConverter.ts

const path = require('path');
let converter;
try {
  // Try to require the compiled JS (if project built to dist or lib)
  converter = require(path.resolve(__dirname, '..', 'src', 'utils', 'patmanConverter'));
} catch (e) {
  console.warn('Could not require compiled patmanConverter.js directly. Attempting dynamic import via ts-node/register (if installed).');
  try {
    require('ts-node').register();
    converter = require(path.resolve(__dirname, '..', 'src', 'utils', 'patmanConverter.ts'));
  } catch (e2) {
    console.error('Failed to load patmanConverter. Please run this script with ts-node or build the frontend first.');
    console.error(e2.message);
    process.exit(1);
  }
}

const examples = [
  {type: 'depot', in: 'FR 17 00574'},
  {type: 'depot', in: 'PCT/FR2017/000123'},
  {type: 'publication', in: 'EP 13 720022 . 6'},
  {type: 'publication', in: 'KR 10 2014 0114335'},
  {type: 'depot', in: 'US 11 , 278 , 568'},
];

for (const ex of examples) {
  try {
    const out = converter.convert(ex.in, ex.type);
    console.log(`${ex.type} | ${ex.in} -> ${out}`);
  } catch (err) {
    console.error('Error converting', ex, err && err.message);
  }
}
