const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectLog = sequelize.define('ProjectLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    project_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'projects',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    log_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'note',
        validate: {
            isIn: [['note', 'status_change', 'system']]
        }
    },
    created_by: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'project_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
});

module.exports = ProjectLog;
