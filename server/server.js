import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Ensure .js extension
import adminRoutes from './routes/adminRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import dns from 'dns';

// Forces the app to use Google's DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// Also helpful to force IPV4 if you are still getting connection errors
dns.setDefaultResultOrder('ipv4first');

// Load config
dotenv.config({ silent: true });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/guests', guestRoutes)
app.use('/api/food', foodRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));