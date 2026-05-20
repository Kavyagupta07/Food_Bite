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
  Line 
} from 'recharts';
import { Brain, TrendingUp, BarChart3, HelpCircle, Activity } from 'lucide-react';
import { fetchAIAnalytics } from '../services/api';

const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAnalytics();
  }, [user]);

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
    if (item.date.includes('-')) {
      const parts = item.date.split('-');
      return {
        ...item,
        date: `${parts[1]}/${parts[2]}` // MM/DD
      };
    }
    return item;
  });

  const averages = hasLoggedData ? analytics.averages : {
    calories: 2261,
    protein: 164,
    carbs: 229,
    fats: 70
  };

  const calorieTarget = user?.goals?.calories || 2000;
  const proteinTarget = user?.goals?.protein || 150;

  const weeklyInsight = hasLoggedData 
    ? analytics.insight 
    : "Awesome baseline log simulated! You average 164g of protein daily against your target of 150g. Having protein consistently above threshold supports lean tissue maintenance. Calorie average is slightly above target: prioritize high-fiber vegetables during dinner to manage satiety.";

  return (
    <div className="flex-1 min-h-screen bg-brand-black md:pl-64 pb-24 md:pb-12 text-white relative">
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
              <p className="font-bold text-white text-xs">VISUALIZING ATHLETE PRESETS</p>
              <p className="text-xs text-brand-textMuted leading-relaxed mt-0.5">
                You haven't logged food across multiple days yet. Showing a 7-day athlete profile demo so you can evaluate the charts and AI coach insight layout. Keep logging to render your actual logs!
              </p>
            </div>
          </div>
        )}

        {/* 1. AI ADVISOR INSIGHT BOX */}
        <div className="glass-panel p-6 rounded-3xl border border-brand-border relative overflow-hidden bg-gradient-to-br from-brand-charcoal to-brand-charcoal/40 mb-8">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-brand-green animate-pulse" size={20} />
            <h3 className="text-sm font-black uppercase tracking-wider">AI Athlete Advisor</h3>
          </div>
          
          <div className="p-4 bg-brand-black/60 border border-brand-border/60 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium">
            <p className="text-brand-green font-bold text-xs uppercase tracking-wider mb-2">Performance Audit</p>
            {weeklyInsight}
          </div>
        </div>

        {/* 2. WEEKLY AVERAGES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-brand-border text-center">
            <span className="block text-2xl font-black text-brand-green">{averages.calories}</span>
            <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Avg Calories</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-brand-border text-center">
            <span className="block text-2xl font-black text-white">{averages.protein}g</span>
            <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Avg Protein</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-brand-border text-center">
            <span className="block text-2xl font-black text-white">{averages.carbs}g</span>
            <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Avg Carbs</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-brand-border text-center">
            <span className="block text-2xl font-black text-white">{averages.fats}g</span>
            <span className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">Avg Fats</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} />
                  <YAxis stroke="#666" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
                  />
                  <Bar dataKey="calories" name="Consumed" fill="#9D73E6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} />
                  <YAxis stroke="#666" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#FFF' }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
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
