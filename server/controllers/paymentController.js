import Payment from '../models/Payment.js';
import Resident from '../models/Resident.js';
import Info from '../models/Info.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';
import { uploadToGridFS } from '../config/gridfs.js';

const PHONE_REGEX = /^\d{10,12}$/;

const ensureOwnPhoneOrOwner = async (req, phoneNumber) => {
	if (req.user?.role === 'owner') {
		return { allowed: true };
	}

	const requester = await User.findById(req.user?.id).select('mobileNumber');
	if (!requester || requester.mobileNumber !== phoneNumber) {
		return {
			allowed: false,
			status: 403,
			message: 'Access denied. You can only access your own payment data.',
		};
	}

	return { allowed: true };
};

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

		if (!PHONE_REGEX.test(String(phoneNumber))) {
			return res.status(400).json({ message: 'Please provide a valid phoneNumber' });
		}

		const numericAmount = Number(amount);
		if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
			return res.status(400).json({ message: 'Amount must be a number greater than 0' });
		}

		if (date && Number.isNaN(new Date(date).getTime())) {
			return res.status(400).json({ message: 'Please provide a valid payment date' });
		}

		const accessCheck = await ensureOwnPhoneOrOwner(req, String(phoneNumber));
		if (!accessCheck.allowed) {
			return res.status(accessCheck.status).json({ message: accessCheck.message });
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
			amount: numericAmount,
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
			{ returnDocument: 'after', runValidators: true }
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

		if (!PHONE_REGEX.test(String(phoneNumber))) {
			return res.status(400).json({ message: 'Please provide a valid phone number' });
		}

		const accessCheck = await ensureOwnPhoneOrOwner(req, String(phoneNumber));
		if (!accessCheck.allowed) {
			return res.status(accessCheck.status).json({ message: accessCheck.message });
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

// @desc    Get current dues for a resident/guest
// @route   GET /api/payments/dues/:phoneNumber
export const getDues = async (req, res) => {
	try {
		const { phoneNumber } = req.params;

		if (!phoneNumber) {
			return res.status(400).json({ message: 'Phone number is required' });
		}

		if (!PHONE_REGEX.test(String(phoneNumber))) {
			return res.status(400).json({ message: 'Please provide a valid phone number' });
		}

		const accessCheck = await ensureOwnPhoneOrOwner(req, String(phoneNumber));
		if (!accessCheck.allowed) {
			return res.status(accessCheck.status).json({ message: accessCheck.message });
		}

		// Check if resident/guest exists
		const resident = await Resident.findOne({ phoneNumber });

		if (!resident) {
			return res.status(404).json({ message: 'Resident not found' });
		}

		// Get rates from info collection
		const info = await Info.findOne();

		if (!info) {
			return res.status(404).json({ message: 'Rent information not found' });
		}

		const isGuest = resident.type === 'Guest';
		let totalDue = 0;
		let daysStayed = 0;
		let dailyRate = 0;
		let monthlyRate = 0;

		if (isGuest) {
			// Guest: Calculate based on daily rate from joining date
			dailyRate = Number(info.daily) || 0;
			const joiningDate = new Date(resident.joiningDate);
			const today = new Date();

			// Calculate days stayed (inclusive of joining date)
			const timeDiff = today.getTime() - joiningDate.getTime();
			daysStayed = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

			totalDue = dailyRate * daysStayed;
		} else {
			// Resident: Calculate based on monthly rate for current month
			monthlyRate = Number(info.monthly) || 0;
			totalDue = monthlyRate;
		}

		// Get all approved payments (for guests: all time, for residents: current month)
		let paymentQuery = {
			phoneNumber,
			status: 'approved'
		};

		if (!isGuest) {
			// For residents, only count current month's payments
			const now = new Date();
			const currentMonth = now.getMonth();
			const currentYear = now.getFullYear();
			paymentQuery.date = {
				$gte: new Date(currentYear, currentMonth, 1),
				$lt: new Date(currentYear, currentMonth + 1, 1)
			};
		}

		const approvedPayments = await Payment.find(paymentQuery);
		const totalPaid = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
		const dueAmount = Math.max(0, totalDue - totalPaid);

		return res.status(200).json({
			dueAmount,
			isGuest,
			...(isGuest && {
				dailyRate,
				daysStayed,
				totalDue,
				totalPaid,
				joiningDate: resident.joiningDate
			}),
			...(!isGuest && {
				monthlyRate,
				totalPaid
			})
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};


