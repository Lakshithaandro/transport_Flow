import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../context/useAuth.js'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth()
  const location = useLocation()

  if (!isAuthReady) {
    return <main className="page-container">Checking authentication...</main>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
