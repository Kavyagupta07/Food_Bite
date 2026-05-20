import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Coffee, 
  Utensils, 
  Moon, 
  Sparkles, 
  Droplet, 
  TrendingUp, 
  Brain,
  RotateCcw,
  PlusCircle
} from 'lucide-react';
import { 
  fetchLoggedMeals, 
  fetchWaterIntake, 
  logWater, 
  deleteWater, 
  deleteMeal, 
  fetchAISuggestions 
} from '../services/api';

const Dashboard = ({ user, setUser }) => {
  const [meals, setMeals] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [coachData, setCoachData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [date, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const mealsData = await fetchLoggedMeals(date);
      const waterData = await fetchWaterIntake(date);
      const aiData = await fetchAISuggestions();
      setMeals(mealsData);
      setWaterLogs(waterData);
      setCoachData(aiData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const calorieTarget = user?.goals?.calories || 2000;
  const proteinTarget = user?.goals?.protein || 150;
  const carbsTarget = user?.goals?.carbs || 220;
  const fatsTarget = user?.goals?.fats || 70;
  const waterTarget = user?.goals?.water || 2500;

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = meals.reduce((acc, m) => acc + m.fats, 0);
  const totalWater = waterLogs.reduce((acc, w) => acc + w.amount, 0);

  const calPercent = Math.min(Math.round((totalCalories / calorieTarget) * 100), 100);
  const protPercent = Math.min(Math.round((totalProtein / proteinTarget) * 100), 100);
  const carbPercent = Math.min(Math.round((totalCarbs / carbsTarget) * 100), 100);
  const fatPercent = Math.min(Math.round((totalFats / fatsTarget) * 100), 100);
  const waterPercent = Math.min(Math.round((totalWater / waterTarget) * 100), 100);

  const handleAddWater = async (amount) => {
    setActionLoading(true);
    try {
      const newWater = await logWater({ amount, date });
      setWaterLogs([...waterLogs, newWater]);
      // Update local water total
      const updatedLogs = [...waterLogs, newWater];
      const sumWater = updatedLogs.reduce((acc, w) => acc + w.amount, 0);
      
      // Update advice
      if (coachData) {
        setCoachData({
          ...coachData,
          dailyTotals: { ...coachData.dailyTotals, calories: totalCalories },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearWater = async () => {
    setActionLoading(true);
    try {
      for (const log of waterLogs) {
        await deleteWater(log._id);
      }
      setWaterLogs([]);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMealLog = async (id) => {
    try {
      await deleteMeal(id);
      setMeals(meals.filter(m => m._id !== id));
      // Reload recommendations since foods changed
      const aiData = await fetchAISuggestions();
      setCoachData(aiData);
    } catch (err) {
      console.error(err);
    }
  };

  // Group meals by mealType
  const mealTypes = {
    breakfast: { label: 'Breakfast', icon: Coffee, color: 'text-amber-600' },
    lunch: { label: 'Lunch', icon: Utensils, color: 'text-emerald-600' },
    dinner: { label: 'Dinner', icon: Moon, color: 'text-blue-600' },
    snack: { label: 'Snacks', icon: Sparkles, color: 'text-brand-green' },
  };

  // Circular progress ring setup
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  if (loading && meals.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-brand-beige md:pl-64 py-10 px-6 flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin"></div>
        <p className="mt-4 text-brand-textMuted text-sm font-semibold tracking-wider uppercase animate-pulse">Loading Gym Stats...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-brand-beige md:pl-64 pb-24 md:pb-12 text-brand-charcoal relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Dashboard Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">ATHLETE DASHBOARD</h1>
            <p className="text-sm text-brand-textMuted">Welcome back, <span className="text-brand-charcoal font-bold">{user?.name}</span>. Streak: {user?.streak || 1} 🔥</p>
          </div>
          <div className="flex items-center gap-3 bg-brand-charcoal border border-brand-border rounded-2xl px-4 py-2 text-sm font-medium text-white">
            <span className="text-brand-textMuted">Log Date:</span>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
            />
          </div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/MAIN PANELS: Core Progress and Meal Logs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Primary Calorie and Macro Widget */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-bl-full blur-xl pointer-events-none"></div>
              
              {/* Apple Fitness Calorie Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#E5DCC6"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#D2B68A"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="progress-ring-circle"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{totalCalories}</span>
                  <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">/ {calorieTarget} KCAL</span>
                </div>
              </div>

              {/* Progress Summary and Bar Gauges */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">DAILY MACROS</h2>
                  <span className="text-xs text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-full font-bold">
                    {calPercent}% Calorie Goal
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Protein Gauge */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-brand-textMuted">Protein</span>
                      <span className="text-brand-charcoal font-bold">{Math.round(totalProtein)}g <span className="text-brand-textMuted font-medium">/ {proteinTarget}g</span></span>
                    </div>
                    <div className="w-full h-2 bg-brand-gray rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-green rounded-full transition-all duration-500"
                        style={{ width: `${protPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Carbs Gauge */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-brand-textMuted">Carbs</span>
                      <span className="text-brand-charcoal font-bold">{Math.round(totalCarbs)}g <span className="text-brand-textMuted font-medium">/ {carbsTarget}g</span></span>
                    </div>
                    <div className="w-full h-2 bg-brand-gray rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-charcoal rounded-full transition-all duration-500"
                        style={{ width: `${carbPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fats Gauge */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-brand-textMuted">Fats</span>
                      <span className="text-brand-charcoal font-bold">{Math.round(totalFats)}g <span className="text-brand-textMuted font-medium">/ {fatsTarget}g</span></span>
                    </div>
                    <div className="w-full h-2 bg-brand-gray rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-gray rounded-full transition-all duration-500"
                        style={{ width: `${fatPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Logs Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">LOGGED MEALS</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('/search')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-brand-charcoal font-bold text-xs hover:bg-brand-charcoal hover:text-white transition-colors"
                  >
                    <Plus size={14} /> Add Meal
                  </button>
                </div>
              </div>

              {meals.length === 0 ? (
                <div className="glass-panel p-10 rounded-3xl border border-brand-border text-center flex flex-col items-center justify-center">
                  <div className="p-4 bg-brand-green/10 text-brand-green rounded-full mb-4">
                    <Utensils size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">No meals logged for this date</h3>
                  <p className="text-sm text-brand-textMuted max-w-sm mb-6">Track your breakfast, lunch, dinner, or snacks to start hitting your fitness targets.</p>
                  <button 
                    onClick={() => navigate('/search')}
                    className="px-6 py-2.5 rounded-full border border-brand-green/30 text-brand-charcoal font-bold text-xs hover:bg-brand-green/10 transition-colors"
                  >
                    Log First Meal
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(mealTypes).map(([typeKey, typeInfo]) => {
                    const filteredMeals = meals.filter(m => m.mealType === typeKey);
                    const TypeIcon = typeInfo.icon;
                    if (filteredMeals.length === 0) return null;

                    return (
                      <div key={typeKey} className="glass-panel p-5 rounded-3xl border border-brand-border space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
                          <TypeIcon className={`${typeInfo.color}`} size={18} />
                          <h3 className="text-sm font-bold uppercase tracking-wider">{typeInfo.label}</h3>
                          <span className="text-xs text-brand-textMuted ml-auto font-medium">
                            {filteredMeals.reduce((acc, m) => acc + m.calories, 0)} kcal
                          </span>
                        </div>

                        <div className="divide-y divide-brand-border/40">
                          {filteredMeals.map((meal) => (
                            <div key={meal._id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 group">
                              <div className="min-w-0 flex-1 flex items-center gap-3">
                                {meal.pictureUrl && (
                                  <img 
                                    src={meal.pictureUrl} 
                                    alt={meal.mealName} 
                                    className="w-10 h-10 object-cover rounded-lg border border-brand-border shrink-0"
                                  />
                                )}
                                <div>
                                  <h4 className="font-semibold text-sm truncate text-brand-charcoal">{meal.mealName}</h4>
                                  <p className="text-[10px] text-brand-textMuted mt-0.5">
                                    {meal.servingSize} &bull; P: {meal.protein}g &bull; C: {meal.carbs}g &bull; F: {meal.fats}g
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-brand-green">{meal.calories} kcal</span>
                                <button
                                  onClick={() => handleDeleteMealLog(meal._id)}
                                  className="text-brand-textMuted hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE PANEL: Coach and Water Tracker Widgets */}
          <div className="space-y-8">
            
            {/* AI Coach Insights Box */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border relative overflow-hidden text-brand-charcoal">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-brand-green animate-pulse" size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Bite AI Coach</h3>
              </div>

              {coachData ? (
                <div className="space-y-4 text-sm">
                  <div className="p-3.5 bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-2xl">
                    <p className="text-brand-green font-bold text-xs uppercase tracking-wider mb-1">Live Coaching Tip</p>
                    <p className="text-brand-charcoal text-xs leading-relaxed font-medium">{coachData.coachAdvice}</p>
                  </div>

                  <div className="p-3.5 bg-brand-green/5 border border-brand-green/10 rounded-2xl">
                    <p className="text-brand-green/80 text-xs font-bold uppercase tracking-wider mb-1">Gym Motivation</p>
                    <p className="text-brand-textMuted italic text-xs leading-relaxed">"{coachData.motivation}"</p>
                  </div>

                  {coachData.suggestions && coachData.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-brand-textMuted uppercase font-extrabold tracking-widest">Recommended Meals</p>
                      <div className="space-y-2">
                        {coachData.suggestions.map((sug, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => navigate('/search')}
                            className="p-3 bg-brand-beige border border-brand-border rounded-2xl hover:border-brand-green/30 transition-all cursor-pointer flex justify-between items-center text-brand-charcoal"
                          >
                            <div>
                              <p className="font-bold text-xs text-brand-charcoal">{sug.name}</p>
                              <p className="text-[10px] text-brand-textMuted">P: {sug.protein}g &bull; C: {sug.carbs}g &bull; {sug.calories} kcal</p>
                            </div>
                            <PlusCircle size={14} className="text-brand-green" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-brand-textMuted">Analyzing metrics for workout recommendations...</p>
              )}
            </div>

            {/* Water Tracker Widget */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Droplet className="text-blue-400" size={20} />
                  <h3 className="text-sm font-black uppercase tracking-wider">Hydration Tracker</h3>
                </div>
                <button
                  onClick={handleClearWater}
                  disabled={actionLoading || waterLogs.length === 0}
                  className="text-[10px] text-brand-textMuted hover:text-red-400 flex items-center gap-1 transition-colors uppercase font-bold disabled:opacity-30"
                >
                  <RotateCcw size={10} /> Clear
                </button>
              </div>

              {/* Water statistics */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black">{totalWater}</span>
                  <span className="text-sm font-semibold text-brand-textMuted ml-1">/ {waterTarget} ml</span>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  {waterPercent}% Logged
                </span>
              </div>

              {/* Water progress bar */}
              <div className="w-full h-3 bg-brand-gray rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${waterPercent}%` }}
                ></div>
              </div>

              {/* Water quick action logs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAddWater(250)}
                  className="py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all font-bold text-xs text-blue-300 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> +250ml (Cup)
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAddWater(500)}
                  className="py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all font-bold text-xs text-blue-200 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> +500ml (Bottle)
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
