import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../context/useAuth.js'
import AdminAccessDenied from '../../pages/admin/AdminAccessDenied.jsx'

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAuthReady, isProfileReady, isAdmin, profileError } = useAuth()
  const location = useLocation()

  if (!isAuthReady || !isProfileReady) {
    return <main className="page-container">Checking admin access...</main>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (profileError || !isAdmin) {
    return <AdminAccessDenied message={profileError} />
  }

  return children
}
