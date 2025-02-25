module.exports = (sequelize, DataTypes) => {


const Contact = sequelize.define('Contact', {
  
  nom_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  prenom_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telephone_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  poste_contact: {
    type: DataTypes.STRING,
    allowNull: true,
  }}, {
  tableName: 'contact',
  timestamps: false
});

return Contact;
};
