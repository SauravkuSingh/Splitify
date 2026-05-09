import express from 'express';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { scanReceipt, uploadImage } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);

// Receipt scan — image upload + AI analysis
router.post('/scan-receipt', upload.single('receipt'), scanReceipt);

// Simple image upload — sirf Cloudinary pe store karo
router.post('/upload-image', upload.single('image'), uploadImage);

export default router;