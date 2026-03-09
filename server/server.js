import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js'; // Ensure .js extension
import { initSocket } from './socket.js';
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';

// Load config
dotenv.config({ silent: true });

// Connect to Database
connectDB();

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies from requests

// Initialize Socket.IO
initSocket(server, corsOptions);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/kitchen', kitchenRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));