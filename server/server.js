import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitizer from './middleware/mongoSanitizer.js';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js'; // Ensure .js extension
import { initSocket } from './socket.js';
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';
import { startMonthlyRentReset } from './cron/monthlyRentReset.js';
import helmet from 'helmet';


// Load config
dotenv.config({ silent: true });

// Connect to Database
connectDB();

const app = express();
const server = createServer(app);

// Rate limiting configuration (with .env overrides)
const GLOBAL_RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // default 1 minute
const GLOBAL_RATE_LIMIT_MAX = Number(process.env.MAX_REQUESTS_PER_WINDOW) || 10; // default 10 requests
const AUTH_RATE_LIMIT_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000; // default 1 hour
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 5; // default 5 requests

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  'http://localhost:5173',
  'https://km-pg.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const isLanDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):\d+$/.test(origin);

    if (!isProduction && isLanDevOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true, // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies from requests

// 🛡️ SECURITY MIDDLEWARE
// 1. Data sanitization against NoSQL injection
app.use(mongoSanitizer());

// 2. Global rate limiting - default 10 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: GLOBAL_RATE_LIMIT_WINDOW_MS,
  max: GLOBAL_RATE_LIMIT_MAX,
  message: {
    message: 'Too many requests from this IP, please try again after 1 minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 3. Stricter rate limiting for auth/login routes
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: {
    message: 'Too many login attempts. Please try again in an minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);

// Initialize Socket.IO
initSocket(server, corsOptions);

// Start cron jobs
startMonthlyRentReset();

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