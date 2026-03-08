import express from 'express';
import { registerResident, getResidents, updateResident, deleteResident, getResidentByPhone, getResidentsByRoom, registerReport, getReport, getAnnouncements, toggleGateStatus } from '../controllers/residentController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: /residents
router.route('/')
    .post(verifyToken, authorizeRoles('owner'), registerResident)
    .get(verifyToken, authorizeRoles('owner'), getResidents);

// CRITICAL: More specific routes must come BEFORE generic :id routes!
// Room route must come before :phoneNumber to avoid route conflicts
router.get('/room/:roomNumber', verifyToken, authorizeRoles('owner'), getResidentsByRoom);

// Gate toggle route (must come before :phoneNumber)
router.put('/gate-toggle/:phoneNumber', verifyToken, authorizeRoles('resident'), toggleGateStatus);

// Resident report and announcement routes (must come before :phoneNumber)
router.post('/report', verifyToken, authorizeRoles('resident'), registerReport);
router.get('/report/:phoneNumber', verifyToken, authorizeRoles('resident'), getReport);
router.get('/announcements', verifyToken, authorizeRoles('resident'), getAnnouncements);

// Route: /:phoneNumber - Generic phone lookup (must come LAST)
router.route('/:phoneNumber')
.get(verifyToken, getResidentByPhone)
.put(verifyToken, authorizeRoles('owner'), updateResident)
.delete(verifyToken, authorizeRoles('owner'), deleteResident);

export default router;