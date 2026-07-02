import { LogOut, Moon, Sun } from 'lucide-react'
import useAuth from '../../context/useAuth.js'
import useTheme from '../../context/useTheme.js'

export default function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const nextThemeLabel = isDark ? 'Light' : 'Dark'
  const ThemeIcon = isDark ? Sun : Moon

  return (
    <header className="topbar">
      <div className="topbar-brand" aria-label="TransportFlow AI">
        <span className="topbar-logo">TF</span>
        <span>TransportFlow AI</span>
      </div>
      <div className="topbar-actions">
        {user ? <div className="company-chip">{user.displayName || user.email}</div> : null}
        <button className="button button-secondary button-small" type="button" onClick={toggleTheme} aria-label={`Switch to ${nextThemeLabel.toLowerCase()} mode`}>
          <ThemeIcon className="lucide-icon" aria-hidden="true" />
          {nextThemeLabel}
        </button>
        <button className="button button-primary button-small" type="button" onClick={logout} aria-label="Logout">
          <LogOut className="lucide-icon" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  )
}
