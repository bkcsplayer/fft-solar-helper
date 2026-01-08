const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// All routes require authentication
router.use(auth);

// System settings routes
router.get('/system', settingsController.getSettings);
router.put('/system', settingsController.updateSettings);

// Admin profile routes
router.get('/profile', settingsController.getAdminProfile);
router.put('/profile', settingsController.updateAdminProfile);

module.exports = router;
