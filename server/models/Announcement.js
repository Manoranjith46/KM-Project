import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['urgent', 'info', 'rule', 'general'],
      default: 'general',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema, 'announcements');
