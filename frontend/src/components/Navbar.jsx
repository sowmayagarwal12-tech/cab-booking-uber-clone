import React from 'react';
import { Car, Radio, LogOut, User } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onOpenLogin, onGoHome, isWsConnected }) {
  return (
    <header className="bg-black/95 backdrop-blur border-b border-neutral-800 text-white sticky top-0 z-50 px-4 lg:px-8 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Live Status */}
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={onGoHome}
            className="bg-white text-black px-3 py-1.5 rounded-xl flex items-center justify-center font-black tracking-tighter text-lg shadow-lg hover:bg-neutral-200 transition cursor-pointer"
            title="Go to Home Map"
          >
            <Car className="w-4 h-4 mr-1 text-black" />
            <span>UBER</span>
          </button>
          
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-neutral-400 font-semibold border-l border-neutral-700 pl-3">
            Enterprise Ride Platform
          </span>

          <div className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full text-xs">
            <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'text-green-500 animate-pulse' : 'text-neutral-500'}`} />
            <span className={isWsConnected ? 'text-green-400 font-medium' : 'text-neutral-400'}>
              {isWsConnected ? 'Live Real-time' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Right Section: ONLY Profile and Sign out option / Sign In button */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Profile Card */}
              <div className="flex items-center space-x-2.5 bg-neutral-900/80 border border-neutral-800/90 px-3 py-1.5 rounded-2xl shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight text-white max-w-[140px] truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-neutral-400 leading-tight">
                    {currentUser.role?.replace('ROLE_', '')}
                  </div>
                </div>
              </div>

              {/* Sign out Option */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-red-950/80 hover:text-red-400 text-neutral-300 border border-neutral-800 hover:border-red-900/60 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="bg-white text-black px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-neutral-200 transition shadow-md cursor-pointer flex items-center space-x-1.5"
              title="Sign in to your account"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
