import { apiRequest } from './apiClient.js'

function toQueryString(params = {}) {
  return new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')).toString()
}

export const adminApi = {
  getDashboard: (getAuthToken) => apiRequest('/api/admin/dashboard', { getAuthToken }),
  getManagers: (params, getAuthToken) => apiRequest(`/api/admin/users?${toQueryString(params)}`, { getAuthToken }),
  getManager: (id, getAuthToken) => apiRequest(`/api/admin/users/${id}`, { getAuthToken }),
  createManager: (payload, getAuthToken) => apiRequest('/api/admin/users', { method: 'POST', body: payload, getAuthToken }),
  updateManager: (id, payload, getAuthToken) => apiRequest(`/api/admin/users/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteManager: (id, getAuthToken) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE', getAuthToken }),
  resetManagerPassword: (id, payload, getAuthToken) => apiRequest(`/api/admin/users/${id}/reset-password`, { method: 'POST', body: payload, getAuthToken }),
  getShipments: (params, getAuthToken) => apiRequest(`/api/admin/shipments?${toQueryString(params)}`, { getAuthToken }),
  getShipment: (id, getAuthToken) => apiRequest(`/api/admin/shipments/${id}`, { getAuthToken }),
  updateShipment: (id, payload, getAuthToken) => apiRequest(`/api/admin/shipments/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteShipment: (id, getAuthToken) => apiRequest(`/api/admin/shipments/${id}`, { method: 'DELETE', getAuthToken }),
  getActivity: (params, getAuthToken) => apiRequest(`/api/admin/activity?${toQueryString(params)}`, { getAuthToken }),
}
