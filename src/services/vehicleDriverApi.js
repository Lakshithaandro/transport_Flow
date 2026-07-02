import { apiRequest } from './apiClient.js'

export const vehicleDriverApi = {
  getVehicles: (getAuthToken) => apiRequest('/api/vehicles', { getAuthToken }),
  createVehicle: (payload, getAuthToken) => apiRequest('/api/vehicles', { method: 'POST', body: payload, getAuthToken }),
  updateVehicle: (id, payload, getAuthToken) => apiRequest(`/api/vehicles/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteVehicle: (id, getAuthToken) => apiRequest(`/api/vehicles/${id}`, { method: 'DELETE', getAuthToken }),
  getDrivers: (getAuthToken) => apiRequest('/api/drivers', { getAuthToken }),
  createDriver: (payload, getAuthToken) => apiRequest('/api/drivers', { method: 'POST', body: payload, getAuthToken }),
  updateDriver: (id, payload, getAuthToken) => apiRequest(`/api/drivers/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteDriver: (id, getAuthToken) => apiRequest(`/api/drivers/${id}`, { method: 'DELETE', getAuthToken }),
}
