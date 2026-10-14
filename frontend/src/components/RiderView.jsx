import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Car, Shield, Clock, Tag, CreditCard, 
  CheckCircle, AlertCircle, FileText, ChevronRight, X, Phone, Star 
} from 'lucide-react';
import MapComponent from './MapComponent';
import LocationInput from './LocationInput';
import PaymentModal from './PaymentModal';
import RatingModal from './RatingModal';
import SosModal from './SosModal';
import { rideApi } from '../api/rideApi';
import { driverApi } from '../api/driverApi';
import wsService from '../api/websocket';

const CITY_CONFIG = {
  DELHI: {
    name: 'New Delhi NCR',
    defaultPickup: { name: 'Connaught Place Central', lat: 28.6315, lng: 77.2167, city: 'Delhi' },
    defaultDrop: { name: 'Indira Gandhi International Airport T3', lat: 28.5562, lng: 77.1000, city: 'Delhi' },
    hubs: [
      { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, city: 'Delhi' },
      { name: 'Airport T3', lat: 28.5562, lng: 77.1000, city: 'Delhi' },
      { name: 'India Gate', lat: 28.6129, lng: 77.2295, city: 'Delhi' },
      { name: 'Cyber Hub Gurugram', lat: 28.4900, lng: 77.0900, city: 'Delhi' },
      { name: 'Noida Sec 18', lat: 28.5672, lng: 77.3211, city: 'Delhi' },
      { name: 'Hauz Khas', lat: 28.5494, lng: 77.1947, city: 'Delhi' }
    ]
  },
  LUCKNOW: {
    name: 'Lucknow',
    defaultPickup: { name: 'Chowk Central & Clock Tower', lat: 26.8692, lng: 80.9064, city: 'Lucknow' },
    defaultDrop: { name: 'Hazratganj Metro & Market', lat: 26.8467, lng: 80.9462, city: 'Lucknow' },
    hubs: [
      { name: 'Chowk Central', lat: 26.8692, lng: 80.9064, city: 'Lucknow' },
      { name: 'Jingle Bell Convent', lat: 26.8680, lng: 80.9025, city: 'Lucknow' },
      { name: 'Hazratganj', lat: 26.8467, lng: 80.9462, city: 'Lucknow' },
      { name: 'Charbagh Station', lat: 26.8310, lng: 80.9220, city: 'Lucknow' },
      { name: 'Gomti Nagar', lat: 26.8504, lng: 80.9984, city: 'Lucknow' },
      { name: 'Lulu Mall', lat: 26.7725, lng: 80.9880, city: 'Lucknow' },
      { name: 'CCS Airport', lat: 26.7606, lng: 80.8836, city: 'Lucknow' }
    ]
  }
};

