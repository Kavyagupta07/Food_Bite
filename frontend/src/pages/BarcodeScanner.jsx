import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Scan, 
  Search, 
  AlertCircle, 
  X, 
  Info,
  Sparkles,
  Barcode,
  Dumbbell
} from 'lucide-react';
import { scanBarcode, logMeal } from '../services/api';

// A collection of real/simulated fitness product barcodes for testing out the scanner
const DEMO_BARCODES = [
  { name: 'Oikos Triple Zero Vanilla Greek Yogurt', code: '0036632027581', category: 'Dairy / Protein' },
  { name: 'Quest Nutrition Protein Bar (Chocolate Chip)', code: '0888849000216', category: 'Supplements' },
  { name: 'Pure Protein Whey Chocolate Powder', code: '0743124505374', category: 'Supplements' },
  { name: 'Dave\'s Killer Bread (21 Whole Grains)', code: '0013764027055', category: 'Carbohydrates' },
  { name: 'Jif Creamy Peanut Butter', code: '0051500255162', category: 'Fats / Protein' },
];

const BarcodeScanner = ({ user }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Found product state
  const [scannedProduct, setScannedProduct] = useState(null);
  const [multiplier, setMultiplier] = useState(1);
  const [mealType, setMealType] = useState('snack');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pictureUrl, setPictureUrl] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  const handleScan = async (code) => {
    if (!code) return;
    setLoading(true);
    setError('');
    setScannedProduct(null);
    setPictureUrl('');
    setSuccessMsg('');

    try {
      const data = await scanBarcode(code);
      if (data && data.found) {
        setScannedProduct(data);
      } else {
        setError('Product not found in OpenFoodFacts database.');
      }
    } catch (err) {
      console.error(err);
      setError('Barcode query failed. Make sure you entered a valid barcode number.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleScan(barcodeInput.trim());
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogProduct = async () => {
    if (!scannedProduct) return;
    setLogLoading(true);
    setError('');
    setSuccessMsg('');

    const mealData = {
      mealName: `${scannedProduct.brand ? '[' + scannedProduct.brand + '] ' : ''}${scannedProduct.name}`,
      calories: Math.round(scannedProduct.calories * multiplier),
      protein: Math.round(scannedProduct.protein * multiplier * 10) / 10,
      carbs: Math.round(scannedProduct.carbs * multiplier * 10) / 10,
      fats: Math.round(scannedProduct.fats * multiplier * 10) / 10,
      servingSize: `${multiplier}x ${scannedProduct.servingSize || '100g'}`,
      mealType,
      date,
      barcode: scannedProduct.barcode,
      pictureUrl: pictureUrl.trim(),
    };

    try {
      await logMeal(mealData);
      setSuccessMsg(`Logged scanned ${scannedProduct.name} for ${mealType}!`);
      setTimeout(() => {
        setScannedProduct(null);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to log product macros. Check database server.');
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-brand-black md:pl-64 pb-24 md:pb-12 text-white relative">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">BARCODE SCANNER</h1>
          <p className="text-sm text-brand-textMuted">Instantly read nutritional macro profiles by scanning food packages using your device.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: Interactive Simulator Camera View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-brand-border flex flex-col items-center">
              <h2 className="text-base font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Camera className="text-brand-green animate-pulse" size={18} /> Camera Viewport
              </h2>

              {/* Scanning Box frame */}
              <div className="w-full max-w-sm aspect-[4/3] bg-brand-black border-2 border-brand-border rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
                {/* Laser animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-brand-green/80 shadow-[0_0_10px_#39FF14] scanner-laser z-10"></div>
                
                {/* Camera corner markings */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-green rounded-tl-md"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-green rounded-tr-md"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-green rounded-bl-md"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-green rounded-br-md"></div>

                <Scan size={48} className="text-brand-gray/60 mb-2 animate-pulse" />
                <p className="text-xs text-brand-textMuted font-bold uppercase tracking-widest text-center px-4">
                  Simulating Camera Stream...
                </p>
                <span className="text-[10px] text-brand-green/60 mt-1 block">
                  Select a test preset below to scan
                </span>
              </div>

              {/* Help Tip Banner */}
              <div className="w-full mt-6 p-4 bg-brand-charcoal/50 border border-brand-border rounded-2xl flex items-start gap-3">
                <Info size={16} className="text-brand-green shrink-0 mt-0.5" />
                <p className="text-xs text-brand-textMuted leading-relaxed">
                  This page mimics a camera scanner. Because browser-based barcode scanning requires specific lighting and physical media, you can use the **Fitness Presets** below to instantly simulate scanning high-protein foods, or type in a real product barcode manually.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Demo Presets and Manual Search Input */}
          <div className="space-y-6">
            
            {/* Manual input lookup */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Barcode size={18} className="text-brand-green" /> Manual Barcode Query
              </h3>
              
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. 0036632027581"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-black border border-brand-border rounded-2xl focus:outline-none focus:border-brand-green transition-colors text-white text-sm font-semibold placeholder-brand-textMuted"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-green text-black font-bold rounded-2xl hover:bg-white transition-all text-xs uppercase tracking-wider shadow"
                >
                  {loading ? 'Searching Code...' : 'Query Barcode'}
                </button>
              </form>
            </div>

            {/* Simulated Scan Presets */}
            <div className="glass-panel p-6 rounded-3xl border border-brand-border space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-brand-green" /> Fitness Test Presets
              </h3>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {DEMO_BARCODES.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleScan(item.code)}
                    className="p-3 bg-brand-black border border-brand-border rounded-2xl hover:border-brand-green/30 cursor-pointer transition-all flex items-center justify-between text-left group"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate text-white">{item.name}</p>
                      <p className="text-[10px] text-brand-textMuted">{item.category} &bull; {item.code}</p>
                    </div>
                    <span className="text-[10px] text-brand-green font-bold bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full uppercase shrink-0 opacity-80 group-hover:opacity-100">
                      Scan
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* LOG SCANNED FOOD MODAL */}
        {scannedProduct && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel border border-brand-border rounded-3xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
              
              <button
                onClick={() => setScannedProduct(null)}
                className="absolute top-4 right-4 text-brand-textMuted hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2.5 mb-4 pr-8">
                <Dumbbell className="text-brand-green shrink-0" size={20} />
                <div>
                  <h2 className="text-base font-extrabold truncate text-white">{scannedProduct.name}</h2>
                  {scannedProduct.brand && (
                    <p className="text-[10px] text-brand-textMuted uppercase font-bold tracking-wider">{scannedProduct.brand}</p>
                  )}
                </div>
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
                      <span className="block text-brand-green font-black text-sm">{Math.round(scannedProduct.calories * multiplier)}</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Kcal</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-white font-black text-sm">{Math.round(scannedProduct.protein * multiplier * 10) / 10}g</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Protein</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-white font-black text-sm">{Math.round(scannedProduct.carbs * multiplier * 10) / 10}g</span>
                      <span className="text-[9px] text-brand-textMuted uppercase font-bold">Carbs</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-white font-black text-sm">{Math.round(scannedProduct.fats * multiplier * 10) / 10}g</span>
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
                        className="w-12 h-12 bg-brand-black border border-brand-border rounded-xl font-bold hover:border-brand-green transition-colors text-white"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setMultiplier(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="flex-1 text-center py-3 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-white font-bold"
                      />
                      <button
                        onClick={() => setMultiplier(prev => prev + 0.5)}
                        className="w-12 h-12 bg-brand-black border border-brand-border rounded-xl font-bold hover:border-brand-green transition-colors text-white"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-brand-textMuted mt-1.5 block">
                      Target Serving Size: {scannedProduct.servingSize || '100g'} (logging: {Math.round(multiplier * 100)}% of serving)
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
                      className="w-full py-3 px-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-white font-semibold text-sm cursor-pointer"
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
                      className="w-full py-3 px-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-green transition-colors text-white font-semibold text-sm cursor-pointer"
                    />
                  </div>

                  {/* Picture Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                      Attach Meal Picture
                    </label>
                    <div className="flex flex-col gap-3 p-3 border border-brand-border rounded-xl bg-brand-black/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="w-full text-sm text-brand-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-green file:text-black hover:file:bg-white transition-colors cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase">OR URL:</span>
                        <input
                          type="url"
                          placeholder="https://example.com/pic.jpg"
                          value={pictureUrl.startsWith('data:') ? '' : pictureUrl}
                          onChange={(e) => setPictureUrl(e.target.value)}
                          className="flex-1 py-1.5 px-3 bg-brand-black border border-brand-border rounded-lg focus:outline-none focus:border-brand-green transition-colors text-white text-xs placeholder-brand-textMuted"
                        />
                      </div>
                      {pictureUrl && (
                        <div className="mt-1">
                          <img src={pictureUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-brand-border" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setScannedProduct(null)}
                      className="flex-1 py-3.5 rounded-xl border border-brand-border hover:bg-brand-gray font-bold text-xs transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogProduct}
                      disabled={logLoading}
                      className="flex-1 py-3.5 rounded-xl bg-brand-green text-black font-bold text-xs hover:bg-white transition-all uppercase tracking-wider"
                    >
                      {logLoading ? 'Logging...' : 'Confirm Log'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Feedback Banner */}
        {error && !scannedProduct && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default BarcodeScanner;
