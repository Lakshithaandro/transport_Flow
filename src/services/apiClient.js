const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export async function apiRequest(path, { method = 'GET', body, getAuthToken } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (getAuthToken) {
    const token = await getAuthToken()
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed')
  }

  return data
}
