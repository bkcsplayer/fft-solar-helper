const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Export all data
router.get('/all', exportController.exportAllData);

// Reset database (dangerous - requires confirmation)
router.post('/reset', exportController.resetDatabase);

// Import data from backup
router.post('/import', express.json({ limit: '50mb' }), exportController.importAllData);

module.exports = router;
