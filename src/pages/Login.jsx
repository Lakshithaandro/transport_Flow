import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Field from '../components/ui/Field.jsx'
import useAuth from '../context/useAuth.js'
import { demoCredentials } from '../data/vehicleDriverData.js'

export default function Login() {
  const [email, setEmail] = useState(demoCredentials.email)
  const [password, setPassword] = useState(demoCredentials.password)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = login({ email, password })

    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate(location.state?.from || '/', { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-block auth-brand">
          <div className="brand-mark">TF</div>
          <div>
            <p className="brand-name">TransportFlow AI</p>
            <p className="brand-caption">Milestone 2 authentication</p>
          </div>
        </div>

        <div>
          <Badge tone="info">Frontend mock auth</Badge>
          <h1>Sign in to manage vehicles and drivers.</h1>
          <p>
            This milestone uses a demo login only. Production authentication and backend
            sessions are deferred to a later milestone.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field label="Email">
            <input className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password">
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="button button-primary" type="submit">
            Sign in
          </button>
        </form>

        <div className="auth-hint">
          <strong>Demo credentials</strong>
          <span>{demoCredentials.email}</span>
          <span>{demoCredentials.password}</span>
        </div>
      </section>
    </main>
  )
}
