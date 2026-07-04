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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    navigate(location.state?.from || '/vehicles-drivers', { replace: true })
  }

  const switchMode = (nextMode = isSignup ? 'signin' : 'signup') => {
    setMode(nextMode)
    setError('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
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
          <h1>{isSignup ? 'Create your TransportFlow account.' : 'Sign in to manage transport operations.'}</h1>
          <p>{isSignup ? 'Create an account to access the TransportFlow workspace.' : 'Use your account credentials to access protected operations modules.'}</p>
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
          {isSignup ? (
            <Field label="Confirm Password">
              <div className="password-control">
                <input
                  className="form-control"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength="6"
                />
                <button className="button button-secondary button-small" type="button" onClick={() => setShowConfirmPassword((current) => !current)}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
          ) : null}
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-hint">
          <strong>{isSignup ? 'Already have an account?' : 'Need an account?'}</strong>
          <span>{isSignup ? 'Switch back to sign in if your account already exists.' : 'Create an account directly from this screen.'}</span>
          <div className="inline-group">
            <button className="button button-secondary button-small" type="button" onClick={() => switchMode()}>
              {isSignup ? 'Go to sign in' : 'Create new account'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
