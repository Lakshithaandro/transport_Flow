import { NavLink } from 'react-router-dom'
import Badge from '../ui/Badge.jsx'

const futureNavigation = ['Loads', 'Dispatch', 'Fleet', 'Customers', 'Reports', 'Settings']

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-block">
        <div className="brand-mark">TF</div>
        <div>
          <p className="brand-name">TransportFlow AI</p>
          <p className="brand-caption">TMS frontend foundation</p>
        </div>
      </div>

      <nav className="nav-stack">
        <NavLink className="nav-link" to="/" end>
          Overview
        </NavLink>
        <NavLink className="nav-link" to="/design-system">
          Design System
        </NavLink>
        {futureNavigation.map((item) => (
          <span className="nav-link nav-link-disabled" key={item}>
            {item}
            <Badge tone="neutral">Soon</Badge>
          </span>
        ))}
      </nav>

      <div className="sidebar-note">
        <Badge tone="info">Milestone 1</Badge>
        <p>Static UI/UX setup only. No backend or workflow logic included.</p>
      </div>
    </aside>
  )
}
