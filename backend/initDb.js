const db = require('./models');
const { QueryTypes } = require('sequelize');

// Désactiver/réactiver les contraintes FK
async function setFK(enable) {
  const v = enable ? 'ON' : 'OFF';
  await db.sequelize.query(`PRAGMA foreign_keys = ${v};`);
}

// Liste des modèles principaux et de jointure
const mainModels = [
  'Brevet','Client','Pays','Statuts',
  'Deposant','Inventeur','Titulaire','Cabinet',
  'NumeroPays','Contact','User'
];
const joinModels = [
  'BrevetClients','BrevetInventeurs','BrevetTitulaires',
  'BrevetDeposants','BrevetCabinets',
  'InventeurPays','TitulairePays','DeposantPays','CabinetPays','PaysStatuts'
];

// Supprime toutes les tables générées par ALTER TABLE de SQLite
async function cleanupBackupTables() {
  const rows = await db.sequelize.query(
    "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';",
    { type: QueryTypes.SELECT }
  );
  for (const { name } of rows) {
    await db.sequelize.query(`DROP TABLE IF EXISTS "${name}";`);
    console.log(`🗑️ Table backup supprimée : ${name}`);
  }
}

async function initDb() {
  await setFK(false);
  
  // nettoyage préalable des tables *_backup
  await cleanupBackupTables();
  
  // suppression des tables de jointure pour éviter FOREIGN KEY constraint failed
  for (const name of joinModels) {
    console.log(`🗑️ Suppression table de jointure : ${name}`);
    await db.sequelize.query(`DROP TABLE IF EXISTS "${name}";`);
  }
  
  // Recréation forcée de toutes les tables (vide avant recréation)
  await db.sequelize.sync({ force: true });
  
  await setFK(true);
  console.log('✅ Synchronisation terminée');
}

initDb();
