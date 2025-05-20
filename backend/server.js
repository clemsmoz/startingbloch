const { app, BrowserWindow, Menu, dialog } = require('electron');
const express = require('express');
const cors = require('cors');
const portfinder = require('portfinder');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Fonctions utilitaires pour les logs colorés et avec icônes
const logInfo = (...args) => console.log('\x1b[36m%s\x1b[0m', 'ℹ️', ...args);      // Cyan
const logSuccess = (...args) => console.log('\x1b[32m%s\x1b[0m', '✅', ...args);   // Vert
const logWarn = (...args) => console.warn('\x1b[33m%s\x1b[0m', '⚠️', ...args);     // Jaune
const logError = (...args) => console.error('\x1b[31m%s\x1b[0m', '❌', ...args);   // Rouge

logInfo("🚀 Démarrage de l'application Electron + Express (tout-en-un)");

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
  logSuccess("Routes Express chargées.");
} catch (err) {
  logError("Erreur lors du chargement des routes Express :", err);
}
logInfo("__dirname détecté :", __dirname);

// Définition du chemin du frontend
const isPackaged = process.mainModule.filename.indexOf('app.asar') !== -1;
const basePath = isPackaged ? path.join(process.resourcesPath, 'app') : __dirname;

// nouvelle route pour exporter la base SQLite
expressApp.get('/api/backup', (req, res) => {
  let dbPath = path.join(basePath, 'data', 'database.sqlite');
  const fallback = path.join(basePath, 'database.sqlite');
  if (!fs.existsSync(dbPath)) {
    logWarn('DB introuvable dans data/, fallback vers:', fallback);
    dbPath = fallback;
  }
  logInfo('Backup DB path:', dbPath);
  res.download(dbPath, 'database.sqlite', err => {
    if (err) {
      logError('Erreur export DB:', err);
      return res.status(500).send('Erreur lors du téléchargement de la sauvegarde.');
    }
  });
});

const frontendStaticPath = path.join(basePath, 'frontend', 'build');
logInfo("📂 Chemin utilisé pour le frontend :", frontendStaticPath);

if (fs.existsSync(frontendStaticPath)) {
  logSuccess("frontend/build trouvé !");
  expressApp.use(express.static(frontendStaticPath));

  expressApp.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(frontendStaticPath, 'index.html');
    logInfo(`Requête reçue pour ${req.url}, envoi de ${indexPath}`);
    res.sendFile(indexPath);
  });

} else {
  logWarn("Dossier frontend/build non trouvé. Vérifiez que le build du frontend est bien généré.");
}



// Gestion des erreurs 404
expressApp.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ------------------------------
// Partie Frontend : Electron
// ------------------------------
let isQuitting = false;

function createWindow(port) {
  logInfo("Création de la fenêtre Electron...");
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
        logSuccess(`Téléchargement terminé : ${savePath}`);
      } else {
        logError(`Échec du téléchargement : ${state}`);
      }
    });
  });

  const startUrl = `http://127.0.0.1:${port}`;
  logInfo("🔗 Chargement de l'URL :", startUrl);
  win.loadURL(startUrl)
    .then(() => logSuccess("URL chargée avec succès :", startUrl))
    .catch(err => logError("Échec du chargement de l'URL :", err.message));

  // Ouvrir la console de développement par défaut
  win.webContents.openDevTools({ mode: 'detach' });

  // Ajouter des écouteurs d'événements pour les changements de page
  win.webContents.on('did-navigate', (event, url) => {
    logInfo(`📄 Navigation vers : ${url}`);
  });

  win.webContents.on('did-navigate-in-page', (event, url) => {
    logInfo(`📄 Navigation dans la page vers : ${url}`);
  });

  // Intercepter la fermeture de la fenêtre principale pour afficher le message de sauvegarde
  win.on('close', async (event) => {
    if (!isQuitting) {
      event.preventDefault();
      logInfo("Déclenchement de la sauvegarde automatique avant fermeture (via close)...");
      backupDatabaseOnExit();
      isQuitting = true;
      await dialog.showMessageBox(win, {
        type: 'info',
        title: 'Sauvegarde effectuée',
        message: 'La sauvegarde automatique de la base de données a été réalisée avec succès.\nL\'application va maintenant se fermer.',
        buttons: ['OK']
      });
      win.destroy(); // ferme la fenêtre sans relancer close
      app.quit();
    }
  });
}

// Fonction utilitaire pour sauvegarder la base SQLite avec timestamp
function backupDatabaseOnExit() {
  try {
    const dbDir = fs.existsSync(path.join(basePath, 'data')) ? path.join(basePath, 'data') : basePath;
    const dbPath = path.join(dbDir, 'database.sqlite');
    if (!fs.existsSync(dbPath)) {
      logWarn('Aucune base de données à sauvegarder:', dbPath);
      return;
    }
    const backupDir = path.join(basePath, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logInfo('Dossier de sauvegarde créé:', backupDir);
    }
    // Formatage lisible : database_YYYY-MM-DD_HH-mm-ss.sqlite
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const backupPath = path.join(backupDir, `database_${timestamp}.sqlite`);
    fs.copyFileSync(dbPath, backupPath);
    logSuccess('Sauvegarde automatique de la base effectuée:', backupPath);
  } catch (err) {
    logError('Erreur lors de la sauvegarde automatique de la base:', err);
  }
}

// Démarrage d'Electron une fois prêt
app.whenReady().then(() => {
  logInfo("Electron prêt.");

  // Démarrer Express et ensuite créer la fenêtre
  portfinder.basePort = 3000;
  portfinder.getPort((err, port) => {
    if (err) {
      logError("Erreur lors de la recherche d'un port libre :", err);
      app.quit();
      return;
    }

    logSuccess(`Démarrage du serveur Express sur le port ${port}...`);
    expressApp.listen(port, () => {
      logSuccess(`Serveur Express en écoute sur http://127.0.0.1:${port}`);
      createWindow(port);
    }).on('error', (err) => {
      logError("Erreur lors du démarrage d'Express :", err);
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
              logWarn('DB introuvable dans data/, fallback vers racine');
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
app.on('before-quit', (event) => {
  if (isQuitting) return; // Évite la boucle
  logInfo("Déclenchement de la sauvegarde automatique avant fermeture...");
  backupDatabaseOnExit();
  // On ne bloque plus ici, la fermeture continue normalement
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    logInfo("Fermeture de l'application...");
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    logInfo("Réouverture de la fenêtre Electron...");
    portfinder.basePort = 3000;
    portfinder.getPort((err, port) => {
      if (!err) {
        createWindow(port);
      }
    });
  }
});