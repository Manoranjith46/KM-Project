import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  beds: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  maxOccupants: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: true });

const infoSchema = new mongoose.Schema({
  monthly: {
    type: String,
    required: true
  },
  daily: {
    type: String,
    required: true
  },
  rooms: {
    type: [roomSchema],
    default: [],
  },
}, { timestamps: true });

export default mongoose.model('Info', infoSchema);
