import { apiRequest } from './apiClient.js'

export const aiApi = {
  getStatus: (getAuthToken) => apiRequest('/api/ai/status', { getAuthToken }),
  askAssistant: (question, getAuthToken) => apiRequest('/api/ai/assistant', { method: 'POST', body: { question }, getAuthToken }),
}
