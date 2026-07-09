import { apiRequest } from './apiClient.js'

function buildQueryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const analyticsApi = {
  getReports: (getAuthToken, filters) => apiRequest(`/api/analytics/reports${buildQueryString(filters)}`, { getAuthToken }),
  getRouteOptimization: (getAuthToken) => apiRequest('/api/analytics/route-optimization', { getAuthToken }),
}
