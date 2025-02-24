const { app, BrowserWindow } = require('electron');
const express = require('express');
const cors = require('cors');
const portfinder = require('portfinder');
const path = require('path');
const fs = require('fs');

console.log("🚀 Démarrage de l'application Electron + Express (tout-en-un)");

// ------------------------------
// Partie Backend : Express
// ------------------------------
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

// Charger les routes Express (assurez-vous que le dossier routes existe et est correctement configuré)
try {
  const routes = require('./routes');
  expressApp.use('/', routes);
  console.log("📌 Routes Express chargées.");
} catch (err) {
  console.error("❌ Erreur lors du chargement des routes Express :", err);
}
console.log("📂 __dirname détecté :", __dirname);

// Définition du chemin du frontend
const isPackaged = process.mainModule.filename.indexOf('app.asar') !== -1;
const basePath = isPackaged ? path.join(process.resourcesPath, 'app') : __dirname;

const frontendStaticPath = path.join(basePath, 'frontend', 'build');
console.log("📂 Chemin utilisé pour le frontend :", frontendStaticPath);

if (fs.existsSync(frontendStaticPath)) {
  console.log("✅ frontend/build trouvé !");
  expressApp.use(express.static(frontendStaticPath));

  expressApp.get('*', (req, res) => {
    const indexPath = path.join(frontendStaticPath, 'index.html');
    console.log(`📌 Requête reçue pour ${req.url}, envoi de ${indexPath}`);
    res.sendFile(indexPath);
  });

} else {
  console.warn("⚠️ Dossier frontend/build non trouvé. Vérifiez que le build du frontend est bien généré.");
}

// ------------------------------
// Partie Frontend : Electron
// ------------------------------
function createWindow(port) {
  console.log("📌 Création de la fenêtre Electron...");
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false, // Désactive l'intégration de Node.js pour plus de sécurité
      contextIsolation: true,
    },
  });

  const startUrl = `http://127.0.0.1:${port}`;
  console.log("🔗 Chargement de l'URL :", startUrl);
  win.loadURL(startUrl)
    .then(() => console.log("✅ URL chargée avec succès :", startUrl))
    .catch(err => console.error("❌ Échec du chargement de l'URL :", err.message));
}

// Démarrage d'Electron une fois prêt
app.whenReady().then(() => {
  console.log("📌 Electron prêt.");

  // Démarrer Express et ensuite créer la fenêtre
  portfinder.basePort = 3000;
  portfinder.getPort((err, port) => {
    if (err) {
      console.error("❌ Erreur lors de la recherche d'un port libre :", err);
      app.quit();
      return;
    }

    console.log(`🚀 Démarrage du serveur Express sur le port ${port}...`);
    expressApp.listen(port, () => {
      console.log(`✅ Serveur Express en écoute sur http://127.0.0.1:${port}`);
      createWindow(port); // Maintenant, on est sûr qu'Electron est prêt
    }).on('error', (err) => {
      console.error("❌ Erreur lors du démarrage d'Express :", err);
      app.quit();
    });
  });
});

// Gestion de la fermeture de l'application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log("📌 Fermeture de l'application...");
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log("📌 Réouverture de la fenêtre Electron...");
    portfinder.basePort = 3000;
    portfinder.getPort((err, port) => {
      if (!err) {
        createWindow(port);
      }
    });
  }
});
