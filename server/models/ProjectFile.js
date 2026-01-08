const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectFile = sequelize.define('ProjectFile', {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['photo', 'document']]
    }
  },
  file_size: {
    type: DataTypes.INTEGER
  },
  mime_type: {
    type: DataTypes.STRING(100)
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'project_files',
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false
});

module.exports = ProjectFile;

