import { apiRequest } from '../api/client'

export async function apiLogin({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const safeUser = {
    id: data.doctor.id,
    name: data.doctor.full_name,
    email: data.doctor.email,
    role: data.doctor.role || 'Vaccination Officer',
    clinic: data.doctor.clinic_name || 'General Clinic',
  }

  console.log('Login successful, storing token:', data.token.substring(0, 50) + '...')
  localStorage.setItem('immuntrack_token', data.token)
  localStorage.setItem('immuntrack_user', JSON.stringify(safeUser))

  return { user: safeUser, token: data.token }
}

export async function apiRegister({ name, email, password, role, clinic }) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: name,
      email,
      password,
      clinic_name: clinic,
      role,
    }),
  })

  const safeUser = {
    id: data.doctor.id,
    name,
    email,
    role: role || 'Vaccination Officer',
    clinic: clinic || 'General Clinic',
  }

  localStorage.setItem('immuntrack_token', data.token)
  localStorage.setItem('immuntrack_user', JSON.stringify(safeUser))

  return { user: safeUser, token: data.token }
}

export function apiLogout() {
  localStorage.removeItem('immuntrack_token')
  localStorage.removeItem('immuntrack_user')
}

function decodeJwtPayload(token) {
  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null
    // JWT uses base64url encoding, convert to standard base64
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function getStoredSession() {
  try {
    const token = localStorage.getItem('immuntrack_token')
    const user  = JSON.parse(localStorage.getItem('immuntrack_user') || 'null')
    if (!token || !user) {
      console.log('No token or user in localStorage')
      return null
    }

    let payload = null
    try {
      payload = token.includes('.') ? decodeJwtPayload(token) : JSON.parse(atob(token))
    } catch (decodeError) {
      console.error('Failed to decode token:', decodeError)
      apiLogout()
      return null
    }

    if (payload?.exp && payload.exp < Date.now() / 1000) {
      console.log('Token expired, exp:', payload.exp, 'now:', Date.now() / 1000)
      apiLogout()
      return null
    }

    console.log('Valid session found:', { user: user.name, exp: payload?.exp })
    return { user, token }
  } catch (error) {
    console.error('Error in getStoredSession:', error)
    return null
  }
}
