import express from 'express';
import protect from '../middleware/auth.js';
import {
  runSettlement,
  getSettlements,
  markSettlementComplete,
} from '../controllers/settlementController.js';

const router = express.Router();

router.use(protect);

router.post('/run/:groupId', runSettlement);
router.get('/group/:groupId', getSettlements);
router.put('/:id/complete', markSettlementComplete);

export default router;