import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Field from '../components/ui/Field.jsx'
import useAuth from '../context/useAuth.js'

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = isSignup ? await signup({ email, password }) : await login({ email, password })
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate(location.state?.from || '/', { replace: true })
  }

  const switchMode = () => {
    setMode(isSignup ? 'signin' : 'signup')
    setError('')
    setConfirmPassword('')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-block auth-brand">
          <div className="brand-mark">TF</div>
          <div>
            <p className="brand-name">TransportFlow AI</p>
            <p className="brand-caption">Firebase authentication</p>
          </div>
        </div>

        <div>
          <Badge tone="info">Firebase Auth</Badge>
          <h1>{isSignup ? 'Create your TransportFlow account.' : 'Sign in to manage fuel and maintenance operations.'}</h1>
          <p>
            {isSignup
              ? 'Sign up with Firebase Authentication. After signup, your account can access protected TransportFlow pages.'
              : 'Use your Firebase Authentication account. The frontend sends Firebase ID tokens to the Milestone 4 REST API.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field label="Email">
            <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          <Field label="Password">
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength="6"
            />
          </Field>
          {isSignup ? (
            <Field label="Confirm Password">
              <input
                className="form-control"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength="6"
              />
            </Field>
          ) : null}
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-hint">
          <strong>{isSignup ? 'Already have an account?' : 'Need an account?'}</strong>
          <span>
            {isSignup
              ? 'Switch back to sign in if your Firebase user already exists.'
              : 'Create a Firebase Auth user directly from this screen.'}
          </span>
          <button className="button button-secondary button-small" type="button" onClick={switchMode}>
            {isSignup ? 'Go to sign in' : 'Create new account'}
          </button>
        </div>
      </section>
    </main>
  )
}
