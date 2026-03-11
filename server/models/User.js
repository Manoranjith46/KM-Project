import mongoose from 'mongoose';
import { hashPassword, comparePassword } from '../Security/bycrypt.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please provide a mobile number'],
      unique: true,
      match: [/^\d{10,15}$/, 'Please provide a valid mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default with find queries
    },
    role: {
      type: String,
      enum: ['owner', 'resident', 'guest'],
      default: 'guest',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  this.password = await hashPassword(this.password);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await comparePassword(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
