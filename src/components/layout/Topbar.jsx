import useAuth from '../../context/useAuth.js'
import Badge from '../ui/Badge.jsx'

export default function Topbar() {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">TransportFlow AI</p>
        <h1>Operations Management Workspace</h1>
      </div>
      <div className="topbar-actions">
        <Badge tone="success">Milestone 4</Badge>
        {user ? <div className="company-chip">{user.displayName || user.email}</div> : null}
        <button className="button button-secondary button-small" type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  )
}
