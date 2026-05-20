import express from 'express';
import axios from 'axios';
import MealLog from '../models/MealLog.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { mealsMemory } from '../config/memoryDb.js';

const router = express.Router();

// A robust local database of standard fitness foods for instant, highly accurate results
const FITNESS_FOODS = [
  { name: 'Chicken Breast (Cooked)', calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: '100g' },
  { name: 'Oatmeal (Raw Oats)', calories: 389, protein: 16.9, carbs: 66.3, fats: 6.9, servingSize: '100g' },
  { name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, servingSize: '100g' },
  { name: 'Brown Rice (Cooked)', calories: 112, protein: 2.6, carbs: 23, fats: 0.9, servingSize: '100g' },
  { name: 'Whey Protein Shake', calories: 120, protein: 24, carbs: 3, fats: 1.5, servingSize: '1 scoop (30g)' },
  { name: 'Whole Egg (Boiled)', calories: 155, protein: 13, carbs: 1.1, fats: 11, servingSize: '100g (approx. 2 eggs)' },
  { name: 'Egg Whites', calories: 52, protein: 11, carbs: 0.7, fats: 0.2, servingSize: '100g (approx. 3 eggs)' },
  { name: 'Salmon Fillet (Grilled)', calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: '100g' },
  { name: 'Tuna (Canned in Water)', calories: 116, protein: 26, carbs: 0, fats: 1, servingSize: '100g' },
  { name: 'Greek Yogurt (0% Fat)', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, servingSize: '100g' },
  { name: 'Broccoli (Steamed)', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, servingSize: '100g' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3, servingSize: '1 medium (118g)' },
  { name: 'Sweet Potato (Baked)', calories: 86, protein: 1.6, carbs: 20.1, fats: 0.1, servingSize: '100g' },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fats: 50, servingSize: '2 tbsp (32g)' },
  { name: 'Almonds', calories: 579, protein: 21.1, carbs: 21.6, fats: 49.9, servingSize: '1 oz (28g)' },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fats: 14.7, servingSize: '100g' },
  { name: 'Cottage Cheese (Low Fat)', calories: 81, protein: 10.4, carbs: 4.8, fats: 2.3, servingSize: '100g' },
  { name: 'Beef (Lean Steak 10%)', calories: 250, protein: 26, carbs: 0, fats: 15, servingSize: '100g' },
  { name: 'Protein Bar', calories: 200, protein: 20, carbs: 18, fats: 6, servingSize: '1 bar (60g)' },
  { name: 'Spinach (Raw)', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, servingSize: '100g' },
];

// @desc    Get user's logged meals for a specific date
// @route   GET /api/meals
// @access  Private
router.get('/', protect, async (req, res) => {
  const { date } = req.query; // Expecting YYYY-MM-DD
  if (!date) {
    return res.status(400).json({ message: 'Date parameter is required (YYYY-MM-DD)' });
  }

  if (process.env.MOCK_DB === 'true') {
    const userMeals = mealsMemory.filter(
      (m) => m.user.toString() === req.user._id.toString() && m.date === date
    );
    return res.json(userMeals);
  }

  try {
    const meals = await MealLog.find({ user: req.user._id, date });
    return res.json(meals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching logged meals' });
  }
});

// @desc    Log a new meal
// @route   POST /api/meals
// @access  Private
router.post('/', protect, async (req, res) => {
  const { mealName, calories, protein, carbs, fats, servingSize, mealType, date, barcode, pictureUrl } = req.body;

  if (!mealName || calories === undefined || protein === undefined || carbs === undefined || fats === undefined || !mealType || !date) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (process.env.MOCK_DB === 'true') {
    const meal = {
      _id: `mock_meal_${Date.now()}`,
      user: req.user._id,
      mealName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      servingSize: servingSize || '1 serving',
      mealType,
      date,
      barcode,
      pictureUrl,
    };
    mealsMemory.push(meal);

    // Update user streak in memory
    const user = req.user;
    if (user) {
      if (user.lastLogDate !== date) {
        let updatedStreak = user.streak || 0;
        if (user.lastLogDate) {
          const lastLog = new Date(user.lastLogDate);
          const currentLog = new Date(date);
          const diffTime = Math.abs(currentLog - lastLog);
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
        user.lastLogDate = date;
      }
    }
    return res.status(201).json(meal);
  }

  try {
    const meal = await MealLog.create({
      user: req.user._id,
      mealName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      servingSize: servingSize || '1 serving',
      mealType,
      date,
      barcode,
      pictureUrl,
    });

    // Handle user streak validation
    const user = await User.findById(req.user._id);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      if (user.lastLogDate !== date) {
        // Logging for a new date
        let updatedStreak = user.streak;
        if (user.lastLogDate) {
          const lastLog = new Date(user.lastLogDate);
          const currentLog = new Date(date);
          const diffTime = Math.abs(currentLog - lastLog);
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
        user.lastLogDate = date;
        await user.save();
      }
    }

    return res.status(201).json(meal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging meal' });
  }
});

// @desc    Delete a logged meal
// @route   DELETE /api/meals/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  if (process.env.MOCK_DB === 'true') {
    const index = mealsMemory.findIndex((m) => m._id.toString() === req.params.id.toString());
    if (index === -1) {
      return res.status(404).json({ message: 'Meal log not found' });
    }
    const meal = mealsMemory[index];
    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    mealsMemory.splice(index, 1);
    return res.json({ message: 'Meal log removed' });
  }

  try {
    const meal = await MealLog.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: 'Meal log not found' });
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await MealLog.deleteOne({ _id: req.params.id });
    return res.json({ message: 'Meal log removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting meal log' });
  }
});

