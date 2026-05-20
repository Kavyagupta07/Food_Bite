// In-memory data store for Bite application when MongoDB is unavailable

export const usersMemory = [
  {
    _id: 'mock_user_1',
    name: 'Gym Lover',
    email: 'demo@bite.com',
    password: 'password123', // plaintext for quick demo matching
    weight: 75,
    height: 180,
    age: 26,
    gender: 'male',
    activityLevel: 'very_active',
    goals: {
      calories: 2500,
      protein: 180,
      carbs: 250,
      fats: 80,
      water: 3000,
    },
    streak: 5,
    lastLogDate: new Date().toISOString().split('T')[0],
    profilePicture: ''
  }
];

export const mealsMemory = [
  {
    _id: 'mock_meal_1',
    user: 'mock_user_1',
    mealName: 'Scrambled Eggs & Whole Wheat Toast',
    calories: 320,
    protein: 22,
    carbs: 24,
    fats: 14,
    servingSize: '1 plate',
    mealType: 'breakfast',
    date: new Date().toISOString().split('T')[0],
  },
  {
    _id: 'mock_meal_2',
    user: 'mock_user_1',
    mealName: 'Grilled Chicken, Rice and Broccoli',
    calories: 550,
    protein: 48,
    carbs: 65,
    fats: 8,
    servingSize: '350g serving',
    mealType: 'lunch',
    date: new Date().toISOString().split('T')[0],
  },
  {
    _id: 'mock_meal_3',
    user: 'mock_user_1',
    mealName: 'Protein Shake & Banana',
    calories: 250,
    protein: 30,
    carbs: 30,
    fats: 2,
    servingSize: '1 shake + 1 banana',
    mealType: 'snack',
    date: new Date().toISOString().split('T')[0],
  },
  {
    _id: 'mock_meal_4',
    user: 'mock_user_1',
    mealName: 'Salmon with Quinoa',
    calories: 620,
    protein: 45,
    carbs: 55,
    fats: 20,
    servingSize: '300g serving',
    mealType: 'dinner',
    date: new Date().toISOString().split('T')[0],
  },
  {
    _id: 'mock_meal_5',
    user: 'mock_user_1',
        mealName: 'Greek Yogurt with Berries',
        calories: 180,
        protein: 12,
        carbs: 25,
        fats: 2,
        servingSize: '1 cup',
        mealType: 'snack',
        date: new Date().toISOString().split('T')[0],
    },
    {
        _id: 'mock_meal_6',
        user: 'mock_user_1',
        mealName: 'Beef Stir Fry with Veggies',
        calories: 700,
        protein: 55,
        carbs: 60,
        fats: 30,
        servingSize: '400g',
        mealType: 'dinner',
        date: new Date().toISOString().split('T')[0],
    }
];

export const waterMemory = [
  {
    _id: 'mock_water_1',
    user: 'mock_user_1',
    amount: 500,
    date: new Date().toISOString().split('T')[0]
  },
  {
    _id: 'mock_water_2',
    user: 'mock_user_1',
    amount: 750,
    date: new Date().toISOString().split('T')[0]
  }
];
