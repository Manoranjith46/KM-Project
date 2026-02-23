import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Resident', 'Guest'], 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  checkInDate: { 
    type: Date 
  },
  checkOutDate: { 
    type: Date, 
    default: Date.now 
  },
  // --- The Field for Total Spending ---
  totalExpense: { 
    type: Number,
    required: true,
    default: 0
  },
  // ------------------------------------
  aadharUrl: { 
    type: String 
  }
}, { timestamps: true });

export default mongoose.model('History', historySchema);