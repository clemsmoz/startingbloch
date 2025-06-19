const fs = require("fs");
const path = require("path");

const flagsPath = path.resolve('./src/png40px'); // Chemin où tu as mis les PNG
const files = fs.readdirSync(flagsPath).filter(f => f.endsWith('.png'));

const flags = {};
for (const file of files) {
  const code = file.replace('.png', '').toUpperCase();
  const buffer = fs.readFileSync(path.join(flagsPath, file));
  flags[code] = 'data:image/png;base64,' + buffer.toString('base64');
}

fs.writeFileSync(
  './src/flags.js',
  'const flags = ' + JSON.stringify(flags, null, 2) + ';\nexport default flags;\n'
);

console.log("✅ flags.js généré avec tous les drapeaux PNG (base64)");
