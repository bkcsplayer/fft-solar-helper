const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectInverter = sequelize.define('ProjectInverter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  inverter_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['hybrid', 'micro']]
    }
  },
  brand: {
    type: DataTypes.STRING(100)
  },
  model: {
    type: DataTypes.STRING(100)
  },
  watt_per_unit: {
    type: DataTypes.INTEGER
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'project_inverters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProjectInverter;
