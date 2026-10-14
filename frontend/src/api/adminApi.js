import { request } from './apiClient';

export const adminApi = {
  getMetrics: async () => {
    return await request('/admin/metrics');
  },

  getAllUsers: async () => {
    return await request('/admin/users');
  },

  toggleUserStatus: async (userId) => {
    return await request(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT'
    });
  },

  getAllDrivers: async () => {
    return await request('/admin/drivers');
  },

  verifyDriver: async (driverId, isVerified) => {
    return await request(`/admin/drivers/${driverId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified })
    });
  },

  getAllRides: async () => {
    return await request('/admin/rides');
  },

  getAllTickets: async () => {
    return await request('/admin/tickets');
  },

  resolveTicket: async (ticketId, notes = 'Resolved by admin') => {
    return await request(`/admin/tickets/${ticketId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  }
};
