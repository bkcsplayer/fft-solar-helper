const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');

router.use(authMiddleware);

// Projects
router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Inverters
router.post('/:id/inverters', projectController.addInverter);
router.put('/:id/inverters/:inverterId', projectController.updateInverter);
router.delete('/:id/inverters/:inverterId', projectController.deleteInverter);

// Assignments
router.get('/:id/assignments', projectController.getAssignments);
router.post('/:id/assignments', projectController.assignStaff);
router.delete('/:id/assignments/:assignmentId', projectController.removeAssignment);
router.put('/:id/assignments/:assignmentId/payment', projectController.updateStaffPayment);
router.post('/:id/notify', projectController.notifyStaff);

// Progress
router.get('/:id/progress', projectController.getProgress);
router.put('/:id/progress/:stage', projectController.updateProgress);

// Finance
router.get('/:id/finance', projectController.getProjectFinance);

// Files
router.post('/:id/files', upload.single('file'), projectController.uploadFile);
router.get('/:id/files', projectController.getFiles);
router.delete('/:id/files/:fileId', projectController.deleteFile);

module.exports = router;