export default function RiderView({ currentUser, onOpenLogin, onOpenAuthModal }) {
  // Active City state (DELHI or LUCKNOW)
  const [selectedCity, setSelectedCity] = useState('DELHI');

  // Location States
  const [pickup, setPickup] = useState(CITY_CONFIG.DELHI.defaultPickup);
  const [drop, setDrop] = useState(CITY_CONFIG.DELHI.defaultDrop);
  const [clickTarget, setClickTarget] = useState('drop'); // 'pickup' | 'drop'

  // Estimate & Booking States
  const [estimate, setEstimate] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('ECONOMY');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Active Trip State
  const [activeRide, setActiveRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  // Modals & History
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rideHistory, setRideHistory] = useState([]);

  // Fetch Nearby Drivers and Active Ride on Mount
  useEffect(() => {
    loadNearbyDrivers();
    checkActiveRide();
    const interval = setInterval(loadNearbyDrivers, 15000);
    return () => clearInterval(interval);
  }, [pickup]);

  // WebSocket Subscription for Active Ride updates
  useEffect(() => {
    if (!activeRide?.id) return;

    const unsubscribeRide = wsService.subscribe(`/topic/ride-status/${activeRide.id}`, (updatedRide) => {
      setActiveRide(updatedRide);

      if (updatedRide.status === 'COMPLETED') {
        setShowPaymentModal(true);
      }
    });

    const unsubscribeLocation = wsService.subscribe(`/topic/driver-location/${activeRide.id}`, (loc) => {
      setDriverLocation({ lat: loc.latitude, lng: loc.longitude, heading: loc.heading || 0 });
    });

    return () => {
      unsubscribeRide();
      unsubscribeLocation();
    };
  }, [activeRide?.id]);

  // Load fare estimate whenever pickup, drop or promo changes
  useEffect(() => {
    fetchEstimate();
  }, [pickup, drop, appliedPromo]);

  const loadNearbyDrivers = async () => {
    try {
      const drivers = await driverApi.getNearbyDrivers(pickup.lat, pickup.lng, 20);
      setNearbyDrivers(drivers || []);
    } catch {
      // ignore
    }
  };

  const checkActiveRide = async () => {
    try {
      const active = await rideApi.getActiveRide();
      if (active) {
        setActiveRide(active);
        if (active.driverLat && active.driverLng) {
          setDriverLocation({ lat: active.driverLat, lng: active.driverLng });
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchEstimate = async () => {
    if (!pickup || !drop) return;
    setLoadingEstimate(true);
    try {
      const res = await rideApi.getEstimate({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupAddress: pickup.name,
        dropLat: drop.lat,
        dropLng: drop.lng,
        dropAddress: drop.name,
        promoCode: appliedPromo?.code
      });
      setEstimate(res);
      if (res?.options?.length > 0 && !selectedVehicle) {
        setSelectedVehicle(res.options[0].vehicleType);
      }
    } catch (err) {
      console.warn('Error fetching estimate:', err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await rideApi.validatePromo(promoCode.trim());
      if (res.valid) {
        setAppliedPromo(res);
        alert(`Success: ${res.message}`);
      } else {
        alert(res.message || 'Invalid promo code');
      }
    } catch (err) {
      alert('Promo validation error: ' + err.message);
    }
  };

  const handleBookRide = async () => {
    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      else if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setBookingLoading(true);
    try {
      const booked = await rideApi.bookRide({
        pickupAddress: pickup.name,
        pickupLatitude: pickup.lat,
        pickupLongitude: pickup.lng,
        dropAddress: drop.name,
        dropLatitude: drop.lat,
        dropLongitude: drop.lng,
        vehicleType: selectedVehicle,
        promoCode: appliedPromo?.code
      });
      setActiveRide(booked);
    } catch (err) {
      alert('Booking failed: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!activeRide) return;
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await rideApi.cancelRide(activeRide.id, 'Cancelled by rider');
      setActiveRide(null);
      setDriverLocation(null);
    } catch (err) {
      alert('Error cancelling ride: ' + err.message);
    }
  };

  const handleMapClick = (lat, lng) => {
    const coordName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    if (clickTarget === 'pickup') {
      setPickup({ name: coordName, lat, lng });
      setClickTarget('drop');
    } else {
      setDrop({ name: coordName, lat, lng });
      setClickTarget('pickup');
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await rideApi.getRiderHistory();
      setRideHistory(hist || []);
      setShowHistory(true);
    } catch (err) {
      alert('Failed to load ride history: ' + err.message);
    }
  };

  const handleCityChange = (cityKey) => {
    setSelectedCity(cityKey);
    setPickup(CITY_CONFIG[cityKey].defaultPickup);
    setDrop(CITY_CONFIG[cityKey].defaultDrop);
  };

  const handleSelectPickup = (loc) => {
    setPickup(loc);
    if (loc.lat < 27.5 && selectedCity !== 'LUCKNOW') {
      setSelectedCity('LUCKNOW');
    } else if (loc.lat >= 28.0 && selectedCity !== 'DELHI') {
      setSelectedCity('DELHI');
    }
  };

  const handleSelectDrop = (loc) => {
    setDrop(loc);
    if (loc.lat < 27.5 && selectedCity !== 'LUCKNOW') {
      setSelectedCity('LUCKNOW');
    } else if (loc.lat >= 28.0 && selectedCity !== 'DELHI') {
      setSelectedCity('DELHI');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-80px)]">
      
      {/* LEFT COLUMN: Controls & Booking Drawer */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        
        {/* If Active Ride is in progress, display Active Ride Status Card */}
        {activeRide && activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED' ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in">
            
            {/* Status Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                  Live Trip #{activeRide.id}
                </span>
                <h3 className="text-xl font-black text-white capitalize">
                  {activeRide.status.replace(/_/g, ' ').toLowerCase()}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSosModal(true)}
                  className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-red-600 hover:text-white transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>SOS</span>
                </button>
              </div>
            </div>

            {/* OTP Banner */}
            {activeRide.status === 'ACCEPTED' || activeRide.status === 'DRIVER_ARRIVED' ? (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-300">Ride Start PIN</div>
                  <div className="text-[11px] text-neutral-400">Share this with your driver</div>
                </div>
                <div className="text-2xl font-black tracking-widest text-amber-400 bg-neutral-900/80 px-4 py-1.5 rounded-xl border border-amber-500/30 font-mono">
                  {activeRide.otp || '----'}
                </div>
              </div>
            ) : null}

            {/* Driver Information Card */}
            {activeRide.driverName ? (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center text-lg font-bold text-white">
                    🚗
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <span>{activeRide.driverName}</span>
                      <span className="text-xs px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded flex items-center">
                        ★ {activeRide.driverRating || '4.9'}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400">
                      {activeRide.vehicleModel} • <span className="font-mono text-neutral-300 font-bold">{activeRide.vehicleNumber}</span>
                    </div>
                  </div>
                </div>

                {activeRide.driverPhone && (
                  <a
                    href={`tel:${activeRide.driverPhone}`}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition"
                    title="Call Driver"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </a>
                )}
              </div>
            ) : (
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center py-6">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <div className="text-sm font-bold text-neutral-200">Matching nearby drivers...</div>
                <div className="text-xs text-neutral-400 mt-1">Notifying available {activeRide.vehicleType} cabs nearby</div>
              </div>
            )}

            {/* Route Details */}
            <div className="space-y-3 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80 text-xs">
              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1"></div>
                <div>
                  <div className="text-[10px] text-neutral-500 font-semibold uppercase">Pickup</div>
                  <div className="text-neutral-200 font-medium">{activeRide.pickupAddress}</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1"></div>
                <div>
                  <div className="text-[10px] text-neutral-500 font-semibold uppercase">Destination</div>
                  <div className="text-neutral-200 font-medium">{activeRide.dropAddress}</div>
                </div>
              </div>
            </div>

            {/* Price & Cancel Button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-neutral-500">Total Fare:</span>
                <div className="text-xl font-black text-white">₹{activeRide.totalFare?.toFixed(2)}</div>
              </div>

              <button
                onClick={handleCancelRide}
                className="px-4 py-2 bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-neutral-300 rounded-xl text-xs font-semibold border border-neutral-700 transition"
              >
                Cancel Ride
              </button>
            </div>

          </div>
        ) : (
          /* STANDARD BOOKING FORM */
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Where to?</h2>
                <p className="text-xs text-neutral-400">Request a ride with upfront transparent pricing</p>
              </div>

              <button
                onClick={loadHistory}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center space-x-1 transition border border-neutral-700"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>History</span>
              </button>
            </div>

            {/* City Switcher Banner (New Delhi NCR vs Lucknow) */}
            <div className="flex items-center space-x-1.5 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
              <button
                type="button"
                onClick={() => handleCityChange('DELHI')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedCity === 'DELHI'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <span>🏙️</span>
                <span>New Delhi NCR</span>
              </button>
              <button
                type="button"
                onClick={() => handleCityChange('LUCKNOW')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedCity === 'LUCKNOW'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <span>🏛️</span>
                <span>Lucknow</span>
              </button>
            </div>

            {/* Location Selector Inputs with Suggestions & Current Location */}
            <div className="space-y-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
              
              {/* Pickup Field with Autocomplete Suggestions & Current Location Button */}
              <LocationInput
                label="Pickup Location"
                dotColor="emerald"
                currentLocation={pickup}
                onSelectLocation={handleSelectPickup}
                isSettingOnMap={clickTarget === 'pickup'}
                onToggleSetOnMap={() => setClickTarget('pickup')}
                showCurrentLocationBtn={true}
                activeCity={selectedCity}
              />

              {/* Destination Field with Autocomplete Suggestions (sorted nearest to pickup first) */}
              <LocationInput
                label="Destination"
                dotColor="red"
                currentLocation={drop}
                onSelectLocation={handleSelectDrop}
                isSettingOnMap={clickTarget === 'drop'}
                onToggleSetOnMap={() => setClickTarget('drop')}
                showCurrentLocationBtn={false}
                referenceLocation={pickup}
                activeCity={selectedCity}
              />

              {/* Preset Quick Landmarks for Active City */}
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block mb-1.5">
                  Popular {CITY_CONFIG[selectedCity].name} Hubs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CITY_CONFIG[selectedCity].hubs.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDrop(loc)}
                      className="text-[11px] px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 transition truncate max-w-[160px]"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Vehicle Options Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 block">Choose Vehicle Category</label>
              <div className="grid grid-cols-2 gap-2.5">
                {estimate?.options?.map((opt) => {
                  const isSelected = selectedVehicle === opt.vehicleType;
                  return (
                    <button
                      key={opt.vehicleType}
                      type="button"
                      onClick={() => setSelectedVehicle(opt.vehicleType)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/10'
                          : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">
                          {opt.vehicleType === 'XL' ? '🚙' : opt.vehicleType === 'PREMIER' ? '🚘' : '🚗'}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-neutral-800 rounded font-semibold text-neutral-300">
                          {opt.capacity} seats
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white capitalize">{opt.vehicleType.toLowerCase()}</div>
                        <div className="text-[10px] text-neutral-400">{opt.etaMinutes} min away</div>
                      </div>
                      <div className="text-sm font-black text-white mt-2">
                        ₹{opt.estimatedFare?.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="flex items-center space-x-2 bg-neutral-950 p-2 rounded-2xl border border-neutral-800">
              <Tag className="w-4 h-4 text-amber-400 ml-2" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo Code (FIRST50, UBER20)"
                className="bg-transparent flex-1 text-xs text-white focus:outline-none placeholder-neutral-500 font-mono"
              />
              <button
                onClick={handleApplyPromo}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition border border-neutral-700"
              >
                Apply
              </button>
            </div>

            {appliedPromo && (
              <div className="text-xs text-emerald-400 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <span>Code {appliedPromo.code} active (-{appliedPromo.discountPercentage}%)</span>
                <button onClick={() => setAppliedPromo(null)} className="text-neutral-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Request Ride CTA */}
            <button
              onClick={currentUser ? handleBookRide : onOpenLogin}
              disabled={bookingLoading}
              className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Car className="w-4 h-4 text-black" />
              <span>{bookingLoading ? 'Requesting Ride...' : !currentUser ? 'Sign In to Book Ride' : `Request ${selectedVehicle} Ride`}</span>
            </button>

          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Map & Live Tracking */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <MapComponent
          pickupCoords={pickup}
          dropCoords={drop}
          nearbyDrivers={nearbyDrivers}
          assignedDriverCoords={driverLocation}
          assignedDriverHeading={driverLocation?.heading || 0}
          onMapClick={handleMapClick}
        />
      </div>

      {/* MODALS */}
      {showPaymentModal && activeRide && (
        <PaymentModal
          ride={activeRide}
          onConfirm={async (paymentData) => {
            await rideApi.confirmPayment(paymentData);
            setShowPaymentModal(false);
            setShowRatingModal(true);
          }}
          onClose={() => {
            setShowPaymentModal(false);
            setShowRatingModal(true);
          }}
        />
      )}

      {showRatingModal && activeRide && (
        <RatingModal
          ride={activeRide}
          onSubmit={async (ratingData) => {
            await rideApi.submitRating(ratingData);
            setActiveRide(null);
            setDriverLocation(null);
          }}
          onClose={() => {
            setShowRatingModal(false);
            setActiveRide(null);
            setDriverLocation(null);
          }}
        />
      )}

      {showSosModal && (
        <SosModal
          ride={activeRide}
          onClose={() => setShowSosModal(false)}
        />
      )}

      {/* RIDE HISTORY DRAWER */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Your Past Rides & PDF Invoices</span>
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {rideHistory.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">No completed rides yet.</div>
              ) : (
                rideHistory.map((r) => (
                  <div key={r.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>Trip #{r.id}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">{r.vehicleType}</span>
                        <span className="text-[10px] text-neutral-500 font-normal">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 truncate max-w-[280px]">
                        From: {r.pickupAddress}
                      </div>
                      <div className="text-xs text-neutral-400 truncate max-w-[280px]">
                        To: {r.dropAddress}
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-3">
                      <div>
                        <div className="text-base font-black text-white">₹{r.totalFare?.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-400">{r.status}</div>
                      </div>
                      <button
                        onClick={() => rideApi.downloadInvoice(r.id)}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-semibold border border-blue-500/40 transition"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
