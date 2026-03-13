import express from 'express';
import { getFoodStatus, toggleFoodStatus, getMealCount, getDailyFoodReport } from '../controllers/foodController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status/:phoneNumber', getFoodStatus);
router.put('/toggle', verifyToken, authorizeRoles('resident', 'guest'), toggleFoodStatus);
router.get('/count', getMealCount);

// Get the actual meal count for today
router.get('/food-report', getDailyFoodReport);


export default router;