import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    totalBeds: {
      type: Number,
      default: 0,
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    managerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Property', propertySchema);
