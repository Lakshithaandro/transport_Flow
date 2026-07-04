import useAuth from '../../context/useAuth.js'
import useTheme from '../../context/useTheme.js'

export default function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const nextThemeLabel = theme === 'dark' ? 'Light' : 'Dark'

  return (
    <header className="topbar">
      <div className="topbar-brand" aria-label="TransportFlow AI">
        <span className="topbar-logo">TF</span>
        <span>TransportFlow AI</span>
      </div>
      <div className="topbar-actions">
        {user ? <div className="company-chip">{user.displayName || user.email}</div> : null}
        <button className="button button-secondary button-small" type="button" onClick={toggleTheme} aria-label={`Switch to ${nextThemeLabel.toLowerCase()} mode`}>
          {nextThemeLabel} mode
        </button>
        <button className="button button-primary button-small" type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
