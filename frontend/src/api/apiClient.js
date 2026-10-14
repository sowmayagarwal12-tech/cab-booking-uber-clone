const API_BASE_URL = 'http://localhost:8080/api';

export const getAuthToken = () => {
  return localStorage.getItem('uber_jwt_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('uber_jwt_token', token);
  } else {
    localStorage.removeItem('uber_jwt_token');
  }
};

export const getCurrentUserFromStorage = () => {
  const user = localStorage.getItem('uber_current_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUserToStorage = (user) => {
  if (user) {
    localStorage.setItem('uber_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('uber_current_user');
  }
};

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  // Handle PDF/binary downloads
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    if (!response.ok) throw new Error('Failed to download invoice PDF');
    return await response.blob();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export default request;
