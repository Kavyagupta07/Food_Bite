import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number, // in grams
      required: true,
    },
    carbs: {
      type: Number, // in grams
      required: true,
    },
    fats: {
      type: Number, // in grams
      required: true,
    },
    servingSize: {
      type: String,
      default: '1 serving',
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD for simpler indexing and querying
      required: true,
    },
    barcode: {
      type: String,
    },
    pictureUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index to allow fast lookup of logs for a user on a specific date
mealLogSchema.index({ user: 1, date: 1 });

const MealLog = mongoose.model('MealLog', mealLogSchema);

export default MealLog;
