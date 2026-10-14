import { request } from './apiClient';

export const driverApi = {
  getProfile: async () => {
    return await request('/drivers/profile');
  },

  updateStatus: async (isOnline) => {
    return await request('/drivers/status', {
      method: 'PUT',
      body: JSON.stringify({ isOnline })
    });
  },

  updateLocation: async (locationData) => {
    return await request('/drivers/location', {
      method: 'PUT',
      body: JSON.stringify(locationData)
    });
  },

  getNearbyDrivers: async (lat, lng, radiusKm = 15) => {
    return await request(`/drivers/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
  },

  getOnlineDrivers: async () => {
    return await request('/drivers/online');
  }
};
