import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Field from '../components/ui/Field.jsx'
import useAuth from '../context/useAuth.js'

function isAllowedRedirect(role, path) {
  if (!path || path === '/login') return false
  if (role === 'admin') return true
  if (role === 'manager') return !path.startsWith('/admin') && path !== '/logistics-assistant'
  return false
}

export default function Login() {
  const [loginRole, setLoginRole] = useState('manager')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await login({ email, password })
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    const accountRole = result.user?.role
    if (accountRole !== loginRole) {
      await logout()
      setError(loginRole === 'admin' ? 'Use an admin account for Admin Login.' : 'Use a manager account for Manager Login.')
      return
    }

    const defaultPath = accountRole === 'admin' ? '/admin/dashboard' : '/dashboard'
    const requestedPath = location.state?.from
    navigate(isAllowedRedirect(accountRole, requestedPath) ? requestedPath : defaultPath, { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-block auth-brand">
          <div className="brand-mark">TF</div>
          <div>
            <p className="brand-name">TransportFlow AI</p>
            <p className="brand-caption">Secure operations access</p>
          </div>
        </div>

        <div>
          <Badge tone="info">Secure access</Badge>
          <h1>Sign in to TransportFlow AI.</h1>
          <p>Use your admin or manager credentials to access authorized transport operations modules.</p>
        </div>

        <div className="inline-group" role="group" aria-label="Login type">
          <button
            className={`button ${loginRole === 'admin' ? 'button-primary' : 'button-secondary'} button-small`}
            type="button"
            onClick={() => { setLoginRole('admin'); setError('') }}
          >
            Admin Login
          </button>
          <button
            className={`button ${loginRole === 'manager' ? 'button-primary' : 'button-secondary'} button-small`}
            type="button"
            onClick={() => { setLoginRole('manager'); setError('') }}
          >
            Manager Login
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field label="Email">
            <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          <Field label="Password">
            <div className="password-control">
              <input
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength="6"
              />
              <button className="button button-secondary button-small" type="button" onClick={() => setShowPassword((current) => !current)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </Field>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : loginRole === 'admin' ? 'Admin Login' : 'Manager Login'}
          </button>
        </form>

        <div className="auth-hint">
          <strong>Need an account?</strong>
          <span>Manager accounts are created by an administrator. Contact your TransportFlow AI admin for access.</span>
        </div>
      </section>
    </main>
  )
}
