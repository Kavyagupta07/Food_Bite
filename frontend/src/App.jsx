import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';

// Page Imports
import Landing from './pages/Landing';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import MealSearch from './pages/MealSearch';
import BarcodeScanner from './pages/BarcodeScanner';
import UserProfile from './pages/UserProfile';
import Analytics from './pages/Analytics';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user credentials exist in localStorage
    const savedUser = localStorage.getItem('bite_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing stored user details:', err);
        localStorage.removeItem('bite_user');
        localStorage.removeItem('bite_token');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('bite_token');
    localStorage.removeItem('bite_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center text-brand-charcoal">
        <div className="w-12 h-12 border-4 border-brand-charcoal/20 border-t-brand-charcoal rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-brand-beige text-brand-charcoal flex flex-col md:flex-row">
        {/* Navigation Sidebar / Bottom Bar */}
        <Navigation user={user} logout={logout} />

        {/* Core Page Router Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            {/* Public landing page */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" replace /> : <Landing />} 
            />

            {/* Login and Registration forms */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <LoginRegister setUser={setUser} />} 
            />

            {/* Authenticated Dashboard */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" replace />} 
            />

            {/* Authenticated Search */}
            <Route 
              path="/search" 
              element={user ? <MealSearch user={user} /> : <Navigate to="/login" replace />} 
            />

            {/* Authenticated Barcode Scanner */}
            <Route 
              path="/scan" 
              element={user ? <BarcodeScanner user={user} /> : <Navigate to="/login" replace />} 
            />

            {/* Authenticated Profile Settings */}
            <Route 
              path="/profile" 
              element={user ? <UserProfile user={user} setUser={setUser} /> : <Navigate to="/login" replace />} 
            />

            {/* Authenticated History/Analytics */}
            <Route 
              path="/analytics" 
              element={user ? <Analytics user={user} /> : <Navigate to="/login" replace />} 
            />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
