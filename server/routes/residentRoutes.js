import express from 'express';
import { registerResident, getResidents, updateResident, deleteResident, getResidentByPhone, getResidentsByRoom } from '../controllers/residentController.js';


const router = express.Router();

// Route: /residents
router.route('/')
    .post(registerResident)
    .get(getResidents);

// Route: /resident/search - handles query parameters (must come before /:phonenumber)
router.route('/:phoneNumber')
  .get(getResidentByPhone)
  .put(updateResident)
  .delete(deleteResident);

router.get('/room/:roomNumber', getResidentsByRoom);

export default router;