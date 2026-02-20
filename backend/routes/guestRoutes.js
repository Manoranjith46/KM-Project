import express from 'express';
import { checkInGuest, getActiveGuests, checkOutGuest, getGuestByPhone, updateGuest } from '../controllers/guestController.js';

const router = express.Router();

router.route('/')
    .post(checkInGuest)
    .get(getActiveGuests);

router.route('/:phoneNumber')
    .get(getGuestByPhone)
    .put(updateGuest)
    .delete(checkOutGuest);

export default router;