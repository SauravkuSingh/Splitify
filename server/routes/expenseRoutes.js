import express from 'express';
import protect from '../middleware/auth.js';
import {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
  getGroupBalances,
  getUserStats,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect);

// Expense CRUD
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Stats and Analytics
router.get('/stats', getUserStats);

// Group specific routes
router.get('/group/:groupId', getGroupExpenses);
router.get('/group/:groupId/balances', getGroupBalances);

export default router;