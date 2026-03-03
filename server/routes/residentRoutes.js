import express from 'express';
import { registerResident, getResidents, updateResident, deleteResident, getResidentByPhone, getResidentsByRoom } from '../controllers/residentController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: /residents
router.route('/')
    .post(verifyToken, authorizeRoles('owner'), registerResident)
    .get(verifyToken, getResidents);

// CRITICAL: More specific routes must come BEFORE generic :id routes!
// Room route must come before :phoneNumber to avoid route conflicts
router.get('/room/:roomNumber', verifyToken, getResidentsByRoom);

// Route: /:phoneNumber - Generic phone lookup (must come LAST)
router.route('/:phoneNumber')
  .get(verifyToken, getResidentByPhone)
  .put(verifyToken, authorizeRoles('owner'), updateResident)
  .delete(verifyToken, authorizeRoles('owner'), deleteResident);

export default router;