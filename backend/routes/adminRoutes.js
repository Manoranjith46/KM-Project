import express from 'express';
const router = express.Router();
import { getDailyFoodReport, getPendingPayments, getRevenueSummary, resetAllMealToggles } from '../controllers/adminController.js';

// Aggregate revenue from both Active Residents and History
router.get('/revenue-summary', getRevenueSummary);

// Find all residents with 'Pending' status in their latest payment
router.get('/pending-payments', getPendingPayments);

// Get the actual meal count for today
router.get('/food-report', getDailyFoodReport);

router.put('/reset-meals', resetAllMealToggles);

export default router;