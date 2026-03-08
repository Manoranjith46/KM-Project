import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	phoneNumber: {
		type: String,
		required: true,
		trim: true,
	},
	amount: {
		type: Number,
		required: true,
		min: 0,
	},
	date: {
		type: Date,
		required: true,
		default: Date.now,
	},
	paymentMethod: {
		type: String,
		required: true,
		trim: true,
		enum: ['Cash', 'UPI', 'Other'],
	},
	paymentProof: {
		type: String,
		trim: true,
		default: null,
		required: function requiredPaymentProof() {
			return this.paymentMethod !== 'Cash';
		},
	},
	status: {
		type: String,
		required: true,
		enum: ['approved', 'rejected', 'pending'],
		default: 'pending',
	},
}, { timestamps: true });

paymentSchema.index({ name: 1, phoneNumber: 1, date: -1 });

export default mongoose.model('Payment', paymentSchema);