import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dumbbell, Scale, Activity, Save, Award, BrainCircuit, ShieldCheck } from 'lucide-react';
import { updateProfile } from '../services/api';

const UserProfile = ({ user, setUser }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderately_active');
  
  // Goals
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(220);
  const [fats, setFats] = useState(70);
  const [water, setWater] = useState(2500);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Load initial values
    setName(user.name || '');
    setWeight(user.weight || 70);
    setHeight(user.height || 175);
    setAge(user.age || 25);
    setGender(user.gender || 'male');
    setActivityLevel(user.activityLevel || 'moderately_active');
    
    if (user.goals) {
      setCalories(user.goals.calories || 2000);
      setProtein(user.goals.protein || 150);
      setCarbs(user.goals.carbs || 220);
      setFats(user.goals.fats || 70);
      setWater(user.goals.water || 2500);
    }
  }, [user]);

  // BMI Calculation
  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : 0;
  
  let bmiCategory = 'Normal';
  let bmiColor = 'text-brand-green border-brand-green/20 bg-brand-green/10';
  let bmiIndicatorOffset = '50%'; // positioning on scale slider
  
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-blue-400 border-blue-500/20 bg-blue-500/10';
    bmiIndicatorOffset = '15%';
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = 'Normal Weight';
    bmiColor = 'text-brand-green border-brand-green/20 bg-brand-green/10';
    bmiIndicatorOffset = '40%';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    bmiIndicatorOffset = '65%';
  } else {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-400 border-red-500/20 bg-red-500/10';
    bmiIndicatorOffset = '88%';
  }

  // Auto macro generator helper (Gym-focused formula)
  const calculateRecommendedMacros = () => {
    // Bodybuilder formula: 2.2g Protein per kg, 20-25% Calories from Fats, rest Carbs
    let suggestedCalories = 2200;
    
    // Basal Metabolic Rate estimation (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') bmr += 5;
    else bmr -= 161;

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    
    const factor = activityMultipliers[activityLevel] || 1.55;
    suggestedCalories = Math.round(bmr * factor);

    // Protein: 2.2g per kg
    const suggestedProtein = Math.round(weight * 2.2);
    // Fats: 25% of calories
    const suggestedFats = Math.round((suggestedCalories * 0.25) / 9);
    // Carbs: Remaining calories
    const proteinCal = suggestedProtein * 4;
    const fatCal = suggestedFats * 9;
    const suggestedCarbs = Math.round((suggestedCalories - (proteinCal + fatCal)) / 4);

    setCalories(suggestedCalories);
    setProtein(suggestedProtein);
    setCarbs(suggestedCarbs);
    setFats(suggestedFats);
    setWater(gender === 'male' ? 3200 : 2500);

    setSuccessMsg('Successfully computed athletic macro recommendations!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const profileData = {
      name,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      gender,
      activityLevel,
      goals: {
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
        water: Number(water),
      }
    };

    try {
      const data = await updateProfile(profileData);
      localStorage.setItem('bite_user', JSON.stringify(data));
      setUser(data);
      setSuccessMsg('Profile settings updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save profile. Verify backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-black md:pl-64 pb-24 md:pb-12 text-white relative">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">ATHLETE PROFILE</h1>
          <p className="text-sm text-brand-textMuted">Configure your physical dimensions, compute metabolic rates, and personalize your anabolic macro limits.</p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Success/Error Feedback */}
            {successMsg && (
              <div className="p-4 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-2xl flex items-center gap-3 text-sm font-bold animate-pulse">
                <ShieldCheck size={18} />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl flex items-center gap-3 text-sm">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Dimensions */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-5">
              <h2 className="text-base font-bold uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
                <Scale className="text-brand-green" size={18} /> Physical Dimensions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Athlete Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(10, parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(Math.max(50, parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Training Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold cursor-pointer"
                  >
                    <option value="sedentary">Sedentary (No training)</option>
                    <option value="lightly_active">Lightly Active (1-2 days/wk)</option>
                    <option value="moderately_active">Moderately Active (3-5 days/wk)</option>
                    <option value="very_active">Very Active (6-7 Heavy Lift/wk)</option>
                    <option value="extra_active">Extra Active (2x Daily Athlete)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Goals */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border pb-3">
                <h2 className="text-base font-bold uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell className="text-brand-green" size={18} /> Nutrition Targets
                </h2>
                <button
                  type="button"
                  onClick={calculateRecommendedMacros}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green hover:bg-brand-green hover:text-black font-bold text-xs transition-all duration-300"
                >
                  <BrainCircuit size={13} /> Compute Anabolic Targets
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Calorie Cap (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(Math.max(100, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Protein Goal (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={protein}
                    onChange={(e) => setProtein(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Carbs Goal (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={carbs}
                    onChange={(e) => setCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Fats Goal (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={fats}
                    onChange={(e) => setFats(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Hydration Goal (ml)
                  </label>
                  <input
                    type="number"
                    required
                    step="100"
                    value={water}
                    onChange={(e) => setWater(Math.max(100, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-white text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Save trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-fit px-8 py-4 bg-brand-green text-black font-bold rounded-2xl hover:bg-white hover:scale-105 transition-all text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving adjustments...' : 'Save Settings'}
            </button>

          </div>

          {/* RIGHT COLUMN: BMI Status Box */}
          <div className="space-y-8">
            
            {/* BMI status widget */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border relative overflow-hidden bg-gradient-to-br from-brand-charcoal to-brand-charcoal/40 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-brand-border/40 pb-3">
                <Activity className="text-brand-green" size={16} /> Body Mass Index (BMI)
              </h2>

              <div className="text-center py-4">
                <span className="block text-5xl font-black text-white mb-2">{bmi}</span>
                <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold ${bmiColor}`}>
                  {bmiCategory}
                </span>
              </div>

              {/* Graphical representation gauge */}
              <div className="space-y-2 relative">
                <div className="w-full h-2.5 bg-brand-gray border border-brand-border rounded-full flex overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '25%' }}></div>
                  <div className="h-full bg-brand-green" style={{ width: '25%' }}></div>
                  <div className="h-full bg-amber-500" style={{ width: '25%' }}></div>
                  <div className="h-full bg-red-500" style={{ width: '25%' }}></div>
                </div>
                
                {/* Gauge marker */}
                <div 
                  className="absolute top-[-8px] w-4 h-4 bg-white border border-brand-black rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500"
                  style={{ left: `calc(${bmiIndicatorOffset} - 8px)` }}
                ></div>
                
                <div className="flex justify-between text-[8px] text-brand-textMuted font-bold uppercase tracking-wider pt-1">
                  <span>&lt;18.5</span>
                  <span>18.5-24.9</span>
                  <span>25-29.9</span>
                  <span>30+</span>
                </div>
              </div>
            </div>

            {/* Streak milestones */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-brand-border/40 pb-3">
                <Award className="text-brand-green" size={16} /> Fitness Milestones
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green flex items-center justify-center font-bold text-sm shrink-0">
                    🔥
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Daily Consistency Streak</h4>
                    <p className="text-[10px] text-brand-textMuted mt-0.5">Maintain logging. Current: {user?.streak || 1} day streak.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    💧
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans">Hydration Master</h4>
                    <p className="text-[10px] text-brand-textMuted mt-0.5">Reach your hydration goals for 7 consecutive days.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default UserProfile;
