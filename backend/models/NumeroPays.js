module.exports = (sequelize, DataTypes) => {

  const NumeroPays = sequelize.define('NumeroPays', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_brevet: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'brevet',
        key: 'id'
      }
    },
    numero_depot: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    numero_publication: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_pays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pays',
        key: 'id'
      }
    },
    alpha2: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    id_statuts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'statuts',
        key: 'id'
      }
    },
    date_depot: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_delivrance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    numero_delivrance: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    licence: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nom_fr_fr: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'numero_pays',
    timestamps: false
  });

  NumeroPays.associate = (models) => {
    NumeroPays.belongsTo(models.Brevet, { foreignKey: 'id_brevet' });
    NumeroPays.belongsTo(models.Pays, { foreignKey: 'id_pays' });
    NumeroPays.belongsTo(models.Statuts, { foreignKey: 'id_statuts' });
  };

  return NumeroPays;
};