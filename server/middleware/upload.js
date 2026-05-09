import multer from 'multer';
import ErrorResponse from '../utils/errorResponse.js';

// Memory storage — file disk pe nahi, RAM mein temporarily
const storage = multer.memoryStorage();

// File filter — sirf images allow karo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept karo
  } else {
    cb(new ErrorResponse('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export default upload;