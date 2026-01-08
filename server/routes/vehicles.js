const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', vehicleController.getVehicles);
router.post('/', vehicleController.createVehicle);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

router.get('/:id/usage', vehicleController.getVehicleUsage);
router.post('/:id/usage', vehicleController.addVehicleUsage);


// Existing maintenance routes (old table)
router.get('/:id/maintenance', vehicleController.getVehicleMaintenance);
router.post('/:id/maintenance', vehicleController.addVehicleMaintenance);

// Document upload routes
const { upload } = require('../utils/fileUpload');
router.post('/:id/upload', upload.array('documents', 10), vehicleController.uploadVehicleDocuments);
router.delete('/:id/documents/:docId', vehicleController.deleteVehicleDocument);

// Maintenance logs routes (new table)
router.get('/:id/maintenance-logs', vehicleController.getMaintenanceLogs);
router.post('/:id/maintenance-logs', vehicleController.createMaintenanceLog);
router.put('/:id/maintenance-logs/:logId', vehicleController.updateMaintenanceLog);
router.delete('/:id/maintenance-logs/:logId', vehicleController.deleteMaintenanceLog);

// Email report
router.post('/:id/email-report', vehicleController.sendVehicleReport);


module.exports = router;
