
import { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiRegister, apiLogout, getStoredSession } from './authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null)
  const [token,         setToken]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [authError,     setAuthError]     = useState(null)
  const [authLoading,   setAuthLoading]   = useState(false)

  useEffect(() => {
    const session = getStoredSession()
    if (session) {
      setUser(session.user)
      setToken(session.token)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { user: u, token: t } = await apiLogin(credentials)
      setUser(u)
      setToken(t)
      return true
    } catch (err) {
      setAuthError(err.message)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const register = async (data) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { user: u, token: t } = await apiRegister(data)
      setUser(u)
      setToken(t)
      return true
    } catch (err) {
      setAuthError(err.message)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setToken(null)
  }

  const clearError = () => setAuthError(null)

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      authLoading, authError,
      login, register, logout, clearError,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
