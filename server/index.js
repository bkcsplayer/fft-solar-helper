const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`========================================`);
  console.log(`${req.method} ${req.url}`);
  console.log(`Full path: ${req.path}`);
  console.log(`Base URL: ${req.baseUrl}`);
  console.log(`========================================`);
  next();
});

// Debug Route (Temporary)
app.get('/api/debug-db', async (req, res) => {
  try {
    const { sequelize } = require('./config/database');
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const [users] = await sequelize.query("SELECT * FROM users WHERE username='admin'");

    res.json({
      status: 'success',
      message: 'Database connection working',
      tables: results.map(r => r.table_name),
      adminUserFound: users.length > 0,
      env: {
        db_user: process.env.DB_USER,
        db_host: process.env.DB_HOST,
        // db_pass_len: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
});

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FFT Solar CRM API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await testConnection();

    console.log('Database connected. Starting server...');
    const server = app.listen(PORT, () => {
      console.log('=================================');
      console.log('FFT Solar CRM Server');
      console.log('=================================');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log('=================================');
    });
    server.on('error', (e) => console.error('Server listen error:', e));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
