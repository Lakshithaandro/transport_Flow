import { apiRequest } from './apiClient.js'

export const invoiceApi = {
  getInvoices: (getAuthToken) => apiRequest('/api/invoices', { getAuthToken }),
  getInvoice: (id, getAuthToken) => apiRequest(`/api/invoices/${id}`, { getAuthToken }),
  getNextInvoiceNumber: (getAuthToken) => apiRequest('/api/invoices/next-number', { getAuthToken }),
  getRevenueSummary: (getAuthToken) => apiRequest('/api/invoices/revenue-summary', { getAuthToken }),
  createInvoice: (payload, getAuthToken) => apiRequest('/api/invoices', { method: 'POST', body: payload, getAuthToken }),
  updateInvoice: (id, payload, getAuthToken) => apiRequest(`/api/invoices/${id}`, { method: 'PATCH', body: payload, getAuthToken }),
  deleteInvoice: (id, getAuthToken) => apiRequest(`/api/invoices/${id}`, { method: 'DELETE', getAuthToken }),
}
