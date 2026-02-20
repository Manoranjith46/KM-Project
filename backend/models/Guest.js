import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
    },
  aadharUrl: { 
    type: String, 
    required: true 
  },
  roomNumber: { 
    type: String, 
    required: true 
  },
    // Daily Toggle (Used when NOT on leave)
  dailyMeals: {
    breakfast: { 
      type: Boolean, 
      default: true 
    },
    lunch: { 
      type: Boolean, 
      default: true 
    },
    dinner: { 
      type: Boolean, 
      default: true 
    }
  },
  checkInDate: { 
    type: Date, 
    default: Date.now 
    },
  checkOutDate: { 
    type: Date
    },
  daysStayed: { 
    type: Number
    },
  amountPaid: { 
    type: Number
    },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Paid'
  }
}, { timestamps: true });

export default mongoose.model('Guest', guestSchema);