const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
// const staffStatsController = require('../controllers/staffStatsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', staffController.getStaff);
router.post('/', staffController.createStaff);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);
router.get('/:id/payments', staffController.getStaffPayments);
router.get('/:id/performance', staffController.getStaffPerformance);
// router.get('/:id/stats', staffStatsController.getStaffStats);
router.get('/:id/detail', staffController.getStaffDetail);
router.get('/:id/projects', staffController.getStaffProjects);
router.post('/:id/timesheet', staffController.sendStaffTimesheet);


module.exports = router;
