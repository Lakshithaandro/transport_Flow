import { apiRequest } from './apiClient.js'

export const customerRouteTripApi = {
  getCustomers: (getAuthToken) => apiRequest('/api/customers', { getAuthToken }),
  createCustomer: (payload, getAuthToken) => apiRequest('/api/customers', { method: 'POST', body: payload, getAuthToken }),
  updateCustomer: (id, payload, getAuthToken) => apiRequest(`/api/customers/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteCustomer: (id, getAuthToken) => apiRequest(`/api/customers/${id}`, { method: 'DELETE', getAuthToken }),
  getRoutes: (getAuthToken) => apiRequest('/api/routes', { getAuthToken }),
  createRoute: (payload, getAuthToken) => apiRequest('/api/routes', { method: 'POST', body: payload, getAuthToken }),
  updateRoute: (id, payload, getAuthToken) => apiRequest(`/api/routes/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteRoute: (id, getAuthToken) => apiRequest(`/api/routes/${id}`, { method: 'DELETE', getAuthToken }),
  getTrips: (getAuthToken) => apiRequest('/api/trips', { getAuthToken }),
  createTrip: (payload, getAuthToken) => apiRequest('/api/trips', { method: 'POST', body: payload, getAuthToken }),
  updateTrip: (id, payload, getAuthToken) => apiRequest(`/api/trips/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteTrip: (id, getAuthToken) => apiRequest(`/api/trips/${id}`, { method: 'DELETE', getAuthToken }),
}
