import express from 'express';
import { getFoodStatus, toggleFoodStatus, getMealCount } from '../controllers/foodController.js';

const router = express.Router();

router.get('/status/:phoneNumber', getFoodStatus);
router.post('/toggle', toggleFoodStatus);
router.get('/count', getMealCount);

export default router;