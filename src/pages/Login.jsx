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
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, signup, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = isForgot ? await resetPassword({ email }) : isSignup ? await signup({ email, password }) : await login({ email, password })
    setIsSubmitting(false)

    if (!result.ok && !isForgot) {
      setError(result.message)
      return
    }

    if (isForgot) {
      setMessage('If an account exists for this email, a password reset link has been sent.')
      setPassword('')
      setConfirmPassword('')
      return
    }

    navigate(location.state?.from || '/', { replace: true })
  }

  const switchMode = (nextMode = isSignup ? 'signin' : 'signup') => {
    setMode(nextMode)
    setError('')
    setMessage('')
    setPassword('')
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
          <h1>
            {isForgot
              ? 'Reset your TransportFlow password.'
              : isSignup
                ? 'Create your TransportFlow account.'
                : 'Sign in to manage fuel, maintenance, and invoice operations.'}
          </h1>
          <p>
            {isForgot
              ? 'Enter your Firebase Authentication email and we will send a secure password reset link.'
              : isSignup
                ? 'Sign up with Firebase Authentication. After signup, your account can access protected TransportFlow pages.'
                : 'Use your Firebase Authentication account. The frontend sends Firebase ID tokens to the protected REST API.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field label="Email">
            <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          {!isForgot ? (
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
          ) : null}
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
          {message ? <p className="auth-success">{message}</p> : null}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-hint">
          <strong>{isForgot ? 'Remembered your password?' : isSignup ? 'Already have an account?' : 'Need an account?'}</strong>
          <span>
            {isForgot
              ? 'Go back to sign in after resetting your Firebase password.'
              : isSignup
                ? 'Switch back to sign in if your Firebase user already exists.'
                : 'Create a Firebase Auth user directly from this screen.'}
          </span>
          <div className="inline-group">
            <button className="button button-secondary button-small" type="button" onClick={() => switchMode(isForgot || isSignup ? 'signin' : 'signup')}>
              {isForgot || isSignup ? 'Go to sign in' : 'Create new account'}
            </button>
            {!isForgot && !isSignup ? (
              <button className="button button-secondary button-small" type="button" onClick={() => switchMode('forgot')}>
                Forgot password?
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}
