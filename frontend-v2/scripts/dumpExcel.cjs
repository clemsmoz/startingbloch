// Script to dump the full contents of an Excel file to stdout as JSON
// Usage: node scripts/dumpExcel.cjs [path/to/file.xlsx]

const path = require('path');
const fs = require('fs');
let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('Missing dependency "xlsx". Install with: npm install xlsx');
  process.exit(2);
}

const fileArg = process.argv[2] || path.resolve(__dirname, '..', '..', 'ciloa.xlsx');
if (!fs.existsSync(fileArg)) {
  console.error('File not found:', fileArg);
  process.exit(3);
}

try {
  const workbook = XLSX.readFile(fileArg, { cellDates: true });
  const out = {};
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    // Convert to JSON; raw values kept
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
    out[name] = rows;
  });
  // Pretty-print JSON
  console.log(JSON.stringify(out, null, 2));
} catch (err) {
  console.error('Error reading Excel file:', err && err.message ? err.message : err);
  process.exit(4);
}
