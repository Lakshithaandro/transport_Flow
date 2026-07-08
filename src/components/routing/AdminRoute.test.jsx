import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useAuth from '../../context/useAuth.js'
import AdminRoute from './AdminRoute.jsx'

vi.mock('../../context/useAuth.js')

function renderAdminRoute(authState) {
  useAuth.mockReturnValue(authState)

  return render(
    <MemoryRouter initialEntries={["/admin/dashboard"]}>
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading while profile readiness is pending', () => {
    renderAdminRoute({ isAuthenticated: true, isAuthReady: true, isProfileReady: false, isAdmin: false, profileError: '' })

    expect(screen.getByText(/checking admin access/i)).toBeInTheDocument()
  })

  it('shows access denied for manager accounts', () => {
    renderAdminRoute({ isAuthenticated: true, isAuthReady: true, isProfileReady: true, isAdmin: false, profileError: '' })

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument()
  })

  it('renders children for admin accounts', () => {
    renderAdminRoute({ isAuthenticated: true, isAuthReady: true, isProfileReady: true, isAdmin: true, profileError: '' })

    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })
})
