const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/records', financeController.getFinanceRecords);
router.post('/records', financeController.createFinanceRecord);
router.put('/records/:id', financeController.updateFinanceRecord);
router.delete('/records/:id', financeController.deleteFinanceRecord);

router.get('/summary', financeController.getFinanceSummary);
router.get('/projects', financeController.getProjectFinanceReport);
router.get('/staff', financeController.getStaffPaymentReport);

// Recurring expenses
router.get('/recurring', financeController.getRecurringExpenses);
router.post('/recurring', financeController.createRecurringExpense);
router.put('/recurring/:id', financeController.updateRecurringExpense);
router.delete('/recurring/:id', financeController.deleteRecurringExpense);
router.post('/recurring/process', financeController.processRecurringExpenses);

module.exports = router;
