const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VehicleUsage = sequelize.define('VehicleUsage', {
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
  project_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  staff_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'staff',
      key: 'id'
    }
  },
  usage_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_mileage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_mileage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  distance: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.end_mileage - this.start_mileage;
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'vehicle_usage',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = VehicleUsage;
