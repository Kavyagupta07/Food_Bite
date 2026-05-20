import express from 'express';
import { protect } from '../middleware/auth.js';
import MealLog from '../models/MealLog.js';
import { mealsMemory } from '../config/memoryDb.js';

const router = express.Router();

// A pre-defined collection of premium healthy recipes mapped to specific fitness goals
const RECIPES = [
  {
    name: 'Lean Body Chicken & Rice',
    calories: 450,
    protein: 42,
    carbs: 45,
    fats: 8,
    mealType: 'lunch',
    ingredients: ['150g Chicken Breast', '1 cup White Rice', '80g Steamed Broccoli', '1 tsp Olive Oil'],
    instructions: 'Grill the chicken breast with salt, pepper, and garlic powder. Serve over steamed white rice and broccoli. Drizzle with olive oil.',
    goalType: 'muscle_building'
  },
  {
    name: 'Pro-Gym Whey & Oats Bowl',
    calories: 380,
    protein: 32,
    carbs: 48,
    fats: 6,
    mealType: 'breakfast',
    ingredients: ['50g Rolled Oats', '1 scoop Whey Protein', '1/2 Banana', '1 tbsp Chia Seeds', 'Water/Almond Milk'],
    instructions: 'Cook oats in water/almond milk. Once warm, stir in whey protein until fully mixed. Top with sliced banana and chia seeds.',
    goalType: 'muscle_building'
  },
  {
    name: 'Supercharged Keto Salmon Salad',
    calories: 520,
    protein: 38,
    carbs: 6,
    fats: 38,
    mealType: 'dinner',
    ingredients: ['150g Grilled Salmon', '2 cups Spinach', '1/2 Avocado', '10g Feta Cheese', '1 tbsp Lemon Dressing'],
    instructions: 'Grill salmon fillet until flaky. Toss spinach, avocado, feta, and lemon dressing. Top salad with salmon.',
    goalType: 'fat_loss'
  },
  {
    name: 'Anabolic Egg White Scramble',
    calories: 220,
    protein: 28,
    carbs: 4,
    fats: 10,
    mealType: 'breakfast',
    ingredients: ['4 Egg Whites', '1 Whole Egg', '50g Spinach', '30g Mushrooms', 'Low-fat Cheddar cheese'],
    instructions: 'Scramble egg whites and the whole egg in a pan. Whisk in spinach, mushrooms, and top with cheese.',
    goalType: 'fat_loss'
  },
  {
    name: 'Energy Boost Peanut Butter & Rice Cakes',
    calories: 280,
    protein: 10,
    carbs: 32,
    fats: 14,
    mealType: 'snack',
    ingredients: ['2 Brown Rice Cakes', '1.5 tbsp Natural Peanut Butter', '1/2 Banana sliced'],
    instructions: 'Spread peanut butter evenly over two rice cakes. Layer with banana slices. Perfect pre-workout snack!',
    goalType: 'energy'
  },
  {
    name: 'Recovery Tuna Stuffed Sweet Potato',
    calories: 420,
    protein: 34,
    carbs: 52,
    fats: 4,
    mealType: 'lunch',
    ingredients: ['1 Medium Sweet Potato', '1 can Tuna in Water', '1 tbsp Greek Yogurt (0%)', 'Chives & Paprika'],
    instructions: 'Bake sweet potato. Mix canned tuna with Greek yogurt, chives, and paprika. Slice sweet potato open and stuff with the tuna mixture.',
    goalType: 'recovery'
  }
];

const MOTIVATIONS = [
  "No matter how slow you go, you are still lapping everyone on the couch. Keep logging!",
  "Make protein your best friend today. Build that muscle fiber by fiber.",
  "Water is the secret fuel of champions. Take a sip right now!",
  "Consistency beats intensity. Log every meal, track every macro, win every day.",
  "You are one workout and one healthy meal away from a good mood.",
  "The scale measures gravity, not your progress, strength, or dedication. Trust the process."
];

