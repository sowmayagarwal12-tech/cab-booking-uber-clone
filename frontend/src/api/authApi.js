import { request, setAuthToken, setCurrentUserToStorage } from './apiClient';

export const authApi = {
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(data.token);
    setCurrentUserToStorage(data);
    return data;
  },

  register: async (userData) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    setAuthToken(data.token);
    setCurrentUserToStorage(data);
    return data;
  },

  demoLogin: async (role = 'rider') => {
    const data = await request(`/auth/demo-login/${role}`, {
      method: 'POST'
    });
    setAuthToken(data.token);
    setCurrentUserToStorage(data);
    return data;
  },

  getMe: async () => {
    return await request('/auth/me');
  },

  logout: () => {
    setAuthToken(null);
    setCurrentUserToStorage(null);
  }
};
