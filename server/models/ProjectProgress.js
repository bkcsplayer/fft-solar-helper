const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectProgress = sequelize.define('ProjectProgress', {
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
  stage: {
    type: DataTypes.STRING(30),
    allowNull: false,
    validate: {
      isIn: [['roof_base', 'electrical', 'roof_install', 'bird_net']]
    }
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completed_at: {
    type: DataTypes.DATE
  },
  completed_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  inspection_status: {
    type: DataTypes.STRING(30),
    validate: {
      isIn: [['pass', 'fail', 'waiting_for_inspection']]
    }
  },
  inspection_date: {
    type: DataTypes.DATE
  },
  inspection_fail_reason: {
    type: DataTypes.TEXT
  },
  inspection_notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'project_progress',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProjectProgress;
