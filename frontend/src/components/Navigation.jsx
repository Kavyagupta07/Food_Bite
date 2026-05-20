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
                    : 'text-brand-textMuted hover:bg-brand-gray hover:text-white'
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
            <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/50 flex items-center justify-center font-bold text-brand-green uppercase">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user.name}</p>
              <p className="text-xs text-brand-textMuted truncate">
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
                isActive ? 'text-brand-green' : 'text-brand-textMuted'
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
