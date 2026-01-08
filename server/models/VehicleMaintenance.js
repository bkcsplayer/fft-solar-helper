const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VehicleMaintenance = sequelize.define('VehicleMaintenance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  maintenance_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'vehicle_maintenance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = VehicleMaintenance;
