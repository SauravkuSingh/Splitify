import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());


// ─── Routes ───────────────────────────────────────────────────
// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 SplitSmart API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler — koi bhi route match nahi hua
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});