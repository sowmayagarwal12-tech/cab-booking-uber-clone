import React, { useState } from 'react';
import { 
  Car, Shield, User, Lock, Mail, Phone, Eye, EyeOff, 
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Check, FileText 
} from 'lucide-react';
import { authApi } from '../api/authApi';

export default function LoginPage({ onBack, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false); // false = Sign In, true = Sign Up
  
  // Registration Role Selection
  const [accountType, setAccountType] = useState('RIDER'); // 'RIDER' | 'DRIVER'

  // Common Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Driver Specific Fields
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('ECONOMY');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Instant 1-Click Login for test accounts
  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await authApi.demoLogin(role);
      setSuccessMsg(`Welcome back, ${user.fullName || 'User'}! Redirecting...`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 700);
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  // Form Submit (Sign In or Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        // Sign Up / Register
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }

        const payload = {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          phoneNumber: phoneNumber.trim() || '+91-9876543210',
          role: accountType === 'DRIVER' ? 'ROLE_DRIVER' : 'ROLE_RIDER'
        };

        if (accountType === 'DRIVER') {
          payload.vehicleModel = vehicleModel.trim() || 'Toyota Prius Hybrid';
          payload.vehicleNumber = vehicleNumber.trim() || 'DL-01-AB-1234';
          payload.vehicleType = vehicleType || 'ECONOMY';
          payload.licenseNumber = licenseNumber.trim() || 'DL-992140';
        }

        const user = await authApi.register(payload);
        setSuccessMsg(`Welcome, ${user.fullName}! Your ${accountType === 'DRIVER' ? 'Driver Partner' : 'Rider'} account is ready.`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 800);
      } else {
        // Sign In
        const user = await authApi.login(email.trim().toLowerCase(), password);
        setSuccessMsg(`Welcome back, ${user.fullName || 'User'}! Redirecting...`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 700);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Top Bar */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Map</span>
        </button>

        <div className="flex items-center space-x-2 text-neutral-400 text-xs">
          <Car className="w-4 h-4 text-white" />
          <span className="font-bold text-white tracking-wider">UBER</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white text-black font-black text-2xl rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
            <Car className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isRegister ? 'Create Your Account' : 'Welcome to Uber'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1.5">
            {isRegister 
              ? (accountType === 'DRIVER' 
                  ? 'Sign up to drive and earn fares on your own schedule' 
                  : 'Sign up to start booking rides with upfront transparent pricing') 
              : 'Sign in to access rides, saved places, and live tracking'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-2xl border border-neutral-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              !isRegister
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isRegister
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register / Sign Up
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ASK USER: Role Selector (Rider vs Driver) on Sign Up */}
          {isRegister && (
            <div className="space-y-1.5 mb-3 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800">
              <label className="text-[11px] font-bold text-neutral-300 block mb-2">
                I am signing up as:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Option 1: Rider */}
                <button
                  type="button"
                  onClick={() => setAccountType('RIDER')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 cursor-pointer ${
                    accountType === 'RIDER'
                      ? 'border-blue-500 bg-blue-600/20 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 text-neutral-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl text-lg flex items-center justify-center ${
                    accountType === 'RIDER' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Rider</span>
                      {accountType === 'RIDER' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate mt-0.5">Book rides</div>
                  </div>
                </button>

                {/* Option 2: Driver */}
                <button
                  type="button"
                  onClick={() => setAccountType('DRIVER')}
                  className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 cursor-pointer ${
                    accountType === 'DRIVER'
                      ? 'border-amber-500 bg-amber-600/20 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 text-neutral-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl text-lg flex items-center justify-center ${
                    accountType === 'DRIVER' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    🚖
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Driver</span>
                      {accountType === 'DRIVER' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate mt-0.5">Drive & earn</div>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* Full Name (Registration only) */}
          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-neutral-300 block mb-1.5">
                {accountType === 'DRIVER' ? 'Driver Full Name' : 'Full Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={accountType === 'DRIVER' ? 'e.g. John Carter' : 'e.g. Rahul Sharma'}
                  className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-medium transition"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-medium transition"
              />
            </div>
          </div>

          {/* Phone Number (Registration only) */}
          {isRegister && (
            <div>
              <label className="text-[11px] font-bold text-neutral-300 block mb-1.5">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-medium transition"
                />
              </div>
            </div>
          )}

          {/* DRIVER SPECIFIC FIELDS */}
          {isRegister && accountType === 'DRIVER' && (
            <div className="space-y-3 bg-neutral-950/70 p-3.5 rounded-2xl border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Vehicle & Driver Details
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 block mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Swift Dzire"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 block mb-1">Number Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="DL 01 AB 1234"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 block mb-1">Cab Category</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ECONOMY">Economy (4 Seats)</option>
                    <option value="COMFORT">Comfort (4 Seats)</option>
                    <option value="PREMIER">Premier (4 Seats)</option>
                    <option value="XL">XL (6 Seats)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 block mb-1">License No.</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    placeholder="DL-14201100"
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-neutral-300">Password</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => alert('Password hint: Demo rider password is "rider123", driver is "driver123", admin is "admin123"')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-blue-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-medium transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          {!isRegister && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-neutral-950 border-neutral-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-neutral-400 cursor-pointer select-none">
                Keep me signed in on this browser
              </label>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 cursor-pointer ${
              isRegister && accountType === 'DRIVER'
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-white hover:bg-neutral-200 text-black shadow-white/10'
            }`}
          >
            <span>
              {loading 
                ? 'Please wait...' 
                : isRegister 
                  ? (accountType === 'DRIVER' ? 'Register as Driver Partner' : 'Create Rider Account') 
                  : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Test Accounts Helper Section */}
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick Test Accounts:</span>
            </span>
            <span className="text-[10px] text-neutral-500">1-click login</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            
            {/* Rider Pill */}
            <button
              type="button"
              onClick={() => handleQuickLogin('rider')}
              className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-blue-500/50 rounded-xl text-left transition group cursor-pointer"
              title="One-click login as Rider Alex"
            >
              <div className="text-base mb-0.5">👤</div>
              <div className="text-xs font-bold text-white group-hover:text-blue-400">Rider</div>
              <div className="text-[9px] text-neutral-500 truncate">rider@uber.com</div>
            </button>

            {/* Driver Pill */}
            <button
              type="button"
              onClick={() => handleQuickLogin('driver')}
              className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 rounded-xl text-left transition group cursor-pointer"
              title="One-click login as Driver John"
            >
              <div className="text-base mb-0.5">🚖</div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400">Driver</div>
              <div className="text-[9px] text-neutral-500 truncate">driver.john@...</div>
            </button>

            {/* Admin Pill */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/50 rounded-xl text-left transition group cursor-pointer"
              title="One-click login as Admin"
            >
              <div className="text-base mb-0.5">🛡️</div>
              <div className="text-xs font-bold text-white group-hover:text-purple-400">Admin</div>
              <div className="text-[9px] text-neutral-500 truncate">admin@uber.com</div>
            </button>

          </div>

          <p className="text-[10px] text-neutral-500 text-center mt-3">
            Click any account above to log in instantly, or enter your credentials.
          </p>
        </div>

      </div>

    </div>
  );
}
