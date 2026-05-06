import express from 'express';
import protect from '../middleware/auth.js';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  updateGroup,
} from '../controllers/groupController.js';

const router = express.Router();

// ─── Routes ─────────────────────────────────────────────────────
router.route('/')
  .post(protect, createGroup)
  .get(protect, getMyGroups);

router.post('/join/:inviteToken', protect, joinGroup);

router.route('/:id')
  .get(protect, getGroupById)
  .put(protect, updateGroup);

export default router;
