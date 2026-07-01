import { apiRequest } from './apiClient.js'

export const fuelMaintenanceApi = {
  getFuelLogs: (getAuthToken) => apiRequest('/api/fuel-logs', { getAuthToken }),
  createFuelLog: (payload, getAuthToken) => apiRequest('/api/fuel-logs', { method: 'POST', body: payload, getAuthToken }),
  updateFuelLog: (id, payload, getAuthToken) => apiRequest(`/api/fuel-logs/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteFuelLog: (id, getAuthToken) => apiRequest(`/api/fuel-logs/${id}`, { method: 'DELETE', getAuthToken }),
  getMaintenanceRecords: (getAuthToken) => apiRequest('/api/maintenance', { getAuthToken }),
  createMaintenanceRecord: (payload, getAuthToken) => apiRequest('/api/maintenance', { method: 'POST', body: payload, getAuthToken }),
  updateMaintenanceRecord: (id, payload, getAuthToken) => apiRequest(`/api/maintenance/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteMaintenanceRecord: (id, getAuthToken) => apiRequest(`/api/maintenance/${id}`, { method: 'DELETE', getAuthToken }),
  getSummary: (getAuthToken) => apiRequest('/api/fuel-maintenance/summary', { getAuthToken }),
}
