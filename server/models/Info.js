import mongoose from 'mongoose';

const infoSchema = new mongoose.Schema({
  monthly: {
    type: String,
    required: true
  },
  daily: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Info', infoSchema);
