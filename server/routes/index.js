const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const clientRoutes = require('./clients');
const staffRoutes = require('./staff');
const projectRoutes = require('./projects');
const vehicleRoutes = require('./vehicles');
const assetRoutes = require('./assets');
const financeRoutes = require('./finance');
const dashboardRoutes = require('./dashboard');
const settingsRoutes = require('./settings');
const exportRoutes = require('./export');
const dataRoutes = require('./data');

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/staff', staffRoutes);
router.use('/projects', projectRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/assets', assetRoutes);
router.use('/finance', financeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/export', exportRoutes);
router.use('/data', dataRoutes);

module.exports = router;
