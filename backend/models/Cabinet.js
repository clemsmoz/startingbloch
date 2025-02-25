module.exports = (sequelize, DataTypes) => {


const Cabinet = sequelize.define('Cabinet', {
  nom_cabinet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_cabinet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telephone_cabinet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reference_cabinet: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'cabinet',
  timestamps: false
});

return Cabinet;
};