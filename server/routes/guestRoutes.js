import express from 'express';
import { checkInGuest, getActiveGuests, checkOutGuest, getGuestByPhone, updateGuest } from '../controllers/guestController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
    .post(upload.single('aadharDoc'), checkInGuest)
    .get(getActiveGuests);

router.route('/:phoneNumber')
    .get(getGuestByPhone)
    .put(updateGuest)
    .delete(checkOutGuest);

export default router;