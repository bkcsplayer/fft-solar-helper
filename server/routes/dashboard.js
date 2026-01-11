const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/overview', dashboardController.getOverview);
router.get('/charts', dashboardController.getChartData);
router.get('/analytics', dashboardController.getAnalytics);
router.get('/details', dashboardController.getFinancialDetails);

module.exports = router;
