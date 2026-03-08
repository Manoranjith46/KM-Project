import Payment from '../models/Payment.js';
import Resident from '../models/Resident.js';
import Info from '../models/Info.js';
import { getIO } from '../socket.js';
import { uploadToGridFS } from '../config/gridfs.js';

// @desc    Create online rent payment (resident)
// @route   POST /api/payments/online
export const createOnlineRentPayment = async (req, res) => {
	try {
		const { name, phoneNumber, amount, date, paymentMethod } = req.body;

		if (!name || !phoneNumber || !amount || !paymentMethod) {
			return res.status(400).json({
				message: 'Please provide name, phoneNumber, amount and paymentMethod',
			});
		}

		if (!req.file) {
			return res.status(400).json({
				message: 'Payment proof is required for online payments',
			});
		}

		if (String(paymentMethod).toLowerCase() === 'cash') {
			return res.status(400).json({
				message: 'Use cash payment endpoint for cash rent entries',
			});
		}

		// Upload payment proof to GridFS
		const proofId = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);

		const payment = await Payment.create({
			name,
			phoneNumber,
			amount,
			date: date || new Date(),
			paymentMethod,
			paymentProof: proofId.toString(),
			status: 'pending',
		});

		return res.status(201).json({
			message: 'Receipt uploaded! Awaiting admin approval.',
			payment,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc    Update payment status (admin)
// @route   PATCH /api/payments/:id/status
export const updatePaymentStatus = async (req, res) => {
	try {
		const { status } = req.body;
		const { id } = req.params;

		if (!status || !['approved', 'rejected'].includes(status)) {
			return res.status(400).json({
				message: 'Valid status is required (approved or rejected)',
			});
		}

		const payment = await Payment.findByIdAndUpdate(
			id,
			{ status },
			{ new: true, runValidators: true }
		);

		if (!payment) {
			return res.status(404).json({ message: 'Payment not found' });
		}

		getIO().to(payment.phoneNumber).emit('resident:payment-updated');

		return res.status(200).json({
			message: `Payment updated successfully`,
			payment,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc    Update an existing cash payment (admin)
// @route   PUT /api/payments/cash
export const updateCashRentByAdmin = async (req, res) => {
	try {
		const { id, name, phoneNumber, amount, date, paymentMethod } = req.body;

		if (!id) {
			return res.status(400).json({ message: 'Payment id is required' });
		}

		const updates = {};
		if (name !== undefined) updates.name = name;
		if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
		if (amount !== undefined) updates.amount = amount;
		if (date !== undefined) updates.date = date;
		if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;

		if (updates.paymentMethod && String(updates.paymentMethod).toLowerCase() !== 'cash') {
			return res.status(400).json({ message: 'Only Cash payment method can be updated from this endpoint' });
		}

		updates.paymentMethod = 'Cash';
		updates.paymentProof = null;
		updates.status = 'approved';

		const payment = await Payment.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		if (!payment) {
			return res.status(404).json({ message: 'Payment not found' });
		}

		return res.status(200).json({
			message: 'Cash payment updated successfully',
			payment,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc    Create cash rent payment (admin)
// @route   POST /api/payments/cash
export const createCashRentPayment = async (req, res) => {
	try {
		const { name, phoneNumber, amount, date, paymentMethod } = req.body;

		if (!name || !phoneNumber || !amount) {
			return res.status(400).json({
				message: 'Please provide name, phoneNumber and amount',
			});
		}

		const normalizedMethod = paymentMethod || 'Cash';

		if (String(normalizedMethod).toLowerCase() !== 'cash') {
			return res.status(400).json({
				message: 'Cash endpoint only accepts paymentMethod as Cash',
			});
		}

		const payment = await Payment.create({
			name,
			phoneNumber,
			amount,
			date: date || new Date(),
			paymentMethod: 'Cash',
			paymentProof: null,
			status: 'approved',
		});

		return res.status(201).json({
			message: 'Cash rent payment recorded successfully',
			payment,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc    Get payment history by resident phone number
// @route   GET /api/payments/:phoneNumber
export const getPaymentsByPhoneNumber = async (req, res) => {
	try {
		const { phoneNumber } = req.params;

		if (!phoneNumber) {
			return res.status(400).json({ message: 'Phone number is required' });
		}

		const payments = await Payment.find({ phoneNumber }).sort({ date: -1 });
		return res.status(200).json(payments);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
export const getAllPayments = async (req, res) => {
	try {
		const payments = await Payment.find({}).sort({ date: -1 });
		return res.status(200).json(payments);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// @desc    Get current dues for a resident
// @route   GET /api/payments/dues/:phoneNumber
export const getDues = async (req, res) => {
	try {
		const { phoneNumber } = req.params;

		if (!phoneNumber) {
			return res.status(400).json({ message: 'Phone number is required' });
		}

		// Check if resident exists
		const resident = await Resident.findOne({ phoneNumber });
		
		if (!resident) {
			return res.status(404).json({ message: 'Resident not found' });
		}

		// Get monthly rent from info collection
		const info = await Info.findOne();
		
		if (!info || !info.monthly) {
			return res.status(404).json({ message: 'Rent information not found' });
		}

		const monthlyRent = Number(info.monthly);

		// Get current month and year
		const now = new Date();
		const currentMonth = now.getMonth(); // 0-11
		const currentYear = now.getFullYear();

		// Find all approved payments for current month
		const approvedPayments = await Payment.find({
			phoneNumber,
			status: 'approved',
			date: {
				$gte: new Date(currentYear, currentMonth, 1),
				$lt: new Date(currentYear, currentMonth + 1, 1)
			}
		});

		// Sum all approved payments this month
		const totalPaid = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
		const dueAmount = Math.max(0, monthlyRent - totalPaid);

		return res.status(200).json({ dueAmount });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};