// @desc    Get AI meal suggestions and gym coach advice
// @route   GET /api/ai/suggestions
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    let loggedMeals;
    if (process.env.MOCK_DB === 'true') {
      loggedMeals = mealsMemory.filter(
        (m) => m.user.toString() === req.user._id.toString() && m.date === today
      );
    } else {
      // 1. Fetch current day logs to evaluate macro progress
      loggedMeals = await MealLog.find({ user: req.user._id, date: today });
    }
    
    // Calculate current totals
    const totals = loggedMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fats += meal.fats;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const user = req.user;
    const calorieTarget = user.goals.calories;
    const proteinTarget = user.goals.protein;

    // Determine primary goal based on targets/activity
    // Ratio of protein to calories can indicate bodybuilding focus
    let fitnessGoal = 'muscle_building';
    if (proteinTarget / calorieTarget > 0.08) {
      fitnessGoal = 'muscle_building';
    } else if (calorieTarget < 1800) {
      fitnessGoal = 'fat_loss';
    } else {
      fitnessGoal = 'energy';
    }

    // Filter recipes appropriate for the user
    const suggestions = RECIPES.filter(r => r.goalType === fitnessGoal || r.goalType === 'energy');

    // Generate smart coach advice based on daily logs
    let advice = "";
    if (loggedMeals.length === 0) {
      advice = "Welcome to your day! Start off strong by logging your breakfast. Let's aim to fuel those muscles early.";
    } else if (totals.protein < proteinTarget * 0.4) {
      advice = `Your protein intake is currently at ${Math.round(totals.protein)}g (target: ${proteinTarget}g). Consider focusing your next meal on high-protein sources like chicken, tuna, or egg whites to support recovery.`;
    } else if (totals.calories > calorieTarget * 0.9) {
      advice = `You've consumed ${Math.round(totals.calories)} kcal, approaching your target of ${calorieTarget} kcal. Keep snacks light and fibrous (spinach, cucumber, broccoli) for the rest of the day.`;
    } else {
      advice = "Awesome job maintaining your nutrition logs! Your macros are looking balanced. Keep drinking water and fuel up for your training session.";
    }

    const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

    return res.json({
      coachAdvice: advice,
      motivation: randomMotivation,
      suggestions: suggestions.slice(0, 3), // return top 3 suggestions
      dailyTotals: totals,
      goals: user.goals
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error generating AI suggestions' });
  }
});

// @desc    Get weekly analytics summary and suggestions
// @route   GET /api/ai/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    let logs;
    if (process.env.MOCK_DB === 'true') {
      logs = mealsMemory
        .filter((m) => m.user.toString() === req.user._id.toString())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 100);
    } else {
      // Fetch last 7 days of logs
      logs = await MealLog.find({
        user: req.user._id,
      }).sort({ date: -1 }).limit(100);
    }

    // Group logs by date
    const grouped = {};
    logs.forEach(meal => {
      if (!grouped[meal.date]) {
        grouped[meal.date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      grouped[meal.date].calories += meal.calories;
      grouped[meal.date].protein += meal.protein;
      grouped[meal.date].carbs += meal.carbs;
      grouped[meal.date].fats += meal.fats;
    });

    const dates = Object.keys(grouped).sort();
    const analyticsData = dates.map(date => ({
      date,
      ...grouped[date]
    }));

    // Calculate averages
    let avgCalories = 0;
    let avgProtein = 0;
    let avgCarbs = 0;
    let avgFats = 0;

    if (dates.length > 0) {
      const sum = dates.reduce((acc, date) => {
        acc.calories += grouped[date].calories;
        acc.protein += grouped[date].protein;
        acc.carbs += grouped[date].carbs;
        acc.fats += grouped[date].fats;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

      avgCalories = Math.round(sum.calories / dates.length);
      avgProtein = Math.round(sum.protein / dates.length);
      avgCarbs = Math.round(sum.carbs / dates.length);
      avgFats = Math.round(sum.fats / dates.length);
    }

    // AI Insight
    let insight = "No nutrition data logged yet. Start logging your meals to unlock detailed macro-analytics and coaching insight!";
    if (dates.length > 0) {
      const calorieGap = req.user.goals.calories - avgCalories;
      const proteinGap = req.user.goals.protein - avgProtein;

      if (Math.abs(calorieGap) <= 150 && Math.abs(proteinGap) <= 15) {
        insight = "Fantastic consistency! Your 7-day average calories and protein are almost exactly on target. This level of precise fueling will maximize your body composition goals.";
      } else if (proteinGap > 20) {
        insight = `Your 7-day average protein is ${avgProtein}g, which is ${Math.round(proteinGap)}g below your daily target of ${req.user.goals.protein}g. Boosting protein will accelerate muscle recovery, raise your metabolic rate, and improve satiety. Try adding high-quality protein snacks.`;
      } else if (calorieGap > 300) {
        insight = `You are running a significant caloric deficit relative to your settings (average: ${avgCalories} kcal, target: ${req.user.goals.calories} kcal). If your goal is muscle building or maintenance, ensure you eat enough carbs and healthy fats to fuel your workouts.`;
      } else if (calorieGap < -200) {
        insight = `Your weekly calorie average (${avgCalories} kcal) exceeds your daily goal (${req.user.goals.calories} kcal). To optimize fat loss, focus on fiber-dense green vegetables, lean meats, and drink plenty of water to control portion sizes.`;
      } else {
        insight = `You are maintaining a steady pace. Average daily intake is ${avgCalories} kcal (Protein: ${avgProtein}g, Carbs: ${avgCarbs}g, Fats: ${avgFats}g). Keep monitoring how you feel during workouts and adjust your macro ratios as needed.`;
      }
    }

    return res.json({
      analyticsData,
      averages: {
        calories: avgCalories,
        protein: avgProtein,
        carbs: avgCarbs,
        fats: avgFats
      },
      insight,
      daysLogged: dates.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error generating weekly analytics' });
  }
});

export default router;
