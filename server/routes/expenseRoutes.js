import express from 'express';
import protect from '../middleware/auth.js';
import {
  addExpense,
  getGroupExpenses,
  updateExpense,
  deleteExpense,
  getGroupBalances,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect);

// Expense CRUD
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Group specific routes
router.get('/group/:groupId', getGroupExpenses);
router.get('/group/:groupId/balances', getGroupBalances);

export default router;