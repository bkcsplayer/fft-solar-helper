const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectAssignment = sequelize.define('ProjectAssignment', {
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
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'staff',
      key: 'id'
    }
  },
  role_in_project: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['leader', 'installer', 'electrician']]
    }
  },
  calculated_pay: {
    type: DataTypes.DECIMAL(10, 2)
  },
  is_notified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'project_assignments',
  timestamps: true,
  createdAt: 'assigned_at',
  updatedAt: false
});

module.exports = ProjectAssignment;
