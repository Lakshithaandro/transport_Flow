const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function buildHeaders(getAuthToken) {
  const headers = { 'Content-Type': 'application/json' }

  if (typeof getAuthToken === 'function') {
    const token = await getAuthToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function apiRequest(path, { method = 'GET', body, getAuthToken } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: await buildHeaders(getAuthToken),
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed. Please try again.')
  }

  return data
}
