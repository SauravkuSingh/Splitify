import express from 'express';
import protect from '../middleware/auth.js';
import {
  signup,
  login,
  getMe,
} from '../controllers/authController.js';

const router = express.Router();

// ─── Routes ─────────────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;