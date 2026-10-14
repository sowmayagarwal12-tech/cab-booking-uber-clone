import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RiderView from './components/RiderView';
import DriverView from './components/DriverView';
import AdminView from './components/AdminView';
import LoginPage from './components/LoginPage';
import { authApi } from './api/authApi';
import { getCurrentUserFromStorage } from './api/apiClient';
import wsService from './api/websocket';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'login'
  const [isWsConnected, setIsWsConnected] = useState(true);

  // Initialize Auth from localStorage
  useEffect(() => {
    const storedUser = getCurrentUserFromStorage();
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    // Monitor WebSocket connection
    const interval = setInterval(() => {
      setIsWsConnected(wsService.connected);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleOpenLogin = () => {
    setCurrentPage('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Bar: ONLY Logo, Status, Profile & Sign out option / Sign In button */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={handleOpenLogin}
        onGoHome={handleGoHome}
        isWsConnected={isWsConnected}
      />

      {/* Main Perspective Body: LoginPage or Role Views */}
      <main className="flex-1">
        {currentPage === 'login' ? (
          <LoginPage
            onBack={handleGoHome}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : currentUser?.role === 'ROLE_DRIVER' ? (
          <DriverView currentUser={currentUser} />
        ) : currentUser?.role === 'ROLE_ADMIN' ? (
          <AdminView currentUser={currentUser} />
        ) : (
          <RiderView 
            currentUser={currentUser} 
            onOpenLogin={handleOpenLogin} 
          />
        )}
      </main>

      {/* Enterprise Architecture Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-900/40 text-neutral-400 py-6 px-4 lg:px-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-wider">🚖 UBER TAXI PLATFORM</span>
            <span className="text-neutral-600">|</span>
            <span>Enterprise Full-Stack Major Project</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Java 17/21</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Spring Boot 3</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Spring Security + JWT</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Spring WebSocket (STOMP)</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Stripe SDK</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">OpenPDF</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">PostgreSQL / H2</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">Google Maps + Leaflet</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
