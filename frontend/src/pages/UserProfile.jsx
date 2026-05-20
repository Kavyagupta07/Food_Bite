import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Dumbbell, Scale, Activity, Save, Award, BrainCircuit, ShieldCheck, Camera, Upload, Link2 } from 'lucide-react';
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

  const [profilePicture, setProfilePicture] = useState('');

  const avatarTemplates = [
    { name: 'Iron Lifter', value: 'avatar_iron_lifter', emoji: '🏋️‍♂️', bg: 'from-emerald-500 to-teal-700' },
    { name: 'Speed Runner', value: 'avatar_speed_runner', emoji: '🏃‍♀️', bg: 'from-amber-500 to-rose-600' },
    { name: 'Yoga Zen', value: 'avatar_yoga_zen', emoji: '🧘', bg: 'from-indigo-500 to-violet-700' },
    { name: 'Cycle Pro', value: 'avatar_cycle_pro', emoji: '🚴', bg: 'from-cyan-400 to-sky-600' },
    { name: 'Nutrition Guru', value: 'avatar_nutrition_guru', emoji: '🥗', bg: 'from-emerald-400 to-green-600' },
    { name: 'Beast Mode', value: 'avatar_beast_mode', emoji: '🥊', bg: 'from-rose-500 to-red-800' }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setWeight(user.weight || 70);
    setHeight(user.height || 175);
    setAge(user.age || 25);
    setGender(user.gender || 'male');
    setActivityLevel(user.activityLevel || 'moderately_active');
    setProfilePicture(user.profilePicture || '');
    
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // Limit size to ~2MB for storage
        setErrorMsg('Selected image is too large! Please choose an image smaller than 2MB.');
        setTimeout(() => setErrorMsg(''), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderAvatar = (urlOrTemplate, nameString, sizeClass = "w-24 h-24 text-3xl") => {
    if (urlOrTemplate && urlOrTemplate.startsWith('template:')) {
      const templateKey = urlOrTemplate.split(':')[1];
      const template = avatarTemplates.find(t => t.value === templateKey) || avatarTemplates[0];
      return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br ${template.bg} flex items-center justify-center border-2 border-brand-green font-bold shadow-lg shrink-0 transform hover:scale-105 transition-all duration-300`}>
          <span>{template.emoji}</span>
        </div>
      );
    } else if (urlOrTemplate) {
      return (
        <img
          src={urlOrTemplate}
          alt="Avatar"
          className={`${sizeClass} rounded-full object-cover border-2 border-brand-green shadow-lg shrink-0 transform hover:scale-105 transition-all duration-300`}
        />
      );
    } else {
      return (
        <div className={`${sizeClass} rounded-full bg-brand-green/20 border-2 border-brand-green/50 flex items-center justify-center font-black text-brand-green uppercase shrink-0`}>
          {nameString ? nameString[0] : 'U'}
        </div>
      );
    }
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
      profilePicture,
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
    <div className="flex-1 min-h-screen bg-brand-beige md:pl-64 pb-24 md:pb-12 text-brand-charcoal relative">
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

            {/* Profile Picture Panel */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-6">
              <h2 className="text-base font-bold uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-3">
                <User className="text-brand-green" size={18} /> Profile Picture
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Avatar Preview */}
                <div className="relative group shrink-0">
                  {renderAvatar(profilePicture, name, "w-28 h-28 text-4xl")}
                  <label className="absolute inset-0 bg-brand-charcoal/80 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer border border-brand-green/40">
                    <Camera size={18} className="mb-1 text-brand-green animate-bounce" />
                    <span>Upload Custom</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h3 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-2">Select Fitness Avatar</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {avatarTemplates.map((tmpl) => {
                        const isSelected = profilePicture === `template:${tmpl.value}`;
                        return (
                          <button
                            key={tmpl.value}
                            type="button"
                            onClick={() => setProfilePicture(`template:${tmpl.value}`)}
                            title={tmpl.name}
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tmpl.bg} flex items-center justify-center text-xl shrink-0 transition-all duration-300 relative border-2 ${
                              isSelected ? 'border-brand-charcoal scale-110 shadow-md ring-2 ring-brand-green' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            <span>{tmpl.emoji}</span>
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green text-brand-charcoal rounded-full flex items-center justify-center text-[8px] font-black">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-[1px] bg-brand-border flex-1"></div>
                    <span className="text-[10px] font-bold text-brand-textMuted uppercase">Or</span>
                    <div className="h-[1px] bg-brand-border flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                        <Upload size={12} className="text-brand-green" /> Custom Local File
                      </label>
                      <button
                        type="button"
                        onClick={() => document.getElementById('custom-file-upload').click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-beige border border-brand-border rounded-xl text-xs font-bold text-brand-charcoal hover:bg-brand-charcoal hover:text-white transition-all cursor-pointer"
                      >
                        <Upload size={14} /> Upload Image File
                      </button>
                      <input
                        id="custom-file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-brand-textMuted uppercase tracking-wider mb-2">
                        <Link2 size={12} className="text-brand-green" /> Custom Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={profilePicture && !profilePicture.startsWith('template:') && !profilePicture.startsWith('data:') ? profilePicture : ''}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold cursor-pointer"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                    Training Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold cursor-pointer"
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green hover:bg-brand-green hover:text-brand-charcoal font-bold text-xs transition-all duration-300"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
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
                    className="w-full px-4 py-3 bg-brand-beige border border-brand-border rounded-xl focus:outline-none focus:border-brand-green text-brand-charcoal text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Save trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-fit px-8 py-4 bg-brand-green text-brand-charcoal font-bold rounded-2xl hover:bg-brand-charcoal hover:text-white hover:scale-105 transition-all text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving adjustments...' : 'Save Settings'}
            </button>

          </div>

          {/* RIGHT COLUMN: BMI Status Box */}
          <div className="space-y-8">
            
            {/* BMI status widget */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border relative overflow-hidden space-y-6 text-brand-charcoal">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-brand-border/40 pb-3">
                <Activity className="text-brand-green" size={16} /> Body Mass Index (BMI)
              </h2>

              <div className="text-center py-4">
                <span className="block text-5xl font-black text-brand-charcoal mb-2">{bmi}</span>
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
                    <h4 className="text-xs font-bold text-brand-charcoal">Daily Consistency Streak</h4>
                    <p className="text-[10px] text-brand-textMuted mt-0.5">Maintain logging. Current: {user?.streak || 1} day streak.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    💧
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-charcoal font-sans">Hydration Master</h4>
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
