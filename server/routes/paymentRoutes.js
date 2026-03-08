import express from 'express';
import { 
	createOnlineRentPayment, 
	createCashRentPayment, 
	updateCashRentByAdmin, 
	getPaymentsByPhoneNumber, 
	getAllPayments,
	updatePaymentStatus,
	getDues
} from '../controllers/paymentController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Admin: Get all payments
router.get('/', verifyToken, authorizeRoles('owner'), getAllPayments);

// Get current dues by phone number
router.get('/dues/:phoneNumber', verifyToken, getDues);

// Get payments by phone number
router.get('/:phoneNumber', verifyToken, getPaymentsByPhoneNumber);

// Resident: Submit online payment with proof
router.post('/online', verifyToken, authorizeRoles('resident'), upload.single('paymentProof'), createOnlineRentPayment);

// Admin: Add cash payment
router.post('/cash', verifyToken, authorizeRoles('owner'), createCashRentPayment);

// Admin: Update cash payment by fields
router.put('/cash', verifyToken, authorizeRoles('owner'), updateCashRentByAdmin);

// Admin: Update payment status (approve/reject)
router.patch('/:id/status', verifyToken, authorizeRoles('owner'), updatePaymentStatus);

export default router;