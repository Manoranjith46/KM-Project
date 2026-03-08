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
  dob: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  bloodGroup: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['Resident', 'Guest'],
    default: 'Resident'
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
    },
    relation: {
      type: String,
      default: null
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
  monthlyRent: {
    type: Number,
    default: 0
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },

  // --- Document Storage ---
  document: {
    type: String, // GridFS file ID
    default: null
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