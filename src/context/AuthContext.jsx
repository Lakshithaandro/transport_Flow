import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { firebaseAuth } from '../firebase.js'
import AuthContext from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsAuthReady(true)
    })

    return unsubscribe
  }, [])

  const login = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message || 'Firebase sign in failed.' }
    }
  }

  const signup = async ({ email, password }) => {
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message || 'Firebase sign up failed.' }
    }
  }

  const resetPassword = async ({ email }) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email)
      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message || 'Firebase password reset failed.' }
    }
  }

  const logout = () => signOut(firebaseAuth)

  const getAuthToken = async () => {
    if (!firebaseAuth.currentUser) {
      throw new Error('User is not authenticated')
    }

    return firebaseAuth.currentUser.getIdToken()
  }

  const value = useMemo(
    () => ({
      user,
      isAuthReady,
      isAuthenticated: Boolean(user),
      login,
      signup,
      resetPassword,
      logout,
      getAuthToken,
    }),
    [user, isAuthReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
