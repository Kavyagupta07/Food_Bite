import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Camera, 
  Search, 
  Activity, 
  Flame, 
  Droplet,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-charcoal relative overflow-hidden flex flex-col">
      {/* Background gradients for premium Nike/Gymshark aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-brand-green/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
            <Flame size={24} className="animate-bounce" />
          </div>
          <span className="text-2xl font-black tracking-wider">
            BITE<span className="text-brand-green">.AI</span>
          </span>
        </div>
        <Link 
          to="/login" 
          className="px-6 py-2.5 rounded-full bg-brand-charcoal text-white font-medium hover:bg-brand-green hover:text-brand-charcoal border border-brand-border transition-all duration-300 neon-glow-hover"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center py-16 z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Sparkles size={14} /> AI-Powered Gym Companion
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6"
          >
            FUEL YOUR POTENTIAL.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">
              SCAN. SEARCH. DOMINATE.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-brand-textMuted max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            The premium AI-driven macro and nutrition logger crafted specifically for gym lovers, bodybuilders, and fitness enthusiasts. Build muscle and torch fat with perfect accuracy.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-green text-brand-charcoal font-bold flex items-center justify-center gap-2 hover:bg-brand-charcoal hover:text-white hover:scale-105 transition-all duration-300"
            >
              Start Free Today
              <ChevronRight size={18} />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-charcoal text-white border border-brand-border font-medium hover:bg-brand-green hover:text-brand-charcoal transition-all duration-300"
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <section id="features" className="w-full py-12">
          <h2 className="text-3xl font-extrabold text-center mb-12">ANABOLIC UTILITIES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl text-left border border-brand-border relative overflow-hidden group"
            >
              <div className="p-4 bg-brand-green/10 rounded-2xl text-brand-green w-fit mb-6">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-charcoal">Instant Barcode Scanner</h3>
              <p className="text-brand-textMuted leading-relaxed text-sm">
                Point your phone camera at any food barcode to instantly log ingredients, calories, and detailed protein/carb/fat ratios using OpenFoodFacts database.
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-green/5 rounded-tl-full blur-xl group-hover:bg-brand-green/10 transition-colors"></div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl text-left border border-brand-border relative overflow-hidden group"
            >
              <div className="p-4 bg-brand-green/10 rounded-2xl text-brand-green w-fit mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-charcoal">Smart Gym Food Search</h3>
              <p className="text-brand-textMuted leading-relaxed text-sm">
                Search standard meals or protein supplements. Access pre-configured macro breakdowns for eggs, chicken breast, whey isolates, oats, and beef.
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-green/5 rounded-tl-full blur-xl group-hover:bg-brand-green/10 transition-colors"></div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -8 }}
              className="glass-panel p-8 rounded-3xl text-left border border-brand-border relative overflow-hidden group"
            >
              <div className="p-4 bg-brand-green/10 rounded-2xl text-brand-green w-fit mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-charcoal">AI Coach Insights</h3>
              <p className="text-brand-textMuted leading-relaxed text-sm">
                Get daily meal recommendations, weekly analytics reviews, water intake trackers, and gym motivation prompts computed dynamically for your goals.
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-brand-green/5 rounded-tl-full blur-xl group-hover:bg-brand-green/10 transition-colors"></div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Stats Banner */}
        <section className="w-full mt-16 py-8 border-t border-b border-brand-border grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-brand-green mb-1">0s</span>
            <span className="text-xs text-brand-textMuted uppercase tracking-wider">Manual Data Entry Required</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-brand-charcoal mb-1">100%</span>
            <span className="text-xs text-brand-textMuted uppercase tracking-wider">Free & Public Barcode Scanning</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-brand-green mb-1">AI</span>
            <span className="text-xs text-brand-textMuted uppercase tracking-wider">Personalized Macro Planning</span>
          </div>
          <div className="text-center">
            <span className="block text-4xl font-extrabold text-brand-charcoal mb-1">🔥</span>
            <span className="text-xs text-brand-textMuted uppercase tracking-wider">Streak & Consistency Tracking</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-brand-border py-8 text-center text-xs text-brand-textMuted z-10 bg-brand-black">
        <p>&copy; {new Date().getFullYear()} Bite Fitness Technologies Inc. All rights reserved.</p>
        <p className="mt-2 text-[10px] text-brand-green/60">Designed for bodybuilders, athletes, and fitness lovers.</p>
      </footer>
    </div>
  );
};

export default Landing;
