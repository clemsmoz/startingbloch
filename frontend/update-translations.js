const fs = require('fs');
const path = require('path');

// Lister tous les fichiers .js dans src/pages
const pagesDir = path.join(__dirname, 'src', 'pages');
const componentDir = path.join(__dirname, 'src', 'components');

function updateFile(filePath) {
  console.log(`Traitement de ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si T est déjà importé
  if (!content.includes("import T from '../components/T';")) {
    // Ajouter l'import de T après les autres imports React/MUI
    const importPattern = /(import.*from ['"][^'"]*\/components\/[^'"]*['"];?\n)/;
    if (importPattern.test(content)) {
      content = content.replace(importPattern, "$1import T from '../components/T';\n");
    } else {
      // Si pas d'import de composant, l'ajouter après les imports MUI
      const muiImportPattern = /(import.*from ['"]@mui\/[^'"]*['"];?\n)/;
      if (muiImportPattern.test(content)) {
        content = content.replace(muiImportPattern, "$1import T from '../components/T';\n");
      } else {
        // Sinon l'ajouter après le premier import
        const firstImportPattern = /(import.*from ['"][^'"]*['"];?\n)/;
        content = content.replace(firstImportPattern, "$1import T from '../components/T';\n");
      }
    }
  }
  
  // NOUVEAU: Remplacer TOUS les textes français automatiquement
  
  // 1. Remplacer les textes dans les balises JSX : >texte< → ><T>texte</T><
  content = content.replace(/>([^<>{}\n]+)</g, (match, text) => {
    const trimmed = text.trim();
    // Ignorer les espaces, nombres purs, variables, ou textes déjà dans <T>
    if (!trimmed || /^\d+$/.test(trimmed) || /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed) || trimmed.startsWith('<T>')) {
      return match;
    }
    // Si c'est du texte français (contient des lettres)
    if (/[a-zA-ZÀ-ÿ]/.test(trimmed)) {
      return `><T>${trimmed}</T><`;
    }
    return match;
  });
  
  // 2. Remplacer les strings dans les props de composants : prop="texte" → prop={<T>texte</T>}
  content = content.replace(/(\w+)=["']([^"'{}]+)["']/g, (match, prop, text) => {
    // Ignorer certaines props techniques
    const technicalProps = ['className', 'id', 'key', 'src', 'href', 'alt', 'type', 'name', 'value', 'onClick', 'onChange', 'style'];
    if (technicalProps.includes(prop) || /^\d+$/.test(text) || text.includes('http') || text.includes('./') || text.includes('../')) {
      return match;
    }
    // Si c'est du texte français
    if (/[a-zA-ZÀ-ÿ]/.test(text) && text.trim().length > 0) {
      return `${prop}={<T>${text}</T>}`;
    }
    return match;
  });
  
  // 3. Remplacer les strings dans les objets et variables : "texte" → <T>texte</T>
  content = content.replace(/(['"])([\w\sÀ-ÿ.,!?;:'-]+)\1/g, (match, quote, text) => {
    // Éviter les imports, exports, et autres cas techniques
    if (text.includes('/') || text.includes('\\') || text.includes('http') || text.includes('api') || 
        text.includes('error') || text.includes('success') || /^\w+$/.test(text.replace(/\s/g, '')) ||
        text.length < 2) {
      return match;
    }
    // Si c'est du texte français avec des espaces ou des caractères spéciaux français
    if ((/\s/.test(text) || /[À-ÿ]/.test(text)) && /[a-zA-ZÀ-ÿ]/.test(text)) {
      return `<T>${text}</T>`;
    }
    return match;
  });
  
  // 4. Remplacer dans les variables template literals
  content = content.replace(/`([^`]*[a-zA-ZÀ-ÿ\s][^`]*)`/g, (match, text) => {
    // Si pas de variable ${} et contient du texte français
    if (!text.includes('${') && /[a-zA-ZÀ-ÿ]/.test(text) && text.trim().length > 1) {
      return `<T>${text}</T>`;
    }
    return match;
  });

  // 5. Nettoyer les doubles T : <T><T>texte</T></T> → <T>texte</T>
  content = content.replace(/<T><T>([^<]*)<\/T><\/T>/g, '<T>$1</T>');
  
  // 6. Nettoyer les T vides ou avec seulement des espaces
  content = content.replace(/<T>\s*<\/T>/g, '');
  content = content.replace(/<T><\/T>/g, '');

  // Sauvegarder le fichier modifié
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${filePath} mis à jour`);
}

// Traiter tous les fichiers dans pages/
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') && !file.includes('test') && !file.includes('spec')) {
      updateFile(filePath);
    }
  });
}

console.log('🚀 Début de la mise à jour des traductions...');
processDirectory(pagesDir);

// Traiter aussi les composants
if (fs.existsSync(componentDir)) {
  processDirectory(componentDir);
}

console.log('✅ Mise à jour terminée !');
