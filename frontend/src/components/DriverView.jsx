import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Power, DollarSign, Award, MapPin, Navigation, 
  CheckCircle, Play, Check, X, Shield, Phone, Radio 
} from 'lucide-react';
import MapComponent from './MapComponent';
import { driverApi } from '../api/driverApi';
import { rideApi } from '../api/rideApi';
import wsService from '../api/websocket';

export default function DriverView({ currentUser }) {
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [otpInput, setOtpInput] = useState('');
  const [isSimulatingDriving, setIsSimulatingDriving] = useState(false);
  const [driverCoords, setDriverCoords] = useState({ lat: 28.6315, lng: 77.2167 });
  const simulationIntervalRef = useRef(null);

  // Load Driver profile and active ride
  useEffect(() => {
    loadDriverProfile();
    checkActiveRide();
  }, []);

  // WebSocket subscriptions for ride requests and status
  useEffect(() => {
    const unsubRequests = wsService.subscribe('/topic/ride-requests', (newRide) => {
      // If driver is online and free, show incoming request
      if (isOnline && !activeRide && newRide.status === 'REQUESTED') {
        setIncomingRequest(newRide);
        setCountdown(15);
      }
    });

    return () => {
      unsubRequests();
      stopSimulation();
    };
  }, [isOnline, activeRide]);

  // Countdown timer for incoming request
  useEffect(() => {
    if (!incomingRequest) return;

    if (countdown <= 0) {
      setIncomingRequest(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingRequest, countdown]);

  const loadDriverProfile = async () => {
    try {
      const data = await driverApi.getProfile();
      setDriver(data);
      setIsOnline(data.isOnline ?? true);
      if (data.currentLatitude && data.currentLongitude) {
        setDriverCoords({ lat: data.currentLatitude, lng: data.currentLongitude });
      }
    } catch {
      // Demo driver fallback profile
      setDriver({
        vehicleModel: 'Toyota Camry Hybrid',
        vehicleNumber: 'NYC-CAB-102',
        rating: 4.92,
        totalEarnings: 1850.50,
        totalRides: 142
      });
    }
  };

  const checkActiveRide = async () => {
    try {
      const active = await rideApi.getActiveRide();
      if (active) {
        setActiveRide(active);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await driverApi.updateStatus(newStatus);
    } catch {
      // ignore
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const accepted = await rideApi.acceptRide(rideId);
      setActiveRide(accepted);
      setIncomingRequest(null);
      startSimulationTowards(accepted.pickupLatitude, accepted.pickupLongitude, accepted.id);
    } catch (err) {
      alert('Failed to accept ride: ' + err.message);
      setIncomingRequest(null);
    }
  };

  const handleArrived = async () => {
    if (!activeRide) return;
    try {
      const updated = await rideApi.driverArrived(activeRide.id);
      setActiveRide(updated);
      stopSimulation();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleStartRide = async () => {
    if (!otpInput.trim()) {
      alert('Please enter the 4-digit OTP provided by rider');
      return;
    }
    try {
      const updated = await rideApi.startRide(activeRide.id, otpInput.trim());
      setActiveRide(updated);
      setOtpInput('');
      startSimulationTowards(activeRide.dropLatitude, activeRide.dropLongitude, activeRide.id);
    } catch (err) {
      alert('OTP error: ' + err.message);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      await rideApi.completeRide(activeRide.id);
      alert('Trip completed! Fare collected.');
      stopSimulation();
      setActiveRide(null);
      loadDriverProfile();
    } catch (err) {
      alert('Error completing trip: ' + err.message);
    }
  };

  // Real-time GPS movement simulation
  const startSimulationTowards = (targetLat, targetLng, rideId) => {
    stopSimulation();
    setIsSimulatingDriving(true);

    let currentLat = driverCoords.lat;
    let currentLng = driverCoords.lng;
    const steps = 30;
    const deltaLat = (targetLat - currentLat) / steps;
    const deltaLng = (targetLng - currentLng) / steps;
    let stepCount = 0;

    simulationIntervalRef.current = setInterval(() => {
      stepCount++;
      currentLat += deltaLat;
      currentLng += deltaLng;

      const newCoords = { lat: currentLat, lng: currentLng };
      setDriverCoords(newCoords);

      // Broadcast location via WebSocket STOMP
      wsService.send('/app/driver/location', {
        rideId,
        driverId: driver?.id,
        latitude: currentLat,
        longitude: currentLng,
        heading: 45,
        speed: 35.0
      });

      if (stepCount >= steps) {
        stopSimulation();
      }
    }, 1200);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulatingDriving(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-80px)]">
      
      {/* LEFT COLUMN: Driver Console */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        
        {/* Status Toggle Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{isOnline ? 'You are Online' : 'You are Offline'}</span>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-neutral-600'}`} />
              </div>
              <div className="text-xs text-neutral-400">
                {isOnline ? 'Ready to accept incoming trip offers' : 'Go online to start receiving rides'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleOnline}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg ${
              isOnline
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black font-black'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Driver Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Today's Earnings</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              ₹{driver?.totalEarnings ? driver.totalEarnings.toFixed(2) : '1,850.50'}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Completed Trips</span>
            <div className="text-xl font-black text-white mt-0.5">
              {driver?.totalRides || 142}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Driver Rating</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              ⭐ {driver?.rating || 4.92}
            </div>
          </div>
        </div>

        {/* ACTIVE TRIP CONTROLLER */}
        {activeRide ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Assigned Trip #{activeRide.id}</span>
                <h3 className="text-lg font-black text-white capitalize">{activeRide.status.replace(/_/g, ' ').toLowerCase()}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400">Fare:</span>
                <div className="text-lg font-black text-emerald-400">₹{activeRide.totalFare?.toFixed(2)}</div>
              </div>
            </div>

            {/* Rider Details */}
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <div className="text-neutral-400 font-medium">Passenger</div>
                <div className="font-bold text-white text-sm">{activeRide.riderName}</div>
              </div>
              {activeRide.riderPhone && (
                <a href={`tel:${activeRide.riderPhone}`} className="p-2.5 bg-neutral-800 rounded-xl text-emerald-400">
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Route Points */}
            <div className="space-y-2 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 font-semibold text-[10px] uppercase">Pickup:</span>
                <div className="text-neutral-200 font-medium">{activeRide.pickupAddress}</div>
              </div>
              <div>
                <span className="text-neutral-500 font-semibold text-[10px] uppercase">Destination:</span>
                <div className="text-neutral-200 font-medium">{activeRide.dropAddress}</div>
              </div>
            </div>

            {/* Driver Actions according to status */}
            {activeRide.status === 'ACCEPTED' && (
              <button
                onClick={handleArrived}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-2xl transition shadow-lg shadow-amber-500/20"
              >
                I Have Arrived at Pickup
              </button>
            )}

            {activeRide.status === 'DRIVER_ARRIVED' && (
              <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <label className="text-xs font-bold text-neutral-300 block">Enter 4-Digit Passenger OTP</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-center font-mono font-bold tracking-widest text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleStartRide}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
                  >
                    Start Ride
                  </button>
                </div>
              </div>
            )}

            {activeRide.status === 'IN_PROGRESS' && (
              <button
                onClick={handleCompleteRide}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-2xl transition shadow-lg shadow-emerald-500/20"
              >
                Complete Ride & Collect Fare
              </button>
            )}

            {/* GPS Simulation Status */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
              <span className="flex items-center space-x-1.5">
                <Radio className={`w-3.5 h-3.5 ${isSimulatingDriving ? 'text-blue-500 animate-pulse' : 'text-neutral-600'}`} />
                <span>{isSimulatingDriving ? 'GPS Simulating Movement...' : 'Vehicle Stationary'}</span>
              </span>

              <button
                onClick={() => {
                  if (isSimulatingDriving) stopSimulation();
                  else {
                    const target = activeRide.status === 'ACCEPTED'
                      ? { lat: activeRide.pickupLatitude, lng: activeRide.pickupLongitude }
                      : { lat: activeRide.dropLatitude, lng: activeRide.dropLongitude };
                    startSimulationTowards(target.lat, target.lng, activeRide.id);
                  }
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                {isSimulatingDriving ? 'Pause Simulation' : 'Simulate GPS Driving'}
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-neutral-400 shadow-2xl">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              🚕
            </div>
            <div className="text-base font-bold text-white">No Active Trip</div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Keep your status online. When a passenger books a cab, an instant ride alert with fare & route details will appear here.
            </p>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Driver Navigation Map */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <MapComponent
          pickupCoords={activeRide ? { lat: activeRide.pickupLatitude, lng: activeRide.pickupLongitude } : null}
          dropCoords={activeRide ? { lat: activeRide.dropLatitude, lng: activeRide.dropLongitude } : null}
          assignedDriverCoords={driverCoords}
          assignedDriverHeading={45}
        />
      </div>

      {/* INCOMING RIDE REQUEST OVERLAY MODAL */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg font-bold border border-amber-500/30">
                New Ride Offer
              </span>
              <div className="text-xs font-mono text-neutral-400 font-bold">
                Auto-declines in <span className="text-amber-400 text-sm">{countdown}s</span>
              </div>
            </div>

            <div className="text-3xl font-black text-white mb-2">
              ₹{incomingRequest.totalFare?.toFixed(2)}
            </div>
            <div className="text-xs text-neutral-400 mb-4">
              Estimated Trip: {incomingRequest.distanceKm} km ({incomingRequest.durationMinutes} mins)
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs space-y-2 mb-6">
              <div>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Pickup:</span>
                <div className="text-neutral-200 font-medium">{incomingRequest.pickupAddress}</div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Dropoff:</span>
                <div className="text-neutral-200 font-medium">{incomingRequest.dropAddress}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIncomingRequest(null)}
                className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-bold text-xs transition"
              >
                Decline
              </button>
              <button
                onClick={() => handleAcceptRide(incomingRequest.id)}
                className="py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-xs transition shadow-lg shadow-amber-500/30"
              >
                Accept Ride
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
