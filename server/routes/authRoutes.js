import express from 'express';
import { loginUser, logoutUser, refreshAccessToken, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (login only)
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);

export default router;
