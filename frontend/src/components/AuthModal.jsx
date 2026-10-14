import React, { useState } from 'react';
import { User, Lock, Car, Shield, X, Check, ArrowRight } from 'lucide-react';
import { authApi } from '../api/authApi';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authApi.login(email.trim(), password);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await authApi.demoLogin(role);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-white text-black font-black text-xl rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            UBER
          </div>
          <h2 className="text-xl font-black text-white">Sign In to Your Account</h2>
          <p className="text-xs text-neutral-400 mt-1">Select an account or enter your credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Quick 1-Click Role Accounts */}
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">Quick Sign In:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('rider')}
              className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-center transition group"
            >
              <div className="text-lg mb-1">👤</div>
              <div className="text-xs font-bold text-white group-hover:text-blue-400">Rider</div>
              <div className="text-[10px] text-neutral-500">Alex R.</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('driver')}
              className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-center transition group"
            >
              <div className="text-lg mb-1">🚖</div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400">Driver</div>
              <div className="text-[10px] text-neutral-500">John D.</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-center transition group"
            >
              <div className="text-lg mb-1">🛡️</div>
              <div className="text-xs font-bold text-white group-hover:text-purple-400">Admin</div>
              <div className="text-[10px] text-neutral-500">Super Admin</div>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink mx-3 text-neutral-500 text-[10px] uppercase font-bold">Or with Email</span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleManualLogin} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@uber.com"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 mt-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
