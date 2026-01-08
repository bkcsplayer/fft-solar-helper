const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Export all data
router.get('/all', exportController.exportAllData);

module.exports = router;
