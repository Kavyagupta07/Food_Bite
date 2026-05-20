import axios from 'axios';

const testStreaksAndPictures = async () => {
  try {
    console.log('1. Registering a new test user...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Streak Tester',
      email: 'streak' + Date.now() + '@bite.com',
      password: 'password123'
    });
    const token = regRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    console.log(`Initial Streak: ${regRes.data.streak}`);

    // Set dates for yesterday and today
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    console.log(`\n2. Logging a meal for YESTERDAY (${yesterdayStr}) with a picture...`);
    const meal1Res = await axios.post('http://localhost:5000/api/meals', {
      mealName: 'Steak and Potatoes',
      calories: 700,
      protein: 55,
      carbs: 45,
      fats: 25,
      servingSize: '1 plate',
      mealType: 'dinner',
      date: yesterdayStr,
      pictureUrl: 'https://example.com/steak-pic.jpg'
    }, config);
    
    console.log(`Meal Logged: ${meal1Res.data.mealName}`);
    console.log(`Saved Picture URL: ${meal1Res.data.pictureUrl}`);

    console.log('\n3. Fetching user profile to check streak...');
    const prof1Res = await axios.get('http://localhost:5000/api/auth/me', config);
    console.log(`Current Streak: ${prof1Res.data.streak} 🔥`);
    console.log(`Last Log Date: ${prof1Res.data.lastLogDate}`);

    console.log(`\n4. Logging a meal for TODAY (${todayStr}) with a picture...`);
    const meal2Res = await axios.post('http://localhost:5000/api/meals', {
      mealName: 'Chicken Salad',
      calories: 400,
      protein: 35,
      carbs: 10,
      fats: 15,
      servingSize: '1 bowl',
      mealType: 'lunch',
      date: todayStr,
      pictureUrl: 'https://example.com/salad-pic.jpg'
    }, config);

    console.log('\n5. Fetching user profile to check if streak increased...');
    const prof2Res = await axios.get('http://localhost:5000/api/auth/me', config);
    console.log(`New Streak: ${prof2Res.data.streak} 🔥`);
    console.log(`Last Log Date: ${prof2Res.data.lastLogDate}`);

    if (prof2Res.data.streak > prof1Res.data.streak) {
      console.log('\n✅ SUCCESS: Streaks are incrementing correctly on consecutive days!');
    }
    
    if (meal1Res.data.pictureUrl === 'https://example.com/steak-pic.jpg') {
      console.log('✅ SUCCESS: Meal pictures are saving and returning perfectly!');
    }

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.response ? err.response.data : err.message);
  }
};

testStreaksAndPictures();
