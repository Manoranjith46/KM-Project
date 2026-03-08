import express from 'express';
const router = express.Router();
import { getPendingPayments, getRevenueSummary } from '../controllers/adminController.js';

// Aggregate revenue from both Active Residents and History
router.get('/revenue-summary', getRevenueSummary);

// Find all residents with 'Pending' status in their latest payment
router.get('/pending-payments', getPendingPayments);



export default router;