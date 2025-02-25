module.exports = (sequelize, DataTypes) => {

  const NumeroPays = sequelize.define('NumeroPays', {
    
    id_brevet: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'brevet', // Supposant l'existence d'une table 'pays'
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
        model: 'pays', // Supposant l'existence d'une table 'pays'
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
        model: 'statuts', // Supposant l'existence d'une table 'statuts'
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

  return NumeroPays;
};