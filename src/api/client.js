const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('immuntrack_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...options,
    })

    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      const message = data?.message || response.statusText || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return data
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Unable to connect to backend at ${API_BASE_URL}. Make sure the server is running and reachable.`)
    }
    throw error
  }
}

export { API_BASE_URL }
