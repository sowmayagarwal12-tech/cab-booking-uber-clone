import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, Search, X } from 'lucide-react';

// Comprehensive dataset of curated landmarks for New Delhi NCR and Lucknow
export const LOCATIONS_DB = [
  // --- LUCKNOW LOCATIONS (45+ entries) ---
  { name: 'Jingle Bell Kids Convent School', address: 'Campbell Road, Thakurganj, Chowk, Lucknow, UP 226003', city: 'Lucknow', lat: 26.8680, lng: 80.9025 },
  { name: 'Chowk Central & Clock Tower', address: 'Chowk, Old Lucknow, Uttar Pradesh 226003', city: 'Lucknow', lat: 26.8692, lng: 80.9064 },
  { name: 'Bara Imambara (Asfi Mosque)', address: 'Machchhi Bhavan, Lucknow, Uttar Pradesh 226003', city: 'Lucknow', lat: 26.8690, lng: 80.9130 },
  { name: 'Chota Imambara', address: 'Tahseen Ganj, Husainabad, Lucknow, UP 226003', city: 'Lucknow', lat: 26.8741, lng: 80.9048 },
  { name: 'Rumi Darwaza', address: 'Husainabad, Lucknow, Uttar Pradesh 226003', city: 'Lucknow', lat: 26.8708, lng: 80.9118 },
  { name: 'KGMU (King George’s Medical University)', address: 'Shah Mina Road, Chowk, Lucknow, UP 226003', city: 'Lucknow', lat: 26.8687, lng: 80.9168 },
  { name: 'Thakurganj Police Station', address: 'Thakurganj, Chowk, Lucknow, UP 226003', city: 'Lucknow', lat: 26.8650, lng: 80.8980 },
  { name: 'Campbell Road Chauraha', address: 'Campbell Road, Rajajipuram, Lucknow, UP 226017', city: 'Lucknow', lat: 26.8570, lng: 80.8940 },
  { name: 'Rajajipuram E-Block Market', address: 'Rajajipuram, Lucknow, Uttar Pradesh 226017', city: 'Lucknow', lat: 26.8480, lng: 80.8900 },
  { name: 'Hazratganj Metro & Market', address: 'Hazratganj, Lucknow, Uttar Pradesh 226001', city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Charbagh Railway Station (LKO)', address: 'Charbagh, Lucknow, Uttar Pradesh 226004', city: 'Lucknow', lat: 26.8310, lng: 80.9220 },
  { name: 'CCS International Airport (Amausi)', address: 'Amausi, Lucknow, Uttar Pradesh 226009', city: 'Lucknow', lat: 26.7606, lng: 80.8836 },
  { name: 'Gomti Nagar Patrakar Puram', address: 'Patrakar Puram, Gomti Nagar, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8504, lng: 80.9984 },
  { name: 'Lulu Mall Lucknow', address: 'Amar Shaheed Path, Golf City, Lucknow, UP 226030', city: 'Lucknow', lat: 26.7725, lng: 80.9880 },
  { name: 'Phoenix Palassio Mall', address: 'Amar Shaheed Path, Gomti Nagar Ext, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8123, lng: 81.0116 },
  { name: 'Phoenix United Mall Alambagh', address: 'Kanpur Road, Alambagh, Lucknow, UP 226005', city: 'Lucknow', lat: 26.7932, lng: 80.8998 },
  { name: 'Ekana International Cricket Stadium', address: 'Amar Shaheed Path, Gomti Nagar Ext, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8115, lng: 81.0162 },
  { name: 'Janeshwar Mishra Park Gate 1', address: 'Gomti Nagar, Lucknow, Uttar Pradesh 226010', city: 'Lucknow', lat: 26.8383, lng: 80.9856 },
  { name: 'Ambedkar Memorial Park', address: 'Vipin Khand, Gomti Nagar, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8523, lng: 80.9733 },
  { name: 'SGPGI Hospital (Sanjay Gandhi PGI)', address: 'Raebareli Road, Lucknow, Uttar Pradesh 226014', city: 'Lucknow', lat: 26.7458, lng: 80.9389 },
  { name: 'Dr. Ram Manohar Lohia Hospital', address: 'Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8643, lng: 80.9991 },
  { name: 'Medanta Hospital Lucknow', address: 'Pocket 1, Sector A, Golf City, Lucknow, UP 226030', city: 'Lucknow', lat: 26.7790, lng: 80.9930 },
  { name: 'Alambagh Bus Terminal & Metro', address: 'Alambagh, Lucknow, Uttar Pradesh 226005', city: 'Lucknow', lat: 26.8138, lng: 80.9009 },
  { name: 'Kaiserbagh Bus Station', address: 'Kaiserbagh, Lucknow, Uttar Pradesh 226001', city: 'Lucknow', lat: 26.8509, lng: 80.9295 },
  { name: 'Aminabad Market & Tunday Kababi', address: 'Aminabad, Lucknow, Uttar Pradesh 226018', city: 'Lucknow', lat: 26.8437, lng: 80.9254 },
  { name: 'Indira Nagar Bhootnath Market', address: 'Bhootnath, Sector 5, Indira Nagar, Lucknow, UP 226016', city: 'Lucknow', lat: 26.8750, lng: 80.9850 },
  { name: 'Munshi Pulia Metro & Chauraha', address: 'Indira Nagar, Lucknow, Uttar Pradesh 226016', city: 'Lucknow', lat: 26.8833, lng: 80.9833 },
  { name: 'Lucknow University (LU Main Campus)', address: 'Badshah Bagh, University Road, Lucknow, UP 226007', city: 'Lucknow', lat: 26.8636, lng: 80.9388 },
  { name: 'Mahanagar Gole Market', address: 'Mahanagar, Lucknow, Uttar Pradesh 226006', city: 'Lucknow', lat: 26.8770, lng: 80.9520 },
  { name: 'Aliganj Kapoorthala Market', address: 'Kapoorthala, Aliganj, Lucknow, UP 226024', city: 'Lucknow', lat: 26.8870, lng: 80.9420 },
  { name: 'Vikas Nagar Sector 4', address: 'Vikas Nagar, Lucknow, Uttar Pradesh 226022', city: 'Lucknow', lat: 26.8950, lng: 80.9600 },
  { name: 'Telibagh Market & Cantt', address: 'Telibagh, Lucknow, Uttar Pradesh 226025', city: 'Lucknow', lat: 26.7910, lng: 80.9410 },
  { name: 'Ashiyana Bangla Bazar', address: 'Sector M, Ashiyana, Lucknow, UP 226012', city: 'Lucknow', lat: 26.7900, lng: 80.9100 },
  { name: 'Singar Nagar Metro Station', address: 'Singar Nagar, Alambagh, Lucknow, UP 226005', city: 'Lucknow', lat: 26.8050, lng: 80.9040 },
  { name: 'Transport Nagar Metro & RTO', address: 'Transport Nagar, Lucknow, UP 226012', city: 'Lucknow', lat: 26.7750, lng: 80.8870 },
  { name: 'Wave Mall Gomti Nagar', address: 'Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8617, lng: 80.9975 },
  { name: 'Fun Republic Mall', address: 'Eldeco Greens, Gomti Nagar, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8530, lng: 80.9740 },
  { name: 'Gomti Riverfront Promenade', address: 'Jopling Road, Gomti Riverfront, Lucknow, UP 226001', city: 'Lucknow', lat: 26.8570, lng: 80.9590 },
  { name: 'Chinhat Industrial Area & Tiraha', address: 'Chinhat, Faizabad Road, Lucknow, UP 226028', city: 'Lucknow', lat: 26.8890, lng: 81.0350 },
  { name: 'Gomti Nagar Extension Sector 4', address: 'Gomti Nagar Extension, Lucknow, UP 226010', city: 'Lucknow', lat: 26.8250, lng: 81.0200 },
  { name: 'Butler Colony / Dalibagh', address: 'Dalibagh Officers Colony, Lucknow, UP 226001', city: 'Lucknow', lat: 26.8420, lng: 80.9600 },
  { name: 'Chander Nagar Alambagh', address: 'Chander Nagar, Lucknow, UP 226005', city: 'Lucknow', lat: 26.8170, lng: 80.9060 },
  { name: 'IT Chauraha & Metro Station', address: 'Faizabad Road, Hasanganj, Lucknow, UP 226007', city: 'Lucknow', lat: 26.8680, lng: 80.9410 },
  { name: 'Husainabad Clock Tower', address: 'Husainabad, Lucknow, Uttar Pradesh 226003', city: 'Lucknow', lat: 26.8715, lng: 80.9090 },

  // --- NEW DELHI NCR LOCATIONS (40+ entries) ---
  { name: 'Connaught Place Central', address: 'Connaught Place, New Delhi, Delhi 110001', city: 'Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Indira Gandhi International Airport T3', address: 'Terminal 3, New Delhi, Delhi 110037', city: 'Delhi', lat: 28.5562, lng: 77.1000 },
  { name: 'Airport Terminal 1D (Domestic)', address: 'Palam, New Delhi, Delhi 110037', city: 'Delhi', lat: 28.5665, lng: 77.1231 },
  { name: 'India Gate Monument', address: 'Rajpath, India Gate, New Delhi, Delhi 110001', city: 'Delhi', lat: 28.6129, lng: 77.2295 },
  { name: 'Cyber Hub Tech Park', address: 'DLF Cyber City, DLF Phase 2, Gurugram, Haryana 122002', city: 'Delhi', lat: 28.4900, lng: 77.0900 },
  { name: 'New Delhi Railway Station (NDLS)', address: 'Bhavbhuti Marg, Ratan Lal Market, Delhi 110006', city: 'Delhi', lat: 28.6429, lng: 77.2195 },
  { name: 'Hazrat Nizamuddin Railway Station', address: 'Nizamuddin, New Delhi, Delhi 110013', city: 'Delhi', lat: 28.5886, lng: 77.2534 },
  { name: 'Old Delhi Railway Station (DLI)', address: 'Mori Gate, Delhi 110006', city: 'Delhi', lat: 28.6619, lng: 77.2301 },
  { name: 'Anand Vihar ISBT & Terminal', address: 'Anand Vihar, New Delhi, Delhi 110092', city: 'Delhi', lat: 28.6469, lng: 77.3160 },
  { name: 'Kashmiri Gate ISBT', address: 'Kashmere Gate, New Delhi, Delhi 110006', city: 'Delhi', lat: 28.6675, lng: 77.2285 },
  { name: 'Hauz Khas Village & Deer Park', address: 'Hauz Khas, New Delhi, Delhi 110016', city: 'Delhi', lat: 28.5494, lng: 77.1947 },
  { name: 'DLF Mall of India Noida', address: 'Sector 18, Noida, Uttar Pradesh 201301', city: 'Delhi', lat: 28.5672, lng: 77.3211 },
  { name: 'Sector 18 Noida Market & Metro', address: 'Sector 18, Noida, Uttar Pradesh 201301', city: 'Delhi', lat: 28.5708, lng: 77.3260 },
  { name: 'Sector 62 Electronic City Noida', address: 'Sector 62, Noida, Uttar Pradesh 201301', city: 'Delhi', lat: 28.6280, lng: 77.3649 },
  { name: 'Select CITYWALK Mall Saket', address: 'Saket District Centre, Pushp Vihar, New Delhi 110017', city: 'Delhi', lat: 28.5284, lng: 77.2193 },
  { name: 'Qutub Minar', address: 'Seth Sarai, Mehrauli, New Delhi, Delhi 110030', city: 'Delhi', lat: 28.5245, lng: 77.1855 },
  { name: 'Lotus Temple', address: 'Kalkaji, New Delhi, Delhi 110019', city: 'Delhi', lat: 28.5535, lng: 77.2588 },
  { name: 'Red Fort (Lal Qila)', address: 'Netaji Subhash Marg, Chandni Chowk, Delhi 110006', city: 'Delhi', lat: 28.6562, lng: 77.2410 },
  { name: 'Chandni Chowk Market', address: 'Old Delhi, New Delhi, Delhi 110006', city: 'Delhi', lat: 28.6506, lng: 77.2303 },
  { name: 'Khan Market', address: 'Rabindra Nagar, New Delhi, Delhi 110003', city: 'Delhi', lat: 28.6003, lng: 77.2270 },
  { name: 'Akshardham Temple', address: 'Noida Link Road, Pandav Nagar, New Delhi, Delhi 110092', city: 'Delhi', lat: 28.6127, lng: 77.2773 },
  { name: 'Rajiv Chowk Metro Station', address: 'Connaught Place, New Delhi, Delhi 110001', city: 'Delhi', lat: 28.6328, lng: 77.2197 },
  { name: 'Vasant Kunj Promenade Mall', address: 'Nelson Mandela Road, Vasant Kunj, New Delhi 110070', city: 'Delhi', lat: 28.5402, lng: 77.1558 },
  { name: 'Lajpat Nagar Central Market', address: 'Lajpat Nagar II, New Delhi, Delhi 110024', city: 'Delhi', lat: 28.5700, lng: 77.2400 },
  { name: 'Karol Bagh Market', address: 'Karol Bagh, New Delhi, Delhi 110005', city: 'Delhi', lat: 28.6514, lng: 77.1907 },
  { name: 'AIIMS Hospital Ansari Nagar', address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029', city: 'Delhi', lat: 28.5672, lng: 77.2100 },
  { name: 'South Extension Market', address: 'South Extension Part II, New Delhi, Delhi 110049', city: 'Delhi', lat: 28.5733, lng: 77.2223 },
  { name: 'Greater Kailash M-Block Market', address: 'GK 1, New Delhi, Delhi 110048', city: 'Delhi', lat: 28.5482, lng: 77.2344 },
  { name: 'Nehru Place IT Market', address: 'Nehru Place, New Delhi, Delhi 110019', city: 'Delhi', lat: 28.5494, lng: 77.2536 },
  { name: 'Sarojini Nagar Market', address: 'Sarojini Nagar, New Delhi, Delhi 110023', city: 'Delhi', lat: 28.5772, lng: 77.1983 },
  { name: 'Sector 29 Gurugram', address: 'Sector 29, Gurugram, Haryana 122001', city: 'Delhi', lat: 28.4682, lng: 77.0632 },
  { name: 'Ambience Mall Gurugram', address: 'NH-8, Ambience Island, Gurugram, Haryana 122002', city: 'Delhi', lat: 28.5042, lng: 77.0968 },
  { name: 'Dwarka Sector 21 Metro', address: 'Sector 21, Dwarka, New Delhi 110077', city: 'Delhi', lat: 28.5523, lng: 77.0583 },
  { name: 'Rohini Sector 10 Mall', address: 'Sector 10, Rohini, New Delhi 110085', city: 'Delhi', lat: 28.7166, lng: 77.1126 },
  { name: 'Delhi University North Campus', address: 'University Enclave, Delhi 110007', city: 'Delhi', lat: 28.6904, lng: 77.2072 },
  { name: 'Aerocity Hospitality District', address: 'Aerocity, IGI Airport, New Delhi 110037', city: 'Delhi', lat: 28.5504, lng: 77.1213 },
  { name: 'Pacific Mall Tagore Garden', address: 'Tagore Garden, New Delhi 110027', city: 'Delhi', lat: 28.6425, lng: 77.1065 },
  { name: 'Mayur Vihar Phase 1', address: 'Mayur Vihar, New Delhi, Delhi 110091', city: 'Delhi', lat: 28.6075, lng: 77.2995 },
  { name: 'Noida Film City', address: 'Sector 16A, Noida, Uttar Pradesh 201301', city: 'Delhi', lat: 28.5662, lng: 77.3190 },
  { name: 'Dhaula Kuan Enclave', address: 'Dhaula Kuan, New Delhi, Delhi 110010', city: 'Delhi', lat: 28.5921, lng: 77.1614 }
];

// Helper to calculate distance in km using Haversine formula
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function LocationInput({
  label,
  dotColor = 'emerald', // 'emerald' | 'red'
  currentLocation,
  onSelectLocation,
  isSettingOnMap,
  onToggleSetOnMap,
  showCurrentLocationBtn = false,
  referenceLocation = null, // Pickup location used to sort destinations by proximity!
  activeCity = 'DELHI' // 'DELHI' | 'LUCKNOW'
}) {
  const [query, setQuery] = useState(currentLocation?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal query when currentLocation prop changes externally
  useEffect(() => {
    if (currentLocation?.name) {
      setQuery(currentLocation.name);
    }
  }, [currentLocation?.name]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort local items by proximity to referenceLocation (nearest displayed first)
  const getSortedMatches = (text, refLoc) => {
    let list = LOCATIONS_DB;

    if (text && text.trim()) {
      const qLower = text.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(qLower) ||
          h.address.toLowerCase().includes(qLower) ||
          h.city.toLowerCase().includes(qLower)
      );
    }

    // Attach distanceKm from reference location if available
    const items = list.map((item) => {
      let dist = null;
      if (refLoc?.lat != null && refLoc?.lng != null) {
        dist = calculateDistanceKm(refLoc.lat, refLoc.lng, item.lat, item.lng);
      }
      return {
        ...item,
        distanceKm: dist
      };
    });

    // If referenceLocation is provided: ALWAYS SORT ASCENDING BY DISTANCE
    if (refLoc?.lat != null && refLoc?.lng != null) {
      items.sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else {
      // Prioritize activeCity if no reference location given
      items.sort((a, b) => {
        const aCityMatch = a.city?.toLowerCase() === activeCity?.toLowerCase() ? 0 : 1;
        const bCityMatch = b.city?.toLowerCase() === activeCity?.toLowerCase() ? 0 : 1;
        return aCityMatch - bCityMatch;
      });
    }

    return items.slice(0, 8);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    // 1. Instant local matching with proximity sorting
    const localMatches = getSortedMatches(val, referenceLocation);
    setSuggestions(localMatches);

    // 2. Debounced online geocoding (OpenStreetMap Nominatim)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (val.trim().length >= 3) {
        setIsSearching(true);
        try {
          // City-aware bounding box to prevent irrelevant cross-country results
          let viewboxParam = '';
          const isLucknowContext =
            activeCity === 'LUCKNOW' ||
            (referenceLocation && referenceLocation.lat < 27.5 && referenceLocation.lng > 80.0);

          if (isLucknowContext) {
            viewboxParam = '&viewbox=80.60,27.15,81.25,26.50&bounded=0';
          } else {
            viewboxParam = '&viewbox=76.80,28.95,77.60,28.30&bounded=0';
          }

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              val
            )}${viewboxParam}&limit=6&addressdetails=1&countrycodes=in`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (res.ok) {
            const data = await res.json();
            const onlineResults = data.map((item) => {
              const nameParts = item.display_name.split(',');
              const mainName = nameParts.slice(0, 2).join(',').trim();
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const distanceKm =
                referenceLocation?.lat != null && referenceLocation?.lng != null
                  ? calculateDistanceKm(referenceLocation.lat, referenceLocation.lng, lat, lng)
                  : null;

              return {
                name: mainName || item.name,
                address: item.display_name,
                city: lat < 27.5 ? 'Lucknow' : 'Delhi',
                lat,
                lng,
                distanceKm
              };
            });

            // Merge local and online, avoiding duplicates
            const combined = [...localMatches];
            onlineResults.forEach((onl) => {
              if (
                !combined.some(
                  (c) =>
                    Math.abs(c.lat - onl.lat) < 0.001 &&
                    Math.abs(c.lng - onl.lng) < 0.001
                )
              ) {
                combined.push(onl);
              }
            });

            // Re-sort entire combined list by proximity to pickup if referenceLocation exists
            if (referenceLocation?.lat != null && referenceLocation?.lng != null) {
              combined.sort((a, b) => {
                if (a.distanceKm == null) return 1;
                if (b.distanceKm == null) return -1;
                return a.distanceKm - b.distanceKm;
              });
            }

            setSuggestions(combined.slice(0, 8));
          }
        } catch {
          // Keep local matches on network error
        } finally {
          setIsSearching(false);
        }
      }
    }, 300);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelectLocation({
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      city: item.city
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let formattedName = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              const parts = data.display_name.split(',');
              formattedName = parts.slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Use lat/lng fallback
        } finally {
          setIsLocating(false);
          setQuery(formattedName);
          setIsOpen(false);
          onSelectLocation({
            name: formattedName,
            lat,
            lng,
            city: lat < 27.5 ? 'Lucknow' : 'Delhi'
          });
        }
      },
      (error) => {
        setIsLocating(false);
        alert('Could not retrieve current location: ' + error.message + '. Please allow location access in your browser or select a location on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const formatDistanceBadge = (distKm) => {
    if (distKm == null) return null;
    if (distKm < 1) {
      return `${Math.round(distKm * 1000)} m away`;
    }
    return `${distKm.toFixed(1)} km away`;
  };

  return (
    <div ref={containerRef} className="relative">
      
      {/* Label & Header Controls */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-neutral-300 font-bold flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${dotColor === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          <span>{label}</span>
          {referenceLocation && (
            <span className="text-[10px] text-blue-400 font-normal ml-1">
              (sorted by nearest)
            </span>
          )}
        </span>

        <div className="flex items-center space-x-2">
          {/* Use Current Location Button (Pickup only) */}
          {showCurrentLocationBtn && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition flex items-center space-x-1 disabled:opacity-50"
              title="Use current GPS location"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  <span>Current Location</span>
                </>
              )}
            </button>
          )}

          {/* Set via Map Toggle */}
          <button
            type="button"
            onClick={onToggleSetOnMap}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
              isSettingOnMap
                ? dotColor === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {isSettingOnMap ? '● Setting on Map' : 'Set via Map'}
          </button>
        </div>
      </div>

      {/* Input Field with Autocomplete Trigger */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-3.5 h-3.5" />
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            setSuggestions(getSortedMatches(query, referenceLocation));
          }}
          onChange={handleInputChange}
          placeholder={`Search ${label.toLowerCase()} in Lucknow or Delhi...`}
          className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-blue-500 rounded-xl pl-8 pr-8 py-2 text-xs text-white focus:outline-none font-medium transition shadow-inner placeholder-neutral-500"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions(getSortedMatches('', referenceLocation));
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-500 hover:text-neutral-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-semibold px-3 bg-neutral-950">
            <span className="flex items-center space-x-1.5">
              <span>SUGGESTED LOCATIONS</span>
              {referenceLocation && (
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Nearest First
                </span>
              )}
            </span>
            {isSearching && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
          </div>

          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500">
              No matching locations found. Try searching another landmark.
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left p-2.5 hover:bg-neutral-800 transition flex items-start space-x-2.5 border-b border-neutral-800/40 last:border-b-0 group"
              >
                <div className="p-1.5 bg-neutral-800 group-hover:bg-blue-600/20 text-neutral-400 group-hover:text-blue-400 rounded-lg transition mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 truncate mr-2">
                      {item.name}
                    </div>
                    {item.distanceKm != null && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                        {formatDistanceBadge(item.distanceKm)}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate mt-0.5 flex items-center space-x-1.5">
                    {item.city && (
                      <span className="px-1 py-0.2 bg-neutral-800 rounded text-[9px] text-neutral-300 font-medium">
                        {item.city}
                      </span>
                    )}
                    <span className="truncate">{item.address || item.name}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

    </div>
  );
}
