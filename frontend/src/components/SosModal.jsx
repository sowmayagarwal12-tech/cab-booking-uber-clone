import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, CheckCircle } from 'lucide-react';
import { rideApi } from '../api/rideApi';

export default function SosModal({ ride, onClose }) {
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTriggerSos = async () => {
    setLoading(true);
    try {
      await rideApi.triggerSos({
        rideId: ride?.id,
        subject: `🚨 EMERGENCY SOS: Ride #${ride?.id || 'Active'}`,
        description: `Emergency alert triggered by rider near ${ride?.pickupAddress || 'current location'}. Driver: ${ride?.driverName || 'Assigned'}, Vehicle: ${ride?.vehicleNumber || 'N/A'}.`
      });
      setTriggered(true);
    } catch (err) {
      alert('Failed to send SOS: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border-2 border-red-500/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/40 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-black text-red-500">Emergency SOS Safety</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Immediate 24/7 Security Dispatch & Emergency Response
          </p>
        </div>

        {triggered ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="font-bold text-sm text-emerald-300">SOS Signal Broadcasted!</div>
            <div className="text-xs text-neutral-300 mt-1">
              Your live GPS telemetry and vehicle details have been transmitted to local emergency dispatch & our incident team.
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 mb-5 text-xs space-y-1.5 text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Trip ID:</span>
              <span className="font-mono font-bold text-white">#{ride?.id || 'Active'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Driver:</span>
              <span className="font-bold text-white">{ride?.driverName || 'Assigned Driver'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Vehicle:</span>
              <span className="font-bold text-white">{ride?.vehicleModel || 'Uber'} ({ride?.vehicleNumber || 'CAB'})</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!triggered && (
            <button
              onClick={handleTriggerSos}
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/40 transition"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{loading ? 'Transmitting...' : 'BROADCAST EMERGENCY SOS'}</span>
            </button>
          )}

          <a
            href="tel:911"
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 border border-neutral-700 transition"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Call Local Police / Emergency (911 / 112)</span>
          </a>
        </div>

      </div>
    </div>
  );
}
