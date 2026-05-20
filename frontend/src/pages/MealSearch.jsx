import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Utensils, AlertCircle, X, ChevronRight, Apple, Dumbbell } from 'lucide-react';
import { searchMeals, logMeal } from '../services/api';

const MealSearch = ({ user }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal Logging state
  const [selectedFood, setSelectedFood] = useState(null);
  const [multiplier, setMultiplier] = useState(1); // multiplier for serving size
  const [mealType, setMealType] = useState('lunch');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pictureUrl, setPictureUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await searchMeals(query);
      setResults(data);
      if (data.length === 0) {
        setError('No items matching search query found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch food details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openLogModal = (food) => {
    setSelectedFood(food);
    setMultiplier(1);
    setPictureUrl('');
    setSuccessMsg('');
    setError('');
  };

  const closeLogModal = () => {
    setSelectedFood(null);
  };

  const handleLogMeal = async () => {
    if (!selectedFood) return;
    setLogLoading(true);
    setError('');
    setSuccessMsg('');

    const mealData = {
      mealName: selectedFood.name,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fats: Math.round(selectedFood.fats * multiplier * 10) / 10,
      servingSize: `${multiplier}x ${selectedFood.servingSize}`,
      mealType,
      date,
      barcode: selectedFood.barcode || '',
      pictureUrl: pictureUrl.trim(),
    };

    try {
      await logMeal(mealData);
      setSuccessMsg(`Successfully logged ${mealData.mealName} for ${mealType}!`);
      setTimeout(() => {
        closeLogModal();
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to log meal. Please check server connection.');
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-black md:pl-64 pb-24 md:pb-12 text-brand-charcoal relative">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">MEAL SEARCH</h1>
          <p className="text-sm text-brand-textMuted">Type in a meal or ingredient to retrieve precise macro stats and log it instantly.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-textMuted">
              <Search size={20} />
            </span>
            <input
              type="text"
              required
              placeholder="Search for Chicken Breast, Rice, Whey Protein, Oats..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-brand-black border border-brand-border rounded-2xl focus:outline-none focus:border-brand-green transition-colors text-brand-charcoal placeholder-brand-textMuted text-sm font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-brand-green text-brand-charcoal font-bold rounded-2xl hover:bg-brand-charcoal hover:text-white hover:scale-105 transition-all text-sm shrink-0 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Success/Error Feedback */}
        {error && (
          <div className="p-4 bg-brand-charcoal border border-brand-border text-brand-textMuted rounded-2xl flex items-center gap-3 text-sm mb-6">
            <AlertCircle size={18} className="text-brand-green" />
            <span>{error}</span>
          </div>
        )}

        {/* Loader Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel p-5 rounded-3xl border border-brand-border animate-pulse flex justify-between items-center">
                <div className="space-y-2.5">
                  <div className="h-4 bg-brand-gray rounded w-48"></div>
                  <div className="h-3 bg-brand-gray rounded w-64"></div>
                </div>
                <div className="h-6 bg-brand-gray rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-4">
            {results.map((food, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-3xl border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-green/30 transition-all duration-300"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 bg-brand-green/10 rounded text-brand-green shrink-0">
                      <Apple size={14} />
                    </span>
                    <h3 className="font-bold text-base truncate text-brand-charcoal">{food.name}</h3>
                    {food.brand && (
                      <span className="text-[10px] bg-brand-gray border border-brand-border text-brand-textMuted px-2 py-0.5 rounded-full uppercase">
                        {food.brand}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-textMuted font-medium">
                    Serving: {food.servingSize} &bull; P: <span className="text-brand-charcoal font-semibold">{food.protein}g</span> &bull; C: <span className="text-brand-charcoal font-semibold">{food.carbs}g</span> &bull; F: <span className="text-brand-charcoal font-semibold">{food.fats}g</span>
                  </p>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center">
                  <div className="text-right">
                    <span className="block text-lg font-black text-brand-green">{food.calories} kcal</span>
                    <span className="text-[9px] text-brand-textMuted uppercase font-bold tracking-wider">Per Serving</span>
                  </div>
                  <button
                    onClick={() => openLogModal(food)}
                    className="p-3.5 bg-brand-green/10 text-brand-green rounded-full hover:bg-brand-green hover:text-brand-charcoal transition-all duration-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOG FOOD MODAL */}
        {selectedFood && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel border border-brand-border rounded-3xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
              
              <button
                onClick={closeLogModal}
                className="absolute top-4 right-4 text-brand-textMuted hover:text-brand-charcoal p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4 pr-8">
                <Dumbbell className="text-brand-green" size={20} />
                <h2 className="text-lg font-extrabold truncate text-brand-charcoal">{selectedFood.name}</h2>
              </div>

              {/* Toast response inside modal */}
              {successMsg ? (
                <div className="p-4 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-2xl flex items-center justify-center text-sm font-bold animate-pulse">
                  {successMsg}
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* Macro preview calculation */}
                  <div className="grid grid-cols-4 gap-2 text-center p-3 bg-brand-black border border-brand-border rounded-2xl">
                    <div className="p-1">
                      <span className="block text-brand-green font-black text-sm">{Math.round(selectedFood.calories * multiplier)}</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Kcal</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-brand-charcoal font-black text-sm">{Math.round(selectedFood.protein * multiplier * 10) / 10}g</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Protein</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-brand-charcoal font-black text-sm">{Math.round(selectedFood.carbs * multiplier * 10) / 10}g</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Carbs</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-brand-charcoal font-black text-sm">{Math.round(selectedFood.fats * multiplier * 10) / 10}g</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Fats</span>
                    </div>
                  </div>

                  {/* Quantity multiplier */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                      Servings / Quantity Multiplier
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setMultiplier(prev => Math.max(0.5, prev - 0.5))}
                        className="w-12 h-12 bg-brand-black border border-brand-border rounded-xl font-bold hover:border-brand-green transition-colors text-brand-charcoal"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setMultiplier(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="flex-1 text-center py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-brand-charcoal font-bold"
                      />
                      <button
                        onClick={() => setMultiplier(prev => prev + 0.5)}
                        className="w-12 h-12 bg-brand-black border border-brand-border rounded-xl font-bold hover:border-brand-green transition-colors text-brand-charcoal"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-brand-textMuted mt-1.5 block">
                      Target Serving Size: {selectedFood.servingSize} (logging: {Math.round(multiplier * 100)}% of serving)
                    </span>
                  </div>

                  {/* Meal Category */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                      Meal Type Category
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full py-3 px-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-brand-charcoal font-semibold text-sm cursor-pointer"
                    >
                      <option value="breakfast">☕ Breakfast</option>
                      <option value="lunch">🥗 Lunch</option>
                      <option value="dinner">🌙 Dinner</option>
                      <option value="snack">⚡ Snack</option>
                    </select>
                  </div>

                  {/* Log Date */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                      Select Log Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full py-3 px-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-brand-charcoal font-semibold text-sm cursor-pointer"
                    />
                  </div>

                  {/* Picture URL */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                      Attach Meal Picture (Optional URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/my-meal.jpg"
                      value={pictureUrl}
                      onChange={(e) => setPictureUrl(e.target.value)}
                      className="w-full py-3 px-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-brand-charcoal font-semibold text-sm placeholder-brand-textMuted"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeLogModal}
                      className="flex-1 py-3.5 rounded-xl border border-brand-border hover:bg-brand-gray font-bold text-xs transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogMeal}
                      disabled={logLoading}
                      className="flex-1 py-3.5 rounded-xl bg-brand-green text-brand-charcoal font-bold text-xs hover:bg-brand-charcoal hover:text-white transition-all uppercase tracking-wider"
                    >
                      {logLoading ? 'Logging...' : 'Confirm Log'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MealSearch;
