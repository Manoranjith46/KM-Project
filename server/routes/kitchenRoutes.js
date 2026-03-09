import express from 'express';
import {
  getMenu,
  getWeekMenu,
  upsertMenu,
  getParticipation,
} from '../controllers/kitchenController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Menu
router.get('/menu/week', verifyToken, getWeekMenu);
router.get('/menu', verifyToken, getMenu);
router.put('/menu', verifyToken, authorizeRoles('owner'), upsertMenu);

// Participation
router.get('/participation', verifyToken, getParticipation);

export default router;
