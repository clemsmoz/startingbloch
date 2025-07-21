// Middleware pour peupler req.user à partir du token JWT ou du body (fallback)

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authUserMiddleware = async (req, res, next) => {
  // 1. Vérifie le header Authorization (Bearer token)
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      if (decoded && decoded.id) {
        const user = await User.findByPk(decoded.id);
        if (user) {
          req.user = user.toJSON();
        }
      }
    } catch (e) {
      req.user = null;
    }
  }

  // 2. Fallback : si pas de token, tente de récupérer l'utilisateur depuis le body (ex : { user: ... })
  if (!req.user && req.body && req.body.user && req.body.user.email_user) {
    req.user = req.body.user;
  }

  // 3. Si toujours rien, req.user = null
  if (!req.user) req.user = null;

  next();
};

module.exports = authUserMiddleware;
