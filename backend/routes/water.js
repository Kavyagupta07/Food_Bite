import express from 'express';
import WaterLog from '../models/WaterLog.js';
import { protect } from '../middleware/auth.js';
import { waterMemory } from '../config/memoryDb.js';

const router = express.Router();

// @desc    Get user's logged water intake for a specific date
// @route   GET /api/water
// @access  Private
router.get('/', protect, async (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  if (!date) {
    return res.status(400).json({ message: 'Date parameter is required (YYYY-MM-DD)' });
  }

  if (process.env.MOCK_DB === 'true') {
    const userLogs = waterMemory.filter(
      (w) => w.user.toString() === req.user._id.toString() && w.date === date
    );
    return res.json(userLogs);
  }

  try {
    const logs = await WaterLog.find({ user: req.user._id, date });
    return res.json(logs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching water logs' });
  }
});

// @desc    Log water intake
// @route   POST /api/water
// @access  Private
router.post('/', protect, async (req, res) => {
  const { amount, date } = req.body;

  if (amount === undefined || !date) {
    return res.status(400).json({ message: 'Please provide amount and date' });
  }

  if (process.env.MOCK_DB === 'true') {
    const log = {
      _id: `mock_water_${Date.now()}`,
      user: req.user._id,
      amount: Number(amount),
      date,
    };
    waterMemory.push(log);
    return res.status(201).json(log);
  }

  try {
    const log = await WaterLog.create({
      user: req.user._id,
      amount: Number(amount),
      date,
    });

    return res.status(201).json(log);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging water intake' });
  }
});

// @desc    Delete a water log entry
// @route   DELETE /api/water/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const index = waterMemory.findIndex((w) => w._id.toString() === req.params.id.toString());
    if (index === -1) {
      return res.status(404).json({ message: 'Water log not found' });
    }
    const log = waterMemory[index];
    if (log.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    waterMemory.splice(index, 1);
    return res.json({ message: 'Water log removed' });
  }

  try {
    const log = await WaterLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Water log not found' });
    }

    if (log.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await WaterLog.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Water log removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting water log' });
  }
});

export default router;

