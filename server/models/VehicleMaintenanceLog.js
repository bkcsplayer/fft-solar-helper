const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VehicleMaintenanceLog = sequelize.define('VehicleMaintenanceLog', {
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
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    mileage: {
        type: DataTypes.INTEGER
    },
    performed_by: {
        type: DataTypes.STRING(100)
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'vehicle_maintenance_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = VehicleMaintenanceLog;
