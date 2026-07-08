import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/authApi.js'
import AuthContext from './authContext.js'

const TOKEN_STORAGE_KEY = 'transportflow-auth-token'

function getStoredToken() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

function storeToken(token) {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

function normalizeAccount(account) {
  if (!account) return account
  return { ...account, role: account.role === 'user' ? 'manager' : account.role }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken)
  const [user, setUser] = useState(null)
  const [appUser, setAppUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isProfileReady, setIsProfileReady] = useState(false)
  const [profileError, setProfileError] = useState('')

  const clearAuthState = useCallback(() => {
    storeToken('')
    setToken('')
    setUser(null)
    setAppUser(null)
    setProfileError('')
    setIsProfileReady(true)
  }, [])

  const getAuthToken = useCallback(async () => {
    const currentToken = token || getStoredToken()

    if (!currentToken) {
      throw new Error('Account is not authenticated')
    }

    return currentToken
  }, [token])

  const loadAppUser = useCallback(async (authToken = token || getStoredToken()) => {
    if (!authToken) {
      clearAuthState()
      return null
    }

    setIsProfileReady(false)
    setProfileError('')

    try {
      const profile = normalizeAccount(await authApi.getCurrentUser(async () => authToken))
      setUser(profile)
      setAppUser(profile)
      return profile
    } catch (error) {
      clearAuthState()
      setProfileError(error.message || 'Unable to load application profile.')
      return null
    } finally {
      setIsProfileReady(true)
    }
  }, [clearAuthState, token])

  useEffect(() => {
    let ignore = false

    async function initializeAuth() {
      const storedToken = getStoredToken()

      if (storedToken) {
        setToken(storedToken)
        await loadAppUser(storedToken)
      } else {
        setIsProfileReady(true)
      }

      if (!ignore) setIsAuthReady(true)
    }

    initializeAuth()

    return () => {
      ignore = true
    }
  }, [loadAppUser])

  const login = useCallback(async ({ email, password }) => {
    try {
      const result = await authApi.login({ email, password })
      const account = normalizeAccount(result.user)
      storeToken(result.token)
      setToken(result.token)
      setUser(account)
      setAppUser(account)
      setProfileError('')
      setIsProfileReady(true)
      return { ok: true, user: account }
    } catch (error) {
      return { ok: false, message: error.message || 'Sign in failed.' }
    }
  }, [])

  const resetPassword = useCallback(async ({ email }) => {
    try {
      await authApi.resetPassword({ email })
      return { ok: false, message: 'Password reset email is not configured. Ask an administrator for help.' }
    } catch (error) {
      return { ok: false, message: error.message || 'Password reset is not configured.' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout(async () => token)
    } catch {
      // Stateless logout still succeeds locally when the backend is unavailable.
    } finally {
      clearAuthState()
    }
  }, [clearAuthState, token])

  const refreshAppUser = useCallback(() => loadAppUser(token || getStoredToken()), [loadAppUser, token])

  const value = useMemo(
    () => ({
      user,
      appUser,
      profileError,
      isAuthReady,
      isProfileReady,
      isAuthenticated: Boolean(user && token),
      isAdmin: appUser?.role === 'admin',
      isManager: appUser?.role === 'manager',
      login,
      resetPassword,
      logout,
      getAuthToken,
      refreshAppUser,
    }),
    [user, appUser, profileError, isAuthReady, isProfileReady, token, login, resetPassword, logout, getAuthToken, refreshAppUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
