import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { Brain, TrendingUp, BarChart3, HelpCircle, Activity, Dumbbell, Coffee, Flame } from 'lucide-react';
import { fetchAIAnalytics } from '../services/api';

const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workoutDays, setWorkoutDays] = useState(['Tue', 'Thu', 'Sat']);
  const [simCalorieTarget, setSimCalorieTarget] = useState(2000);
  const [simProteinTarget, setSimProteinTarget] = useState(150);
  const navigate = useNavigate();

  // Pre-fill fallback chart data if user hasn't logged anything yet (for visual layout mockup)
  const defaultChartData = [
    { date: 'Mon', calories: 2100, protein: 145, carbs: 210, fats: 65 },
    { date: 'Tue', calories: 2350, protein: 172, carbs: 240, fats: 72 },
    { date: 'Wed', calories: 1950, protein: 155, carbs: 190, fats: 58 },
    { date: 'Thu', calories: 2480, protein: 182, carbs: 260, fats: 78 },
    { date: 'Fri', calories: 2200, protein: 160, carbs: 220, fats: 70 },
    { date: 'Sat', calories: 2600, protein: 190, carbs: 270, fats: 85 },
    { date: 'Sun', calories: 2150, protein: 150, carbs: 215, fats: 68 },
  ];

  const hasLoggedData = analytics && analytics.analyticsData && analytics.analyticsData.length > 0;
  const rawChartData = hasLoggedData ? analytics.analyticsData : defaultChartData;

  // Format dates for display on XAxis
  const chartData = rawChartData.map(item => {
    if (item.date && item.date.includes('-')) {
      const parts = item.date.split('-');
      return {
        ...item,
        date: `${parts[1]}/${parts[2]}` // MM/DD
      };
    }
    return item;
  });

  useEffect(() => {
    if (user?.goals) {
      setSimCalorieTarget(user.goals.calories || 2000);
      setSimProteinTarget(user.goals.protein || 150);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAnalytics();
  }, [user]);

  // Sync default workout days based on dates
  useEffect(() => {
    if (chartData.length > 0) {
      const isDemo = chartData.some(d => d.date && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(d.date));
      if (isDemo) {
        setWorkoutDays(['Tue', 'Thu', 'Sat']);
      } else {
        const defaults = chartData
          .filter((_, idx) => idx % 2 === 1)
          .map(d => d.date);
        setWorkoutDays(defaults);
      }
    }
  }, [analytics]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAIAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-brand-black md:pl-64 py-10 px-6 flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin"></div>
        <p className="mt-4 text-brand-textMuted text-sm font-semibold tracking-wider uppercase animate-pulse">Analyzing Weekly Performance...</p>
      </div>
    );
  }

  const averages = hasLoggedData ? analytics.averages : {
    calories: 2261,
    protein: 164,
    carbs: 229,
    fats: 70
  };

  const calorieTarget = simCalorieTarget;
  const proteinTarget = simProteinTarget;

  const weeklyInsight = hasLoggedData 
    ? analytics.insight 
    : "Awesome baseline log simulated! You average 164g of protein daily against your target of 150g. Having protein consistently above threshold supports lean tissue maintenance. Calorie average is slightly above target: prioritize high-fiber vegetables during dinner to manage satiety.";

  const toggleWorkoutDay = (dateStr) => {
    setWorkoutDays(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr]
    );
  };

  const workoutData = chartData.filter(d => workoutDays.includes(d.date));
  const restData = chartData.filter(d => !workoutDays.includes(d.date));

  const computeAverages = (dataList) => {
    if (dataList.length === 0) return null;
    const totals = dataList.reduce((acc, curr) => {
      acc.calories += curr.calories || 0;
      acc.protein += curr.protein || 0;
      acc.carbs += curr.carbs || 0;
      acc.fats += curr.fats || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return {
      calories: Math.round(totals.calories / dataList.length),
      protein: Math.round(totals.protein / dataList.length),
      carbs: Math.round(totals.carbs / dataList.length),
      fats: Math.round(totals.fats / dataList.length)
    };
  };

  const workoutAverages = computeAverages(workoutData);
  const restAverages = computeAverages(restData);

  const generateWorkoutSplitInsight = () => {
    if (!workoutAverages && !restAverages) {
      return "Designate training or recovery days to audit your splits.";
    }

    let report = "";
    if (workoutAverages) {
      const proteinStatus = workoutAverages.protein >= proteinTarget 
        ? "excellent high-protein replication" 
        : "slightly low protein density";
      report += `On training days, you averaged ${workoutAverages.calories} calories and ${workoutAverages.protein}g of protein (target: ${proteinTarget}g). This represents ${proteinStatus} for muscle protein synthesis and recovery. `;
    }

    if (restAverages) {
      const taperAmount = calorieTarget - restAverages.calories;
      if (taperAmount > 150) {
        report += `On rest days, you naturally tapered down to ${restAverages.calories} calories (a difference of -${taperAmount} kcal under target), producing a smart caloric taper to support body-fat management.`;
      } else if (taperAmount < 0) {
        report += `On rest days, your average of ${restAverages.calories} calories exceeds your daily target. Tapering energy slightly on recovery days will optimize insulin sensitivity.`;
      } else {
        report += `Your rest day average of ${restAverages.calories} calories is highly consistent and provides stable recovery refueling.`;
      }
    }

    return report;
  };

  const splitInsight = generateWorkoutSplitInsight();

  return (
    <div className="flex-1 min-h-screen bg-brand-black md:pl-64 pb-24 md:pb-12 text-brand-charcoal relative">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">MACRO ANALYTICS</h1>
          <p className="text-sm text-brand-textMuted">Evaluate your historical meal tracking trends, caloric consistency, and get AI performance breakdowns.</p>
        </div>

        {/* Mock Data Banner Notification */}
        {!hasLoggedData && (
          <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-2xl flex items-start gap-3 mb-8 text-sm">
            <Activity className="text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brand-charcoal text-xs">VISUALIZING ATHLETE PRESETS</p>
              <p className="text-xs text-brand-textMuted leading-relaxed mt-0.5">
                You haven't logged food across multiple days yet. Showing a 7-day athlete profile demo so you can evaluate the charts and AI coach insight layout. Keep logging to render your actual logs!
              </p>
            </div>
          </div>
        )}

        {/* Header Grid: Advisor + Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI ADVISOR INSIGHT BOX */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-border relative overflow-hidden text-brand-charcoal lg:col-span-2 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full blur-xl pointer-events-none"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="text-brand-green animate-pulse" size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-charcoal">AI Athlete Advisor</h3>
              </div>
              
              <div className="p-4 bg-brand-charcoal/5 border border-brand-charcoal/10 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium text-brand-charcoal space-y-3">
                <div>
                  <p className="text-brand-green font-bold text-xs uppercase tracking-wider mb-1">Weekly Baseline Audit</p>
                  <p className="text-brand-textMuted">{weeklyInsight}</p>
                </div>
                {splitInsight && (
                  <div className="pt-3 border-t border-brand-charcoal/10">
                    <p className="text-brand-green font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Flame size={13} className="animate-pulse text-brand-green" /> Workout vs Recovery Audit
                    </p>
                    <p className="text-brand-charcoal font-semibold">{splitInsight}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Goal Simulator Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-border relative overflow-hidden flex flex-col justify-between text-brand-charcoal">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full blur-xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-brand-green" size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider text-brand-charcoal">Goal Simulator</h3>
              </div>
              <p className="text-[10px] text-brand-textMuted leading-relaxed mb-4">
                Slide to simulate custom energy budgets. All targets, checks, and AI advice adjust instantly.
              </p>
              
              <div className="space-y-4">
                {/* Calorie Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                    <span>Calories</span>
                    <span className="text-brand-green font-black">{simCalorieTarget} Kcal</span>
                  </div>
                  <input 
                    type="range"
                    min="1200"
                    max="4000"
                    step="50"
                    value={simCalorieTarget}
                    onChange={(e) => setSimCalorieTarget(Number(e.target.value))}
                    className="w-full h-1.5 bg-brand-charcoal/10 rounded-lg appearance-none cursor-pointer accent-brand-green"
                  />
                </div>

                {/* Protein Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                    <span>Protein</span>
                    <span className="text-brand-green font-black">{simProteinTarget}g</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="250"
                    step="5"
                    value={simProteinTarget}
                    onChange={(e) => setSimProteinTarget(Number(e.target.value))}
                    className="w-full h-1.5 bg-brand-charcoal/10 rounded-lg appearance-none cursor-pointer accent-brand-green"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-charcoal/10 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-textMuted">
                <span>Focus Mode:</span>
                <span className="text-brand-green">
                  {simCalorieTarget < 1800 ? 'Fat Loss / Cut' : simCalorieTarget > 2600 ? 'Anabolic Bulk' : 'Recomp / Active'}
                </span>
              </div>
              
              {/* Unique Target Aligned Success Badge */}
              {((workoutAverages && Math.abs(workoutAverages.calories - simCalorieTarget) <= 100) || 
                (restAverages && Math.abs(restAverages.calories - simCalorieTarget) <= 100)) ? (
                <div className="p-2 bg-brand-green/20 border border-brand-green text-brand-charcoal rounded-xl text-center text-[9px] font-black uppercase tracking-widest animate-bounce mt-1 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(210,182,138,0.3)]">
                  <span>🎉 Target Aligned with Logs!</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* 1b. INTERACTIVE WORKOUT DAY CLASSIFIER WIDGET */}
        <div className="glass-panel p-6 rounded-3xl border border-brand-border mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-brand-charcoal">
                <Dumbbell className="text-brand-green" size={18} /> Workout Day Classifier
              </h3>
              <p className="text-xs text-brand-textMuted mt-1">
                Tap dates below to toggle active workout days. Averages, charts, and AI advice splits recalculate instantly.
              </p>
            </div>
            
            {/* Quick Presets */}
            <div className="flex gap-2">
              <button 
                onClick={() => setWorkoutDays(chartData.map(d => d.date))}
                className="py-1 px-3 bg-brand-charcoal/5 border border-brand-charcoal/10 hover:border-brand-green/30 text-brand-charcoal font-bold text-[10px] rounded-lg transition-colors uppercase tracking-wider"
              >
                All Training
              </button>
              <button 
                onClick={() => setWorkoutDays([])}
                className="py-1 px-3 bg-brand-charcoal/5 border border-brand-charcoal/10 hover:border-brand-green/30 text-brand-charcoal font-bold text-[10px] rounded-lg transition-colors uppercase tracking-wider"
              >
                All Recovery
              </button>
            </div>
          </div>

          {/* Calendar row of active dates */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mt-5">
            {chartData.map((item, idx) => {
              const isWorkout = workoutDays.includes(item.date);
              return (
                <button
                  key={idx}
                  onClick={() => toggleWorkoutDay(item.date)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group ${
                    isWorkout
                      ? 'bg-brand-green/10 border-brand-green text-brand-charcoal shadow-[0_0_15px_rgba(210,182,138,0.15)]'
                      : 'bg-brand-charcoal/5 border-brand-charcoal/10 hover:border-brand-green/40 text-brand-textMuted'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.date}</span>
                  {isWorkout ? (
                    <Dumbbell size={16} className="text-brand-green animate-pulse" />
                  ) : (
                    <Coffee size={16} className="text-brand-textMuted opacity-70 group-hover:opacity-100" />
                  )}
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                    isWorkout ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-charcoal/10 text-brand-textMuted'
                  }`}>
                    {isWorkout ? 'Workout' : 'Rest'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. DUAL-CATEGORY SPLIT COMPARISON GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Workout Days Card */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-green/30 bg-brand-green/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/10 rounded-bl-full blur-xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-brand-green/20 text-brand-green rounded-xl border border-brand-green/30">
                  <Dumbbell size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-brand-charcoal">Workout Day Fueling</h4>
                  <p className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">
                    {workoutData.length} {workoutData.length === 1 ? 'day' : 'days'} active
                  </p>
                </div>
              </div>
              
              {workoutAverages ? (
                <div className="grid grid-cols-4 gap-2 text-center mt-6">
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-green">{workoutAverages.calories}</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Kcal</span>
                  </div>
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-charcoal">{workoutAverages.protein}g</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Protein</span>
                  </div>
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-charcoal">{workoutAverages.carbs}g</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Carbs</span>
                  </div>
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-charcoal">{workoutAverages.fats}g</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Fats</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-brand-textMuted font-bold uppercase tracking-wider">
                  No workout days selected
                </div>
              )}
            </div>
            {workoutAverages && (
              <div className="mt-4 pt-3 border-t border-brand-green/20 text-[10px] text-brand-textMuted flex justify-between items-center">
                <span>Workout Calorie Target:</span>
                <span className={`font-black ${workoutAverages.calories >= calorieTarget ? 'text-brand-green' : 'text-orange-500'}`}>
                  {workoutAverages.calories} / {calorieTarget} Kcal
                </span>
              </div>
            )}
          </div>

          {/* Rest Days Card */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-border bg-brand-charcoal/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-charcoal/5 rounded-bl-full blur-xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-brand-charcoal/10 text-brand-charcoal rounded-xl border border-brand-charcoal/10">
                  <Coffee size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-brand-charcoal">Recovery Day Fueling</h4>
                  <p className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">
                    {restData.length} {restData.length === 1 ? 'day' : 'days'} active
                  </p>
                </div>
              </div>
              
              {restAverages ? (
                <div className="grid grid-cols-4 gap-2 text-center mt-6">
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-green">{restAverages.calories}</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Kcal</span>
                  </div>
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-charcoal">{restAverages.protein}g</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Protein</span>
                  </div>
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-charcoal">{restAverages.carbs}g</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Carbs</span>
                  </div>
                  <div className="p-2 bg-brand-black/50 border border-brand-border/20 rounded-xl">
                    <span className="block text-base font-black text-brand-charcoal">{restAverages.fats}g</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold">Fats</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-brand-textMuted font-bold uppercase tracking-wider">
                  No recovery days selected
                </div>
              )}
            </div>
            {restAverages && (
              <div className="mt-4 pt-3 border-t border-brand-border/20 text-[10px] text-brand-textMuted flex justify-between items-center">
                <span>Recovery Calorie Target:</span>
                <span className={`font-black ${restAverages.calories <= calorieTarget ? 'text-brand-green' : 'text-orange-500'}`}>
                  {restAverages.calories} / {calorieTarget} Kcal
                </span>
              </div>
            )}
          </div>

        </div>

        {/* 3. CHART GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Calorie Trend Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-green" /> Caloric Consistency
            </h3>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 32, 82, 0.15)" />
                  <XAxis dataKey="date" stroke="#222052" fontSize={11} tickLine={false} />
                  <YAxis stroke="#222052" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', borderColor: 'rgba(34, 32, 82, 0.15)', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#222052' }}
                  />
                  <Bar dataKey="calories" name="Consumed" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const isWorkout = workoutDays.includes(entry.date);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isWorkout ? '#D2B68A' : '#222052'} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Bar Legend */}
            <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-green"></span>
                <span className="text-brand-charcoal">Workout Day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-charcoal"></span>
                <span className="text-brand-textMuted">Rest Day</span>
              </div>
            </div>
            <p className="text-[10px] text-brand-textMuted text-center font-medium">Daily calorie log counts compared on a 7-day scale</p>
          </div>

          {/* Macro Breakdown Trend */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={16} className="text-brand-green" /> Macro Trends (grams)
            </h3>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 32, 82, 0.15)" />
                  <XAxis dataKey="date" stroke="#222052" fontSize={11} tickLine={false} />
                  <YAxis stroke="#222052" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFF', borderColor: 'rgba(34, 32, 82, 0.15)', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#222052' }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11, color: '#222052' }} />
                  <Line type="monotone" dataKey="protein" name="Protein" stroke="#9D73E6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="carbs" name="Carbs" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="fats" name="Fats" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-brand-textMuted text-center font-medium">Protein, Carbs, and Fats daily trends mapped</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Analytics;
