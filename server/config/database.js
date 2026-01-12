const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Better error handling for Docker
    retry: {
      max: 3
    }
  }
);

// Retry connection function for Docker startup timing issues
const testConnection = async (maxRetries = 10, retryDelay = 3000) => {
  console.log('=== Database Connection Info ===');
  console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log('================================');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log(`✓ Database connection established successfully (attempt ${attempt}/${maxRetries})`);
      return true;
    } catch (error) {
      console.error(`✗ Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);

      if (attempt < maxRetries) {
        console.log(`   Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('✗ All database connection attempts failed.');
        throw error;
      }
    }
  }
};

module.exports = { sequelize, testConnection };

