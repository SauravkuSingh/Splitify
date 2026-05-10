import express from 'express';
import protect from '../middleware/auth.js';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  updateGroup,
  deleteGroup,
  getMyConnections,
  addMember
} from '../controllers/groupController.js';

const router = express.Router();

// ─── Routes ─────────────────────────────────────────────────────
router.route('/')
  .post(protect, createGroup)
  .get(protect, getMyGroups);

router.post('/join/:inviteToken', protect, joinGroup);

router.get('/connections', protect, getMyConnections);

router.route('/:id')
  .get(protect, getGroupById)
  .put(protect, updateGroup)
  .delete(protect, deleteGroup);

router.post('/:id/members', protect, addMember);

export default router;
