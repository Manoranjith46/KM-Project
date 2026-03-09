import mongoose from 'mongoose';

const mealSchema = {
  time: { type: String, default: '' },
  items: [{ type: String }],
};

const kitchenSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    unique: true,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
}, { timestamps: true });

export default mongoose.model('Kitchen', kitchenSchema);
