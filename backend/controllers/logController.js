// Contrôleur pour les logs d'activité

const db = require('../models');
const Log = db.Log;

const logController = {
  createLog: async (user, user_email, action, details = null) => {
    try {
      // Correction : toujours privilégier l'email de l'utilisateur qui fait l'action
      let email = user_email;
      if ((!email || email === 'user' || email === 'admin') && user && typeof user === 'object') {
        email = user.email_user || user.email || null;
      }
      await Log.create({
        user: user && user.prenom_user ? user.prenom_user : (typeof user === 'string' ? user : null),
        user_email: email,
        action,
        details,
        date: new Date()
      });
    } catch (err) {
      console.error('[LOG] Erreur lors de la création du log :', err);
    }
  },

  // Récupérer tous les logs (pour l'admin)
  getAllLogs: async (req, res) => {
    try {
      const logs = await Log.findAll({ order: [['date', 'DESC']] });
      res.status(200).json({ data: logs });
    } catch (err) {
      res.status(500).json({ error: err.message || "Erreur lors de la récupération des logs." });
    }
  }
};

module.exports = logController;
module.exports = logController;
