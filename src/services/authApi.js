import { apiRequest } from './apiClient.js'

export const authApi = {
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  signup: (payload) => apiRequest('/api/auth/signup', { method: 'POST', body: payload }),
  logout: (getAuthToken) => apiRequest('/api/auth/logout', { method: 'POST', getAuthToken }),
  resetPassword: (payload) => apiRequest('/api/auth/reset-password', { method: 'POST', body: payload }),
  getCurrentUser: (getAuthToken) => apiRequest('/api/auth/me', { getAuthToken }),
}
