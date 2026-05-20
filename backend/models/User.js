import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      default: 70, // kg
    },
    height: {
      type: Number,
      default: 175, // cm
    },
    age: {
      type: Number,
      default: 25,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'moderately_active',
    },
    goals: {
      calories: { type: Number, default: 2200 },
      protein: { type: Number, default: 150 }, // in grams
      carbs: { type: Number, default: 220 }, // in grams
      fats: { type: Number, default: 70 }, // in grams
      water: { type: Number, default: 2500 }, // in ml
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastLogDate: {
      type: String, // YYYY-MM-DD
    },
    profilePicture: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
