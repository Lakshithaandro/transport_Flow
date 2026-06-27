import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import DesignSystem from './pages/DesignSystem.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Overview from './pages/Overview.jsx'
import VehicleDriverManagement from './pages/VehicleDriverManagement.jsx'

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedPage><Overview /></ProtectedPage>} />
          <Route path="/vehicles-drivers" element={<ProtectedPage><VehicleDriverManagement /></ProtectedPage>} />
          <Route path="/design-system" element={<ProtectedPage><DesignSystem /></ProtectedPage>} />
          <Route path="*" element={<ProtectedPage><NotFound /></ProtectedPage>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
