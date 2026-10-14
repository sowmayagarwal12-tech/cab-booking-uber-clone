import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';
import { Key, Layers, Check, AlertCircle, MapPin, Compass } from 'lucide-react';

export default function MapComponent({
  pickupCoords,
  dropCoords,
  nearbyDrivers = [],
  assignedDriverCoords = null,
  assignedDriverHeading = 0,
  onMapClick = null
}) {
  const savedKey = localStorage.getItem('google_maps_api_key') || '';
  const [apiKey, setApiKey] = useState(savedKey);
  const [mapEngine, setMapEngine] = useState(savedKey ? 'google' : 'leaflet'); // default to leaflet if no key set, can toggle to google
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);

  const containerRef = useRef(null);

  // References for Google Maps objects
  const gMapRef = useRef(null);
  const gPolylineRef = useRef(null);
  const gMarkersRef = useRef({
    pickup: null,
    drop: null,
    assignedDriver: null,
    nearby: [],
    directionsRenderer: null,
    trafficLayer: null
  });

  // References for Leaflet fallback objects
  const lMapRef = useRef(null);
  const lMarkersRef = useRef({
    pickup: null,
    drop: null,
    assignedDriver: null,
    nearby: [],
    routeLine: null
  });

  // Load Google Maps SDK when requested or key available
  useEffect(() => {
    let isMounted = true;

    if (mapEngine === 'google' || apiKey) {
      loadGoogleMaps(apiKey)
        .then(() => {
          if (isMounted && window.google?.maps?.Map) {
            setGoogleMapsReady(true);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Google Maps API unavailable without key, switching to OpenStreetMap:', err);
            setGoogleMapsReady(false);
            setMapEngine('leaflet');
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [mapEngine, apiKey]);

  // Clean container when switching engines
  useEffect(() => {
    if (gMapRef.current) {
      gMapRef.current = null;
    }
    if (lMapRef.current) {
      lMapRef.current.remove();
      lMapRef.current = null;
    }
  }, [mapEngine]);

  // -------------------------------------------------------------
  // 1. GOOGLE MAPS RENDERING ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'google' || !googleMapsReady || !containerRef.current) return;
    if (!window.google?.maps?.Map) return;

    try {
      const google = window.google;

      // Initialize Google Map instance
      if (!gMapRef.current) {
        const initialLat = pickupCoords?.lat || 28.6139;
        const initialLng = pickupCoords?.lng || 77.2090;

        const map = new google.maps.Map(containerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 13,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true
        });

        // Click listener
        map.addListener('click', (e) => {
          if (onMapClick && e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });

        if (google.maps.DirectionsRenderer) {
          gMarkersRef.current.directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#276EF1',
              strokeWeight: 6,
              strokeOpacity: 0.9
            }
          });
        }

        gMapRef.current = map;
      }

      const map = gMapRef.current;

      // Toggle Traffic Layer
      if (trafficEnabled && google.maps.TrafficLayer) {
        if (!gMarkersRef.current.trafficLayer) {
          gMarkersRef.current.trafficLayer = new google.maps.TrafficLayer();
        }
        gMarkersRef.current.trafficLayer.setMap(map);
      } else if (gMarkersRef.current.trafficLayer) {
        gMarkersRef.current.trafficLayer.setMap(null);
      }

      // 1. Pickup Marker (Google Maps)
      if (pickupCoords?.lat && pickupCoords?.lng) {
        const position = { lat: pickupCoords.lat, lng: pickupCoords.lng };
        if (gMarkersRef.current.pickup) {
          gMarkersRef.current.pickup.setPosition(position);
        } else {
          gMarkersRef.current.pickup = new google.maps.Marker({
            position,
            map,
            title: 'Pickup Location',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new google.maps.Size(40, 40)
            }
          });
        }
      } else if (gMarkersRef.current.pickup) {
        gMarkersRef.current.pickup.setMap(null);
        gMarkersRef.current.pickup = null;
      }

      // 2. Drop Destination Marker (Google Maps)
      if (dropCoords?.lat && dropCoords?.lng) {
        const position = { lat: dropCoords.lat, lng: dropCoords.lng };
        if (gMarkersRef.current.drop) {
          gMarkersRef.current.drop.setPosition(position);
        } else {
          gMarkersRef.current.drop = new google.maps.Marker({
            position,
            map,
            title: 'Destination',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(40, 40)
            }
          });
        }
      } else if (gMarkersRef.current.drop) {
        gMarkersRef.current.drop.setMap(null);
        gMarkersRef.current.drop = null;
      }

      // 3. Route Plotting: DirectionsService or Smooth Polyline
      if (pickupCoords?.lat && dropCoords?.lat) {
        const pathCoords = [
          { lat: pickupCoords.lat, lng: pickupCoords.lng },
          {
            lat: (pickupCoords.lat + dropCoords.lat) / 2 + 0.003,
            lng: (pickupCoords.lng + dropCoords.lng) / 2 - 0.003
          },
          { lat: dropCoords.lat, lng: dropCoords.lng }
        ];

        // If API key is present and DirectionsService is available, use Directions
        if (apiKey && google.maps.DirectionsService && gMarkersRef.current.directionsRenderer) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: { lat: pickupCoords.lat, lng: pickupCoords.lng },
              destination: { lat: dropCoords.lat, lng: dropCoords.lng },
              travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                gMarkersRef.current.directionsRenderer.setDirections(result);
                if (gPolylineRef.current) gPolylineRef.current.setMap(null);
              } else {
                drawGooglePolyline(pathCoords, map);
              }
            }
          );
        } else {
          drawGooglePolyline(pathCoords, map);
        }
      } else {
        if (gPolylineRef.current) gPolylineRef.current.setMap(null);
        if (gMarkersRef.current.directionsRenderer) gMarkersRef.current.directionsRenderer.set('directions', null);
      }

      // 4. Assigned Driver Live Moving Marker
      if (assignedDriverCoords?.lat && assignedDriverCoords?.lng) {
        const position = { lat: assignedDriverCoords.lat, lng: assignedDriverCoords.lng };
        if (gMarkersRef.current.assignedDriver) {
          gMarkersRef.current.assignedDriver.setPosition(position);
        } else {
          gMarkersRef.current.assignedDriver = new google.maps.Marker({
            position,
            map,
            title: 'Your Driver',
            icon: {
              url: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
              scaledSize: new google.maps.Size(36, 36)
            }
          });
        }
      } else if (gMarkersRef.current.assignedDriver) {
        gMarkersRef.current.assignedDriver.setMap(null);
        gMarkersRef.current.assignedDriver = null;
      }

      // 5. Nearby Available Drivers
      gMarkersRef.current.nearby.forEach((m) => m.setMap(null));
      gMarkersRef.current.nearby = [];

      if (nearbyDrivers && nearbyDrivers.length > 0) {
        nearbyDrivers.forEach((d) => {
          if (!d.currentLatitude || !d.currentLongitude) return;
          const marker = new google.maps.Marker({
            position: { lat: d.currentLatitude, lng: d.currentLongitude },
            map,
            title: `${d.vehicleModel || 'Cab'} • ${d.rating || '4.9'}★`,
            icon: {
              url: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png',
              scaledSize: new google.maps.Size(26, 26)
            }
          });
          gMarkersRef.current.nearby.push(marker);
        });
      }
    } catch (e) {
      console.warn('Google Maps operation error, switching to OpenStreetMap:', e);
      setMapEngine('leaflet');
    }
  }, [
    mapEngine,
    googleMapsReady,
    pickupCoords,
    dropCoords,
    assignedDriverCoords,
    assignedDriverHeading,
    nearbyDrivers,
    trafficEnabled
  ]);

  const drawGooglePolyline = (coords, map) => {
    if (gPolylineRef.current) {
      gPolylineRef.current.setPath(coords);
      gPolylineRef.current.setMap(map);
    } else {
      gPolylineRef.current = new window.google.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: '#276EF1',
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map
      });
    }
    const bounds = new window.google.maps.LatLngBounds();
    coords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds);
  };

  // -------------------------------------------------------------
  // 2. OPENSTREETMAP / LEAFLET RENDERING ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !containerRef.current) return;

    if (!lMapRef.current) {
      const initialLat = pickupCoords?.lat || 28.6139;
      const initialLng = pickupCoords?.lng || 77.2090;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      map.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      lMapRef.current = map;
    }

    const map = lMapRef.current;

    // Pickup Marker
    if (pickupCoords?.lat && pickupCoords?.lng) {
      const pickupIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `<div class="relative flex items-center justify-center"><div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div><div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">P</div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (lMarkersRef.current.pickup) {
        lMarkersRef.current.pickup.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      } else {
        lMarkersRef.current.pickup = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon }).addTo(map);
      }
    } else if (lMarkersRef.current.pickup) {
      map.removeLayer(lMarkersRef.current.pickup);
      lMarkersRef.current.pickup = null;
    }

    // Destination Marker
    if (dropCoords?.lat && dropCoords?.lng) {
      const dropIcon = L.divIcon({
        className: 'custom-drop-marker',
        html: `<div class="relative flex items-center justify-center"><div class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></div><div class="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">D</div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (lMarkersRef.current.drop) {
        lMarkersRef.current.drop.setLatLng([dropCoords.lat, dropCoords.lng]);
      } else {
        lMarkersRef.current.drop = L.marker([dropCoords.lat, dropCoords.lng], { icon: dropIcon }).addTo(map);
      }
    } else if (lMarkersRef.current.drop) {
      map.removeLayer(lMarkersRef.current.drop);
      lMarkersRef.current.drop = null;
    }

    // Route Polyline
    if (pickupCoords?.lat && dropCoords?.lat) {
      const latlngs = [
        [pickupCoords.lat, pickupCoords.lng],
        [(pickupCoords.lat + dropCoords.lat) / 2 + 0.004, (pickupCoords.lng + dropCoords.lng) / 2 - 0.004],
        [dropCoords.lat, dropCoords.lng]
      ];

      if (lMarkersRef.current.routeLine) {
        lMarkersRef.current.routeLine.setLatLngs(latlngs);
      } else {
        lMarkersRef.current.routeLine = L.polyline(latlngs, {
          color: '#276EF1',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8'
        }).addTo(map);
      }

      const bounds = L.latLngBounds([
        [pickupCoords.lat, pickupCoords.lng],
        [dropCoords.lat, dropCoords.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (lMarkersRef.current.routeLine) {
      map.removeLayer(lMarkersRef.current.routeLine);
      lMarkersRef.current.routeLine = null;
    }

    // Assigned Driver Marker
    if (assignedDriverCoords?.lat && assignedDriverCoords?.lng) {
      const carIcon = L.divIcon({
        className: 'assigned-driver-marker',
        html: `<div class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-base">🚗</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (lMarkersRef.current.assignedDriver) {
        lMarkersRef.current.assignedDriver.setLatLng([assignedDriverCoords.lat, assignedDriverCoords.lng]);
      } else {
        lMarkersRef.current.assignedDriver = L.marker([assignedDriverCoords.lat, assignedDriverCoords.lng], { icon: carIcon }).addTo(map);
      }
    } else if (lMarkersRef.current.assignedDriver) {
      map.removeLayer(lMarkersRef.current.assignedDriver);
      lMarkersRef.current.assignedDriver = null;
    }

    // Nearby Roaming Cabs
    lMarkersRef.current.nearby.forEach((m) => map.removeLayer(m));
    lMarkersRef.current.nearby = [];

    if (nearbyDrivers && nearbyDrivers.length > 0) {
      nearbyDrivers.forEach((d) => {
        if (!d.currentLatitude || !d.currentLongitude) return;
        const icon = L.divIcon({
          className: 'nearby-driver',
          html: `<div class="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-600 flex items-center justify-center text-xs shadow-md">🚕</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        const m = L.marker([d.currentLatitude, d.currentLongitude], { icon }).addTo(map);
        lMarkersRef.current.nearby.push(m);
      });
    }
  }, [mapEngine, pickupCoords, dropCoords, assignedDriverCoords, nearbyDrivers]);

  const handleSaveApiKey = () => {
    const trimmed = inputKey.trim();
    localStorage.setItem('google_maps_api_key', trimmed);
    setApiKey(trimmed);
    setShowKeyModal(false);
    if (trimmed) {
      setMapEngine('google');
    }
    window.location.reload();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col">
      
      {/* MAP HEADER TOOLBAR: Provider Switcher & Controls */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 p-1.5 rounded-2xl shadow-xl">
        
        {/* Map Engine Toggle */}
        <div className="flex items-center bg-black/60 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setMapEngine('google')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              mapEngine === 'google'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🗺️ Google Maps</span>
          </button>

          <button
            onClick={() => setMapEngine('leaflet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
              mapEngine === 'leaflet'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🌍 OpenStreetMap</span>
          </button>
        </div>

        {/* Traffic Layer Toggle for Google Maps */}
        {mapEngine === 'google' && (
          <button
            onClick={() => setTrafficEnabled(!trafficEnabled)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition ${
              trafficEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Toggle Live Traffic Layer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Traffic</span>
          </button>
        )}

        {/* API Key Config Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-neutral-700 transition"
          title="Configure Google Maps API Key"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{apiKey ? 'API Key Set' : 'Enter Key'}</span>
        </button>
      </div>

      {/* Map DOM Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[460px] flex-1 z-10" />

      {/* Map Footer Helper */}
      <div className="absolute bottom-4 left-4 z-20 bg-neutral-900/90 backdrop-blur border border-neutral-800 text-neutral-300 text-xs px-3.5 py-1.5 rounded-xl shadow-xl flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>
          {mapEngine === 'google' ? 'Google Maps Connected' : 'OpenStreetMap Connected'} • Click map to set destination
        </span>
      </div>

      {/* GOOGLE MAPS API KEY CONFIGURATION MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Google Maps API Setup</h3>
                <p className="text-xs text-neutral-400">Enter your Google Maps JavaScript API Key</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              To use production Google Maps without development restrictions, enter your Google Maps API Key below:
            </p>

            <div className="mb-4">
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">Google Maps API Key</label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Save Key</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
