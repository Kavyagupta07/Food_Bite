import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  ScanBarcode, 
  BarChart3, 
  User, 
  LogOut, 
  Apple
} from 'lucide-react';

const Navigation = ({ user, logout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null; // Only show navigation for logged-in users

  const avatarTemplates = [
    { name: 'Iron Lifter', value: 'avatar_iron_lifter', emoji: '🏋️‍♂️', bg: 'from-emerald-500 to-teal-700' },
    { name: 'Speed Runner', value: 'avatar_speed_runner', emoji: '🏃‍♀️', bg: 'from-amber-500 to-rose-600' },
    { name: 'Yoga Zen', value: 'avatar_yoga_zen', emoji: '🧘', bg: 'from-indigo-500 to-violet-700' },
    { name: 'Cycle Pro', value: 'avatar_cycle_pro', emoji: '🚴', bg: 'from-cyan-400 to-sky-600' },
    { name: 'Nutrition Guru', value: 'avatar_nutrition_guru', emoji: '🥗', bg: 'from-emerald-400 to-green-600' },
    { name: 'Beast Mode', value: 'avatar_beast_mode', emoji: '🥊', bg: 'from-rose-500 to-red-800' }
  ];

  const renderAvatar = (urlOrTemplate, nameString, sizeClass = "w-10 h-10 text-lg") => {
    if (urlOrTemplate && urlOrTemplate.startsWith('template:')) {
      const templateKey = urlOrTemplate.split(':')[1];
      const template = avatarTemplates.find(t => t.value === templateKey) || avatarTemplates[0];
      return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br ${template.bg} flex items-center justify-center border border-brand-green font-bold shadow-sm shrink-0`}>
          <span>{template.emoji}</span>
        </div>
      );
    } else if (urlOrTemplate) {
      return (
        <img
          src={urlOrTemplate}
          alt="Avatar"
          className={`${sizeClass} rounded-full object-cover border border-brand-green shadow-sm shrink-0`}
        />
      );
    } else {
      return (
        <div className={`${sizeClass} rounded-full bg-brand-green/20 border border-brand-green/50 flex items-center justify-center font-bold text-brand-green uppercase shrink-0`}>
          {nameString ? nameString[0] : 'U'}
        </div>
      );
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Meal Search', path: '/search', icon: Search },
    { name: 'Scan Barcode', path: '/scan', icon: ScanBarcode },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-brand-charcoal border-r border-brand-border py-6 px-4 z-20">
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
            <Apple size={24} className="animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            BITE<span className="text-brand-green">.AI</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-brand-green/10 text-brand-green border-l-2 border-brand-green'
                    : 'text-brand-gray hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-brand-border pt-4 px-2">
          <div className="flex items-center gap-3 mb-4 px-2">
            {renderAvatar(user.profilePicture, user.name)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user.name}</p>
              <p className="text-xs text-brand-gray truncate">
                Streak: {user.streak || 0} 🔥
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-charcoal/90 backdrop-blur-lg border-t border-brand-border py-2 px-4 flex justify-around items-center z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                isActive ? 'text-brand-green' : 'text-brand-gray'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;
