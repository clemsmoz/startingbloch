// Initialisation et synchronisation de la base de données
const db = require('./models');

// Synchronisation de la base de données
db.sequelize.sync()
  .then(() => {
    console.log('✅ Les tables ont été créées ou existent déjà.');
    console.log('📋 Modèles synchronisés :', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
  })
  .catch(error => console.error('❌ Erreur lors de la synchronisation des tables :', error));