// @desc    Search for meals via local DB + OpenFoodFacts API
// @route   GET /api/meals/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // 1. Search local high-quality gym database first
    const cleanQuery = query.toLowerCase().trim();
    const localMatches = FITNESS_FOODS.filter((food) =>
      food.name.toLowerCase().includes(cleanQuery)
    );

    // 2. Query OpenFoodFacts API for additional/exact items
    let externalMatches = [];
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&page_size=10`,
        { headers: { 'User-Agent': 'BiteApp - WebApp - Version 1.0' } }
      );

      if (response.data && response.data.products) {
        externalMatches = response.data.products
          .filter((p) => p.product_name && p.nutriments)
          .map((p) => {
            const nut = p.nutriments;
            // Calories: energy-kcal_100g is standard, fallback to other kcal keys
            const calories = Math.round(nut['energy-kcal_100g'] || nut['energy-kcal_value'] || nut['energy-kcal'] || 0);
            const protein = Math.round((nut.proteins_100g || nut.proteins || 0) * 10) / 10;
            const carbs = Math.round((nut.carbohydrates_100g || nut.carbohydrates || 0) * 10) / 10;
            const fats = Math.round((nut.fat_100g || nut.fat || 0) * 10) / 10;

            return {
              name: p.product_name,
              calories,
              protein,
              carbs,
              fats,
              servingSize: p.serving_size || '100g',
              brand: p.brands || '',
              image: p.image_url || '',
              barcode: p.code || '',
            };
          });
      }
    } catch (apiErr) {
      console.warn('OpenFoodFacts Search API error:', apiErr.message);
    }

    // Combine local matches (with high priority) and external matches
    const results = [...localMatches, ...externalMatches];
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error searching meals' });
  }
});

// @desc    Scan food barcode via OpenFoodFacts API
// @route   GET /api/meals/barcode/:code
// @access  Private
router.get('/barcode/:code', protect, async (req, res) => {
  const { code } = req.params;

  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
      { headers: { 'User-Agent': 'BiteApp - WebApp - Version 1.0' } }
    );

    if (response.data && response.data.status === 1 && response.data.product) {
      const p = response.data.product;
      const nut = p.nutriments || {};
      const calories = Math.round(nut['energy-kcal_100g'] || nut['energy-kcal_value'] || nut['energy-kcal'] || 0);
      const protein = Math.round((nut.proteins_100g || nut.proteins || 0) * 10) / 10;
      const carbs = Math.round((nut.carbohydrates_100g || nut.carbohydrates || 0) * 10) / 10;
      const fats = Math.round((nut.fat_100g || nut.fat || 0) * 10) / 10;

      return res.json({
        found: true,
        name: p.product_name || 'Unknown Barcode Product',
        calories,
        protein,
        carbs,
        fats,
        servingSize: p.serving_size || '100g',
        brand: p.brands || '',
        image: p.image_url || '',
        barcode: code,
      });
    } else {
      return res.status(404).json({ found: false, message: 'Product not found in database' });
    }
  } catch (error) {
    console.error('Barcode scan API error:', error.message);
    return res.status(500).json({ message: 'Error querying barcode database' });
  }
});

export default router;

