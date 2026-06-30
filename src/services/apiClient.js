const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export async function apiRequest(
  path,
  { method = 'GET', body, getAuthToken } = {}
) {
  const headers = {
    'Content-Type': 'application/json',
  }

  // Get Firebase token and attach it to the request
  if (getAuthToken) {
    const token = await getAuthToken()
    console.log('Firebase Token:', token)

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const url = `${apiBaseUrl}${path}`
  let response

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(
      `Unable to reach the API at ${apiBaseUrl}. Check that the backend is running, VITE_API_BASE_URL is correct, and CORS allows this frontend.`
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const message =
      [data?.message, data?.error].filter(Boolean).join(': ') ||
      'API request failed'

    throw new Error(
      `${message} (${response.status} ${response.statusText || 'Error'}: ${path})`
    )
  }

  return data
}