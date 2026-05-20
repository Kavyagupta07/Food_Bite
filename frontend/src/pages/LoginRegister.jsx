import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, registerUser } from '../services/api';
import { Flame, Mail, Lock, User, AlertCircle, Play } from 'lucide-react';

const LoginRegister = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser({ email, password });
        localStorage.setItem('bite_token', data.token);
        localStorage.setItem('bite_user', JSON.stringify(data));
        setUser(data);
        navigate('/dashboard');
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const data = await registerUser({ name, email, password });
        localStorage.setItem('bite_token', data.token);
        localStorage.setItem('bite_user', JSON.stringify(data));
        setUser(data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill demo credentials for the user to try the app instantly
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const demoEmail = 'demo@bite.com';
      const demoPassword = 'password123';
      const data = await loginUser({ email: demoEmail, password: demoPassword });
      localStorage.setItem('bite_token', data.token);
      localStorage.setItem('bite_user', JSON.stringify(data));
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Demo login failed. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative flex items-center justify-center py-12 px-6">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green mb-4">
            <Flame size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-wider">
            BITE<span className="text-brand-green">.AI</span>
          </h2>
          <p className="text-xs text-brand-textMuted uppercase tracking-widest mt-1">
            Fuel. Track. Perform.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-3xl border border-brand-border shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 border-b border-brand-border pb-4">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`text-lg font-bold transition-colors pb-2 relative ${
                isLogin ? 'text-brand-green' : 'text-brand-textMuted'
              }`}
            >
              Sign In
              {isLogin && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" 
                />
              )}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`text-lg font-bold transition-colors pb-2 relative ${
                !isLogin ? 'text-brand-green' : 'text-brand-textMuted'
              }`}
            >
              Register
              {!isLogin && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" 
                />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl flex items-center gap-3 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-textMuted">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-brand-black border border-brand-border rounded-2xl focus:outline-none focus:border-brand-green transition-colors text-white placeholder-brand-textMuted text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-textMuted">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-brand-black border border-brand-border rounded-2xl focus:outline-none focus:border-brand-green transition-colors text-white placeholder-brand-textMuted text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textMuted uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-textMuted">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-brand-black border border-brand-border rounded-2xl focus:outline-none focus:border-brand-green transition-colors text-white placeholder-brand-textMuted text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-brand-green text-black font-bold hover:bg-white hover:scale-[1.02] transition-all duration-300 flex items-center justify-center text-sm shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Access Dashboard' : 'Create Profile'}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          {isLogin && (
            <div className="mt-6 border-t border-brand-border pt-6 flex flex-col items-center">
              <span className="text-[10px] text-brand-textMuted uppercase tracking-widest mb-3">
                Or explore instantly
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3.5 rounded-2xl bg-brand-green/10 border border-brand-green/30 text-brand-green font-bold flex items-center justify-center gap-2 hover:bg-brand-green/20 transition-all duration-300 text-sm"
              >
                <Play size={16} fill="currentColor" />
                Demo Account Login
              </button>
              <span className="text-[10px] text-brand-textMuted mt-2">
                Pre-filled with mock user and meal log data!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
