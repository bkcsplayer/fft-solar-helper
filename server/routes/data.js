const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/auth');

// Protect these routes with authentication
router.use(authMiddleware);

router.get('/export/:modelName', dataController.exportModel);
router.post('/import/:modelName', dataController.importModel);

module.exports = router;
