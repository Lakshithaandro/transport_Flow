import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import AdminRoute from './components/routing/AdminRoute.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import CustomerRouteTripManagement from './pages/CustomerRouteTripManagement.jsx'
import FuelMaintenanceManagement from './pages/FuelMaintenanceManagement.jsx'
import InvoicePaymentManagement from './pages/InvoicePaymentManagement.jsx'
import LogisticsAssistant from './pages/LogisticsAssistant'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import ReportsAnalytics from './pages/ReportsAnalytics.jsx'
import VehicleDriverManagement from './pages/VehicleDriverManagement.jsx'
import AdminActivity from './pages/admin/AdminActivity.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminShipments from './pages/admin/AdminShipments.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

function AdminPage({ children }) {
  return (
    <AdminRoute>
      <AppShell>{children}</AppShell>
    </AdminRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/vehicles-drivers" replace />} />
            <Route path="/vehicles-drivers" element={<ProtectedPage><VehicleDriverManagement /></ProtectedPage>} />
            <Route path="/customers-routes-trips" element={<ProtectedPage><CustomerRouteTripManagement /></ProtectedPage>} />
            <Route path="/fuel-maintenance" element={<ProtectedPage><FuelMaintenanceManagement /></ProtectedPage>} />
            <Route path="/invoices-payments" element={<ProtectedPage><InvoicePaymentManagement /></ProtectedPage>} />
            <Route path="/reports-analytics" element={<ProtectedPage><ReportsAnalytics /></ProtectedPage>} />
            <Route path="/logistics-assistant" element={<ProtectedPage><LogisticsAssistant /></ProtectedPage>} />
            <Route path="/admin" element={<AdminPage><Navigate to="/admin/dashboard" replace /></AdminPage>} />
            <Route path="/admin/dashboard" element={<AdminPage><AdminDashboard /></AdminPage>} />
            <Route path="/admin/users" element={<AdminPage><AdminUsers /></AdminPage>} />
            <Route path="/admin/shipments" element={<AdminPage><AdminShipments /></AdminPage>} />
            <Route path="/admin/activity" element={<AdminPage><AdminActivity /></AdminPage>} />
            <Route path="*" element={<ProtectedPage><NotFound /></ProtectedPage>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
