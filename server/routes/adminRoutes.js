import express from 'express';
const router = express.Router();
import { getPendingPayments, getRevenueSummary, getAllOccupants, getAllReports, updateReportStatus, getAdminAnnouncements } from '../controllers/adminController.js';
import { createAnnouncement, deleteAnnouncement } from '../controllers/residentController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

// Aggregate revenue from both Active Residents and History
router.get('/revenue-summary', getRevenueSummary);

// Get all occupants (residents + guests)
router.get('/occupants', verifyToken, authorizeRoles('owner'), getAllOccupants);

// Find all residents with 'Pending' status in their latest payment
router.get('/pending-payments', getPendingPayments);

// Reports management
router.get('/reports', verifyToken, authorizeRoles('owner'), getAllReports);
router.patch('/reports/:id', verifyToken, authorizeRoles('owner'), updateReportStatus);

// Announcement management
router.get('/announcements', verifyToken, authorizeRoles('owner'), getAdminAnnouncements);
router.post('/announcements', verifyToken, authorizeRoles('owner'), createAnnouncement);
router.delete('/announcements/:id', verifyToken, authorizeRoles('owner'), deleteAnnouncement);



export default router;