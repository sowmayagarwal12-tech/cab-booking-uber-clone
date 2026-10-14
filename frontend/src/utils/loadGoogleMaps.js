let googleMapsPromise = null;
let currentLoadedKey = null;

export function loadGoogleMaps(apiKey = '') {
  if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
    return Promise.resolve(window.google.maps);
  }

  // If a new key is provided, allow reloading
  if (apiKey && apiKey !== currentLoadedKey) {
    googleMapsPromise = null;
    currentLoadedKey = apiKey;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.remove();
    }

    const callbackName = '__initGoogleMaps_' + Date.now();
    
    // Set global callback that Google Maps calls when fully initialized
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
        resolve(window.google.maps);
      } else if (window.google && window.google.maps && window.google.maps.importLibrary) {
        // Modern async import library support
        Promise.all([
          window.google.maps.importLibrary('maps'),
          window.google.maps.importLibrary('routes').catch(() => null),
          window.google.maps.importLibrary('marker').catch(() => null)
        ]).then(() => {
          resolve(window.google.maps);
        }).catch(reject);
      } else {
        reject(new Error('Google Maps script loaded but Map constructor is missing'));
      }
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?callback=${callbackName}${keyParam}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;

    const timeout = setTimeout(() => {
      googleMapsPromise = null;
      reject(new Error('Google Maps script load timed out'));
    }, 8000);

    script.onerror = (err) => {
      googleMapsPromise = null;
      clearTimeout(timeout);
      delete window[callbackName];
      console.warn('Failed to load Google Maps script:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
