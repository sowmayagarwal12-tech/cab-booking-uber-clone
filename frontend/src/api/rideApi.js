import { request } from './apiClient';

export const rideApi = {
  getEstimate: async (estimateData) => {
    return await request('/rides/estimate', {
      method: 'POST',
      body: JSON.stringify(estimateData)
    });
  },

  bookRide: async (bookingData) => {
    return await request('/rides/book', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  getRide: async (rideId) => {
    return await request(`/rides/${rideId}`);
  },

  acceptRide: async (rideId) => {
    return await request(`/rides/${rideId}/accept`, {
      method: 'POST'
    });
  },

  driverArrived: async (rideId) => {
    return await request(`/rides/${rideId}/arrived`, {
      method: 'POST'
    });
  },

  startRide: async (rideId, otp) => {
    return await request(`/rides/${rideId}/start`, {
      method: 'POST',
      body: JSON.stringify({ otp })
    });
  },

  completeRide: async (rideId) => {
    return await request(`/rides/${rideId}/complete`, {
      method: 'POST'
    });
  },

  cancelRide: async (rideId, reason = 'User requested cancellation') => {
    return await request(`/rides/${rideId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  getActiveRide: async () => {
    return await request('/rides/active');
  },

  getRiderHistory: async () => {
    return await request('/rides/rider/history');
  },

  getDriverHistory: async () => {
    return await request('/rides/driver/history');
  },

  downloadInvoice: async (rideId) => {
    const blob = await request(`/rides/${rideId}/invoice`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_Ride_${rideId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  submitRating: async (ratingData) => {
    return await request('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData)
    });
  },

  createPaymentIntent: async (rideId) => {
    return await request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ rideId })
    });
  },

  confirmPayment: async (paymentData) => {
    return await request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  validatePromo: async (code) => {
    return await request('/promos/validate', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  raiseSupportTicket: async (ticketData) => {
    return await request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  },

  triggerSos: async (sosData) => {
    return await request('/support/sos', {
      method: 'POST',
      body: JSON.stringify(sosData)
    });
  }
};
