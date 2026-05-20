import mongoose from 'mongoose';

const waterLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number, // in ml (e.g. 250, 500)
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

waterLogSchema.index({ user: 1, date: 1 });

const WaterLog = mongoose.model('WaterLog', waterLogSchema);

export default WaterLog;
