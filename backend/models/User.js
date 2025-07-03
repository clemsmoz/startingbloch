// models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nom_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    prenom_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    email_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      unique: true,
      validate: { isEmail: true },
    },
    password_user: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user', // 'admin' ou 'user'
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // true = droit d'écriture
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // true = droit de lecture
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'users',
    timestamps: true, // gère createdAt et updatedAt automatiquement
  });

  // Ajout de la méthode statique findByEmail pour Sequelize
  User.findByEmail = async function(email, callback) {
    try {
      const user = await User.findOne({ where: { email_user: email } });
      callback(null, user ? user.get({ plain: true }) : null);
    } catch (err) {
      callback(err, null);
    }
  };

  // Ajout de la méthode statique getAll pour Sequelize
  User.getAll = async function(callback) {
    try {
      const users = await User.findAll();
      callback(null, users.map(u => u.get({ plain: true })));
    } catch (err) {
      callback(err, null);
    }
  };

  return User;
};