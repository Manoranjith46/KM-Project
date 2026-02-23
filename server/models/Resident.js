import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
  // --- Identity ---
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  guardianDetails: {
    name: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true
    }
  },
  joiningDate: { 
    type: Date, 
    default: Date.now 
  },
  
  // --- Room Info ---
  roomNumber: { 
    type: String, 
    required: true, 
    uppercase: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },

  // --- Meal Logic (Modified) ---
  leaveSchedule: {
    startDate: { 
      type: Date, 
      default: null 
    },
    endDate: { 
      type: Date, 
      default: null 

    }
  },
  
  // Daily Toggle (Used when NOT on leave)
  dailyMeals: {
    breakfast: { 
      type: Boolean, 
      default: true 
    },
    lunch: { 
      type: Boolean, default: true 
    },
    dinner: { 
      type: Boolean, 
      default: true 
    }
  },

  // --- Payment History ---
  // This array stores the history. Every time they pay, we push a new object here.
  payments: [{
    month: { 
      type: String, 
      required: true 

    }, // e.g., "Feb 2026"
    amount: { type: Number, 
      required: true 

    },
    status: { 
      type: String, 
      enum: ['Paid', 'Pending', 'Failed'], 
      default: 'Pending' 
    },
    paymentDate: { 
      type: Date, 
      default: Date.now 

    }, // Auto-sets to current time
    screenshotUrl: { 
      type: String 
    } // Proof of payment
  }]

}, { timestamps: true });

export default mongoose.model('Resident', residentSchema);