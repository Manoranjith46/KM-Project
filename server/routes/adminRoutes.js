import express from 'express';
const router = express.Router();
import { getPendingPayments, getRevenueSummary, getAllOccupants, getAllReports, updateReportStatus, getAdminAnnouncements } from '../controllers/adminController.js';
import { createAnnouncement, deleteAnnouncement } from '../controllers/residentController.js';
import { getProfile, updateProfile, getProperty, updateProperty, changePassword, uploadProfilePhoto, removeProfilePhoto } from '../controllers/settingsController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

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

// Settings
router.get('/settings/profile', verifyToken, authorizeRoles('owner'), getProfile);
router.put('/settings/profile', verifyToken, authorizeRoles('owner'), updateProfile);
router.get('/settings/property', verifyToken, authorizeRoles('owner'), getProperty);
router.put('/settings/property', verifyToken, authorizeRoles('owner'), updateProperty);
router.post('/settings/change-password', verifyToken, authorizeRoles('owner'), changePassword);
router.post('/settings/profile-photo', verifyToken, authorizeRoles('owner'), upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/settings/profile-photo', verifyToken, authorizeRoles('owner'), removeProfilePhoto);

export default router;