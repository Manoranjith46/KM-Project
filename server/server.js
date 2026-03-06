import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js'; // Ensure .js extension
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load config
dotenv.config({ silent: true });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for Base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true })); // For form data
app.use(cookieParser()); // Parse cookies from requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/guests', guestRoutes)
app.use('/api/food', foodRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));