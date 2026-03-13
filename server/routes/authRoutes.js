import express from 'express';
import { loginUser, logoutUser, refreshAccessToken, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser); // Public - just clears cookies

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;
