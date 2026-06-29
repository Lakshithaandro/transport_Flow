import { useMemo, useState } from 'react'
import AuthContext from './authContext.js'
import { demoCredentials, demoUser } from '../data/vehicleDriverData.js'

const storageKey = 'transportflow-demo-user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(storageKey)
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = ({ email, password }) => {
    const isValidLogin = email === demoCredentials.email && password === demoCredentials.password

    if (!isValidLogin) {
      return { ok: false, message: 'Use the demo credentials shown on this page.' }
    }

    localStorage.setItem(storageKey, JSON.stringify(demoUser))
    setUser(demoUser)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem(storageKey)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
