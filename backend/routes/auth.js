import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { usersMemory } from '../config/memoryDb.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bite_ai_fitness_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (process.env.MOCK_DB === 'true') {
    const userExists = usersMemory.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      _id: `mock_user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password, // store as plain-text for mock simplicity
      weight: 70,
      height: 175,
      age: 25,
      gender: 'male',
      activityLevel: 'moderately_active',
      goals: {
        calories: 2200,
        protein: 150,
        carbs: 220,
        fats: 70,
        water: 2500,
      },
      streak: 1,
      lastLogDate: new Date().toISOString().split('T')[0],
    };

    usersMemory.push(newUser);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      weight: newUser.weight,
      height: newUser.height,
      age: newUser.age,
      gender: newUser.gender,
      activityLevel: newUser.activityLevel,
      goals: newUser.goals,
      streak: newUser.streak,
      token: generateToken(newUser._id),
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goals: user.goals,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (process.env.MOCK_DB === 'true') {
    const user = usersMemory.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      const today = new Date().toISOString().split('T')[0];
      let updatedStreak = user.streak || 0;

      if (user.lastLogDate) {
        const lastLog = new Date(user.lastLogDate);
        const diffTime = Math.abs(new Date(today) - lastLog);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          updatedStreak += 1;
        } else if (diffDays > 1) {
          updatedStreak = 1;
        }
      } else {
        updatedStreak = 1;
      }

      user.streak = updatedStreak;
      user.lastLogDate = today;

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goals: user.goals,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check/Update daily streak
      const today = new Date().toISOString().split('T')[0];
      let updatedStreak = user.streak;

      if (user.lastLogDate) {
        const lastLog = new Date(user.lastLogDate);
        const diffTime = Math.abs(new Date(today) - lastLog);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Increment streak
          updatedStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          updatedStreak = 1;
        }
      } else {
        updatedStreak = 1; // start streak
      }

      user.streak = updatedStreak;
      user.lastLogDate = today;
      await user.save();

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goals: user.goals,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    return res.json(req.user);
  }

  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @desc    Update user profile / goals
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const user = usersMemory.find((u) => u._id === req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.weight = req.body.weight !== undefined ? Number(req.body.weight) : user.weight;
      user.height = req.body.height !== undefined ? Number(req.body.height) : user.height;
      user.age = req.body.age !== undefined ? Number(req.body.age) : user.age;
      user.gender = req.body.gender || user.gender;
      user.activityLevel = req.body.activityLevel || user.activityLevel;

      if (req.body.goals) {
        user.goals = {
          calories: req.body.goals.calories !== undefined ? Number(req.body.goals.calories) : user.goals.calories,
          protein: req.body.goals.protein !== undefined ? Number(req.body.goals.protein) : user.goals.protein,
          carbs: req.body.goals.carbs !== undefined ? Number(req.body.goals.carbs) : user.goals.carbs,
          fats: req.body.goals.fats !== undefined ? Number(req.body.goals.fats) : user.goals.fats,
          water: req.body.goals.water !== undefined ? Number(req.body.goals.water) : user.goals.water,
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goals: user.goals,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      return res.status(404).json({ message: 'User not found in memory' });
    }
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.weight = req.body.weight !== undefined ? req.body.weight : user.weight;
      user.height = req.body.height !== undefined ? req.body.height : user.height;
      user.age = req.body.age !== undefined ? req.body.age : user.age;
      user.gender = req.body.gender || user.gender;
      user.activityLevel = req.body.activityLevel || user.activityLevel;

      if (req.body.goals) {
        user.goals = {
          calories: req.body.goals.calories !== undefined ? req.body.goals.calories : user.goals.calories,
          protein: req.body.goals.protein !== undefined ? req.body.goals.protein : user.goals.protein,
          carbs: req.body.goals.carbs !== undefined ? req.body.goals.carbs : user.goals.carbs,
          fats: req.body.goals.fats !== undefined ? req.body.goals.fats : user.goals.fats,
          water: req.body.goals.water !== undefined ? req.body.goals.water : user.goals.water,
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        weight: updatedUser.weight,
        height: updatedUser.height,
        age: updatedUser.age,
        gender: updatedUser.gender,
        activityLevel: updatedUser.activityLevel,
        goals: updatedUser.goals,
        streak: updatedUser.streak,
        token: generateToken(updatedUser._id),
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
});

export default router;

