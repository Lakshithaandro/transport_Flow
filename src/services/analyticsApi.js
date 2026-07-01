import { apiRequest } from './apiClient.js'

export const analyticsApi = {
  getReports: (getAuthToken) => apiRequest('/api/analytics/reports', { getAuthToken }),
  getRouteOptimization: (getAuthToken) => apiRequest('/api/analytics/route-optimization', { getAuthToken }),
}
