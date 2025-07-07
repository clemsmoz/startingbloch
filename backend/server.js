const { app, BrowserWindow, Menu, dialog } = require('electron');
const express = require('express');
const cors = require('cors');
const portfinder = require('portfinder');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

console.log("🚀 Démarrage de l'application Electron + Express (tout-en-un)");

// ------------------------------
// Partie Backend : Express
// ------------------------------
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(bodyParser.json());

// Charger les routes Express (assurez-vous que le dossier routes existe et est correctement configuré)
try {
  const routes = require('./routes');
  expressApp.use('/api', routes);
  console.log("📌 Routes Express chargées.");
} catch (err) {
  console.error("❌ Erreur lors du chargement des routes Express :", err);
}
console.log("📂 __dirname détecté :", __dirname);

// Définition du chemin du frontend
const isPackaged = process.mainModule.filename.indexOf('app.asar') !== -1;
const basePath = isPackaged ? path.join(process.resourcesPath, 'app') : __dirname;

// nouvelle route pour exporter la base SQLite
expressApp.get('/api/backup', (req, res) => {
  let dbPath = path.join(basePath, 'data', 'database.sqlite');
  const fallback = path.join(basePath, 'database.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.warn('DB introuvable dans data/, fallback vers:', fallback);
    dbPath = fallback;
  }
  console.log('Backup DB path:', dbPath);
  res.download(dbPath, 'database.sqlite', err => {
    if (err) {
      console.error('Erreur export DB:', err);
      return res.status(500).send('Erreur lors du téléchargement de la sauvegarde.');
    }
  });
});

// Ajoute une route API sécurisée pour la sauvegarde, accessible uniquement à l'admin
expressApp.post('/api/backup', (req, res) => {
  // Vérifie que l'utilisateur est admin (par exemple via un champ dans le body)
  const { user } = req.body;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé à l\'administrateur.' });
  }

  let dbPath = path.join(basePath, 'data', 'database.sqlite');
  const fallback = path.join(basePath, 'database.sqlite');
  if (!fs.existsSync(dbPath)) {
    dbPath = fallback;
  }
  res.download(dbPath, 'database.sqlite', err => {
    if (err) {
      console.error('Erreur export DB:', err);
      return res.status(500).send('Erreur lors du téléchargement de la sauvegarde.');
    }
  });
});

const frontendStaticPath = path.join(basePath, 'frontend', 'build');
console.log("📂 Chemin utilisé pour le frontend :", frontendStaticPath);

if (fs.existsSync(frontendStaticPath)) {
  console.log("✅ frontend/build trouvé !");
  expressApp.use(express.static(frontendStaticPath));

  expressApp.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(frontendStaticPath, 'index.html');
    console.log(`📌 Requête reçue pour ${req.url}, envoi de ${indexPath}`);
    res.sendFile(indexPath);
  });

} else {
  console.warn("⚠️ Dossier frontend/build non trouvé. Vérifiez que le build du frontend est bien généré.");
}



// Gestion des erreurs 404
expressApp.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ------------------------------
// Partie Frontend : Electron
// ------------------------------
function createWindow(port) {
  console.log("📌 Création de la fenêtre Electron...");
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false, // Désactive l'intégration de Node.js pour plus de sécurité
      contextIsolation: true,
    },
  });

  // Gérer les téléchargements (pour .sqlite)
  win.webContents.session.on('will-download', (event, item) => {
    const fileName = item.getFilename();
    const savePath = path.join(app.getPath('downloads'), fileName);
    item.setSavePath(savePath);
    item.once('done', (e, state) => {
      if (state === 'completed') {
        console.log(`Téléchargement terminé : ${savePath}`);
      } else {
        console.error(`Échec du téléchargement : ${state}`);
      }
    });
  });

  const startUrl = `http://127.0.0.1:${port}`;
  console.log("🔗 Chargement de l'URL :", startUrl);
  win.loadURL(startUrl)
    .then(() => console.log("✅ URL chargée avec succès :", startUrl))
    .catch(err => console.error("❌ Échec du chargement de l'URL :", err.message));

  // Ouvrir la console de développement par défaut
  win.webContents.openDevTools({ mode: 'detach' });

  // Ajouter des écouteurs d'événements pour les changements de page
  win.webContents.on('did-navigate', (event, url) => {
    console.log(`📄 Navigation vers : ${url}`);
  });

  win.webContents.on('did-navigate-in-page', (event, url) => {
    console.log(`📄 Navigation dans la page vers : ${url}`);
  });
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
      createWindow(port);
    }).on('error', (err) => {
      console.error("❌ Erreur lors du démarrage d'Express :", err);
      app.quit();
    });
  });

  // Menu natif "Télécharger la base de données"
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Télécharger la base de données',
          click: async () => {
            // fallback if data/database.sqlite n'existe pas
            let source = path.join(basePath, 'data', 'database.sqlite');
            if (!fs.existsSync(source)) {
              console.warn('DB introuvable dans data/, fallback vers racine');
              source = path.join(basePath, 'database.sqlite');
            }

            const { canceled, filePath } = await dialog.showSaveDialog({
              title: 'Enregistrer la base SQLite',
              defaultPath: 'database.sqlite'
            });
            if (!canceled && filePath) {
              fs.copyFile(source, filePath, err => {
                if (err) {
                  dialog.showErrorBox('Erreur', `Impossible de copier la base : ${err.message}`);
                } else {
                  dialog.showMessageBox({
                    type: 'info',
                    message: 'Base de données sauvegardée avec succès.'
                  });
                }
              });
            }
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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